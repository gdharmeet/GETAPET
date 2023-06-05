
import React, { useState, useLayoutEffect, memo, useEffect, useRef, useCallback, } from 'react';
import database from '@react-native-firebase/database';
import {
    View, StyleSheet, Image, Text, FlatList, TouchableOpacity, KeyboardAvoidingView,
    ScrollView, SafeAreaView, TextInput, BackHandler, ActivityIndicator, RefreshControl
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';

import {
    fontBold, fontLight,
    themeColor, fontMediumTextColor, fontMediumTextColor2, headerColor, grayBorderColor
} from '../common/common';
import { useHomeDispatch, useHomeState } from '../contexts/HomeContext';
import { useAuthDispatch, useAuthState } from '../contexts/authContext';
import { fetchUserDetail, sendPushNotificationUser } from '../services/api';
import { chartStyles } from './ChatScreenStyles';
import customToastMsg from '../subcomponents/CustomToastMsg';
import { BaseURL } from '../services/Constant';

const activeStar = require("../images/star-active.png")
const inActiveStar = require("../images/star-inactive.png")

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
const MessageBox = ({ sendMessage }) => {
    const [message, setMessage] = useState("");
    const [clickCount, setClickCount] = useState(0);
    return (
        <View style={chartStyles.send_message_location}>
            <View style={[chartStyles.sec_padding, { flexDirection: "row" }]}>
                <TextInput style={chartStyles.send_message_input} placeholderTextColor={fontMediumTextColor2} value={message} onChangeText={(value) => { setMessage(value) }} placeholder="Message..." />

                <View style={{ justifyContent: "center", alignContent: "center", marginLeft: 5, elevation: 2, width: wp(10) }}>
                    <TouchableOpacity
                        onPress={() => {
                            if (message.trim()) {
                                sendMessage(message, setMessage, setClickCount);
                                setClickCount(clickCount + 1);
                            } else {
                                setMessage("");
                                customToastMsg("Blank Message can not be sent.");
                            }
                        }}
                        disabled={clickCount == 0 ? false : true}
                    >
                        <Image source={require("../images/send.png")} style={{ height: hp("6%"), width: hp("6%") }} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export const ChatScreen = ({ navigation, route }) => {
    let authDispatch = useAuthDispatch()
    let authState = useAuthState()
    let homeState = useHomeState()
    let homeDispatch = useHomeDispatch()
    const scrollViewRef = useRef();
    const [starRating, setStarRating] = useState(3)
    const [stars, setStars] = useState(["star-inactive.png", "star-inactive.png", "star-inactive.png", "star-inactive.png", "star-inactive.png"])
    const [userChatMessages, setUserChatMessages] = useState([]);

    const [userChatMessagesLoading, setUserChatMessagesLoading] = useState(false)
    const [scrollToDown, setScrollToDown] = useState(false)
    const [userData, setUserData] = useState("")


    const [currentPagination, setCurrentPagination] = useState("");
    const [totalPagination, setTotalPagination] = useState("");
    const [pageno, setpageno] = useState(1)
    const [refreshing, setRefreshing] = useState(false)
    const [scrollDown, setscrollDown] = useState(true)


    const [checkExist, setCheckExist] = useState(false)
    var readChatMessageFromUser = database().ref(`Chats/user_${authState.loginedUser?.id || route.params.item?.messageObj?.to_user}/sender_${route.params.item.userId}`);

    var readChatMessageFromUserCheck = database().ref(`Chats}`);

    useEffect(() => {
        let notificationUser = homeState.notificationUser;
        if (route.params.item.hasOwnProperty("messageObj")) {
            if (notificationUser.includes(`${route.params.item.messageObj.from_user}`)) {
                let notificationUserIndex = notificationUser.indexOf(`${route.params.item.messageObj.from_user}`);
                let updateNotificationUser = notificationUser.splice(notificationUserIndex, 1);
                homeDispatch({
                    type: "CLEAR_NOTIFICATION_USER",
                    payload: notificationUser
                });
            }
        }
        const backAction = () => {
            navigation.navigate("Inbox")
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [homeState.notificationUser]);

    const sendMessage = (message, setMessage, setClickCount) => {
        if (authState.loginedUser.id && route.params.item && message) {
            let messageObj = {
                createdTime: new Date().toISOString(),
                fromUserId: authState.loginedUser.id,
                toUserId: route?.params?.item?.userId,
                messageText: `${message}`,
                uuid: generateUUID()
            }

            let sendChatMessage = database().ref(`Chats/user_${route.params.item.userId}/sender_${authState.loginedUser.id}/message`)
            sendChatMessage.once("value", snapshot => {
                if (!snapshot.exists()) {
                    const email = snapshot.val();
                    let writeMessageToDbRef = sendChatMessage.set(messageObj).then((res) => {
                        let userChatUpdate = userChatMessages;
                        userChatUpdate.push(messageObj);

                        setUserChatMessages([...userChatUpdate]);
                        setUserChatMessagesLoading(false)
                    })
                } else {
                    let writeMessageToDbRef = sendChatMessage.update(messageObj).then((res) => {
                        let userChatUpdate = userChatMessages;
                        userChatUpdate.push(messageObj);

                        setUserChatMessages([...userChatUpdate]);
                        setUserChatMessagesLoading(false)
                    })
                }
                setMessage("");
                setClickCount(0);
                scrollViewRef.current.scrollToEnd({ animated: true })

            });
        }
    }

    useEffect(() => {
        if (authState.loginedUser) {

            if (authState?.loginedUser?.id && userChatMessages && route.params.item.userId) {
                try {
                    readChatMessageFromUser.on('child_changed', (snapshot, prevChildKey) => {
                        const newMessage = snapshot.val();
                        if (newMessage) {
                            setCheckExist(true)
                        }

                        if (userChatMessages) {
                            let userChatUpdate = userChatMessages;
                            userChatUpdate.push(newMessage);
                            setUserChatMessages([...userChatUpdate]);
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }

        return (() => {
            if (authState.loginedUser) {
                if (authState?.loginedUser?.id && route.params.item.userId) {
                    readChatMessageFromUser.off()
                }
            }
        })
    })


    let fetchChat = () => {
        // console.log(`${BaseURL}get_message_user_db?second_user=${route.params.item.userId}&id=${route.params.item.id}&page=${pageno}`, "kjdhaf")
        setUserChatMessagesLoading(true)
        fetch(`${BaseURL}get_message_user_db?second_user=${route.params.item.userId}&id=${route.params.item.id}&page=${pageno}`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authState.userToken}`,
            }
        })
            .then((res) => {
                return res.json()
            })
            .then((res) => {
                // console.log(res)
                let directUpdate = () => {
                    setCurrentPagination(res.chat.to)
                    setTotalPagination(res.chat.total)

                    let userChatUpdate = res.chat.data;
                    if (route.params.item.messageObj) {
                        userChatUpdate.unshift(route.params.item.messageObj);
                        setUserChatMessages([...userChatUpdate.reverse()]);
                    }
                    setscrollDown(true)
                    setUserChatMessagesLoading(false)
                    setRefreshing(false)
                }

                let concatUpdate = () => {
                    setCurrentPagination(res.chat.to)
                    setTotalPagination(res.chat.total)
                    setUserChatMessages(userChatMessages.reverse().concat(res.chat.data).reverse())

                    setscrollDown(false)
                    setUserChatMessagesLoading(false)
                    setRefreshing(false)
                }

                if (userChatMessages.length > 0 && res.chat.data.length > 0 && pageno == 1) {
                    directUpdate()
                } else if (userChatMessages.length > 0 && res.chat.data.length > 0 && pageno == 1) {
                    directUpdate();
                } else if (userChatMessages.length > 0 && res.chat.data.length > 0 && pageno == 1) {
                    directUpdate();
                } else if (userChatMessages.length > 0 && res.chat.data.length > 0 && pageno > 1) {
                    if (res?.chat?.data[res?.chat?.data.length - 1]?.id != userChatMessages[0].from_user) {
                        concatUpdate();
                    }
                } else {
                    directUpdate();
                }
                setRefreshing(false)

                setUserChatMessagesLoading(false)
            })
            .catch((err) => {
                setUserChatMessagesLoading(false)
                setRefreshing(false)

                console.log(err)
            })
    }

    useEffect(async () => {
        setUserChatMessagesLoading(true);
        fetchUserDetail(route.params.item.userId).then(res => {
            setUserData(res.data);
            setUserChatMessagesLoading(false)
        })
        database().ref(`Chats/user_${route.params.item.userId}/sender_${authState.loginedUser.id}/message`).once("value", snapshot => {
            database().ref(`Chats/user_${authState.loginedUser.id}/sender_${route.params.item.userId}/message`).once("value", snaps => {
                if (snapshot.exists() || snaps.exists()) {
                    if (authState.loginedUser.id && route.params.item.userId) {
                        fetchChat()
                    }
                }
            });
        })
    }, [route.params.item.userId]);

    useEffect(() => {
        if (pageno > 1) {
            // console.log('here');
            setUserChatMessagesLoading(true);
            fetchChat()
        }
    }, [pageno])

    function tConvert(time) {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) { // If time format correct
            time = time.slice(1); // Remove full string match value
            time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
    }

    const renderHeader = (userData) => {
        return (
            <>
                <View style={chartStyles.sec_padding}>
                    <View style={chartStyles.chat_Inner_Wrapper}>
                        <Image source={userData?.profile_image ? {
                            uri: userData.profile_image,
                        } : require("../images/defaultProfile.png")} style={chartStyles.chat_Img} />
                        <View style={chartStyles.wrp}>
                            <Text style={chartStyles.chat_Name}>{userData?.name}</Text>
                            <Text style={chartStyles.chat_Message} numberOfLines={1}>{userData?.address ? userData?.address : null}</Text>

                            <View style={{ flexDirection: 'row' }}>
                                {stars.map((currentValue, index) => {
                                    if (index < userData?.user_rating) {
                                        return (
                                            <Image key={index} source={activeStar} style={chartStyles.strRat} />
                                        )
                                    }
                                    return (
                                        <Image key={index} source={inActiveStar} style={chartStyles.strRat} />
                                    )
                                }
                                )}
                                <Text style={chartStyles.Rating}>({userData?.user_rating_count})</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={chartStyles.border_Bottom_1}></View>
            </>
        )
    }

    let renderChat = useCallback(({ item, index }) => {
        let UTCregx = /^([0-2][0-9]{3})\-(0[1-9]|1[0-2])\-([0-2][0-9]|3[0-1]) ([0-1][0-9]|2[0-3]):([0-5][0-9])\:([0-5][0-9])( ([\-\+]([0-1][0-9])\:00))?$/;
        let date = {};
        if (item.created && item.created.match(UTCregx)) {
            let covertDate = item.created.split("-").join(" ").split(" ").join(":").split(":")
            date = new Date(Date.UTC(covertDate[0], covertDate[1] - 1, covertDate[2], covertDate[3], covertDate[4], covertDate[5]));
        } else {
            date = new Date(item.created || item.createdTime);
        }
        let hours = date.getHours().toLocaleString().length < 1 ? `0${date.getHours().toLocaleString()}` : date.getHours().toLocaleString();
        let min = date.getMinutes().toLocaleString()
        let day = date.getDate().toLocaleString();
        let crDay = date.getDate().toString();
        let crMonth = (date.getMonth() + 1).toString();
        let crYear = date.getFullYear().toString();
        //let fullDate = date.toLocaleDateString().split("/").reverse()
        let fullDate = [crMonth, crDay, crYear]
        let currdate = new Date();
        let currday = currdate.getDate().toLocaleString();
        let userdate = ""

        if (userChatMessages && userChatMessages?.length && userChatMessages[index].created && userChatMessages[index > 0 ? index - 1 : index]?.created) {
            let userDatadate = userChatMessages[index > 0 ? index - 1 : index]?.created.split("-").join(" ").split(" ").join(":").split(":")
            userdate = new Date(Date.UTC(userDatadate[0], userDatadate[1] - 1, userDatadate[2], userDatadate[3], userDatadate[4], userDatadate[5]));
        } else if (userChatMessages && userChatMessages?.length && userChatMessages[index].createdTime && userChatMessages[index > 0 ? index - 1 : index]?.createdTime) {
            userdate = new Date(userChatMessages[index > 0 ? index - 1 : index].createdTime)
        }

        var difMint = Math.floor((Math.abs(new Date(date) - userdate) / 1000) / 60);

        return (
            <>
                <View style={[chartStyles.single_Chat_Wrapper,
                authState.loginedUser.id == item.from_user || authState.loginedUser.id == item.fromUserId ? chartStyles.single_Chat_Wrapper_Sender : null]}
                >
                    {index > 0 ?
                        (item.fromUserId || item.from_user) == (userChatMessages[index - 1].fromUserId ||
                            userChatMessages[index - 1].from_user) && difMint < 2 ?
                            null :
                            <Text style={chartStyles.chat_Time}>
                                {
                                    currday === day ?
                                        tConvert(`${hours.length == 1 ? "0" + hours : hours}:${min.length == 1 ? "0" + min : min}`) :
                                        `${fullDate[0].length == 1 ? "0" + fullDate[0] : fullDate[0]}-${fullDate[1].length == 1 ? "0" + fullDate[1] : fullDate[1]}-${fullDate[2]} ${tConvert(`${hours}:${min.length == 1 ? "0" + min : min}`)}`
                                }
                            </Text>
                        : null
                    }
                    {index == 0 ?
                        <Text style={chartStyles.chat_Time}>
                            {
                                currday === day ? tConvert(`${hours.length == 1 ? "0" + hours : hours}:${min.length == 1 ? "0" + min : min}`) : `${fullDate[0].length == 1 ? "0" + fullDate[0] : fullDate[0]}-${fullDate[1].length == 1 ? "0" + fullDate[1] : fullDate[1]}-${fullDate[2]} ${tConvert(`${hours}:${min.length == 1 ? "0" + min : min}`)}`
                            }
                        </Text> : null
                    }
                    <View style={chartStyles.chat_Content}>
                        <Text style={[chartStyles.single_Chat_Message, authState.loginedUser.id == item.from_user || authState.loginedUser.id == item.fromUserId ? chartStyles.single_Chat_Sender : null]}>{item?.message_text ? item?.message_text : item?.messageText}</Text>
                        {authState.loginedUser.id == item.from_user || authState.loginedUser.id == item.fromUserId ? <Image style={chartStyles.chat_Seen_Reciept} source={require("../images/d-tick.png")} /> : null}
                    </View>
                </View>
            </>
        )
    }, [userChatMessages])


    let onContentOffsetChanged = (distanceFromTop) => {
        console.log(distanceFromTop)
        if (distanceFromTop === 0 && currentPagination != totalPagination) {
            setpageno(pageno + 1)
        }
    }

    const renderFlatlistHeader = () => {
        return (
            //Footer View with Load More button
            <View style={{ flex: 1 }}>
                {totalPagination > 1 && currentPagination != totalPagination ? <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        if (currentPagination != totalPagination) {
                            setpageno(pageno + 1)
                            setRefreshing(false)
                        }
                    }}
                    //On Click of button calling getData function to load more data
                    style={{
                        padding: 10,
                        backgroundColor: "#ddd",
                        borderRadius: 15,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: "center",
                        width: wp(40),
                        marginTop: 10,
                        marginBottom: 30,

                    }}>
                    <Text style={{
                        color: '#000',
                        fontSize: 15,
                        textAlign: 'center',
                    }}>Load More</Text>
                </TouchableOpacity> : null}
            </View>
        );
    };

    return (
        <SafeAreaView style={chartStyles.mainContainer}>
            {/* {console.log(route.params.item, 'aldsfk')} */}
            <View style={chartStyles.top_Header}>
                <TouchableOpacity
                    style={chartStyles.go_Back_Icon}
                    onPress={() => { navigation.navigate("Inbox") }}>
                    <Image source={require("../images/back-button.png")} style={chartStyles.go_Back_Icon_Img} resizeMode="contain" />
                </TouchableOpacity>

                <View style={chartStyles.top_HeaderRight}>
                    <Text allowFontScaling={true} style={chartStyles.top_HeaderText}>Message</Text>
                </View>
            </View>
            {userChatMessagesLoading && <View style={{
                position: "absolute",
                height: hp(100),
                width: wp(100),
                zIndex: 1,
                backgroundColor: "#ffffff91",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <ActivityIndicator
                    // style={{ t}}
                    size="large"
                />
            </View>}
            {renderHeader(userData)}

            <KeyboardAvoidingView style={chartStyles.content_view}
                behavior={Platform.OS === "ios" ? "padding" : ""}
                keyboardShouldPersistTaps="always"
            >
                <FlatList
                    data={userChatMessages}
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollDown && scrollViewRef.current.scrollToEnd({ animated: true })}
                    style={{ marginHorizontal: wp("5%") }}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={renderFlatlistHeader}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                    // onScroll={(event) =>
                    //     onContentOffsetChanged(event.nativeEvent.contentOffset.y)
                    // }
                    // refreshing={refreshing}
                    // onRefresh={() => {
                    //     if (currentPagination != totalPagination) {
                    //         setpageno(pageno + 1)
                    //         setRefreshing(false)

                    //     }
                    // }}

                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={refreshing}
                    //         onRefresh={() => {
                    //             if (currentPagination != totalPagination) {
                    //                 setpageno(pageno + 1)
                    //                 setRefreshing(false)

                    //             }
                    //         }}
                    //         title={'Pull down to load more'}
                    //     />
                    // }

                    onEndReached={() => {
                        // console.log('aldkjfdljf')
                        setscrollDown(true)
                    }}

                    renderItem={renderChat}
                />

                {/* <MessageBox sendMessage={sendMessage} /> */}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;