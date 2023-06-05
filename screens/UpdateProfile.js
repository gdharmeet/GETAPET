import React, { useEffect, useState } from 'react';
import {
    View,

    StyleSheet,
    SafeAreaView,
    Image,
    Text,
    TouchableOpacity,
    Keyboard,
    Alert,
    Modal
} from 'react-native';

import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp
} from 'react-native-responsive-screen';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import { BaseURL } from '../services/Constant';

import {
    themeColor, fontMediumTextColor, fontMedium, fontBold,
    fontMediumTextColor3, fontMediumTextColor2, textInputBorderColor
} from '../common/common';
import { useAuthDispatch, useAuthState } from '../contexts/authContext';
import { TextInput } from 'react-native-gesture-handler';
import { fetchUserDetail, updateProfileName } from '../services/api';
import { useProfileDispatch, useProfileState } from '../contexts/profileContext';
import ImagePicker from 'react-native-image-crop-picker';
const lables = {
    fontSizeFocused: wp("3.5%"),
    fontSizeBlurred: wp("4.5%"),
    colorFocused: fontMediumTextColor3,
    colorBlurred: fontMediumTextColor2,
}
const inputStyles = {
    paddingTop: 15,
    paddingBottom: 5,
    fontSize: wp("4.5%")
}
const UpdateProfileScreen = ({ navigation }) => {
    // const dispatch = useAuthDispatch();
    const authState = useAuthState();
    const profileState = useProfileState();
    const authDispatch = useAuthDispatch();
    const profileDispatch = useProfileDispatch();

    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState("");
    const [error, setError] = useState({
        error: false,
        attrname: ""
    })

    useEffect(() => {
        if (authState.hasOwnProperty("loginedUser")) {
            if (!authState?.loginedUser?.name_confirmed) {
                setName(authState?.loginedUser?.name)
            }
        }
    }, [authState])
    // const forgotPass = async () => {
    //     // setSignInLoading(true);
    //     // name-confirmed
    //     if (email != "") {
    //         setError({
    //             error: false,
    //             attrname: ""
    //         })
    //         setShowModal(true);

    //         forgot(email)
    //             .then((r) => {
    //                 console.log(r);
    //                 dispatch({ type: 'SIGN_IN', token: r });
    //             })
    //             .catch((e) => {
    //                 console.log(e);
    //             })
    //             .finally(() => {
    //                 // setSignInLoading(false)
    //             });
    //     } else {
    //         setError({
    //             error: true,
    //             attrname: "email"
    //         })
    //     }
    // };

    const updateName = async () => {

        if (authState.hasOwnProperty("loginedUser")) {
            if (!authState.loginedUser.name_confirmed) {
                let x = await updateProfileName(name, authDispatch);
                // console.log(x, "testing ")
                // if(){
                //     fetchUserDetail(res.user.id).then((res) => {
                //         dispatch({ type: "SIGN_IN_USER", loginedUser: res.data })
                //     })
                // }
            }
        }
    }

    return (<Modal animationType={"fade"}
        transparent={true}
        visible={profileState.updateProfile}
        onRequestClose={() => { setShowModal(!showModal); }} >
        <View style={{ flex: 1, backgroundColor: "#00000091", justifyContent: "space-evenly", alignItems: "center" }}>
            <View style={{ width: wp('96%'), height:hp("90%"),backgroundColor: "white", paddingHorizontal: 8, paddingVertical: 50, borderRadius: 20, justifyContent:"space-between" }}>
                <View style={{ alignItems: "center", paddingHorizontal: wp("10%") }}>
                    {/* <Image source={require("../images/mail_send.png")} style={{ width: wp('30%'), height: hp("20%"), resizeMode: "contain", marginBottom: 20 }} /> */}

                    <Text style={{...styles.txtStyle, fontSize:25}}>Confirm  Profile Info</Text>
                    <Text style={{ ...styles.txtStyle1,fontSize:20, textAlign: "center",marginTop:30 }}>This is only for one time you have to provide this information.</Text>
                    <View style={{ flexDirection: "row", marginTop:30}}>
                        <Text style={{
                            flex: 1,
                            fontFamily: fontBold,
                            fontSize:20,
                            textAlign: "left",
                            marginTop: 30,
                            marginRight:50,
                            color:themeColor
                        }}>Profile Image</Text>
                       <View style={{ position: "relative"}}>
                                <Image source={authState?.loginedUser && authState?.loginedUser?.profile_image ? {
                                    uri: authState?.loginedUser?.profile_image}:
                                    // alert("please select your profile picture")
                               require("../images/defaultProfile.png")
                            }


                                    // source={{
                                    //     uri: authState?.loginedUser?.profile_image
                                    // }} 
                                    resizeMode="cover" style={{
                                        height: hp("17%"),
                                        width: hp("17%"),
                                        resizeMode: "cover",
                                        alignContent: 'center',
                                        marginTop:10
                                    }} />
                                <View style={{ position: "absolute", top: 0, right: 0 }}>
                                    <TouchableOpacity onPress={() => {
                                        ImagePicker.openPicker({
                                            // width: 300,
                                            // height: 400,
                                            cropping: true,
                                            freeStyleCropEnabled: true,
                                            mediaType: "photo",
                                            smartAlbums: ['PhotoStream', 'Generic', 'Panoramas', 'Videos', 'Favorites', 'Timelapses', 'AllHidden', 'RecentlyAdded', 'Bursts', 'SlomoVideos', 'UserLibrary', 'SelfPortraits', 'Screenshots', 'DepthEffect', 'LivePhotos', 'Animated', 'LongExposure']
                                        }).then(image => {
                                            var data = new FormData();
                                            data.append('profile_picture', {
                                                uri: image.path,
                                                name: image.path.split("/").pop(),
                                                type: image.mime
                                            });
                                            // console.log(data)

                                            fetch(`${BaseURL}change_profile_picture`, {
                                                method: 'POST',
                                                headers: {
                                                    Accept: 'application/json',
                                                    'Content-Type': 'application/json',

                                                    'Content-Type': 'multipart/form-data;',
                                                    'Authorization': `Bearer ${authState?.userToken}`
                                                },
                                                body: data,
                                            })
                                                .then(response => response.json())
                                                .then(response => {
                                                    authDispatch({ type: "SIGN_IN_USER", loginedUser: response.data })
                                                })


                                        }).catch((err) => {
                                            console.log(err);
                                        })
                                    }} style={{ width: wp("4.5%"), height: hp("3%"), overflow: "hidden", backgroundColor: "#ffffffe0", borderRadius: 3, justifyContent: "center" }}>
                                        <Image resizeMode="contain" style={{ width: wp("4%"), height: hp("3%"), alignSelf: "center" }} source={require('../images/edit.png')} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                    </View>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop:20
                        // justifyContent: "space-between",
                        // paddingLeft: wp(10)
                    }}>
                        <Text style={{
                             flex: 1,
                            fontFamily: fontBold,
                            fontSize:20,
                            textAlign: "left",
                            marginTop: 12,
                            marginRight: 30,
                            color:themeColor
                        }}>Name</Text>
                        <TextInput
                            value={name}
                            style={styles.inputSearchBox}
                            onChangeText={(value) => {
                                setName(value)
                            }}
                            onBlur={() => {
                                if (!name) {
                                    setName(authState?.loginedUser?.name)
                                }
                            }}
                            maxLength={20}
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 35 }}>

                    {/* TODO: Continue Btn */}
                    <TouchableOpacity
                        onPress={() => {
                            if (name) {
                                updateName();
                                profileDispatch({ type: "CONF_INFO", payload: false })
                            } else {
                                Alert.alert("Name should not be empty")
                                setName(authState?.loginedUser?.name)
                            }
                        }}
                        style={styles.btnStyle} >
                        <Text style={styles.btnTxtStyle}>CONTINUE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
    );
};
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        // paddingTop: (Platform.OS === 'ios') ? 20 : 0,
        backgroundColor: "#FFFFFF"
    },
    logo_view: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        marginTop: hp('11%'),
        marginBottom: hp("5%")
    },
    logoStyle: {
        width: wp('41%'),
        height: hp('16%'),
        resizeMode: 'contain'
    },
    content_view: {
        paddingHorizontal: 25
    },
    inner_content_view: {
        paddingBottom: 20,
    },
    HeadingText: {
        textAlign: "left",
        fontFamily: fontMedium,
        fontSize: hp('3.4%'),
        opacity: 1,
        color: fontMediumTextColor3,
        marginBottom: 8
    },
    headingView: {
        // marginTop: hp('1%'),
        // marginBottom: hp('3%'),
        backgroundColor: "#81CED4",
        width: wp('11%'),
        flex: 1,
        height: hp('0.5%'),
        opacity: 1
    },

    loginRegisterBtnBG: {
        backgroundColor: themeColor,
        width: wp('49%'),
        height: hp('6%'),
        alignSelf: "center",
        justifyContent: "center",
        borderRadius: 50,
        opacity: 1,
        marginTop: hp('5%')
    },
    loginRegisterTxt: {
        textAlign: "center",
        color: "#FFFFFF",
        fontFamily: fontMedium,
        fontSize: hp('1.97%')
    },

    txtStyle: {
        fontFamily: fontBold,
        color: themeColor,
        // marginBottom: 20,
        fontSize: wp("5%"),
        fontWeight: "bold",
        textAlign: "center"
    },
    txtStyle1: {
        textAlign: "center",
        fontFamily: fontBold,
        fontSize: wp("3.8%"),
        color: "#959595",
        letterSpacing: 0.56,
        marginTop: 5
    },

    form_input: {
        color: fontMediumTextColor,
        borderBottomWidth: 1,
        borderColor: textInputBorderColor,
        marginTop: 20,
        marginBottom: 5
    },
    btnStyle: {
        backgroundColor: themeColor,
        width: "100%",
        height: 40,
        // padding: 10,
        justifyContent: "center",
        borderRadius: 5,
        marginTop: 20,

    },
    btnTxtStyle: {
        textAlign: "center",
        color: "#FFFFFF",
        fontFamily: fontBold,
        // fontSize: 14
    },

    error_Code: {
        color: "red",
        fontSize: wp("3%")
    },
    error_Img: {
        position: "absolute",
        right: 0,
        bottom: 8,
        width: wp("5%"),
        resizeMode: "contain"
    },
    inputSearchBox: {
        // height: hp('5%'),
        // flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 10,
        // position: "relative",
        paddingHorizontal: 35,
        color: '#000',
        // width: wp(80),
        borderWidth: 1,
        borderColor: '#d1d1d1',
        borderBottomWidth: 0,
        shadowColor: fontMediumTextColor3,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.4,
        shadowRadius: 6.65,
        elevation: 10,
        paddingVertical: 10,
        marginTop: 20,
        maxWidth: 200,
    }
});
export default UpdateProfileScreen;