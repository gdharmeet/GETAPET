import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Image, Text, FlatList, SafeAreaView, AppState, Dimensions } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
    fontBold, fontSemiBold, grayBorderColor,
    themeColor, fontMediumTextColor2, headerColor, fontRegular
} from '../common/common';

import { CustomLoginPopup } from '../subcomponents/CustomLoginPopup';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAuthDispatch, useAuthState } from '../contexts/authContext'
import { fetchAllChat, fetchUserDetail } from '../services/api';
import { useHomeDispatch, useHomeState } from '../contexts/HomeContext';
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import { useDispatch, useSelector } from 'react-redux';
import { setChatScreenFocused } from '../redux/actions/activeScreenAction';
const { width: windowWidth, height: windowHeight } = Dimensions.get("screen");

const MessageScreen = ({ navigation, dispatch }) => {
    const appState = React.useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

    let authDispatch = useAuthDispatch()
    let authState = useAuthState()
    let homeState = useHomeState()
    let homeDispatch = useHomeDispatch()
    const [userDetail, setUserDetail] = useState("")
    const [oldChat, setOldChat] = useState([])

    // var readChatMessageFromUserCheck = database().ref(`Chats`);

    // useEffect(() => {
    //     // if (authState.loginedUser) {
    //     //     if (authState?.loginedUser?.id) {
    //     //         try {
    //     //             readChatMessageFromUserCheck.on('child_changed', (snapshot, prevChildKey) => {
    //     //                 const newMessage = snapshot.val();
    //     //                 if (newMessage) {
    //     //                     // fetchChat()
    //     //                 }
    //     //             });
    //     //         } catch (error) {
    //     //             console.log(error);
    //     //         }
    //     //     }
    //     // }

    //     // return (() => {
    //     //     try {
    //     //         if (authState.loginedUser) {
    //     //             if (authState?.loginedUser?.id) {
    //     //                 readChatMessageFromUserCheck.off()
    //     //             }
    //     //         }
    //     //     } catch (error) {
    //     //         console.log(error);
    //     //     }
    //     // })
    // }, [])

    React.useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                // fetchChat();
            }
            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, [])

    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', () => {
    //         // if (authState?.userToken) {
    //         // fetchChat()
    //         // setFullData1(dataResp)
    //         // }
    //     })

    //     return () => {
    //         unsubscribe();
    //     }
    // }, [navigation]);


    // useEffect(() => {
    //     // console.log(homeState.notificationToggler, 'toggler ')
    //     fetchChat();
    // }, [homeState.notificationToggler])

    const handleSingleChat = (item) => {
        dispatch(setChatScreenFocused({
            isActive: true,
            userInfo: {
                chatId: item.chatId,
                id: item.id,
                postId: item.postId,
                unseenCount: item.unseenCount,
                userName: item.userName
            }
        }))
        // console.log(item,'lkadjf')
        // navigation.navigate("Message", { item: {postId: item.postId, id: item.id} })
        navigation.navigate("Message", { item })
    }

    // const flatListOptimizationProps = {
    //     initialNumToRender: 0,
    //     maxToRenderPerBatch: 1,
    //     removeClippedSubviews: true,
    //     scrollEventThrottle: 16,
    //     // windowSize: 3,

    //     keyExtractor: (data, index) => index,
    //     getItemLayout: useCallback(
    //         (_, index) => ({
    //             index,
    //             length: windowWidth,
    //             offset: index * windowWidth,
    //         }),
    //         []
    //     ),
    // };

    useEffect(() => {
        let unsubscribe = () => { }
        if (authState.loginedUser?.id) {
            const docid = authState.loginedUser?.id;
            unsubscribe = firestore()
                .collection('Chat_History')
                // add this
                .doc(docid.toString())
                .collection('sender')
                .orderBy('createdAt', 'desc')
                .onSnapshot(querySnapshot => {
                    // console.log('hilkj dslj')
                    if (querySnapshot) {

                        const threads = querySnapshot.docs.map(documentSnapshot => {

                            return documentSnapshot.data()
                            //   return {
                            //     _id: documentSnapshot.id,
                            //     name: '',
                            //     // add this
                            //     latestMessage: {
                            //       text: ''
                            //     },
                            //     // ---
                            //     ...documentSnapshot.data()
                            //   };
                        });

                        // console.log(homeState.chatUserInfo, "kdajfl")
                        setUserDetail([...threads, ...homeState.chatUserInfo]);

                        // if (loading) {
                        //   setLoading(false);
                        // }
                    }

                });
            // fetchChat()
        }
        return () => unsubscribe();
    }, [authState.loginedUser, homeState.chatUserInfo]);

    // const renderInbox = useCallback(({ item, index }) => {
    //     return (
    //         <TouchableOpacity
    //             key={Math.random()} onPress={() => { handleSingleChat(item) }}>
    //             <View style={styles.chat_Inner_Wrapper}>
    //                 <View>
    //                     <Image source={item?.photoUrl ? { uri: item?.photoUrl } : require("../images/defaultProfile.png")} style={styles.chat_Img} />
    //                 </View>

    //                 <View style={{ flex: 1, padding: 12 }}>
    //                     <View style={{ flexDirection: "row" }}>
    //                         <Text style={styles.chat_Name}>{item.userName}</Text>
    //                         <View>
    //                             {
    //                                 homeState.notificationUser && homeState.notificationUser.map((fromUser, index) => {
    //                                     if (item.messageObj.from_user == fromUser) {
    //                                         {/* console.log("true") */ }
    //                                         return <View key={Math.random()} style={{
    //                                             position: "absolute",
    //                                             backgroundColor: "red",
    //                                             marginLeft: 10,
    //                                             marginTop: 2,
    //                                             height: 20,
    //                                             paddingHorizontal: 5,
    //                                             borderRadius: 50,
    //                                             top: 0,
    //                                         }}>
    //                                             <Text style={{
    //                                                 color: "#fff",
    //                                                 fontFamily: fontBold
    //                                             }}>New</Text>
    //                                         </View>
    //                                     } else {
    //                                         return <React.Fragment key={Math.random()}></React.Fragment>
    //                                     }
    //                                 })
    //                             }
    //                         </View>
    //                     </View>
    //                     <Text style={[styles.chat_Message, homeState.notificationUser.includes(item.messageObj.from_user.toString()) ? {} : { fontWeight: "normal" }]} numberOfLines={1}>{item.message}</Text>
    //                     <Text style={styles.lastScene} numberOfLines={1}>{item?.LastActive}</Text>
    //                 </View>
    //                 <Image source={item.AnimalImage} style={styles.chat_Img} />
    //                 {/* <View style={{ position: "absolute", backgroundColor: "red", height: 20, width: 20, borderRadius: 50, top: 0, right: 0 }}></View> */}

    //             </View>
    //         </TouchableOpacity>
    //     )
    // }, [homeState.chatUserInfo])

    function getTime(time) {
        // console.log(new Date(time.seconds))
        let currentTime = new Date().toISOString().toString().split('T');
        let incomingTime = new Date(time.toDate()).toISOString().toString().split('T');

        if (currentTime[0] == incomingTime[0]) {
            let t = time.toDate().toTimeString().split(' ')[0].split(":")
            return `${t[0]}:${t[1]}`
        } else {
            return incomingTime[0]
        }

    }

    const handleSingleOldChat = (item) => {
        navigation.navigate("MessageOld", { item: item })

    }

    const renderInboxNew = useCallback(({ item, index }) => {
        if (item.hasOwnProperty("created")) {
            return (
                <TouchableOpacity
                    key={Math.random().toString() + index}
                    onPress={() => { handleSingleOldChat(item) }}
                    style={{
                        backgroundColor: "#dededec9",
                        paddingHorizontal: wp(4),
                        borderColor: grayBorderColor,
                        borderWidth: 1
                    }}
                >
                    <View style={styles.chat_Inner_Wrapper}>
                        <View>
                            <Image source={item?.photoUrl ? { uri: item?.photoUrl } : require("../images/defaultProfile.png")} style={styles.chat_Img} />
                        </View>

                        <View style={{ flex: 1, padding: 12 }}>
                            <View style={{ flexDirection: "row" }}>
                                <Text style={styles.chat_Name}>{item.userName}</Text>
                            </View>
                            <Text style={[styles.chat_Message, { fontFamily: fontRegular, fontWeight: "normal" }]} numberOfLines={1}>{item.message}</Text>
                            <Text style={styles.lastScene} numberOfLines={1}>Old Chat</Text>
                        </View>
                        <Image source={item.AnimalImage} style={styles.chat_Img} />
                        {/* <View style={{ position: "absolute", backgroundColor: "red", height: 20, width: 20, borderRadius: 50, top: 0, right: 0 }}></View> */}

                    </View>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity
                    key={Math.random().toString() + index}
                    onPress={() => { handleSingleChat(item) }}
                    style={{
                        paddingHorizontal: wp(4), borderColor: grayBorderColor,
                        borderWidth: 1
                    }}>
                    <View style={styles.chat_Inner_Wrapper}>
                        <View>
                            <Image source={item?.postImage ? { uri: item?.postImage } : require("../images/defaultProfile.png")} style={styles.chat_Img} />
                        </View>

                        <View style={{ flex: 1, padding: 12 }}>
                            <View style={{ flexDirection: "row", marginBottom: 3 }}>
                                <Text style={styles.chat_Name}>{item.userName}</Text>
                                <View>{
                                    item.unseenCount && <View key={Math.random()} style={{
                                        position: "absolute",
                                        backgroundColor: "red",
                                        marginLeft: 10,
                                        marginTop: 2,
                                        height: 20,
                                        paddingHorizontal: 5,
                                        borderRadius: 50,
                                        top: 0,
                                    }}>
                                        <Text style={{
                                            color: "#fff",
                                            fontFamily: fontBold
                                        }}>New</Text>
                                    </View>
                                }</View>
                                {/* {console.log(item)} */}

                            </View>


                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={[styles.chat_Message]}
                                    numberOfLines={1}>Title: {item.title}</Text>
                                {/* <Text style={styles.tagStyle}>{item.category}</Text> */}
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={[styles.chat_Message, !item.unseenCount && { fontWeight: "normal" }]}
                                    numberOfLines={1}>{item.messageObj.isImageExist ? "Image" : item.messageObj.text}</Text>
                                <Text>{getTime(item.messageObj.createdAt)}</Text>
                            </View>

                            {/* <Text style={styles.lastScene} numberOfLines={1}>{item?.LastActive}</Text> */}
                        </View>
                        {/* <Image source={item.AnimalImage} style={styles.chat_Img} /> */}
                        {/* <View style={{ position: "absolute", backgroundColor: "red", height: 20, width: 20, borderRadius: 50, top: 0, right: 0 }}></View> */}

                    </View>
                </TouchableOpacity>
            )
        }

    }, [userDetail])

    const renderInboxOld = useCallback(({ item, index }) => {
        return (
            <TouchableOpacity
                key={Math.random()}
            // onPress={() => { handleSingleChat(item) }}
            >
                <View style={styles.chat_Inner_Wrapper}>
                    <View>
                        <Image source={item?.photoUrl ? { uri: item?.photoUrl } : require("../images/defaultProfile.png")} style={styles.chat_Img} />
                    </View>

                    <View style={{ flex: 1, padding: 12 }}>
                        <View style={{ flexDirection: "row" }}>
                            <Text style={styles.chat_Name}>{item.userName}</Text>
                        </View>
                        <Text style={[styles.chat_Message]} numberOfLines={1}>{item.message}</Text>
                        <Text style={styles.lastScene} numberOfLines={1}>{item?.LastActive}</Text>
                    </View>
                    <Image source={item.AnimalImage} style={styles.chat_Img} />
                    {/* <View style={{ position: "absolute", backgroundColor: "red", height: 20, width: 20, borderRadius: 50, top: 0, right: 0 }}></View> */}

                </View>
            </TouchableOpacity>
        )
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* {console.log(homeState.notificationUser, "klsjdf lkjsdflkja  j")} */}
            <FlatList
                data={userDetail}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderInboxNew}
                // style={{ paddingHorizontal: wp("4%") }}
                // {...flatListOptimizationProps}
                ListEmptyComponent={() => <Text style={[styles.chat_Message, { marginTop: hp("35"), textAlign: "center", fontSize: 23, marginLeft: wp(6) }]}>
                    No contacts found
                </Text>
                }
            />
            {/* <FlatList
                data={oldChat}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderInboxOld}
                style={{ paddingHorizontal: wp("4%") }}
                // {...flatListOptimizationProps}
                ListEmptyComponent={() => <Text style={[styles.chat_Message, { marginTop: hp("35"), textAlign: "center", fontSize: 23, marginLeft: wp(6) }]}>
                    No contacts found
                </Text>
                }
            /> */}

        </View>

    );
}

