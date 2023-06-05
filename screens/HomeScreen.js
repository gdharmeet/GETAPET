import React, { useState, useEffect } from 'react';
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	Keyboard,
	SafeAreaView,
	ScrollView,
	TextInput,
	Modal,
	Platform,
	KeyboardAvoidingView
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Loader } from '../subcomponents/Loader';

import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Picker } from '@react-native-picker/picker';
import Slider from "react-native-slider";

import { fetchBreed, numbername, async } from '../services/api';
import { themeColor, MAP_API_KEY } from '../common/common';
import Accordian from '../subcomponents/Accordian';
import PetList from '../subcomponents/PetList';
import { requestLocationPermission } from '../subcomponents/latLong';
import { locationName } from '../subcomponents/locationName';
import { useHomeDispatch, useHomeState } from '../contexts/HomeContext';
import { runAllHomeApi, fetchFilterPost, fetchTestFilterPost, fetchAllChat } from '../services/api';
import { homeStyles } from './HomeScreenStyles';
import { useAuthDispatch, useAuthState } from '../contexts/authContext';
import customToastMsg from '../subcomponents/CustomToastMsg';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { firebase } from '@react-native-firebase/dynamic-links';
// import { getAppLaunchLink } from '../common/helper';
import { useProfileDispatch } from '../contexts/profileContext';
import { getAppLaunchLink } from '../common/helper';
import { firebase } from '@react-native-firebase/dynamic-links';
import PushNotification from 'react-native-push-notification';
import { useDispatch, useSelector } from 'react-redux';
import { setChatScreenFocused } from '../redux/actions/activeScreenAction';
import PushNotificationIOS from '@react-native-community/push-notification-ios';


const upArrow = require('../images/up-arrow.png');
const downArrow = require('../images/down-arrow.png');
const rightArrow = require('../images/right-arrow.png');

const sortingItem = [
	'Newest(default)',
	'Closest',
	'Price: Low to High',
	'Price: High to Low',
];

const FiltersModal = ({
	filtersModal,
	setFiltersModal,
	selectedValueCat,
	setSelectedValueCat,
	selectedValueLoc,
	setSelectedValueLoc,
	stateHome,
	setCatgValue,
	catgValue,
	dispatchHome,
	searchTerm,
	setGetDataAcc,
	getDataAcc,
	state, city, setHitNow, hitNow,
	longitude, latitude
}) => {
	return (
		<Modal
			animationType={'slide'}
			transparent={true}
			visible={filtersModal}
			onRequestClose={() => {
				setFiltersModal(!filtersModal);
			}}>
			<View style={homeStyles.modal_Backdrop}>
				<View style={homeStyles.modal_Main_Wrap}>
					<SafeAreaView style={{ flex: 1 }}>
						<View style={[homeStyles.sec_padding, { flex: 1 }]}>
							<View style={homeStyles.accordian_Header}>
								<TouchableOpacity
									onPress={() => {
										setFiltersModal(!filtersModal);
									}}>
									<Image
										source={require('../images/cancle.png')}
										resizeMode="contain"
										style={homeStyles.cancle_Icon}
									/>
								</TouchableOpacity>
								<Text style={{ ...homeStyles.txtStyle1 }}>Filter</Text>
								<TouchableOpacity onPress={() => {
									dispatchHome({ type: "FILTER_STATUS", payload: true })
									setFiltersModal(!filtersModal);
									// fetchFilterPost(
									// 	dispatchHome,
									// 	1,
									// 	searchTerm,
									// 	stateHome.data,
									// 	getDataAcc.id,

									// 	catgValue,
									// );
									setGetDataAcc("")
									// console.log(getDataAcc?.id, selectedValueCat, selectedValueLoc)
									dispatchHome({ type: "Loading", payload: true })
									dispatchHome({ type: "FILTER_STATUS", payload: false })

									fetchTestFilterPost(
										dispatchHome,
										stateHome,
										searchTerm,
										"",
										// sort = '',
										selectedValueCat,
										"",
										"",
										selectedValueLoc,
										false

										// min = '',
										// max = '',
									)
								}}>
									<Text
										style={{
											...homeStyles.txtStyle2,
											fontSize: wp('3.7%'),
											fontWeight: 'bold',
											color: themeColor,
										}}>
										Clear
									</Text>
								</TouchableOpacity>
							</View>
							<ScrollView contentContainerStyle={{ flex: 1 }}>
								<View style={homeStyles.filter_Wrap}>
									<Text style={homeStyles.filter_Text}>Categories</Text>
									<Picker
										selectedValue={selectedValueCat}
										style={homeStyles.filter_Picker}
										onValueChange={(itemValue, itemIndex) => {
											setSelectedValueCat(itemValue)
										}}
									>
										<Picker.Item
											label="All Categories"
											value="All Categories"
										/>
										{stateHome.catg.map((item, index) => {

											return (
												<Picker.Item
													key={index}
													onValueChange={value => {
														setCatgValue(value);
													}}
													label={item.name}
													value={item.id}
												/>
											);
										})}
									</Picker>
								</View>
								<View style={homeStyles.filter_Wrap}>
									<Text style={homeStyles.filter_Text}>Location</Text>

									{state?.length && city?.length ?
										<>
											<Text style={[homeStyles.filter_Picker, { textAlign: "center" }]}>{selectedValueLoc} Miles</Text>
											<Slider
												value={parseInt(selectedValueLoc)}
												minimumValue={0}
												maximumValue={1000}
												onValueChange={value => setSelectedValueLoc(value)}
												step={1}
											/>
										</>
										:
										<Text style={homeStyles.filter_Text}>Please let us know your current location</Text>
									}

								</View>
								{/* <View style={[homeStyles.filter_Wrap, { borderBottomWidth: 0 }]}>
									<Text style={homeStyles.filter_Text}>Price range</Text>
									<View style={homeStyles.price_Wrapper}>
										<TextInput
											style={homeStyles.price_Range}
											keyboardType="number-pad"
											value={inputRangeMin}
											placeholder="Min"
											onChange={value => {
												setInputRangeMin(value);
											}}
										/>
										<Text style={homeStyles.price_Text}>To</Text>
										<TextInput
											style={homeStyles.price_Range}
											keyboardType="number-pad"
											value={inputRangeMax}
											placeholder="Max"
											onChange={value => {
												setInputRangeMax(value);
											}}
										/>
									</View>
								</View> */}
							</ScrollView>

							<View>
								<TouchableOpacity
									onPress={() => {
										setFiltersModal(!filtersModal);
										// fetchFilterPost(
										// 	dispatchHome,
										// 	1,
										// 	searchTerm,
										// 	stateHome.data,
										// 	getDataAcc.id,

										// 	catgValue,
										// );
										setGetDataAcc("")
										// console.log(getDataAcc?.id, selectedValueCat, selectedValueLoc)
										dispatchHome({ type: "Loading", payload: true })
										dispatchHome({ type: "FILTER_STATUS", payload: true })

										fetchTestFilterPost(
											dispatchHome,
											stateHome,
											searchTerm,
											"",
											// sort = '',
											selectedValueCat,
											longitude,
											latitude,
											selectedValueLoc,
											false

											// min = '',
											// max = '',
										)
									}}
									style={homeStyles.btnStyle}>
									<Text style={homeStyles.btnTxtStyle}>Submit</Text>
								</TouchableOpacity>
							</View>
						</View>
					</SafeAreaView>
				</View>
			</View>
		</Modal>
	);
};

