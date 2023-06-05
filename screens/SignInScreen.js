import React, { useState, useRef, useEffect } from 'react';
import customToastMsg from '../subcomponents/CustomToastMsg';
import PhoneInput from 'react-native-phone-input';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Image,
    Text,
    TouchableOpacity,
    Keyboard,
    TextInput,
    KeyboardAvoidingView,
    TouchableHighlight,
    TouchableWithoutFeedback,
    Platform,
    Modal,
    Alert,
    ActivityIndicator
} from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import WebView from 'react-native-webview';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';

import CountryModal from '../subcomponents/CountryModal';
import { Loader } from '../subcomponents/Loader';
import {
    fontLight,
    themeColor,
    fontMediumTextColor,
    fontMedium,
    fontMediumTextColor3,
    fontRegular,
    fontMediumTextColor2,
    fontBold,
    grayBorderColor,
} from '../common/common';
import FacebookIcon from '../images/FacebookIcon';
import GoogleIcon from '../images/GoogleIcon';
import AppleIcon from '../images/AppleIcon';

import { validatePhoneNumber, nameValidate, numValidate } from '../common/helper';
import { numbername } from "../services/api"
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { useAuthDispatch, useAuthState } from '../contexts/authContext';
import { checkAuth } from '../services/authServices';

