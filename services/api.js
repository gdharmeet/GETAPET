import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { storeObjData, storeData, getObjData, getData } from '../common/helper';
import customToastMsg from '../subcomponents/CustomToastMsg';
import messaging from '@react-native-firebase/messaging';
import { BaseURL } from './Constant';

 //let BaseURL = 'https://gogetapet.com/api/api/';
// let BaseURL = 'https://gogetapet.appzlogic.com/api/api/';
let catg = BaseURL + 'get_categories';
let post = BaseURL + 'posts';
let postMain = BaseURL + 'posts?main=true';
let getbreed = BaseURL + 'get_breeds?category_id=';
let boost = BaseURL + "boost_post"
let singleBoost = BaseURL + "single_boost_post"
/**
 * All Api URLs
 */
let auth = null;
let getApiTokenUrl = BaseURL + 'login';

let getApiTokenUrlSocial = BaseURL + 'social_login';

// Login API
export async function login(idToken, state, dispatch) {
  let device_token = await AsyncStorage.getItem("deviceToken");
  let data = '';
  data = {
    name: state?.name,
    phone: state.number,
    firebase_token: idToken,
    device_token: device_token
  };

  // console.log(data, "it's data")
  return await fetch(getApiTokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Credentials': true,
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Methods': 'POST',
      // 'Access-Control-Expose-Headers': 'Content-Security-Policy, Location',
      // 'Access-Control-Allow-Headers': 'Authorization',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(response => {
      if (response.accessToken) {
        auth = response.accessToken;
      }
      return response;
    })
    .catch(error => {
      customToastMsg(error.message);
    });
}


export async function boosts(days, dispatch, id) {
  let data = '';
  data = {
    days: days,
  };

  return await fetch(boost, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,

    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(response => {
      customToastMsg("Account Boosted");

      fetchUserDetail(id).then((res) => {
        dispatch({ type: "SIGN_IN_USER", loginedUser: res.data })
      })
    }).catch(err => {
      customToastMsg(err.message)
      // console.log(res);
    })
}

export async function boostsPost(days, post_id) {
  let data = '';
  data = {
    days: days,
    post_id: post_id
  };
  return await fetch(singleBoost, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,

    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(response => {
      console.log(response)
      customToastMsg("Post Boosted");

      // fetchUserDetail(post_id).then((res) => {
      //   dispatch({ type: "SIGN_IN_USER", loginedUser: res.data })
      // })
      return true
    }).catch(err => {
      customToastMsg(err.message)
      // console.log(res);
      return false
    })
}

const StoreFcmDeviceToken = async () => {
  try {
    const fcmDeviceToken = await messaging().getToken();
    AsyncStorage.setItem('deviceToken', fcmDeviceToken);
    return fcmDeviceToken
  } catch (e) {
    console.log('device token error', e);
    // saving error
  }
};

export async function socialLogin(idToken, name, email, image) {
  let device_token = await AsyncStorage.getItem("deviceToken");
  if (!device_token) {
    device_token = await StoreFcmDeviceToken();
  }

  let data = '';
  data = {
    name: name,
    email: email,
    firebase_token: idToken,
    image_url: image,
    device_token: device_token
  };
  // console.log("yaha par he he ")

  return await fetch(getApiTokenUrlSocial, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // 'Access-Control-Allow-Credentials': true,
      // 'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Methods': 'POST',
      // 'Access-Control-Expose-Headers': 'Content-Security-Policy, Location',
      // 'Access-Control-Allow-Headers': 'Authorization',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(response => {
      // console.log(response)
      if (response.accessToken) {
        auth = response.accessToken;
      }
      return response;
    })
    .catch(error => {
      console.log(error)
      customToastMsg(error.message);
    });
}


export async function fetchUserDetail(id,authData) {
  // console.log(auth)
  let header= {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${auth}`,
  };
  if(auth){
    header= {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    };
  }
  return await fetch(`${BaseURL}users/${id}`, {
    method: 'GET',
    headers: header,

  })
    .then(response => response.json())
    .then(response => {
      if (response.accessToken) {
        auth = response.accessToken;
      }
      return response;
    })
    .catch(error => {
      console.log(error)
      customToastMsg(error.message);
    });
}

export async function updateProfileName(name, authDispatch) {
  // console.log(`${BaseURL} / users / ${id}`)
  return await fetch(`${BaseURL}name-confirmed`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({
      name
    })
  })
    .then(response => response.json())
    .then(response => {
      console.log(response)
      // if (response.accessToken) {
      //   auth = response.accessToken;
      // }
      // return response;
      if (response.data.hasOwnProperty("name_confirmed")) {
        if (response.data.name_confirmed) {
          fetchUserDetail(response.data.id).then((res) => {
            authDispatch({ type: "SIGN_IN_USER", loginedUser: res.data })
          })
        }
      }
    })
    .catch(error => {
      console.log(error)
      customToastMsg(error.message);
    });
}


export async function numbername(method, data = {}) {
  //   console.log(data);
  if (method == 'post') {
    await storeObjData('name_num', data);
  } else if (method == 'get') {
    let storeDataAsync = await getObjData('name_num');
    return storeDataAsync;
  }
}

export const runAllHomeApi = dispatchHome => {

  return async () => {
    /**
     *  All Fetch variables
     */

    // let fetchAllPost = fetch(postMain, {
    //   method: 'GET',
    //   headers: {
    //     accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${auth}`,
    //   },
    // });

    let fetchAllCategories = fetch(catg, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    });

    Promise.all([fetchAllCategories])
      .then(response => {
        response.forEach((res, index) => {
          // console.log(response)
          process(res.json(), index, dispatchHome);
          // dispatchHome({ type: "Loading", payload: false })


        });
      })
      .catch(err => {
        customToastMsg(err.message);
      });
  };
};

