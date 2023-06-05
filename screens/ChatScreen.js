
import React, { useState, useLayoutEffect, memo, useEffect, useRef, useCallback, } from 'react';
import database from '@react-native-firebase/database';
import {
    View, StyleSheet, Image, Text, FlatList, TouchableOpacity, KeyboardAvoidingView,
    ScrollView, SafeAreaView, TextInput, BackHandler, ActivityIndicator, Platform, Clipboard
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import 'react-native-get-random-values';
// import { v4 as uuidv4 } from 'uuid';

import {
    fontBold, fontLight,
    themeColor, fontMediumTextColor, fontMediumTextColor2, headerColor
} from '../common/common';
import { useHomeDispatch, useHomeState } from '../contexts/HomeContext';
import { useAuthDispatch, useAuthState } from '../contexts/authContext';
import { fetchUserDetail, sendPushNotificationUser, async, sendPushNotification } from '../services/api';
import { chartStyles } from './ChatScreenStyles';
import customToastMsg from '../subcomponents/CustomToastMsg';

import {
    GiftedChat, Send, Actions,
    ActionsProps, Bubble
} from 'react-native-gifted-chat'

import ImagePicker from 'react-native-image-crop-picker';
import firestore, { collection, addDoc, getDocs, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';
// import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

import storage from '@react-native-firebase/storage';
import RNPhotoManipulator from 'react-native-photo-manipulator';
import Video from 'react-native-video';
 import VideoPlayer from 'react-native-video-controls';

const activeStar = require("../images/star-active.png")
const inActiveStar = require("../images/star-inactive.png")

const uploadImage = async (uri, name, firebasePath) => {
    // console.log(uri, name, firebasePath,'initila')
    const imageRef = storage().ref(`${firebasePath}/${name}`)
    // console.log(imageRef,'initila imageRef')

    await imageRef.putFile(uri, { contentType: 'image/jpg' }).catch((error) => {
        // console.log(error,'adlkj')
        throw error
    })
    const url = await imageRef.getDownloadURL().catch((error) => {
        throw error
    });
    // console.log(url,'initial in url')

    return url
}

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


const ChatScreen = ({ user, navigation, route }) => {
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
    const [pageno, setpageno] = useState(10)
    const [scrollDown, setscrollDown] = useState(true)


    const [checkExist, setCheckExist] = useState(false)
    const [messages, setMessages] = useState([]);

    const [imageData, setImageData] = useState([]);
    const [videoData, setVideoData] = useState({});
    const [lastDocument, setLastDocument] = useState();

    const [testImg, setTestImg] = useState("");
    // var readChatMessageFromUser = database().ref(`Messages/user_${authState.loginedUser.id}/sender_${route.params.item.userId}`);
    
    useEffect(() => {
        // console.log(homeState.notificationUser, route.params, 'homeState.notificationUser')
        let notificationUser = homeState.notificationUser;
        if (route.params.item.hasOwnProperty("chatId")) {
            if (notificationUser.includes(`${route.params.item.chatId}`)) {
                let notificationUserIndex = notificationUser.indexOf(`${route.params.item.chatId}`);
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

    useEffect(async () => {
        setUserChatMessagesLoading(true);
        fetchUserDetail(route.params.item.id).then(res => {

            // console.log(res, 'asldfk')
            setUserData(res.data);
            setUserChatMessagesLoading(false)
        }).catch(() => {
            setUserChatMessagesLoading(false)
        })
    }, [route.params.item.id]);

    // useEffect(() => {
    //     if (pageno > 1) {
    //         // console.log('here');
    //         // setUserChatMessagesLoading(true);
    //         // fetchChat()
    //     }
    // }, [pageno])

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
        // console.log(userData);
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
    // const handleVideo = () => {
    //     console.log("choose vids called ");
    //     const options = {
    //         title: null,
    //         takePhotoButtonTitle: "Take video",
    //         chooseFromLibraryButtonTitle: "choose video",
    //         cancelButtonTitle: "cancel",
    //         cameraType: 'front',
    //         mediaType: 'video',
    //         videoQuality:'medium',
    //         aspectX: 1,
    //         aspectY: 1,
    //         allowsEditing: true,
    //         quality: 1.0,
    //     };
    //     ImagePicker.showImagePicker(options, (response) => {
    //         console.log('Response = ', response);
    //         if (response.didCancel) {
    //             console.log('User cancelled video picker');
    //         } else if (response.error) {
    //             console.log('ImagePicker Error: ', response.error);
    //         } else if (response.customButton) {
    //             if (response.customButton === 'remove') {
    //                 console.log('User tapped custom button: ', response.customButton);
    //                 this.setState({ Vids: undefined });
    //             }
    //         } else {
    //             const source = { uri: response.uri };
    //             let msg = {
    //                 _id: uuidv4(),
    //                 createdAt: new Date(),
    //                 user: {
    //                     _id: 1,
    //                     name: "test",
    //                 },
    //                 video: source.uri,
    //             }
    //             this.onSend(msg)
    //         }
    //     });
    // }
    const handleVideo = () => {
        // setUserChatMessagesLoading(true)
        ImagePicker.openPicker({
            title: null,
            takePhotoButtonTitle: "Take video",
            chooseFromLibraryButtonTitle: "choose video",
            cancelButtonTitle: "cancel",
            cameraType: 'front',
            mediaType: 'video',
            videoQuality: 'medium',
            aspectX: 1,
            aspectY: 1,
            allowsEditing: true,
            quality: 1.0,
            smartAlbums: ['PhotoStream', 'Generic', 'Panoramas', 'Videos', 'Favorites', 'Timelapses', 'AllHidden', 'RecentlyAdded', 'Bursts', 'SlomoVideos', 'UserLibrary', 'SelfPortraits', 'Screenshots', 'DepthEffect', 'LivePhotos', 'Animated', 'LongExposure'],
        }).then(video => {
            // console.log(video)
            setVideoData({
                uri: video.path,
                name: video.path.split("/").pop(),
                type: video.mime,
                filename: video.path.split("/").pop(),
            })

        }).catch((err) => {
            console.log(err);
            setUserChatMessagesLoading(false)
        })
    }
    const renderVideo = (message) => {
        const source = message.currentMessage.video;
        if (source) {
          return (
            <View style={chartStyles.videoContainer} key={message.currentMessage._id}>
              {Platform.OS === 'ios' ? <Video
                style={chartStyles.videoElement}
                shouldPlay
                height={156}
                width={242}
                muted={true}
                source={{ uri: source }}
                allowsExternalPlayback={false}></Video> : <VideoPlayer
                style={chartStyles.videoElement}
                source={{ uri: source }}
              />}
            </View>
          );
        }
        return <></>;
      };
    const handlePickImage = () => {
        // setUserChatMessagesLoading(true)
        ImagePicker.openPicker({
            cropping: true,
            freeStyleCropEnabled: true,
            compressImageQuality: 1,
            mediaType: "photo",
            width: 1700,
            height: 1700,
            smartAlbums: ['PhotoStream', 'Generic', 'Panoramas', 'Videos', 'Favorites', 'Timelapses', 'AllHidden', 'RecentlyAdded', 'Bursts', 'SlomoVideos', 'UserLibrary', 'SelfPortraits', 'Screenshots', 'DepthEffect', 'LivePhotos', 'Animated', 'LongExposure'],
        }).then(image => {
            const imagesss = image.path;
            const quality = 90;

            RNPhotoManipulator.optimize(imagesss, Platform.OS == "ios" ? 10 : 17).then(path => {
                setImageData({
                    uri: path,
                    name: image.path.split("/").pop(),
                    type: image.mime,
                    filename: image.filename,
                })
            });
        }).catch((err) => {
            console.log(err);
            setUserChatMessagesLoading(false)
        })
    }
    // const handleTestPickImage = () => {
    //     // setUserChatMessagesLoading(true)
    //     ImagePicker.openPicker({
    //         cropping: true,
    //         freeStyleCropEnabled: true,
    //         compressImageQuality: 1,
    //         mediaType: "photo",
    //         width: 1700,
    //         height: 1700,
    //         smartAlbums: ['PhotoStream', 'Generic', 'Panoramas', 'Videos', 'Favorites', 'Timelapses', 'AllHidden', 'RecentlyAdded', 'Bursts', 'SlomoVideos', 'UserLibrary', 'SelfPortraits', 'Screenshots', 'DepthEffect', 'LivePhotos', 'Animated', 'LongExposure'],
    //     }).then(image => {
    //         console.log(image)
    //         // setImageData({
    //         //     uri: Platform.OS == "ios" ? image.sourceURL : image.path,
    //         //     name: image.path.split("/").pop(),
    //         //     type: image.mime,
    //         //     filename: image.filename,
    //         // })
    //         const imagesss = image.path;
    //         const quality = 90;

    //         RNPhotoManipulator.optimize(imagesss, Platform.OS == "ios" ? 10 : 17).then(path => {
    //             setImageData({
    //                 uri: path,
    //                 name: image.path.split("/").pop(),
    //                 type: image.mime,
    //                 filename: image.filename,
    //             })
    //         });
    //     }).catch((err) => {
    //         console.log(err);
    //         setUserChatMessagesLoading(false)
    //     })
    // }

    const handleCaptureImage = () => {
        ImagePicker.openCamera({
            cropping: true,
            freeStyleCropEnabled: true,
            compressImageQuality: 1,
            mediaType: "photo",
            smartAlbums: ['PhotoStream', 'Generic', 'Panoramas', 'Videos', 'Favorites', 'Timelapses', 'AllHidden', 'RecentlyAdded', 'Bursts', 'SlomoVideos', 'UserLibrary', 'SelfPortraits', 'Screenshots', 'DepthEffect', 'LivePhotos', 'Animated', 'LongExposure'],
        }).then(image => {

            const imagesss = image.path;
            const quality = 90;

            RNPhotoManipulator.optimize(imagesss, Platform.OS == "ios" ? 10 : 17).then(path => {
                setImageData({
                    uri: path,
                    name: image.path.split("/").pop(),
                    type: image.mime,
                    filename: image.filename,
                })
            });
            // setImageData({
            //     uri: Platform.OS == "ios" ? image.sourceURL : image.path,
            //     name: image.path.split("/").pop(),
            //     type: image.mime,
            //     filename: image.filename,
            // })
        }).catch((err) => {
            console.log(err);
            setUserChatMessagesLoading(false)
        })
    }

    useEffect(async () => {
        if (imageData && imageData.name && imageData.uri) {
            try {
                let messg = {
                    _id: generateUUID(),
                    createdAt: new Date(),
                    user: {
                        _id: authState?.loginedUser?.id,
                        name: authState?.loginedUser?.name,
                        avatar: authState?.loginedUser?.profile_image
                    },
                    image: imageData.uri,
                    isImageExist: true,
                    isVideoExist: false
                }

                setMessages(previousMessages => GiftedChat.append(previousMessages, messg))
                const folderName = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id
                const uploadedUrl = await uploadImage(`${imageData.uri}`,
                    `${imageData.filename + generateUUID()}`,
                    `${folderName}`);
                if (uploadedUrl) {
                    let messages = {
                        ...messg,
                        image: uploadedUrl,
                        isImageExist: true,
                        isVideoExist: false
                    }

                    // setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
                    const docid = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id

                    firestore().collection('Chats')
                        .doc(`${docid}_${route.params.item?.postId}`)
                        .collection('messages')
                        .add({ ...messages, createdAt: firestore.FieldValue.serverTimestamp() })

                    updateSenderHistory(messages)
                    updateOwnHistory(messages)
                    let notificationPayload = {
                        receiverId: userData?.id,
                        messageText: messages.isImageExist ? "Image" : messages.isVideoExist ? "Video" : messages.text,
                        item: {
                            ...route.params.item,
                            userName: authState?.loginedUser?.name,
                            profile_image: authState?.loginedUser?.profile_image,
                            id: authState?.loginedUser?.id,
                            nameConfirmed: authState?.loginedUser?.name_confirmed,
                            rated: authState?.loginedUser?.rated,
                            createdAt: firestore.FieldValue.serverTimestamp(),
                            messageObj: {
                                ...messages
                            },
                            unseenCount: true,
                            chatId: `${docid}_${route.params.item?.postId}`
                        }
                    }

                    sendPushNotification(notificationPayload)

                    setImageData({})
                    setUserChatMessagesLoading(false)
                }

            } catch (e) {
                setImageData({})
                setUserChatMessagesLoading(false)
            }
        }
    }, [imageData]);


    useEffect(async () => {
        if (videoData && videoData.name && videoData.uri) {
            try {
                let messg = {
                    _id: generateUUID(),
                    createdAt: new Date(),
                    user: {
                        _id: authState?.loginedUser?.id,
                        name: authState?.loginedUser?.name,
                        avatar: authState?.loginedUser?.profile_image
                    },
                    video: videoData.uri,
                    isImageExist: false,
                    isVideoExist: true
                }

                setMessages(previousMessages => GiftedChat.append(previousMessages, messg))
                // const folderName = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id
                // const uploadedUrl = await uploadImage(`${imageData.uri}`,
                //     `${imageData.filename + generateUUID()}`,
                //     `${folderName}`);
                // if (uploadedUrl) {
                //     let messages = {
                //         ...messg,
                //         image: uploadedUrl,
                //         isImageExist: true,
                //         isVideoExist: false
                //     }

                //     // setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
                //     const docid = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id

                //     firestore().collection('Chats')
                //         .doc(`${docid}_${route.params.item?.postId}`)
                //         .collection('messages')
                //         .add({ ...messages, createdAt: firestore.FieldValue.serverTimestamp() })

                //     updateSenderHistory(messages)
                //     updateOwnHistory(messages)
                //     let notificationPayload = {
                //         receiverId: userData?.id,
                //         messageText: messages.isImageExist ? "Image" : messages.isVideoExist ? "Video" : messages.text,
                //         item: {
                //             ...route.params.item,
                //             userName: authState?.loginedUser?.name,
                //             profile_image: authState?.loginedUser?.profile_image,
                //             id: authState?.loginedUser?.id,
                //             nameConfirmed: authState?.loginedUser?.name_confirmed,
                //             rated: authState?.loginedUser?.rated,
                //             createdAt: firestore.FieldValue.serverTimestamp(),
                //             messageObj: {
                //                 ...messages
                //             },
                //             unseenCount: true,
                //             chatId: `${docid}_${route.params.item?.postId}`
                //         }
                //     }

                //     sendPushNotification(notificationPayload)

                //     setImageData({})
                setVideoData({})
                //     setUserChatMessagesLoading(false)
                // }

            } catch (e) {
                setVideoData({})
                setUserChatMessagesLoading(false)
            }
        }
    }, [videoData]);

    useEffect(() => {
        // getAllMessages() 
        // console.log(route.params, 'routes')

        const docid = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id
        const messageRef = firestore().collection('Chats')
            .doc(`${docid}_${route.params.item?.postId}`)
            .collection('messages')
            .orderBy('createdAt', "desc")
             .limit(pageno)
        const unSubscribe = messageRef.onSnapshot(async (querySnap) => {
            const allmsg = querySnap.docs.map(docSanp => {
                // console.log(docSanp.id)
                const data = docSanp.data()
                if (data.createdAt) {
                    return {
                        ...docSanp.data(),
                        docId: docSanp.id,
                        createdAt: docSanp.data().createdAt.toDate()
                    }
                } else {
                    return {
                        ...docSanp.data(),
                        docId: docSanp.id,
                        createdAt: new Date()
                    }
                }
            })

            let success = await firestore().collection('Chat_History')
                .doc(authState?.loginedUser?.id.toString())
                .collection('sender')
                .doc(`${route.params.item?.id}_${route.params.item?.postId}`)
                .update({
                    unseenCount: false
                })

            // console.log(allmsg,'slkfalf')

            setMessages(allmsg)
        })


        return () => {
            unSubscribe()
        }


    }, [route.params.item?.id])

    function renderActions(props) {
        return (
            <Actions
                {...props}
                options={{
                    ['Capture Image']: handleCaptureImage,
                    ['Select Image']: handlePickImage,
                    ['Select Video']: handleVideo,
                }}
                icon={() => (
                    <Image source={require("../images/camera.png")} style={{ height: hp("2.5"), width: hp("3.5") }} resizeMode={'contain'} />
                )}
            // onSend={args => console.log(args)}
            // onPressActionButton={args => console.log(args)}
            />
        )
    }

    const updateSenderHistory = (mssg) => {
        const docid = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id

        firestore().collection('Chat_History')
            .doc(route.params.item?.id.toString())
            .set({
                userName: userData?.name,
                profile_image: userData?.profile_image,
                id: userData?.id,
                nameConfirmed: userData?.name_confirmed,
                rated: userData?.rated,
                createdAt: firestore.FieldValue.serverTimestamp()
            }, { merge: false });

        firestore().collection('Chat_History')
            .doc(route.params.item?.id.toString())
            .collection('sender')
            .doc(`${authState?.loginedUser?.id}_${route.params.item?.postId}`)
            .set({
                ...route.params.item,
                userName: authState?.loginedUser?.name,
                profile_image: authState?.loginedUser?.profile_image,
                id: authState?.loginedUser?.id,
                nameConfirmed: authState?.loginedUser?.name_confirmed,
                rated: authState?.loginedUser?.rated,
                createdAt: firestore.FieldValue.serverTimestamp(),
                messageObj: {
                    ...mssg
                },
                chatId: `${docid}_${route.params.item?.postId}`,
                unseenCount: true

            }, { merge: false })
    }

    const updateOwnHistory = (mssg) => {
        const docid = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id

        firestore().collection('Chat_History')
            .doc(authState?.loginedUser?.id.toString())
            .set({
                userName: authState?.loginedUser?.name,
                profile_image: authState?.loginedUser?.profile_image,
                id: authState?.loginedUser?.id,
                nameConfirmed: authState?.loginedUser?.name_confirmed,
                rated: authState?.loginedUser?.rated,
                createdAt: firestore.FieldValue.serverTimestamp()
            }, { merge: false })

        firestore().collection('Chat_History')
            .doc(authState?.loginedUser?.id.toString())
            .collection('sender')
            .doc(`${route.params.item?.id}_${route.params.item?.postId}`)
            .set({
                ...route.params.item,
                userName: userData?.name,
                profile_image: userData?.profile_image,
                id: userData?.id,
                nameConfirmed: userData?.name_confirmed,
                rated: userData?.rated,
                createdAt: firestore.FieldValue.serverTimestamp(),
                messageObj: {
                    ...mssg
                },
                chatId: `${docid}_${route.params.item?.postId}`
            }, { merge: false });
    }

    const onSend = (messageArray) => {
        // console.log(messageArray, ' laksdfjlk f')
        const msg = messageArray[0]
        const mymsg = {
            ...msg,
            sentBy: authState?.loginedUser?.id,
            sentTo: userData?.id,
            createdAt: new Date(),
            isImageExist: false,
            isVideoExist: false
        }
        if (messageArray[0].text) {
            setMessages(previousMessages => GiftedChat.append(previousMessages, mymsg))
            const docid = userData?.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + userData?.id : userData?.id + "-" + authState?.loginedUser?.id

            firestore().collection('Chats')
                .doc(`${docid}_${route.params.item?.postId}`)
                .collection('messages')
                .add({ ...mymsg, createdAt: firestore.FieldValue.serverTimestamp() })

            updateSenderHistory(mymsg)
            updateOwnHistory(mymsg)
            let notificationPayload = {
                receiverId: userData?.id,
                messageText: mymsg.isImageExist ? "Image" : mymsg.isVideoExist ? "Video" : mymsg.text,
                item: {
                    ...route.params.item,
                    userName: authState?.loginedUser?.name,
                    profile_image: authState?.loginedUser?.profile_image,
                    id: authState?.loginedUser?.id,
                    nameConfirmed: authState?.loginedUser?.name_confirmed,
                    rated: authState?.loginedUser?.rated,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    messageObj: {
                        ...mymsg
                    },
                    unseenCount: true,
                    chatId: `${docid}_${route.params.item?.postId}`
                }
            }
            sendPushNotification(notificationPayload)
        }
    }
    const loadHandler =  () => {
        
      setpageno(pageno+10)
      const docid = route.params.item.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + route.params.item.id : route.params.item.id + "-" + authState?.loginedUser?.id
      const messageRef = firestore().collection('Chats')
          .doc(`${docid}_${route.params.item?.postId}`)
          .collection('messages')
          .orderBy('createdAt', "desc")
           .limit(pageno)
      const unSubscribe = messageRef.onSnapshot(async (querySnap) => {
          const allmsg = querySnap.docs.map(docSanp => {
              // console.log(docSanp.id)
              const data = docSanp.data()
              if (data.createdAt) {
                  return {
                      ...docSanp.data(),
                      docId: docSanp.id,
                      createdAt: docSanp.data().createdAt.toDate()
                  }
              } else {
                  return {
                      ...docSanp.data(),
                      docId: docSanp.id,
                      createdAt: new Date()
                  }
              }
          })

          let success = await firestore().collection('Chat_History')
              .doc(authState?.loginedUser?.id.toString())
              .collection('sender')
              .doc(`${route.params.item?.id}_${route.params.item?.postId}`)
              .update({
                  unseenCount: false
              })

          // console.log(allmsg,'slkfalf')

          setMessages(allmsg)
      })


      return () => {
          unSubscribe()
      }

           
        }
    let handleLongPress = (context, message) => {
        const options = authState?.loginedUser?.id == message.user._id ?
            ['Copy Text', 'Delete Message', 'Cancel'] : ['Copy Text', 'Cancel'];
        const cancelButtonIndex = options.length - 1;
        authState?.loginedUser?.id == message.user._id ?
            context.actionSheet().showActionSheetWithOptions({
                options,
                cancelButtonIndex
            }, async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        Clipboard.setString(message.text);
                        break;
                    case 1:
                        const docid = userData?.id > authState?.loginedUser?.id ? authState?.loginedUser?.id + "-" + userData?.id : userData?.id + "-" + authState?.loginedUser?.id
                        let deleteref = await firestore().collection('Chats')
                            .doc(`${docid}_${route.params.item?.postId}`)
                            .collection('messages')
                            .doc(message.docId)
                            .delete()
                        if (message.isImageExist) {
                            let imageRef = storage().refFromURL(message.image);
                            imageRef.delete()
                        }
                        break;
                    case 2:
                        break;
                }
            }) : context.actionSheet().showActionSheetWithOptions({
                options,
                cancelButtonIndex
            }, async (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        Clipboard.setString(message.text);
                        break;
                    case 1:
                        break;
                }
            })
    }



    return (
        <SafeAreaView style={chartStyles.mainContainer}>
            <View style={chartStyles.top_Header}>
                <TouchableOpacity
                    style={chartStyles.go_Back_Icon}
                    onPress={() => { navigation.navigate("Inbox") }}>
                    <Image source={require("../images/back-button.png")} style={chartStyles.go_Back_Icon_Img} resizeMode="contain" />
                </TouchableOpacity>

                <View style={chartStyles.top_HeaderRight}>
                    <Text style={chartStyles.top_HeaderText}>{route.name}</Text>
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

            {/* <KeyboardAvoidingView style={chartStyles.content_view}
                behavior={Platform.OS === "ios" ? "padding" : ""}
                keyboardShouldPersistTaps="always"
            > */}
            {/* <FlatList
                    data={userChatMessages}
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollDown && scrollViewRef.current.scrollToEnd({ animated: true })}
                    style={{ marginHorizontal: wp("5%") }}
                    keyExtractor={(item, index) => index.toString()}
                    onScroll={(event) =>
                        onContentOffsetChanged(event.nativeEvent.contentOffset.y)
                    }

                    onEndReached={() => {
                        setscrollDown(true)
                    }}

                    renderItem={renderChat}
                /> */}

            <GiftedChat
                messages={messages}
                showAvatarForEveryMessage={true}
                onSend={messages => onSend(messages)}
                user={{
                    _id: authState?.loginedUser?.id,
                    name: authState?.loginedUser?.name,
                    avatar: authState?.loginedUser?.profile_image
                }}

                loadEarlier={true}
                onLoadEarlier={() =>
                    loadHandler()
                //      {
                    // if (currentPagination != totalPagination) {
                    //     setpageno(pageno + 1)
                    // }
                // }
            }

                infiniteScroll={true}
                // showAvatarForEveryMessage={false}
                // showUserAvatar={true}
                renderAvatar={null}
                alwaysShowSend={true}
                // renderBubble={renderBubble}
                onLongPress={handleLongPress}
                renderSend={(props) => {
                    return (
                        <Send
                            {...props}
                            containerStyle={{
                                height: 60,
                                width: 60,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{}}>
                                <Image source={require("../images/send.png")} style={{ height: hp("5%"), width: hp("5%") }} resizeMode={'contain'} />
                            </View>
                        </Send>
                    );
                }}
                messagesContainerStyle={{ paddingBottom: 15 }}
                renderActions={renderActions}
                renderMessageVideo={renderVideo}
            // renderMessageImage={(item) => {
            //     console.log(item)
            // }}
            />

            {/* {testImg ? <Image source={{ uri: testImg }} style={{
                height: hp(50),
                width: hp(50)
            }} resizeMode="contain" /> : null} */}
            {/* <MessageBox sendMessage={sendMessage} /> */}
            {/* </KeyboardAvoidingView> */}
        </SafeAreaView>
    );
};

export default ChatScreen;