const TermsAndCondition = ({
    termCondition,
    setTermCondition,
}) => {
    const [spinner, setSpinner] = useState(true);
    return (

        <Modal
            animationType={'slide'}
            transparent={true}
            visible={termCondition}
            onRequestClose={() => {
                setTermCondition(!setTermCondition);
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.modal_Backdrop}>
                    <View style={styles.modal_Main_Wrap}>
                        <SafeAreaView style={{ flex: 1 }}>
                            <View style={styles.accordian_Header}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setTermCondition(!termCondition);
                                    }}>
                                    <Image
                                        source={require('../images/cancle.png')}
                                        resizeMode="contain"
                                        style={styles.cancle_Icon}
                                    />
                                </TouchableOpacity>
                                <Text style={{ ...styles.txtStyle1 }}>Terms and Conditions</Text>
                                <TouchableOpacity onPress={() => { }}>
                                </TouchableOpacity>
                            </View>
                            {spinner && <ActivityIndicator
                                color="#009688"
                                size="large"
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                }}
                            />}
                            <WebView
                                onLoadStart={() => {
                                    setSpinner(true)
                                }}
                                onLoadEnd={() => {
                                    setSpinner(false)
                                }}
                                // injectedJavaScript={false}
                                javaScriptEnabled={false}
                                originWhitelist={['*']}
                                style={{ flex: 1 }}
                                source={{ uri: 'https://docs.google.com/document/d/1N6xcYT9_Aq4MwOkIwer-pwzPDJXoHDsX/edit' }} />



                        </SafeAreaView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const SignInScreen = ({ navigation }) => {
    const [userName, setUserName] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [isSelected, setSelection] = useState(false);
    const [termCondition, setTermCondition] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCallingCode, setSelectedCallingCode] = useState('');
    const dispatch = useAuthDispatch()
    const [error, setError] = useState({
        error: false,
        attrname: '',
    });
    const [animate, setAnimate] = useState(false);

    const handleSendCode = async () => {
        numbername("post", { "name": userName, "number": number })

        // Request to send OTP
        let phoneNo = number;
        // console.log("out of try")
        try {
            // console.log("in try")

            const confirmation = await auth().signInWithPhoneNumber(phoneNo);
            // console.log(confirmation, "code")
            navigation.navigate('Verification', {
                number: number,
                confirmPass: confirmation,
            });
            setAnimate(false);
        } catch (err) {
            setAnimate(false);
            // console.log(err)

            if (err.code === 'missing-phone-number') {
                customToastMsg('Missing Phone Number.');
            } else if (err.code === 'auth/invalid-phone-number') {
                customToastMsg('Invalid Phone Number.');
            } else if (err.code === 'auth/quota-exceeded') {
                customToastMsg('SMS quota exceeded.Please try again later.');
            } else if (err.code === 'auth/user-disabled') {
                customToastMsg('Phone Number disabled. Please contact support.');
            }
        }
    };

    const signInUser = async navigation => {
        if (userName != '') {
            if (number != '' && validatePhoneNumber(number)) {
                setError({
                    error: false,
                    attrname: '',
                });
                // console.log(validatePhoneNumber(number));
                setAnimate(true);
                handleSendCode();
            } else {
                setError({
                    error: true,
                    attrname: 'number',
                });
            }
        } else {
            setError({
                error: true,
                attrname: 'userName',
            });
        }
    };



    const showLoader = () => {
        if (animate) {
            return <Loader />;
        }
        return null;
    }

    //Function login
    async function onFacebookButtonPress() {
        setAnimate(true);

        // Attempt login with permissions
        const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
        if (result.isCancelled) {
            throw 'User cancelled the login process';
        }

        // Once signed in, get the users AccesToken
        const data = await AccessToken.getCurrentAccessToken();

        if (!data) {
            throw 'Something went wrong obtaining access token';
        }

        // Create a Firebase credential with the AccessToken
        const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

        // console.log(facebookCredential, 'lkadsjfal')

        // Alert.alert(JSON.stringify(facebookCredential) + "facebookCredential")
        // Sign-in the user with the credential
        auth().signInWithCredential(facebookCredential).then((res) => {
            // console.log(res, 'aldfk')
            // Alert.alert(JSON.stringify(res) + "signInWithCredential")
            // setAnimate(false);

            checkAuth(dispatch, navigation, setAnimate)
        }).catch((err) => {
            setAnimate(false);
            customToastMsg(err.message)
        })
    }

    // google login implimentation need to be compleated droped for now
    async function onGoogleButtonPress() {
        setAnimate(true);

        const { idToken } = await GoogleSignin.signIn();
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        auth().signInWithCredential(googleCredential).then((res) => {
            // setAnimate(false);
            console.log(res)
            checkAuth(dispatch, navigation, setAnimate)
        }).catch((err) => {
            setAnimate(false);

            customToastMsg(err.message)
        })
    }

    async function onAppleButtonPress() {
        setAnimate(true);

        // performs login request
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        // Ensure Apple returned a user identityToken
        if (!appleAuthRequestResponse.identityToken) {
            customToastMsg('Apple Sign-In failed - no identify token returned');
        } else {
            // Create a Firebase credential from the response
            const { identityToken, nonce } = appleAuthRequestResponse;
            const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
            // console.log(appleCredential, 'applogin out')

            // Sign the user in with the credential
            auth().signInWithCredential(appleCredential)
                .then((res) => {
                    // console.log(res, 'applogin')
                    // setAnimate(false);

                    checkAuth(dispatch, navigation, setAnimate)
                }).catch((err) => {
                    setAnimate(false);
                    customToastMsg(err.message)
                });
        }
    }

    // Apple Login Implementation
    const appleLoginBtn = () => {
        if (Platform.OS === "ios") {
            return (
                <AppleButton
                    buttonStyle={AppleButton.Style.WHITE_OUTLINE}
                    buttonType={AppleButton.Type.SIGN_IN}
                    style={{
                        width: hp(5),
                        height: hp(5),
                    }}
                    onPress={() => {
                        if (isSelected) {
                            onAppleButtonPress()
                                .then(() => {
                                    // navigation.navigate('Home');
                                    checkAuth(dispatch, navigation)
                                    // console.log('Apple sign-in complete!')
                                })
                        } else {
                            customToastMsg("Please Accept Our Terms & Conditions.")
                        }
                    }
                    }
                />
            )
        }

        return null;
    }



    return (
        <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback
                onPress={() => { Keyboard.dismiss(); }}
            >
                <View style={styles.mainContainer}>
                    <View style={styles.content_view}>
                        <Text style={styles.HeadingText}>Welcome!</Text>
                        <Text style={styles.SubHeadingText}>
                            Thank you for joining GoGetaPet! . We’re here to help you find your
                            new pet.
                        </Text>
                        <View />

                        {/* <View style={styles.inner_content_view}> */}
                        <KeyboardAvoidingView style={styles.inner_content_view}>
                            {/* <TextInput
                                    placeholder={'Your Name'}
                                    value={userName}
                                    onChangeText={value => {
                                        if (nameValidate(value)) {
                                            setUserName(value);
                                            setError({
                                                error: false,
                                                attrname: '',
                                            });
                                        }
                                    }}
                                    style={styles.input}
                                    placeholderTextColor={fontMediumTextColor}
                                    selectionColor="black"
                                /> */}

                            {/* {error.error == true && error.attrname == 'userName' ? (
                                    <View style={{ flexDirection: 'row' }}>
                                        <Text style={styles.error_Code}>
                                            Please Enter Your Name
                                        </Text>
                                        <Image
                                            source={require('../images/eRROR.png')}
                                            style={styles.error_Img}
                                        />
                                    </View>
                                ) : null} */}

                            {/* <View>
                                    <PhoneInput
                                        ref={phonePicker}
                                        onPressFlag={onPressFlag}
                                        initialCountry="us"
                                        autoFormat={true}
                                        style={{ ...styles.input, marginTop: 0, paddingLeft: 6 }}
                                        textStyle={{
                                            color: fontMediumTextColor2,
                                            fontSize: wp('4.5%'),
                                        }}
                                        onChangePhoneNumber={i => {
                                            let phCurr = phonePicker.current.getValue();
                                            setNumber(phCurr);
                                        }}
                                    />
                                    <CountryModal
                                        isModalVisible={isModalVisible}
                                        setIsModalVisible={setIsModalVisible}
                                        selectedCallingCode={selectedCallingCode}
                                        selectCountry={selectCountry}
                                    />

                                    {error.error == true && error.attrname == 'number' ? (
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }}>
                                            <Text style={styles.error_Code}>
                                                Please enter a valid number.
                                            </Text>
                                            <Image
                                                source={require('../images/eRROR.png')}
                                                style={styles.error_Img}
                                            />
                                        </View>
                                    ) : null}
                                </View> */}


                            {/* <TouchableOpacity
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        signInUser(navigation);
                                        // onGoogleButtonPress()
                                        // onFacebookButtonPress()
                                    }}
                                    style={styles.submitBtnBG}>
                                    <Text style={styles.submitTxt}>Submit</Text>
                                </TouchableOpacity> */}
                            <View style={styles.checkboxContainer}>
                                {/* <CheckBox
                                    value={isSelected}
                                    onValueChange={setSelection}
                                    style={styles.checkbox}
                                /> */}
                                <BouncyCheckbox
                                    size={25}
                                    fillColor={themeColor}
                                    unfillColor="#ffffff"
                                    // text="Custom Checkbox"
                                    iconStyle={{ borderColor: themeColor, borderRadius: 0, marginRight: -15 }}
                                    textStyle={{}}
                                    onPress={(isChecked) => {
                                        setSelection(isChecked)
                                    }}
                                />
                                <TouchableOpacity onPress={() => {
                                    setTermCondition(true)
                                }}>
                                    <Text style={styles.label}>Accept Terms & Conditions</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.socialText}>Login with</Text>
                            <View style={styles.socialIconsOuterView}>
                                <TouchableOpacity onPress={() => {
                                    if (isSelected) {
                                        onFacebookButtonPress()
                                    } else {
                                        customToastMsg("Please Accept Our Terms & Conditions.")
                                    }
                                }}>
                                    <View style={styles.socialIconView}>
                                        <FacebookIcon />
                                    </View>

                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    if (isSelected) {
                                        onGoogleButtonPress()
                                    } else {
                                        customToastMsg("Please Accept Our Terms & Conditions.")
                                    }
                                }}>
                                    <View style={styles.socialIconView}>
                                        <GoogleIcon />
                                    </View>
                                </TouchableOpacity>

                                {/* {appleLoginBtn()} */}
                                {Platform.OS == 'ios' &&
                                    <View style={[styles.socialIconView]} >
                                        <AppleButton
                                            buttonStyle={AppleButton.Style.WHITE}
                                            buttonType={AppleButton.Type.SIGN_IN}
                                            cornerRadius={0}
                                            style={{
                                                width: hp(7.5),
                                                height: hp(7),
                                                transform: [{ scale: 2 }]
                                            }}
                                            onPress={() => {
                                                if (isSelected) {
                                                    onAppleButtonPress()
                                                        .then(() => {
                                                            // navigation.navigate('Home');
                                                            checkAuth(dispatch, navigation)
                                                            // console.log('Apple sign-in complete!')
                                                        })
                                                } else {
                                                    customToastMsg("Please Accept Our Terms & Conditions.")
                                                }
                                            }}
                                        />
                                    </View>
                                }
                            </View>
                        </KeyboardAvoidingView>
                        {/* </View> */}
                    </View>
                    <View style={styles.logo_view}>
                        <Image
                            source={require('../images/appLogo.png')}
                            style={styles.logoStyle}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            {showLoader()}
            <TermsAndCondition termCondition={termCondition} setTermCondition={setTermCondition} />
        </View>
    );
};