/**
 * process all the api response
 * called from home screen
 */
let process = (resp, index, dispatchHome) => {
  resp.then(jsonData => {
    /**
     * set All banners
     */
    if (index == 1) {
      // console.log("response_json", jsonData.data);
      if (jsonData?.data) {
        dispatchHome({ type: 'CLEAR_POST' });

        dispatchHome({ type: 'SET_POST', payload: jsonData.data });
        dispatchHome({ type: 'SET_PAGE', payload: jsonData.meta.current_page });
      }
    }

    /**
     * Set Cart
     */
    if (index == 0) {
      if (jsonData?.success == true) {
        dispatchHome({ type: 'SET_CATG', payload: jsonData.categories });
      } else {
        //error msg
        customToastMsg(JSON.stringify(jsonData.error));
      }
    }



    /**
     * set All categories
     */
    // if (index == 2) {
    //     dispatch({ type: 'CLEAR_ALL_CATEGORIES' });

    //     if (jsonData.success == "1") {
    //         let data = jsonData.data;

    //         data.map((ele) => {
    //             var temp = {
    //                 "category_id": ele["category_id"],
    //                 "name": ele["name"],
    //                 "image": ele["original_image"]
    //             }

    //             dispatch({ type: 'SET_ALL_CATEGORIES', cateArr: temp });
    //         })

    //     } else {
    //         //error msg
    //         // dispatch({type: 'ERROR', payload : jsonData.error});
    //         customToastMsg(jsonData.error[0]);
    //     }
    // }
  });
};

export const fetchBreed = async (catgId, setBreed, flag = '', dispatchHome) => {
  // console.log("inside fetch breed")
  try {
    const response = await fetch(getbreed + catgId, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    });
    const response_1 = await response.json();

    if (response_1.success == true) {
      if (flag == 'home') {
        return response_1.breeds;
      }

      setBreed([{ heading: 'Breed', title: 'Breed', data: response_1.breeds }]);
    }
    dispatchHome({ type: "Loading", payload: false })
    return null;
  } catch (err) {
    dispatchHome({ type: "Loading", payload: false })
    customToastMsg(err.message);
  }
};

export const fetchMorePost = (page, dispatchHome, prevState) => {
  dispatchHome({ type: "Loading", payload: true })

  let tempStr = `${post}?page=${page}`;
  // console.log(tempStr, "mnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnb")
  fetch(tempStr, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      // console.log(res);

      if (res?.data) {
        var ids = new Set(prevState.map(d => d.id));
        var merged = [...res.data.filter(d => !ids.has(d.id))];
        dispatchHome({ type: 'SET_POST', payload: merged });

        if (res.meta.current_page <= res.meta.last_page) {
          dispatchHome({ type: 'SET_PAGE', payload: res.meta.current_page + 1 });
        }
      }
      dispatchHome({ type: "Loading", payload: false })

    })
    .catch(err => {
      dispatchHome({ type: "Loading", payload: false })

    })
};

