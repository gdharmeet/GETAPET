import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Text,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    LayoutAnimation,
    Platform,
    UIManager,
    SafeAreaView,
    ScrollView,
    TextInput,
    Modal,
    Dimensions
} from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { runAllHomeApi, fetchTestFilterPost, fetchMorePost, fetchFilterPost } from '../services/api';
import { useHomeDispatch, useHomeState } from '../contexts/HomeContext';

import FastImage from 'react-native-fast-image'

const FastImageWrap = React.memo(({ petImages, index, item }) => {
    return <FastImage
        style={styles.pets_Image}
        source={petImages && petImages?.post.length && petImages?.post[index]?.cover_image.length ? {
            uri: petImages?.post[index]?.cover_image[0]?.image_url,
            priority: FastImage.priority.normal,
        } : require("../images/no-image.png")}
        resizeMode={FastImage.resizeMode.cover}
    />
})

const { width } = Dimensions.get("window");

const PetImages = React.memo(({ petImages, index, item }) => {
    return <Image
        source={petImages && petImages?.post.length && petImages?.post[index]?.cover_image.length ? {
            uri: petImages?.post[index]?.cover_image[0]?.image_url,
        } : require("../images/no-image.png")}
        style={styles.pets_Image}
        resizeMode="cover"
    />
})

function PetList({
    petImages,
    navigation,
    search,
    setSearchTerm,
    getDataAcc,
    searchTerm,
    selectedValueCat,
    longitude,
    latitude,
    selectedValueLoc,
    homeAfterSearch,
    setLatitude,
    setLongitude

}) {
    let dispatchHome = useHomeDispatch();
    let stateHome = useHomeState();
    const [hasScrolled, setHasScrolled] = useState(false)
    // useEffect(() => {
    // fetchFilterPost(
    //   dispatchHome,
    //   1,
    //   search,
    //   stateHome.post,
    //   getDataAcc,

    // );
    // setTimeout(() => {
    //   fetchFilterPost(dispatchHome, stateHome.page, search, stateHome.post);
    // }, 3000);
    // }, [search]);

    // useEffect(async () => {
    //   fetchFilterPost(dispatchHome, stateHome.page, search, stateHome.post);
    // }, [stateHome.page]);
    // console.log(search, 'here is search', stateHome.page);

    return (
        <>
            {/* {petImages?.post ?
                <View style={styles.noListStyle}>
                    <Text>
                        There is no post to show right now.
                    </Text>
                </View>
                : */}


            <FlatList
                //    horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                style={styles.pets_Image_Wrapper}
                data={petImages?.post}
                refreshing={false}
                onEndReachedThreshold={0.4}
                onScroll={() => {
                    setHasScrolled(true)
                }}
                onEndReached={() => {
                    // if (search || getDataAcc?.length) {
                    //   fetchFilterPost(
                    //     dispatchHome,
                    //     stateHome.page,
                    //     search,
                    //     stateHome.post,
                    //     getDataAcc,

                    //   );
                    //   // fetchFilterPost(stateHome.page, dispatchHome, stateHome.post)
                    // } else {
                    if (hasScrolled) {
                        // console.log(homeAfterSearch)
                        fetchTestFilterPost(
                            dispatchHome,
                            stateHome,
                            searchTerm,
                            getDataAcc?.id,
                            // sort = '',
                            selectedValueCat,
                            homeAfterSearch && homeAfterSearch.isSearch || homeAfterSearch && homeAfterSearch.fromLoc ? longitude : "",
                            homeAfterSearch && homeAfterSearch.isSearch || homeAfterSearch && homeAfterSearch.fromLoc ? latitude : "",
                            homeAfterSearch && homeAfterSearch.isSearch || homeAfterSearch && homeAfterSearch.fromLoc ? selectedValueLoc : "",
                            true

                            // min = '',
                            // max = '',
                        )
                        setHasScrolled(false);
                    }
                    //   fetchMorePost(stateHome.page, dispatchHome, stateHome.post);
                    // }
                }}
                onRefresh={() => {
                    // console.log(longitude, latitude, homeAfterSearch)
                    fetchTestFilterPost(
                        dispatchHome,
                        stateHome,
                        searchTerm,
                        "",
                        "",
                        // sort = '',
                        homeAfterSearch && homeAfterSearch.isSearch ? longitude : "",
                        homeAfterSearch && homeAfterSearch.isSearch ? latitude : "",
                        homeAfterSearch && homeAfterSearch.isSearch ? selectedValueLoc : "",
                        false

                        // min = '',
                        // max = '',
                    )
                }}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity
                            style={styles.btn}
                            key={Date()}
                            onPress={() => {
                                navigation.navigate({ name: 'Post', params: { id: item.id, setLatitude, setLongitude } });
                            }}>
                            {/* <Image
                                source={petImages && petImages?.post.length && petImages?.post[index]?.cover_image.length ? {
                                    uri: petImages?.post[index]?.cover_image[0]?.image_url,
                                } : require("../images/no-image.png")}
                                style={styles.pets_Image}
                                resizeMode="cover"
                            /> */}

                            {/* <PetImages petImages={petImages} index={index} item={item} /> */}

                            <FastImageWrap petImages={petImages} index={index} item={item} />
                        </TouchableOpacity>
                    );
                }}
                keyExtractor={(item, index) => {
                    return index;
                }}
                numColumns={3}
            />
            {/* } */}
        </>
    );
}

export default PetList;

const styles = StyleSheet.create({
    noListStyle: {
        flex: 1,
        alignSelf: "center",
        justifyContent: "center",
        paddingHorizontal: wp("5%")
    },
    pets_Image_Wrapper: Platform.OS == "android" ? {
        flexDirection: 'row',
        flexWrap: 'wrap',
    } : {
        width: "100%"
    },
    pets_Image: Platform.OS == "android" ? {
        height: hp('15%'),
        width: wp('31.3%'),
        marginHorizontal: wp('1%'),
        marginVertical: hp('0.5%'),
    } : {
        height: width / 3,
        width: '100%',
    },
    btn: Platform.OS == "ios" ? {
        flex: 1 / 3,
        paddingHorizontal: wp(1),
        paddingVertical: hp(0.5)
    } : {}
});