const styles = StyleSheet.create({
    txtBelowLoginBtn: {
        fontSize: hp(3.4),
        lineHeight: 16,
        textAlign: "center",
    },
    socialIconsOuterView: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        paddingHorizontal: wp(10)
    },
    // socialIconView: {
    //     borderStyle: "solid",
    //     borderColor: "#000",
    //     borderWidth: 1,
    //     borderRadius: 5,
    //     width: hp(5),
    //     height: hp(5),
    //     justifyContent: "center",
    //     alignItems: "center",
    //     elevation: 1
    // },
    form_input: {
        color: fontMediumTextColor,
        borderBottomWidth: 1,
        borderColor: grayBorderColor,
        marginTop: 20,
        marginBottom: 5,
    },
    mainContainer: {
        flex: 1,
        // paddingTop: Platform.OS === 'ios' ? 20 : 0,
        backgroundColor: "#FFF",
    },

    logo_view: {
        alignItems: 'center',
        justifyContent: "center",
        flex: 1,
        bottom: 10
    },
    logoStyle: {
        width: wp('60%'),
        height: wp('60%'),
        resizeMode: 'contain',
    },
    content_view: {
        marginTop: hp('8%'),
        paddingHorizontal: wp('10%'),
        backgroundColor: '#D9DDDC',
        shadowColor: '#eceef5',
        borderRadius: 40,
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.65,
        elevation: 12,
    },
    input: {
        paddingHorizontal: 5,
        backgroundColor: '#FFFFFF',
        color: '#000',
        height: hp('7%'),
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#d1d1d1',
        borderBottomWidth: 0,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6.65,
        elevation: 3,
    },
    inner_content_view: {
        paddingBottom: 20,
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    HeadingText: {
        marginTop: hp('3.8%'),
        textAlign: 'left',
        fontFamily: fontBold,
        fontWeight: 'bold',
        fontSize: hp('3.4%'),
        opacity: 1,
        color: '#000',
        marginBottom: 8,
    },
    socialText: {
        textAlign: 'center',
        fontFamily: fontRegular,
        fontSize: hp('2.5%'),
        opacity: 1,
        color: fontMediumTextColor2,
        marginBottom: hp('1%'),

    },

    SubHeadingText: {
        textAlign: 'left',
        fontFamily: fontRegular,
        fontSize: hp('2.5%'),
        opacity: 1,
        color: fontMediumTextColor2,
        marginBottom: hp('5%'),
    },

    submitBtnBG: {
        backgroundColor: themeColor,
        width: wp('30%'),
        height: hp('7%'),
        textAlign: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        opacity: 1,
        marginTop: hp('2.5%'),
        marginBottom: hp('1%'),
        shadowColor: fontMediumTextColor3,
        borderRadius: 10,
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 20,
    },
    submitTxt: {
        textAlign: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        color: '#FFFFFF',
        fontFamily: fontMedium,
        fontSize: hp('2.4%'),
    },
    error_Code: {
        color: 'red',
        fontSize: wp('3%'),
    },
    error_Img: {
        height: wp('4%'),
        width: wp('4%'),
        resizeMode: 'contain',
    },
    checkboxContainer: {
        flexDirection: "row",
        // marginBottom: 20,
        // alignItems: "center",
        justifyContent: "center"
    },
    checkbox: {
        alignSelf: "center",
    },
    label: {
        margin: 8,
        fontWeight: 'bold',
        color: themeColor
    },
    modal_Backdrop: {
        flex: 1,
        backgroundColor: '#00000091',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modal_Main_Wrap: {
        width: wp('100%'),
        // height: hp('91%'),
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    sec_padding: {
        paddingHorizontal: wp('4%'),
        // marginTop: 20
    },
    accordian_Header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 5,
        marginBottom: 15,
    },
    cancle_Icon: {
        height: hp('3%'),
        width: wp('5%'),
    },
    txtStyle1: {
        fontFamily: fontBold,
        // marginBottom: 10,
        fontSize: wp('4.7%'),
        fontWeight: 'bold',
    },
    txtStyle2: {
        // textAlign: "center",
        fontFamily: fontLight,
        color: fontMediumTextColor2,
        // marginBottom: 5,
        fontSize: wp('3.7%'),
    },
    socialIconView: {
        borderStyle: "solid",
        borderColor: fontMediumTextColor2,
        borderWidth: 1,
        width: wp(16),
        height: hp(7),
        justifyContent: "center",
        alignItems: "center",
        elevation: 1,
        zIndex: 1,
        position: "relative",
        overflow: 'hidden',
        backgroundColor: "#fff",
        borderRadius: 5,
    },
});

export default SignInScreen;