export const fetchFilterPost = (
  dispatchHome,
  pageIndex,
  search,
  prevState = [],
  breed = '',
  // sort = '',
  // catg = '',
  // min = '',
  // max = '',
) => {
  let stringHere = `${post}?`;
  if (search) {
    stringHere = stringHere + `&search=${search}`;
  }
  if (pageIndex) {
    stringHere = stringHere + `&page=${pageIndex}`;
  }
  if (breed?.id) {
    stringHere = stringHere + `&breed=${breed.id}`;
  }
  // if (sort) {
  //   stringHere = stringHere + `&price_sort=${sort}`;
  // }
  // if (catg) {
  //   stringHere = stringHere + `&category=${catg}`;
  // }
  // if (min) {
  //   stringHere = stringHere + `&min_price=${min}`;
  // }
  // if (max) {
  //   stringHere = stringHere + `&max_price=${max}`;
  // }
  // console.log(stringHere, "iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
  fetch(
    // `${post}?page=${page}/?status=${status}&main=${main}&breed=${breed}&min_Price=${min_price}&max_price=${max_price}&latitude=${latitude}&longitude=${longitude}&price_sort&{price_sort}&distance=${distance}&user=${user}&mine=${mine}&category=${category}&search=${search}`,
    stringHere,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      if (res.meta.current_page == 1) {
        dispatchHome({ type: 'CLEAR_POST' });
        dispatchHome({ type: 'SET_PAGE', payload: res.meta.current_page + 1 });

        if (res.meta.current_page <= res.meta.last_page)
          dispatchHome({ type: 'SET_POST', payload: res.data });
      } else {
        if (res?.data) {
          var ids = new Set(prevState.map(d => d.id));
          var merged = [...res.data.filter(d => !ids.has(d.id))];

          // setPageIndex(res.meta.current_page);
          dispatchHome({ type: 'SET_POST', payload: merged });

          if (res.meta.current_page <= res.meta.last_page)
            dispatchHome({ type: 'SET_PAGE', payload: res.meta.current_page + 1 });
        }
      }
    })
    .catch(err => customToastMsg(err.message));
};



export const fetchTestFilterPost = (
  dispatchHome,
  stateHome,
  search,
  breed = '',
  // sort = '',
  catg = '',
  longitude = "",
  latitude = "",
  distance = "",
  more = false

  // min = '',
  // max = '',
) => {



  let stringHere = `${post}?main=true`;
  if (search) {
    stringHere = stringHere + `&search=${search}`;
  }
  // console.log(breed)

  // if (breed) {
  //   stringHere = stringHere + `&breed=${breed}`;
  // }


  if (breed) {
    stringHere = stringHere + `&breed=${breed}`;
  }

  // if (sort) {
  //   stringHere = stringHere + `&price_sort=${sort}`;
  // }
  if (catg && catg != "All Categories") {
    stringHere = stringHere + `&category=${catg}`;
  }

  if (latitude && longitude) {
    stringHere = stringHere + `&latitude=${latitude}&longitude=${longitude}`;
  }

  if (distance) {
    stringHere = stringHere + `&difference=${distance}`;
  }

  if (more) {
    stringHere = stringHere + `&page=${stateHome.page + 1}`;
  }
  // if (min) {
  //   stringHere = stringHere + `&min_price=${min}`;
  // }
  // if (max) {
  //   stringHere = stringHere + `&max_price=${max}`;
  // }



  // console.log(stringHere);
  fetch(
    stringHere.toString(),
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      if (res.meta.current_page == 1) {
        // console.log('alfjaslf', res.meta.current_page, res.meta.last_page)

        dispatchHome({ type: 'CLEAR_POST' });
        dispatchHome({ type: 'SET_PAGE', payload: res.meta.current_page });
        dispatchHome({ type: 'SET_POST', payload: res.data });


      }
      else if (res.meta.current_page <= res.meta.last_page) {
        // console.log('alfjaslf', res.meta.current_page, res.meta.last_page)
        var ids = new Set(stateHome.post.map(d => d.id));
        var merged = [...res.data.filter(d => !ids.has(d.id))];
        dispatchHome({ type: 'SET_POST', payload: merged });
        dispatchHome({ type: 'SET_PAGE', payload: res.meta.current_page });
      }
      dispatchHome({ type: "Loading", payload: false })
    })
    .catch(err => {
      customToastMsg(err.message)
      dispatchHome({ type: "Loading", payload: false })

    });
};