const InboxScreen = ({ navigation, route }) => {
    let authState = useAuthState()
    const [popup, setPopup] = useState(true);
    const dispatch = useDispatch();
    const { activeScreen } = useSelector(state => state)

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (authState?.userToken == null || authState?.userToken == undefined || authState?.userToken == "") {
                setPopup(true);
            }
            else {
                dispatch(setChatScreenFocused({
                    isActive: false,
                    userInfo: null
                }))
                setPopup(false);
            }

        })
        return () => {
            unsubscribe();
        }
    }, [navigation, authState?.userToken]);

    return (
        <SafeAreaView style={styles.mainContainer}>
            {
                authState.userToken ?
                    <>
                        <View style={styles.top_Header}>
                            <View style={styles.top_HeaderRight}>
                                <Text allowFontScaling={false} style={styles.top_HeaderText}>Inbox</Text>
                            </View>
                        </View>
                        <MessageScreen navigation={navigation} dispatch={dispatch} />
                    </>
                    :
                    popup ?
                        <CustomLoginPopup toggle={popup} setPopup={setPopup} name="Access Denied" btnName1="Cancel" btnName2="Login"
                            alertText="Please login to access this funcationality." btn2Action={() => navigation.navigate("SignIn")} />
                        :
                        <View style={{ flex: 1, alignContent: "center", justifyContent: "center" }}>
                            <Text style={styles.blankScreen}> You are not authorized to access this feature. {"\n"}Please login!</Text>
                        </View>
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    ButtonTxt: {
        fontSize: wp("3%"),
        fontWeight: "bold",
        fontFamily: fontBold,
        color: "#fff",
        textAlign: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    ButtonStyle: {

        backgroundColor: themeColor,
        borderRadius: 5,
        width: wp("27.5%"),
        height: hp("4%"),
        flexDirection: "row",
        elevation: 7,
        justifyContent: "center",
    },
    mainContainer: {
        backgroundColor: "#fff",
        flex: 1,
        // paddingTop: (Platform.OS === 'ios') ? 20 : 0,

    },


    top_Header: {
        paddingVertical: wp("3%"),

        justifyContent: "space-between",
        backgroundColor: headerColor,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: wp("3.5%")
    },
    top_HeaderRight: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    top_HeaderText: {
        fontSize: wp("6%"),
        fontFamily: fontBold,
        fontWeight: "bold",
        color: themeColor
    },


    heading_Main: {
        fontSize: wp("4.5%"),
        fontFamily: fontSemiBold,
        fontWeight: "bold"
    },
    chat_Inner_Wrapper: {
        flexDirection: "row",
        alignItems: "center",
        // borderColor: grayBorderColor,
        paddingVertical: hp('0.5%'),
        // borderBottomWidth: 2,
        // backgroundColor: 'blue'
    },
    chat_Img: {
        height: hp("8%"),
        width: hp("8%"),
        resizeMode: "cover",

    },
    Img: {

        height: hp("3%"),
        width: hp("3%"),
        resizeMode: "cover",
        alignSelf: "center",


    },
    chat_Name: {
        color: themeColor,
        fontSize: wp("4.5%"),
        fontWeight: "bold"
    },
    bidPrice: {
        fontFamily: fontBold,
        color: themeColor,
        width: '50%',
        // paddingRight: wp("10%"),
        fontWeight: "bold",
        // backgroundColor: 'green'
    },
    chat_Message: {
        fontFamily: fontBold,
        color: "#000000",
        paddingRight: 40,
        fontWeight: "bold",
        flex: 1
    },
    lastScene: {
        fontFamily: fontBold,
        color: fontMediumTextColor2,
        paddingRight: 40,
        paddingTop: 5

    },
    blankScreen: {
        fontSize: wp("6%"),
        fontFamily: fontBold,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center"
    },
    tagStyle: {
        backgroundColor: themeColor,
        paddingHorizontal: 10,
        paddingVertical: 1,
        color: "#fff",
        fontFamily: fontBold,
        marginBottom: 3,
    }

});
export default InboxScreen;