const SearchByLoc = ({
	searchByLoc,
	setSearchByLoc,
	selectedValueCat,
	selectedValueLoc,
	setSelectedValueLoc,
	stateHome,
	setZipCode,
	zipCode,
	dispatchHome,
	searchTerm,
	setGetDataAcc,
	getDataAcc,
	state, city,
	longitude, latitude,
	setLatitude,
	setLongitude,
	homeAfterSearch,
	setHitNow,
	hitNow,
	setHomeAfterSearch
}) => {
	const [lati, setLati] = useState(latitude);
	const [logni, setLogni] = useState(longitude);
	const [clickSubmit, setClickSubmit] = useState(false);
	const [hit, setHit] = useState(false);

	useEffect(() => {
		if (zipCode == "" || !zipCode) {
			setLati("");
			setLogni("");
		}
	}, [searchByLoc, zipCode])

	useEffect(() => {
		if (longitude && latitude && clickSubmit && zipCode == "") {

			setClickSubmit(false)
			dispatchHome({ type: "Loading", payload: true })
			fetchTestFilterPost(
				dispatchHome,
				stateHome,
				searchTerm,
				"",
				// sort = '',
				selectedValueCat,
				// longitude,
				// latitude,
				"",
				"",
				selectedValueLoc,
				false

				// min = '',
				// max = '',
			)
		}

		if (lati && logni && clickSubmit && zipCode) {

			setClickSubmit(false)
			dispatchHome({ type: "Loading", payload: true })
			fetchTestFilterPost(
				dispatchHome,
				stateHome,
				searchTerm,
				"",
				// sort = '',
				selectedValueCat,
				logni,
				lati,
				selectedValueLoc,
				false

				// min = '',
				// max = '',
			)
		}
	}, [longitude, latitude, lati, logni, hit])

	const fetchLocationUsingPincode = () => {
		if (!zipCode || zipCode == "" || zipCode.length < 4) {
			setLati("");
			setLogni("");
			setLatitude("");
			setLongitude("");
			return;
		}

		fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=` + MAP_API_KEY)
			.then(respon => respon.json())
			.then(results => {
				// var address = results.results[0].address_components
				// console.log(results.results[0].address_components)
				const { lat, lng } = results.results[0].geometry.location
				if (lat && lng) {
					setLati(lat);
					setLogni(lng);
					setLatitude(lat);
					setLongitude(lng);
				}
			})
			.catch(error => {
				dispatchHome({ type: "Loading", payload: false })
				customToastMsg("Not able to locate you. Please enter a valid ZIP Code");
			});
	}
	return (

		<Modal
			animationType={'slide'}
			transparent={true}
			visible={searchByLoc}
			onRequestClose={() => {
				setSearchByLoc(!setSearchByLoc);
			}}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
			>
				<View style={homeStyles.modal_Backdrop}>
					<View style={homeStyles.modal_Main_Wrap}>
						<SafeAreaView style={{ flex: 1 }}>
							<View style={[homeStyles.sec_padding, { flex: 1 }]}>
								<View style={homeStyles.accordian_Header}>
									<TouchableOpacity
										onPress={() => {
											setSearchByLoc(!searchByLoc);
										}}>
										<Image
											source={require('../images/cancle.png')}
											resizeMode="contain"
											style={homeStyles.cancle_Icon}
										/>
									</TouchableOpacity>
									<Text style={{ ...homeStyles.txtStyle1 }}>Location</Text>
									<TouchableOpacity onPress={() => { }}>
										{/* <Text
											style={{
												...homeStyles.txtStyle2,
												fontSize: wp('3.7%'),
												fontWeight: 'bold',
												color: themeColor,
											}}>
											Clear
										</Text> */}
									</TouchableOpacity>
								</View>
								<ScrollView contentContainerStyle={{ flex: 1 }} bounces={false}>
									<View style={{}}>
										<Text style={homeStyles.filter_Text}>ZIP Code</Text>
										<View
											style={{ elevation: 10, marginVertical: hp(2) }}
										>
											<TextInput
												value={zipCode.toString()}
												placeholder="Enter ZIP Code"
												style={{ backgroundColor: "#ddd", padding: wp(4.5) }}
												maxLength={6}
												keyboardType={"number-pad"}
												onChangeText={(value) => {
													setZipCode(value)
												}}
											// onBlur={() => {
											// 	fetchLocationUsingPincode();
											// }}
											/>

										</View>
									</View>
									{zipCode.length > 4 ? <View style={{}}>
										<Text style={homeStyles.filter_Text}>Distance</Text>

										{state?.length && city?.length ?
											<>
												<Text style={[homeStyles.filter_Picker, { textAlign: "center", fontSize: wp(4.5) }]}>{selectedValueLoc} Miles</Text>
												<Slider
													value={parseInt(selectedValueLoc)}
													minimumValue={0}
													maximumValue={1000}
													onValueChange={value => setSelectedValueLoc(value)}
													step={5}
												/>
											</>
											:
											<Text style={homeStyles.filter_Text}>Please let us know your current location</Text>
										}

									</View> : <Text style={homeStyles.filter_Text}>Please enter your ZIP Code.</Text>}

								</ScrollView>

								<View>
									<TouchableOpacity
										onPress={async () => {
											setClickSubmit(true)
											setGetDataAcc("")

											if (zipCode == "" || !zipCode) {
												requestLocationPermission(setLatitude, setLongitude);
											}

											setSearchByLoc(!searchByLoc);
											// fetchFilterPost(
											// 	dispatchHome,
											// 	1,
											// 	searchTerm,
											// 	stateHome.data,
											// 	getDataAcc.id,

											// 	catgValue,
											// );

											if (zipCode) {
												dispatchHome({ type: "Loading", payload: true })

												// fetchTestFilterPost(
												// 	dispatchHome,
												// 	stateHome,
												// 	searchTerm,
												// 	"",
												// 	// sort = '',
												// 	selectedValueCat,
												// 	logni,
												// 	lati,
												// 	selectedValueLoc,
												// 	false

												// 	// min = '',
												// 	// max = '',
												// )
												fetchLocationUsingPincode()
												setHomeAfterSearch({
													...homeAfterSearch,
													fromLoc: true
												});
												setHit(!hit)
											} else {
												setHomeAfterSearch({
													...homeAfterSearch,
													fromLoc: false
												});
												setLatitude("")
												setLongitude("")
											}
										}}
										style={homeStyles.btnStyle}>
										<Text style={homeStyles.btnTxtStyle}>Submit</Text>
									</TouchableOpacity>
								</View>
							</View>
						</SafeAreaView>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
};
// const SortModal = ({
// 	sortingModal,
// 	setSortingModal,
// 	sortingSelected,
// 	setSortingSelected,
// 	searchTerm,
// 	getDataAcc,
// 	dispatchHome,
// 	stateHome,
// 	setSort,
// }) => {
// 	const sortData = () => {
// 		if (sortingSelected == 'Newest(default)') {
// 			setSort('');
// 			fetchFilterPost(
// 				dispatchHome,
// 				1,
// 				searchTerm,
// 				stateHome.data,
// 				getDataAcc.id,
// 				'',
// 			);
// 		} else if (sortingSelected == 'Closest') {
// 		} else if (sortingSelected == 'Price: Low to High') {
// 			setSort('asc');
// 			fetchFilterPost(
// 				dispatchHome,
// 				1,
// 				searchTerm,
// 				stateHome.data,
// 				getDataAcc.id,
// 				'asc',
// 			);
// 		} else if (sortingSelected == 'Price: High to Low') {
// 			console.log('now its here');
// 			setSort('desc');

// 			fetchFilterPost(
// 				dispatchHome,
// 				1,
// 				searchTerm,
// 				stateHome.data,
// 				getDataAcc.id,
// 				'desc',
// 			);
// 		}
// 	};

// 	return (
// 		<Modal
// 			animationType={'slide'}
// 			transparent={true}
// 			visible={sortingModal}
// 			onRequestClose={() => {
// 				setSortingModal(!sortingModal);
// 			}}>
// 			<View style={homeStyles.modal_Backdrop}>
// 				<View style={homeStyles.modal_Main_Wrap}>
// 					<SafeAreaView style={{ flex: 1 }}>
// 						<View style={[homeStyles.sec_padding, { flex: 1 }]}>
// 							<View style={homeStyles.accordian_Header}>
// 								<TouchableOpacity
// 									onPress={() => {
// 										setSortingModal(!sortingModal);
// 									}}>
// 									<Image
// 										source={require('../images/cancle.png')}
// 										resizeMode="contain"
// 										style={homeStyles.cancle_Icon}
// 									/>
// 								</TouchableOpacity>
// 								<Text style={{ ...homeStyles.txtStyle1 }}>Sort</Text>
// 								<View></View>
// 							</View>
// 							<ScrollView>
// 								<View style={{ flex: 1 }}>
// 									{sortingItem.map((item, index) => (
// 										<TouchableOpacity
// 											style={homeStyles.radio_Wrapper}
// 											key={index}
// 											onPress={() => {
// 												setSortingSelected(item);
// 											}}>
// 											<View style={homeStyles.radio_Outer}>
// 												{sortingSelected.toLowerCase() == item.toLowerCase() ? (
// 													<View style={homeStyles.radio_Selected} />
// 												) : null}
// 											</View>
// 											<Text style={homeStyles.radio_Text}>{item}</Text>
// 										</TouchableOpacity>
// 									))}
// 								</View>
// 							</ScrollView>

// 							<View>
// 								<TouchableOpacity
// 									onPress={() => {
// 										setSortingModal(!sortingModal);
// 										sortData();
// 									}}
// 									style={homeStyles.btnStyle}>
// 									<Text style={homeStyles.btnTxtStyle}>Submit</Text>
// 								</TouchableOpacity>
// 							</View>
// 						</View>
// 					</SafeAreaView>
// 				</View>
// 			</View>
// 		</Modal>
// 	);
// };

const CategoriesModal = ({
	dispatchHome,
	stateHome,
	renderCategoriesAccordians,
	categoriesModal,
	setCategoriesModal,
	setGetDataAcc,
	searchTerm,
	getDataAcc,
	setHitNow,
	hitNow,
	setSelectedValueCat
}) => {
	const [reset, setReset] = useState(false);

	return (
		<Modal
			animationType={'slide'}
			transparent={true}
			visible={categoriesModal}
			onRequestClose={() => {
				setCategoriesModal(!categoriesModal);
			}}>
			<View style={homeStyles.modal_Backdrop}>
				<View style={homeStyles.modal_Main_Wrap}>
					<SafeAreaView style={{ flex: 1 }}>
						<View style={[homeStyles.sec_padding, { flex: 1 }]}>
							<View style={homeStyles.accordian_Header}>
								<TouchableOpacity
									onPress={() => {
										setCategoriesModal(false);
									}}>
									<Image
										source={require('../images/cancle.png')}
										resizeMode="contain"
										style={homeStyles.cancle_Icon}
									/>
								</TouchableOpacity>
								<Text style={{ ...homeStyles.txtStyle1 }}>Categories</Text>
								<TouchableOpacity
									onPress={() => {
										setReset(true);
										setGetDataAcc('')
									}}>
									<Text
										style={{
											...homeStyles.txtStyle2,
											fontSize: wp('3.7%'),
											fontWeight: 'bold',
											color: themeColor,
										}}>
										Reset
									</Text>
								</TouchableOpacity>
							</View>
							<ScrollView>
								<View style={{ flex: 1 }}>
									{renderCategoriesAccordians(reset, setReset)}
								</View>
							</ScrollView>

						</View>
					</SafeAreaView>
				</View>
			</View>
		</Modal>
	);
};

const HomeScreen = ({ navigation, route }) => {
	let dispatchHome = useHomeDispatch();
	let stateHome = useHomeState();
	let authState = useAuthState();

	const dispatch = useDispatch();

	const profileDispatch = useProfileDispatch();

	const { activeScreen } = useSelector(state => state)

	// const [homeData, setHomeData] = useState(stateHome);
	const [categoriesModal, setCategoriesModal] = useState(false);
	const [filtersModal, setFiltersModal] = useState(false);
	// const [sortingModal, setSortingModal] = useState(false);

	const [selectedValueCat, setSelectedValueCat] = useState('');
	const [selectedValueLoc, setSelectedValueLoc] = useState('30');
	const [inputRangeMin, setInputRangeMin] = useState('');
	const [inputRangeMax, setInputRangeMax] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [getDataAcc, setGetDataAcc] = useState('');
	const [sort, setSort] = useState('');
	const [catgValue, setCatgValue] = useState('');
	const [longitude, setLongitude] = useState('');
	const [latitude, setLatitude] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [pin, setPin] = useState('');
	const [check, setCheck] = useState('');
	const [hitNow, setHitNow] = useState(false);
	const [breeds, setBreeds] = useState("");
	const [more, setMore] = useState(false);
	const [searchByLoc, setSearchByLoc] = useState(false);
	const [zipCode, setZipCode] = useState("");
	const [enableOtherApi, setEnableOtherApi] = useState(false);
	const [homeAfterSearch, setHomeAfterSearch] = useState({
		isSearch: false,
		searchValue: '',
	});

	const showLoader = (stateHome) => {
		if (stateHome.isLoading) {
			return <Loader />;
		}
		return null;
	}

	const [sortingSelected, setSortingSelected] = useState('Closest');
	const [categories, setCategories] = useState([]);


	// const updateProfileModal = () => {
	// 	if (authState.hasOwnProperty("loginedUser")) {
	// 		if (authState.loginedUser) {
	// 			if (authState.loginedUser.hasOwnProperty("name_confirmed")) {
	// 				if (!authState.loginedUser.name_confirmed) {
	// 					console.log('ioweuoiweur', !authState.loginedUser.name_confirmed)

	// 					profileDispatch({ type: "CONF_INFO", payload: true })
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	PushNotification.configure({
		onNotification: function (notification) {
			// console.log('NOTIFICATION:', notification);
			if (notification.userInteraction && notification.foreground) {
				// navigation.navigate("Inbox")
				// alert(notification.userInteraction, notification.foreground, authState.loginedUser.id)
				let message = notification.data.item
				
				dispatch(setChatScreenFocused({
					isActive: true,
					userInfo: {
						chatId: message?.chatId,
						id: message?.id,
						postId: message?.postId,
						unseenCount: message?.unseenCount,
						userName: message?.userName
					}
				}))
				navigation.navigate("Message", {
					item: {
						...message
					}
				})
			}
			notification.finish(PushNotificationIOS.FetchResult.NoData);
		},
		// (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
		// onAction: function (notification) {
		// 	console.log("ACTION:", notification.action);
		// 	console.log("NOTIFICATION:", notification);

		// 	// process the action
		// },

		popInitialNotification: true,
		requestPermissions: true,
	});

	useEffect(() => {
		dispatchHome({ type: "Loading", payload: true })
		let callApis = async () => {
			runAllHomeApi(dispatchHome)();
			// await requestLocationPermission(setLatitude, setLongitude)
		}

		callApis();
	}, []);

	useEffect(() => {
		if (authState?.loginedUser) {

			fetchAllChat()
				.then((res) => { return res.json() })
				.then(res => {
					if (res.success) {
						dispatchHome({ type: "CLEAR_CHAT_USER_INFO" })

						res?.chat.map((item, index, arr) => {
							if (authState?.loginedUser?.id == item.from_user) {
								dispatchHome({
									type: "SET_CHAT_USER_INFO",
									payload: {
										"id": item.id,
										"userId": item.to_user,
										"uuid": item.uuid,
										"userName": item.to_user_name,
										"photoUrl": item.to_user_image ? `https://gogetapet.com/public/storage/${item?.to_user_image}` : null,
										"message": item.message_text,
										"created": item.created,
										"messageObj": item
									}
								})
								// setUserDetail(res.data)


							}
							if (authState?.loginedUser?.id == item.to_user) {

								// homeDispatch({ type: "CLEAR_CHAT_USER_INFO" })
								// console.log('true then 67')

								dispatchHome({
									type: "SET_CHAT_USER_INFO",
									payload: {
										"id": item.id,
										"userId": item.from_user,
										"uuid": item.uuid,
										"userName": item.from_user_name,
										"photoUrl": item.from_user_image ? `https://gogetapet.com/public/storage/${item?.from_user_image}` : null,
										"message": item.message_text,
										"created": item.created,
										"messageObj": item

									}
								})



							}
						})

					}
				}
				)
				.catch(err => {
					console.log(err)

				})
			// setFullData1(dataResp)
		}

	}, [authState && authState.loginedUser]);



	useEffect(() => {
		if (latitude && longitude) {
			setState('');
			setCity('');
			locationName(latitude, longitude, state, city, setState, setPin, setCity, setCheck)
		}
		if (enableOtherApi) {

			if (latitude == "" && longitude == "") {
				dispatchHome({ type: "Loading", payload: true })
				fetchTestFilterPost(
					dispatchHome,
					stateHome,
					searchTerm,
					getDataAcc?.id,
					// sort = '',
					selectedValueCat,
					"",
					"",
					selectedValueLoc,
					false

					// min = '',
					// max = '',
				)
			}
		}

	}, [latitude, longitude]);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', async () => {

			if (hitNow == false) {
				dispatchHome({ type: "Loading", payload: true })
				if (homeAfterSearch.isSearch == false) {
					setZipCode('')
				}
				setHomeAfterSearch({ searchValue: "", isSearch: false });
				setSearchTerm("")
				setSelectedValueCat("")
				setSelectedValueLoc("30");
				setLatitude('')
				setLongitude('')
				// if (latitude == "" || longitude == "") {
				await requestLocationPermission(setLatitude, setLongitude)
				// }
				dispatchHome({ type: "Loading", payload: true })
				fetchTestFilterPost(
					dispatchHome,
					stateHome,
					"",
					getDataAcc?.id,
					// sort = '',
					"",
					"",
					"",
					selectedValueLoc,
					false

					// min = '',
					// max = '',
				)
			}

			setEnableOtherApi(true)
		});
		if (hitNow) {
			dispatchHome({ type: "Loading", payload: true })
			fetchTestFilterPost(
				dispatchHome,
				stateHome,
				searchTerm,
				getDataAcc?.id,
				// sort = '',
				selectedValueCat,
				homeAfterSearch?.fromLoc ? longitude : "",
				homeAfterSearch?.fromLoc ? latitude : "",
				selectedValueLoc,
				false

				// min = '',
				// max = '',
			)
			setHitNow(false);
		} else {
			// console.log('alkfsdlkasjf lak jfl')
			// setZipCode('')
			// if (latitude == "" || longitude == "") {
			// requestLocationPermission(setLatitude, setLongitude)
			// }
		}

		return unsubscribe;
	}, [hitNow, navigation]);

	// useEffect(() => {


	// }, []);

	useEffect(() => {
		if (enableOtherApi) {

			dispatchHome({ type: "Loading", payload: true })

			setCategoriesModal(false);
			setSelectedValueCat("")
			fetchTestFilterPost(
				dispatchHome,
				stateHome,
				searchTerm,
				getDataAcc?.id,
				// sort = '',
				selectedValueCat,
				homeAfterSearch?.fromLoc ? longitude : "",
				homeAfterSearch?.fromLoc ? latitude : "",
				selectedValueLoc,
				false

				// min = '',
				// max = '',
			)
		}

	}, [getDataAcc]);

	// useEffect(() => {
	// 	console.log(searchTerm, 'search tearnm')
	// }, [searchTerm])

	useEffect(() => {
		setCategories(stateHome?.catg);
	});

	let renderCategoriesAccordians = (reset, setReset) => {
		const items = [];
		let title = ""
		if (reset) {
			// setLatitude("");
			// setLongitude("")
		}

		for (let item of categories) {
			title = item.name;
			if (getDataAcc.catgId == item.id) {
				title = getDataAcc.name;
			}

			const temp =
				<Accordian
					key={item.id}
					title={title}
					data={item.breeds}
					imageOpen={upArrow}
					imageClose={downArrow}
					titleColor={themeColor}
					reset={reset}
					setReset={setReset}
					setGetDataAcc={setGetDataAcc}
				/>;

			items.splice(item.temp_id, 0, temp);
		}

		return items;
	};
	// React.useEffect(() => {
	// 	let getNotificationData = async () => {
	// 		try {
	// 			let notificationArray = await AsyncStorage.getItem("notificationArray")
	// 			console.log(notificationArray, 'he he he h he ')
	// 			if (notificationArray !== null) {
	// 				let notificationUpdatedArray = JSON.parse(notificationArray)
	// 				// console.log(notificationUpdatedArray, "notificationdsfdsaf fas sdf asdf")
	// 				// if (!stateHome.notificationUser.includes(remoteMessage.data.from_user)) {
	// 				dispatchHome({
	// 					type: "UPDATE_NOTIFICATION_USER",
	// 					payload: notificationUpdatedArray
	// 				})
	// 				await AsyncStorage.removeItem("notificationArray")
	// 				// }
	// 			}
	// 		}
	// 		catch (e) {
	// 			console.log(e, "error catch notification")
	// 		}
	// 	}
	// 	getNotificationData();
	// }, [stateHome.notificationUser])

	React.useEffect(() => {
		const unsubscribe = messaging().onMessage(async remoteMessage => {
			// console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
			// console.log(remoteMessage, "lkajsdlkj")
			let message = JSON.parse(remoteMessage.data.payload)
			// console.log(message.item.chatId,"message",activeScreen.chatScreenFocused.userInfo.chatId)
			if (message.item.chatId != activeScreen.chatScreenFocused.userInfo?.chatId) {
				PushNotification.localNotification({
					channelId: "fcm_fallback_notification_channel",
					title: remoteMessage?.notification?.title,
					message: message?.messageText,
					playSound: true,
					soundName: 'dog',
					autoCancel: true,
					vibrate: true,
					vibration: 300,
					// actions: '["Yes", "No"]',
					// onlyAlertOnce: true,
					invokeApp: true,
					userInfo: {
						...message
					}
				});
			}

			// if (!stateHome.notificationUser.includes(remoteMessage.data.from_user)) {

			// 	dispatchHome({
			// 		type: "SET_NOTIFICATION_USER",
			// 		payload: remoteMessage.data.from_user
			// 	})

			// }

			// if (authState.loginedUser) {
			// 	if (authState?.loginedUser?.id) {
			// 		try {
			// 			readChatMessageFromUserCheck.on('child_changed', (snapshot, prevChildKey) => {
			// 				// console.log('hi')
			// 				const newMessage = snapshot.val();
			// 				if (newMessage) {
			// 					fetchChat()
			// 				}
			// 			});
			// 		} catch (error) {
			// 			console.log(error);
			// 		}
			// 	}
			// }
			// 	dispatchHome({
			// 	// 	type: "SET_NOTIFICATION_TOGGLER",
			// 	// 	payload: !stateHome.notificationToggler
			// 	// })
		});
		return unsubscribe;
	}, [activeScreen.chatScreenFocused]);
	// }, [stateHome.notificationUser]);

	// React.useEffect(() => {
	// 	const unsubscribe = messaging().setBackgroundMessageHandler(async remoteMessage => {
	// 		console.log('Message handled in the background!', remoteMessage);

	// 		let updateRemoteMessageData = {
	// 			'created': remoteMessage.data.created,
	// 			'id': remoteMessage.data.id,
	// 			'message': remoteMessage.data.message,
	// 			'messageObj': {
	// 				'created': remoteMessage.data.created_at,
	// 				'from_user': remoteMessage.data.from_user,
	// 				'from_user_image': remoteMessage.data.from_user_image,
	// 				'from_user_latitude': remoteMessage.data.from_user_latitude,
	// 				'from_user_longitude': remoteMessage.data.from_user_longitude,
	// 				'from_user_name': remoteMessage.data.from_user_name,
	// 				'message_text': remoteMessage.data.message_text,
	// 				'to_user': remoteMessage.data.to_user,
	// 				'to_user_image': remoteMessage.data.to_user_image,
	// 				'to_user_latitude': remoteMessage.data.to_user_latitude,
	// 				'to_user_longitude': remoteMessage.data.to_user_longitude,
	// 				'to_user_name': remoteMessage.data.to_user_name,
	// 				'uuid': remoteMessage.data.uuid,
	// 			},
	// 			'photoUrl': remoteMessage.data.photoUrl,
	// 			'userId': remoteMessage.data.userId,
	// 			'userName': remoteMessage.data.userName,
	// 			'uuid': remoteMessage.data.uuid,
	// 		}
	// 		navigation.navigate("Message", { item: updateRemoteMessageData })
	// 	});
	// 	return unsubscribe;
	// }, []);


	useEffect(() => {
		getAppLaunchLink(navigation);

		const unsubscribe = firebase.dynamicLinks().onLink(({ url }) => {
			//handle your url here
			// alert(JSON.stringify(url) + "onlink")

			// console.log(url, 'i am url')
			if (navigation) {
				let id = url.split("=")[1]
				if (id) {
					navigation.navigate("Post", { id })
				}
			}
		});
		// When the component is unmounted, remove the listener
		return () => unsubscribe();
	}, []);

	React.useEffect(() => {
		let getNotificationData = async () => {
			try {
				let notificationArray = await AsyncStorage.getItem("notificationArray")
				// console.log(notificationArray, 'he he he h he form app navigator ')
				if (notificationArray !== null) {
					let notificationUpdatedArray = JSON.parse(notificationArray)
					// console.log(notificationUpdatedArray, "notificationdsfdsaf fas sdf asdf")
					// if (!stateHome.notificationUser.includes(remoteMessage.data.from_user)) {
					dispatchHome({
						type: "UPDATE_NOTIFICATION_USER",
						payload: notificationUpdatedArray
					})
					await AsyncStorage.removeItem("notificationArray")
					// }
				}
			}
			catch (e) {
				console.log(e, "error catch notification")
			}
			return Promise.resolve();
		}
		// Assume a message-notification contains a "type" property in the data payload of the screen to open
		if (authState?.loginedUser) {
			messaging().onNotificationOpenedApp(remoteMessage => {
				// navigation.navigate("Inbox")
				let message = JSON.parse(remoteMessage.data.payload)
				if (remoteMessage) {
					// navigation.navigate("Inbox")
					dispatch(setChatScreenFocused({
						isActive: true,
						userInfo: {
							chatId: message?.item.chatId,
							id: message?.item.id,
							postId: message?.item.postId,
							unseenCount: message?.item.unseenCount,
							userName: message?.item.userName
						}
					}))
					navigation.navigate("Message", {
						item: {
							...message.item
						}
					})
				}
			});

			// Check whether an initial notification is available
			messaging()
				.getInitialNotification()
				.then( remoteMessage => {
					// console.log("m bhi", remoteMessage)
					getNotificationData();
					if (remoteMessage) {
					let message = JSON.parse(remoteMessage.data.payload)

						// navigation.navigate("Inbox")
						dispatch(setChatScreenFocused({
							isActive: true,
							userInfo: {
								chatId: message?.item.chatId,
								id: message?.item.id,
								postId: message?.item.postId,
								unseenCount: message?.item.unseenCount,
								userName: message?.item.userName
							}
						}))
						navigation.navigate("Message", {
							item: {
								...message.item
							}
						})
					}
				});

			// updateProfileModal()

		}

		// setTimeout(() => {
		// dispatch(setChatScreenFocused(false))
		// }, 10000)
	}, [authState, authState?.loginedUser]);
	return (
		<SafeAreaView style={homeStyles.mainContainer}>
			{/* {console.log(activeScreen.chatScreenFocused)} */}
			<View
				style={[
					homeStyles.top_Header,
					homeAfterSearch.isSearch
						? {
							marginTop: 22,
							marginBottom: 17,
							marginHorizontal: wp('5%'),
						}
						: null,
				]}>
				{homeAfterSearch.isSearch ? (
					<View style={homeStyles.header_Back_Btn}>
						<TouchableOpacity
							onPress={() => {
								setHomeAfterSearch({ searchValue: "", isSearch: false });
								setSearchTerm("")
								setSelectedValueCat("")
								if (homeAfterSearch && !homeAfterSearch.isSearch) {
									setSelectedValueLoc("30");
								}
								setLatitude('')
								setLongitude('')
								dispatchHome({ type: "Loading", payload: true })
								dispatchHome({ type: "FILTER_STATUS", payload: false })
								// fetchTestFilterPost(
								// 	dispatchHome,
								// 	stateHome,
								// 	"",
								// 	"",
								// 	// sort = '',
								// 	"",
								// 	// longitude,
								// 	// latitude,
								// 	"",
								// 	"",
								// 	"",
								// 	false

								// 	// min = '',
								// 	// max = '',
								// )
								requestLocationPermission(setLatitude, setLongitude)
								setHitNow(!hitNow);
							}}>
							<Image
								source={require('../images/back-button.png')}
								style={{
									height: hp('8%'),
									width: wp('14%'),
									marginTop: hp('0.5%'),
								}}
								resizeMode="contain"
							/>
						</TouchableOpacity>
					</View>
				) : null}
				<View style={homeStyles.icon_Input_Wraper}>
					{Platform.OS === "ios" ?
						<Image
							source={require('../images/search.png')}
							style={homeStyles.icon_InputSearchBox}
							resizeMode="contain"
						/> :
						<View style={{ elevation: 11 }}>
							<Image
								source={require('../images/search.png')}
								style={homeStyles.icon_InputSearchBox}
								resizeMode="contain"
							/>
						</View>
					}
					<TextInput
						editable={Platform.OS == "ios" ? false : true}
						style={homeStyles.inputSearchBox}
						value={homeAfterSearch.searchValue ?? '\xa0\xa0\xa0\xa0\xa0\xa0\xa0' + homeAfterSearch.searchValue}
						placeholder="Search"
						onPressIn={() => {
							Keyboard.dismiss();
							navigation.navigate('Search', {
								setHomeAfterSearch,
								homeAfterSearch,
								setSearchTerm,
								searchTerm,
								setHitNow,
								hitNow
							});
						}}
					/>
					{/* {homeAfterSearch.isSearch ? (
						<View style={homeStyles.header_Notification_Icon_Wrapper}>
							<TouchButton onPress={() => { }}>
								<Image
									source={require('../images/notification.png')}
									style={homeStyles.header_Notification_Icon}
									resizeMode="contain"
								/>
							</TouchButton>
						</View>
					) : null} */}
				</View>
				{homeAfterSearch.isSearch ? null : (
					<TouchableOpacity
						onPress={() => {
							setCategoriesModal(true);
						}}>
						<View style={homeStyles.inputSearchBox_Right}>
							<Image
								source={require('../images/categories.png')}
								style={homeStyles.inputSearchBox_Right_Image}
								resizeMode="contain"
							/>
						</View>
					</TouchableOpacity>
				)}
			</View>
			<View style={homeStyles.contentSection}>
				<TouchableOpacity onPress={() => {
					// setLatitude("");
					// setLongitude("")
					// requestLocationPermission(setLatitude, setLongitude);
					setSearchByLoc(true)
				}} style={homeStyles.location_Wrapper}>
					<Image
						source={require('../images/location-home.png')}
						style={homeStyles.sm_Image}
						resizeMode="contain"
					/>
					{
						state?.length && city?.length ?
							<Text style={homeStyles.location_Text}>{`${state},${city}${stateHome.filterEnable || zipCode.length > 4 ? "-" + selectedValueLoc + " Miles" : ""} `}</Text>
							:
							<Text style={homeStyles.location_Text}>{`Click here to get pet nearby`}</Text>
					}
				</TouchableOpacity>
				{homeAfterSearch.isSearch ? (
					<View style={homeStyles.buttons_Wrapper}>
						<TouchableOpacity
							style={[homeStyles.buttons_Blue, homeStyles.btn]}
							onPress={() => {
								setFiltersModal(true);
							}}>
							<Image
								source={require('../images/filter.png')}
								style={homeStyles.sm_Image}
								resizeMode="contain"
							/>
							<Text style={homeStyles.btn_Blue_Text}>Filter</Text>
						</TouchableOpacity>
						{/* <TouchableOpacity
							style={[homeStyles.buttons_Gray, homeStyles.btn]}
							onPress={() => {
								setSortingModal(true);
							}}>
							<Image
								source={require('../images/sort.png')}
								style={homeStyles.sm_Image}
								resizeMode="contain"
							/>
							<Text style={homeStyles.btn_Gray_Text}>Sort</Text>
						</TouchableOpacity> */}
					</View>
				) : null}
			</View>
			{stateHome.isLoading ? null :

				stateHome.post.length > 0 ?
					<PetList
						petImages={stateHome}
						navigation={navigation}
						search={searchTerm}
						setSearchTerm={setSearchTerm}
						setGetDataAcc={setGetDataAcc}
						selectedValueCat={selectedValueCat}
						getDataAcc={getDataAcc}
						longitude={longitude}
						latitude={latitude}
						selectedValueLoc={selectedValueLoc}
						searchTerm={searchTerm}
						homeAfterSearch={homeAfterSearch}
						setLatitude={setLatitude}
						setLongitude={setLongitude}
					/>
					:
					<View style={{ flex: 1, alignSelf: "center", justifyContent: "center" }}>
						<Text>
							There is no item to display for applied filter.
							{/* <Text style={{ color: "blue" }}
								onPress={() => navigation.navigate('Home')}>
								click here to reset
							</Text> */}
						</Text>
					</View>
			}

			<CategoriesModal
				renderCategoriesAccordians={renderCategoriesAccordians}
				categoriesModal={categoriesModal}
				setCategoriesModal={setCategoriesModal}
				dispatchHome={dispatchHome}
				stateHome={stateHome}
				searchTerm={searchTerm}
				getDataAcc={getDataAcc}
				setHitNow={setHitNow}
				hitNow={hitNow}
				setSelectedValueCat={setSelectedValueCat}
				setGetDataAcc={setGetDataAcc}
			/>

			<FiltersModal
				filtersModal={filtersModal}
				setFiltersModal={setFiltersModal}
				selectedValueCat={selectedValueCat}
				setSelectedValueCat={setSelectedValueCat}
				selectedValueLoc={selectedValueLoc}
				setSelectedValueLoc={setSelectedValueLoc}
				inputRangeMin={inputRangeMin}
				inputRangeMax={inputRangeMax}
				setInputRangeMin={setInputRangeMin}
				setInputRangeMax={setInputRangeMax}
				dispatchHome={dispatchHome}
				stateHome={stateHome}
				setCatgValue={setCatgValue}
				catgValue={catgValue}
				searchTerm={searchTerm}
				getDataAcc={getDataAcc}
				state={state}
				city={city}
				setHitNow={setHitNow}
				hitNow={hitNow}
				setGetDataAcc={setGetDataAcc}

				longitude={longitude}
				latitude={latitude}
			/>
			<SearchByLoc
				searchByLoc={searchByLoc}
				setSearchByLoc={setSearchByLoc}
				selectedValueCat={selectedValueCat}
				setSelectedValueCat={setSelectedValueCat}
				selectedValueLoc={selectedValueLoc}
				setSelectedValueLoc={setSelectedValueLoc}
				inputRangeMin={inputRangeMin}
				inputRangeMax={inputRangeMax}
				setInputRangeMin={setInputRangeMin}
				setInputRangeMax={setInputRangeMax}
				dispatchHome={dispatchHome}
				stateHome={stateHome}
				zipCode={zipCode}
				setZipCode={setZipCode}
				searchTerm={searchTerm}
				getDataAcc={getDataAcc}
				state={state}
				city={city}
				setHitNow={setHitNow}
				hitNow={hitNow}
				setGetDataAcc={setGetDataAcc}
				setLatitude={setLatitude}
				setLongitude={setLongitude}
				longitude={longitude}
				latitude={latitude}
				homeAfterSearch={homeAfterSearch}
				setHomeAfterSearch={setHomeAfterSearch}
			/>
			{/* <SortMod>al
				sortingModal={sortingModal}
				setSortingModal={setSortingModal}
				sortingSelected={sortingSelected}
				setSortingSelected={setSortingSelected}
				dispatchHome={dispatchHome}
				stateHome={stateHome}
				searchTerm={searchTerm}
				getDataAcc={getDataAcc}
				sort={sort}
				setSort={setSort}
			/> */}
			{showLoader(stateHome)}
		</SafeAreaView>
	);
};

export default HomeScreen;