export const fetchSavedList = (setFullData, dispatchHome) => {
  dispatchHome({ type: "Loading", payload: true })

  let tempStr = `${post}?saved=true`;
  fetch(tempStr, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      if (res.data) {
        setFullData(res.data);
      } else {
        customToastMsg("There is some error. Please try again in sometimes.")
      }
      dispatchHome({ type: "Loading", payload: false });
      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    })
    .catch(err => {
      if (err) {
        dispatchHome({ type: "Loading", payload: false });
        customToastMsg("There is some error while loading saved data")
      }
    })
};

export const fetchArchivedList = (setFullData, dispatchHome) => {
  dispatchHome({ type: "Loading", payload: true })
  // console.log("jiji")
  let tempStr = `${post}?status=Archive&mine=true`;
  // console.log(tempStr)
  fetch(tempStr, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      if (res.data) {
        // console.log(res)
        setFullData(res.data)
      }
      dispatchHome({ type: "Loading", payload: false })
    })
    .catch(err => {
      if (err) {
        dispatchHome({ type: "Loading", payload: false });
        customToastMsg("There is some error while loading Archived data")
      }
    })
};

export const fetchSinglePost = (setFullData, setImages, id, dispatchHome) => {
  dispatchHome({ type: "Loading", payload: true })
  let tempStr = `${post}\/${id}`;
  fetch(tempStr, {
    method: 'GET',
    headers: auth != null ? {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    } : {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(res => res.json())
    .then(res => {
      setFullData(res.data)
      setImages([...res.data.cover_image, ...res.data.non_cover_image])
      dispatchHome({ type: "Loading", payload: false })

      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    })
    .catch(err => {
      dispatchHome({ type: "Loading", payload: false })
      customToastMsg(err)

    })
};


export const reportPost = (id, msg, setFullData, setImages, dispatchHome) => {

  let tempStr = `${BaseURL}report_user`;
  data = {
    post_id: id,
    message: msg
  }
  return fetch(tempStr, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {

      fetchSinglePost(setFullData, setImages, id, dispatchHome)

      // dispatchHome({type:"Loading",payload:false})
      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    });
};

export const reportUser = (id, msg, setFullData) => {

  let tempStr = `${BaseURL}report_user`;
  data = {
    reportee_user: id,
    message: msg
  }
  return fetch(tempStr, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {



    });
};






export const UnsavePost = (id, setHeart) => {

  let tempStr = `${BaseURL}unsave_post\/${id}`;

  fetch(tempStr, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {

      if (res.success) {
        setHeart(false)
      }

      // dispatchHome({type:"Loading",payload:false})
      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    });
};

export const savePost = (id, setHeart) => {
  let tempStr = `${BaseURL}save_post\/${id}`;

  fetch(tempStr, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setHeart(true);
        customToastMsg("Post saved in your profile")
      }

      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    });
};

export const PurchaseList = (setFullData, dispatchHome) => {
  let tempStr = `${BaseURL}posts?bought=1&mine=true`;
  dispatchHome({ type: "Loading", payload: true })

  fetch(tempStr, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      // console.log(res);
      if (res?.data) {
        setFullData(res.data)
      }
      dispatchHome({ type: "Loading", payload: false })
      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    })
    .catch(err => {
      customToastMsg(err)
      dispatchHome({ type: "Loading", payload: false })

    })

};


export const SalesList = (setFullDataSales, dispatchHome) => {
  let tempStr = `${BaseURL}posts?mine=true`;
  dispatchHome({ type: "Loading", payload: true });

  fetch(tempStr, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      // console.log(res);
      if (res?.data) {
        setFullDataSales(res.data)
      }
      dispatchHome({ type: "Loading", payload: false });

      // if (res?.data) {
      //   var ids = new Set(prevState.map(d => d.id));
      //   var merged = [...res.data.filter(d => !ids.has(d.id))];
      //   dispatchHome({type: 'SET_POST', payload: merged});
      //   if (res.meta.current_page <= res.meta.last_page)
      //     dispatchHome({type: 'SET_PAGE', payload: res.meta.current_page});
      // }
    })
    .catch(err => {
      customToastMsg(err)
      dispatchHome({ type: "Loading", payload: false });

    })
}

