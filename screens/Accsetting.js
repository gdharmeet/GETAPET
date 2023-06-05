import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, SafeAreaView, } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { TouchableOpacity } from 'react-native-gesture-handler';

import {
    fontBold, grayBorderColor,
    themeColor, headerColor
} from '../common/common';

import { signOut } from "../services/authServices"
import { useAuthDispatch, useAuthState } from '../contexts/authContext'



const Accsetting = ({ navigation, route }) => {
    const dispatch = useAuthDispatch();
    let authState = useAuthState();

    useEffect(() => {
        if (authState.isSignout) {
            navigation.navigate("Home");
        }
    }, [authState])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} >
            <View style={styles.top_Header}>
                <View style={{ flex: 1, }}>
                    <TouchableOpacity onPress={() => { navigation.goBack() }}>
                        <Image source={require('../images/back-button.png')} style={styles.headerIcon} />
                    </TouchableOpacity>
                </View>
                <View style={styles.top_HeaderRight}>
                    <Text allowFontScaling={false} style={styles.top_HeaderText}>Account Settings</Text>
                </View>
                <View style={{ flex: 1, alignItems: "flex-end", }}></View>
            </View>
            <View style={[styles.content_view]}>
                {/* <SafeAreaView style={{ flex: 1, backgroundColor: "red" }}> */}
                <ScrollView>
                    <View>

                        <View style={{ flex: 1, flexDirection: "column", paddingTop: wp('4%') }}>

                            {/* 
                                Hide notification section on request of client 
                            */}
                            {/* <Text style={styles.headingBox}>Notifications</Text>
                            <TouchableOpacity 
                            // onPress={() => { navigation.navigate("Notifications") }}
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={styles.chat_Message}>Recommendations & Special Communications</Text>
                                    <View style={{
                                        justifyContent: 'center', //Centered horizontally
                                        alignItems: 'center'
                                    }}>
                                        <Image source={require('../images/right-arrow.png')} style={styles.chat_Img1} />
                                    </View>
                                </View>
                            </TouchableOpacity> */}

                            {/* <View style={styles.border_btm}></View> */}

                            <TouchableOpacity style={{ flexDirection: 'row', paddingTop: wp("3%"), }}
                                onPress={() => {
                                    signOut(dispatch, authState)
                                }}>
                                <Text style={styles.text}>Logout</Text>
                                <View style={{
                                    justifyContent: 'center', //Centered horizontally
                                    alignItems: 'center'
                                }}>
                                    <Image source={require('../images/right-arrow.png')} style={styles.chat_Img1} />
                                </View>
                            </TouchableOpacity>
                            <View style={styles.border_btm}></View>

                            {/* <View style={{ flexDirection: 'row', paddingTop: wp("3%"), }}>
                                <Text style={styles.text}>Deactivate my account and delete my data</Text>
                                <View style={{
                                    justifyContent: 'center', //Centered horizontally
                                    alignItems: 'center'
                                }}>
                                    <Image source={require('../images/right-arrow.png')} style={styles.chat_Img1} />
                                </View>
                            </View> */}
                            {/* <View style={styles.border_btm}></View> */}
                        </View>
                    </View>
                </ScrollView>
                {/* </SafeAreaView> */}
            </View>

        </SafeAreaView>



    );
};

const styles = StyleSheet.create({
    border_btm: {
        marginTop: 10,
        backgroundColor: grayBorderColor,
        width: wp("90%"),
        height: 2
    },
    chat_Message: {
        flex: 1,
        fontFamily: fontBold,
        color: "#000",


    },
    text: {

        flex: 1,
        fontFamily: fontBold,
        color: "#000",
        fontWeight: "bold"
    },



    chat_Img: {
        height: hp("12%"),
        width: hp("12%"),
        resizeMode: "cover",
        alignSelf: "flex-end"

    },
    chat_Img1: {
        height: hp("3%"),
        alignSelf: "center",
        resizeMode: "contain",
        justifyContent: "center",
    },
    headingBox: {

        paddingVertical: hp("0.75%"),
        fontFamily: fontBold,
        fontWeight: 'bold',
        fontSize: hp("2.2%"),
        paddingTop: wp('3%'),
        paddingBottom: wp('3%')
    },
    ////////////////////////////
    headerIcon: {
        height: hp("8%"), width: wp("14%")
    },
    content_view: {
        flex: 1,
        alignContent: 'flex-start',
        flexDirection: "column",
        paddingHorizontal: wp("5%")
    },

    top_Header: {
        backgroundColor: headerColor,
        paddingHorizontal: wp("4%"),
        paddingVertical: 0,
        justifyContent: "space-between",

        flexDirection: "row",
    },
    top_HeaderRight: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    top_HeaderText: {
        fontSize: wp("6%"),
        fontFamily: fontBold,
        fontWeight: "bold",
        color: themeColor,
    },

});


export default Accsetting;