export const fetchSellingData = async (dispatchHome) => {
  dispatchHome({ type: "Loading", payload: true });
  return await fetch(
    `${BaseURL}posts?mine=true`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      dispatchHome({ type: "Loading", payload: false });
      return res;
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)
      dispatchHome({ type: "Loading", payload: false });

    });
};

export const markSoldRes = async (id) => {
  return await fetch(
    `${BaseURL}mark_as_sold\/${id}?status=true`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      return res;
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};


export const markDelRes = async (id) => {
  return await fetch(
    `${BaseURL}posts\/${id}`,
    {
      method: 'DELETE',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      return res;
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};

export const markArchiveRes = async (id) => {
  return await fetch(
    `${BaseURL}archive_post\/${id}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      return res;
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};

export const fetchUserPost = async (id, dispatchHome) => {
  dispatchHome({ type: "Loading", payload: true });

  return await fetch(
    // `${post}?page=${page}/?status=${status}&main=${main}&breed=${breed}&min_Price=${min_price}&max_price=${max_price}&latitude=${latitude}&longitude=${longitude}&price_sort&{price_sort}&distance=${distance}&user=${user}&mine=${mine}&category=${category}&search=${search}`,
    `${BaseURL}posts?user=${id}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      // console.log(res)
      dispatchHome({ type: "CLEAR_PROFILE_POST" })

      dispatchHome({ type: "SET_PROFILE_POST", payload: res.data })
      dispatchHome({ type: "SET_PROFILE_PAGE", payload: res.meta.current_page })
      dispatchHome({ type: "Loading", payload: false });


    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)
      dispatchHome({ type: "Loading", payload: false });


    });
};



export const fetchMoreUserPost = async (id, dispatchHome, stateHome) => {
  // console.log(`${BaseURL}posts?user=${id}&page=${stateHome.profilePostPage}`, "kkkkkkkkkkkkkkkjjjjjjjjjjjjjjjjjjjjj")

  return await fetch(
    // `${post}?page=${page}/?status=${status}&main=${main}&breed=${breed}&min_Price=${min_price}&max_price=${max_price}&latitude=${latitude}&longitude=${longitude}&price_sort&{price_sort}&distance=${distance}&user=${user}&mine=${mine}&category=${category}&search=${search}`,
    `${BaseURL}posts?user=${id}&page=${stateHome.profilePostPage + 1}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      // console.log(res)
      // dispatchHome({ type: "CLEAR_PROFILE_POST" })
      if (res?.data) {
        // var ids = new Set(stateHome.profilePost.map(d => d.id));
        // var merged = [...res.data.filter(d => !ids.has(d.id))];


        if (res.meta.current_page <= res.meta.last_page) {
          dispatchHome({ type: "SET_PROFILE_POST", payload: res.data })

          dispatchHome({ type: "SET_PROFILE_PAGE", payload: res.meta.current_page + 1 })
        }
      }

    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};

export const fetchUserBought = async (id, setBought) => {
  return await fetch(
    // `${post}?page=${page}/?status=${status}&main=${main}&breed=${breed}&min_Price=${min_price}&max_price=${max_price}&latitude=${latitude}&longitude=${longitude}&price_sort&{price_sort}&distance=${distance}&user=${user}&mine=${mine}&category=${category}&search=${search}`,
    `${BaseURL}posts?bought=${id}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      setBought(res.meta.total)
      // dispatchHome({ type: "SET_PROFILE_PAGE", payload: res.meta.current_page })

    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};
export const fetchUserSold = async (id, setSold) => {
  return await fetch(
    // `${post}?page=${page}/?status=${status}&main=${main}&breed=${breed}&min_Price=${min_price}&max_price=${max_price}&latitude=${latitude}&longitude=${longitude}&price_sort&{price_sort}&distance=${distance}&user=${user}&mine=${mine}&category=${category}&search=${search}`,
    `${BaseURL}posts?user=${id}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      setSold(res.meta.total)

    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};

export const fetchUserMorePost = async (id, dispatchHome, stateHome) => {

  return await fetch(
    // `${post}?page=${page}/?status=${status}&main=${main}&breed=${breed}&min_Price=${min_price}&max_price=${max_price}&latitude=${latitude}&longitude=${longitude}&price_sort&{price_sort}&distance=${distance}&user=${user}&mine=${mine}&category=${category}&search=${search}`,
    `${BaseURL}posts?user=\/${id}%page=${stateHome.profilePostPage + 1}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      dispatchHome({ type: "SET_PROFILE_POST", payload: res.data })
      dispatchHome({ type: "SET_PROFILE_PAGE", payload: res.meta.current_page })

    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};


export const followApi = async (id, setFollow) => {
  // console.log(id)
  return await fetch(
    `${BaseURL}user/${id}/follow`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      // console.log(res)
      // if (res.sucess == false && res.message == " Already Followed") {
      //   setFollow(true)
      // }
      setFollow(true)
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};


export const unfollowApi = async (id, setFollow) => {
  // console.log(id)

  return await fetch(
    `${BaseURL}user/${id}/unfollow`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
    },
  )
    .then(res => res.json())
    .then(res => {
      // console.log(res)
      setFollow(false)

    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};

export const RatingUser = async (id, Rating) => {
  // console.log(id)

  return await fetch(
    `${BaseURL}user_rating/${id}`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        rating: Rating
      })
    },
  )
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        customToastMsg("Your Ratings Saved Sucessfully")
      }
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};


/////////////////////////Chat///////////////////////////////
export const fetchAllChat = async () => {
  // console.log('here it is')

  return fetch(`${BaseURL}get_message_db`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
  })

};

// export async function sendPushNotificationUser(receiver_user_data) {
//   // console.log(receiver_user_data, "jeyhdj yeju jd ")
//   let modifiedUserData = receiver_user_data.hasOwnProperty("data") ? receiver_user_data.data : receiver_user_data
//   // console.log(modifiedUserData, "yo bro ")
//   return await fetch(`${BaseURL}send_notification`, {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//       // Authorization: `Bearer ${auth}`,
//     },
//     body: JSON.stringify({
//       receiver_user: modifiedUserData,
//       platform: Platform.OS == "android" ? "android" : "ios"
//     })

//   })
//     .then(response => response.json())
//     .then(response => {
//       // console.log("push notification response", response);
//       return response;
//     })
//     .catch(error => {
//       console.log(error)
//       // customToastMsg(error.message);
//     });
// }

export async function sendPushNotification(notificationPayload) {
  // console.log(JSON.stringify({
  //   ...notificationPayload,
  //   item: {
  //     ...notificationPayload.item,
  //     messageObj: {
  //       ...notificationPayload.item.messageObj,
  //       user : JSON.stringify(notificationPayload.item.messageObj.user)
  //     }
  //   }
  // }), "jeyhdj yeju jd ")
  // let modifiedUserData = receiver_user_data.hasOwnProperty("data") ? receiver_user_data.data : receiver_user_data
  // console.log(modifiedUserData, "yo bro ")
  return await fetch(`${BaseURL}send_notification`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify({
      payload: {
        ...notificationPayload,
        item: {
          ...notificationPayload.item,
          messageObj: {
            ...notificationPayload.item.messageObj,
            user : JSON.stringify(notificationPayload.item.messageObj.user)
          }
        }
      },
      platform: Platform.OS == "android" ? "android" : "ios"
    })
  })
    .then(response => response.json())
    .then(response => {
      // console.log("push notification response", response);
      return response;
    })
    .catch(error => {
      console.log(error)
      customToastMsg(error.message);
      return error;

    });
  return true
}


export const enableVisibility = async (setVisile, dispatch, id) => {
  // console.log(id)

  return await fetch(
    `${BaseURL}user_visibility`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        visibility: 'public'
      })
    },
  )
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setVisile(true)
        fetchUserDetail(id).then((res) => {
          dispatch({ type: "SIGN_IN_USER", loginedUser: res.data })
        })
      }
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};



export const disableVisibility = async (setVisile, dispatch, id) => {

  return await fetch(
    `${BaseURL}user_visibility`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        visibility: 'private'
      })
    },
  )
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setVisile(false)
        fetchUserDetail(id).then((res) => {
          dispatch({ type: "SIGN_IN_USER", loginedUser: res.data })
        })
      }
    })
    .catch(err => {
      // console.log(err);
      customToastMsg(err.message)

    });
};



export const logOut = (clear) => {
  auth = clear;
};