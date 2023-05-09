import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CommonActions } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, BackHandler, FlatList, Image, Text, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Menu, MenuItem } from 'react-native-material-menu';
import Snackbar from 'react-native-snackbar';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TxtInput from '../components/TxtInput';
import Spinner from 'react-native-loading-spinner-overlay';
import { AlertBox } from '../Utils/AlertBox';
import { GetCalls, PostCalls } from '../ApiCalls/Api';
import { colors } from '../components/Colors';
import { UseDB, deleteObj, openDB, readDB, writeDB } from '../Utils/DBUtils';
import { ADD_USER, BASE_URL, DELETE_USER, UPDATE_USER,GET_ALL_USERS } from '../ApiCalls/Constants';
const localdtaschema = {
  name: 'local_db',
  properties: {
    id: 'int',
    name: 'string',
    email: 'string',
    mobile: 'string',
    gender: 'int',
    createdAt: 'string',
    updatedAt: 'string'
  }
}
openDB('LocaluserDatabase.realm', localdtaschema)

const HomeScreen = ({ navigation }) => {
  const [SearchText, setSearchText] = useState('')
  const [userdata, setuserdata] = useState([])
  const [userOlddata, setuserOlddata] = useState([])
  const [isloading, setisloading] = useState(true)
  const [image, setimage] = useState([])
  const [netInfo, setNetInfo] = useState();
  const [sortvisible, setsortVisible] = useState(false);
  const [deleteid,setdeleteid] = useState([]);
  const [deleteallarray, setdeleteallarray] = useState([])
  const [isselectedall, setisselectedall] = useState(false)
  const listRef = useRef()
  const [refreshing, setRefreshing] = React.useState(false);

  //UseEffect for setting headeroptions and calling getimage() and back handler
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => { AlertBox('Hold on!', 'Are you sure you want Logout?', () => Logout()) }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 17, paddingRight: 5 }}>Logout </Text><Icon color={colors.black} size={21} name="logout" />
          </View>
        </TouchableOpacity>
      )
    })
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      console.log('Is offline?', offline)
      setNetInfo(offline)
    })

    const backAction = () => {
      AlertBox('Hold on!', 'Are you sure you want to Exit?', () => BackHandler.exitApp())
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress',backAction);
    getImage()
    return () => {backHandler.remove(),unsubscribe()}
  }, [])
  //UseEffect for checking network Connection
  useEffect(() => {
    if (netInfo == undefined) { return }
    const fetchData = async () => {
      if (netInfo == true) {
        console.log('getting local data')
        Snackbar.show({
          text: 'Offline',
          backgroundColor: colors.fail,
          duration: Snackbar.LENGTH_LONG,
        })
        await getLocaldata()
      }
      else {
        Snackbar.show({
          text: 'Online',
          duration: Snackbar.LENGTH_LONG,
          backgroundColor: colors.success
        })
        await syncdata()
        setTimeout(async() => {
          await getapidata()      
        }, 2000);
    
      }
    }
    fetchData()

  }, [netInfo])

  //Refresh Control
  const onRefresh = React.useCallback(async() => {
    console.log('refresh',netInfo)
    setRefreshing(true);
    if (netInfo == undefined) { return }
    if (netInfo == true) {
     await getLocaldata()
    }
    else {
      await syncdata()
      await getapidata()
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [netInfo]);



  const hidesortMenu = () => setsortVisible(false);

  const showsortMenu = () => setsortVisible(true);

  //For fetching image stored in LocalDB
  const getImage = async () => {
    UseDB('ImageDatabase.realm')
    const image_details = await readDB('user_image')
    setimage(image_details)
    UseDB('LocaluserDatabase.realm')
  }
  //For getting Offline data from LocalDB
  const getLocaldata = async () => {

    setisloading(true)
    try {
      UseDB('LocaluserDatabase.realm')
      const localuser = await readDB('local_db');
      setuserdata(localuser)
      setuserOlddata(localuser)
    }
    catch (error) {
      console.log(error)
    }
    finally {
      setisloading(false)
    }
  }

  //For Storing API data into LocalDB 
  const savedatalocal = async (user) => {
    UseDB('LocaluserDatabase.realm')
    const localuser = await readDB('local_db');
    user.map(async (usr) => {
      const checkuser = localuser.filter((csk) => {
        return csk.id == usr.id || csk.email == usr.email || csk.mobile == usr.mobile
      })
      if (checkuser.length > 0) {
        null
      }
      else {
        await writeDB('local_db', {
          id: usr.id,
          name: usr.name,
          email: usr.email,
          mobile: usr.mobile,
          gender: usr.gender,
          createdAt: usr.createdAt,
          updatedAt: usr.updatedAt
        })
        Toast.show('User Saved Locally', Toast.SHORT);
      }
    })
  }

  //For Performing actions which are waiting for network connection
  const syncdata = async () => {

    const deletedata = await AsyncStorage.getItem('@MySuperStore:key')
    const adduserdata = await AsyncStorage.getItem('users')
    const edituserdata = await AsyncStorage.getItem('editusers')

    console.log(JSON.parse(adduserdata))
    console.log(JSON.parse(edituserdata))
    console.log(JSON.parse(deletedata))
    if (JSON.parse(deletedata) != null) {
      JSON.parse(deletedata).map(async (itm) => {
        await deleteUserSync(itm)
      })
    }
    if (JSON.parse(adduserdata) != null) {
      JSON.parse(adduserdata).map(async (itm) => {
        if (itm != null) {
          await addUserSync(itm.id, itm.name, itm.email, itm.mobile, itm.gender)
        }
      })
    }
    if (JSON.parse(edituserdata) != null) {
      JSON.parse(edituserdata).map(async (itm) => {
        if (itm != null) {
          await editUserSync(itm.id, itm.name, itm.email, itm.mobile, itm.gender)
        }
      })
    }
    else {
      console.log('nothing to sync')
    }

    
  }


  const addUserSync = async (id, name, email, mobile, gender) => {
    UseDB('LocaluserDatabase.realm')
    let local = await readDB('local_db');
    const response = await PostCalls({
      "name": name,
      "email": email,
      "mobile": mobile,
      "gender": gender
    }, BASE_URL + ADD_USER)
    if (response.status === 200) {
      Toast.show('Added', Toast.SHORT);
      await deleteObj(local.filtered("id=" + id))
      await AsyncStorage.setItem('users', JSON.stringify([]))
    }

  }
  const editUserSync = async (id, name, email, mobile, gender) => {
    UseDB('LocaluserDatabase.realm')
    let local = await readDB('local_db');
    const response = await PostCalls({
      "id": id,
      "name": name,
      "email": email,
      "mobile": mobile,
      "gender": gender
    }, BASE_URL + UPDATE_USER)
    if (response.status === 200) {
    
      await deleteObj(local.filtered("id=" + id))
      Toast.show('User Updated !', Toast.SHORT);
      await AsyncStorage.setItem('editusers', JSON.stringify([]))
    }
  }
  const deleteUserSync = async (userid) => {
    UseDB('LocaluserDatabase.realm')
    let local = await readDB('local_db');
    const response = await PostCalls({ "id": userid }, BASE_URL + DELETE_USER)
    if (response.status == 200) {
      await deleteObj(local.filtered("id=" + userid))
      Toast.show('Deleted', Toast.SHORT);
    }
  }


  //For Fetching API data
  const getapidata = async () => {
    console.log('api called')
    setisloading(true)
    try {
      const Mydata = await GetCalls(BASE_URL+GET_ALL_USERS);
      // console.log(Mydata)
      setuserOlddata(Mydata.data)
      const data = await AsyncStorage.getItem('sorttype')
      console.log('sortttttttt', JSON.parse(data))
      if(Mydata.data.length>0){
      if (JSON.parse(data) == 'A-Z') {
        setuserdata(Mydata.data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
        savedatalocal(Mydata.data)
      }
      else if (JSON.parse(data) == 'Z-A') {
        setuserdata(Mydata.data.sort((a, b) =>
          a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1))
        savedatalocal(Mydata.data)
      }
      else if (JSON.parse(data) == 'lastupdt') {
        setuserdata(Mydata.data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
        savedatalocal(Mydata.data)
      }
      else if (JSON.parse(data) == 'LastCreated') {
        setuserdata(Mydata.data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        savedatalocal(Mydata.data)
      }
      else if (JSON.parse(data) == null) {
        setuserdata(Mydata.data)
        savedatalocal(Mydata.data)
      }}
      else{
        console.log('no data in api')
      }
    }
    catch (error) {
      console.log('api', error)
    }
    finally {
      setisloading(false)
    }
  }

  const SortCommonFunction = async (type, tempList) => {
    Toast.show(type, Toast.SHORT);
    listRef.current.scrollToOffset({ animated: true, offset: 0 })
    setuserdata(tempList)
    hidesortMenu()
    await AsyncStorage.setItem('sorttype', JSON.stringify(type));
  }
  //For checking SortFilter
  const SortTheList = async (sorttype) => {
    if (sorttype == 'A-Z') {
      let tempList = [...userdata].sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
      SortCommonFunction(sorttype, tempList)
    }
    else if (sorttype == 'Z-A') {
      let tempList = [...userdata].sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? 1 : -1);
      SortCommonFunction(sorttype, tempList)

    }
    else if (sorttype == 'LastModified') {
      let tempList = [...userdata].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      SortCommonFunction(sorttype, tempList)

    }
    else if (sorttype == 'LastCreated') {
      let tempList = [...userdata].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      SortCommonFunction(sorttype, tempList)
    }

  }

  //For handling Search Operation
  const SearchItem = (text) => {
    // console.log('Search old:',userOlddata)
    // if (text) {
    //   if (userOlddata == null) {
    //     null
    //   }
    //   else {
    //     const tempList = userOlddata.filter(function (item) {
    //       // Applying filter for the inserted text in search bar

    //       const nameData = item.name ? item.name.toLowerCase() : ''.toLowerCase();
    //       const emailData = item.email ? item.email.toLowerCase() : ''.toLowerCase();
    //       const textData = text.toLowerCase();
    //       return nameData.indexOf(textData) > -1 || emailData.indexOf(textData) > -1 || item.mobile.indexOf(textData) > -1

    //     });

    //     setuserdata(tempList);

    //     setSearchText(text)
    //   }
    // }
    // else {
    //   setuserdata(userOlddata)
    //   setSearchText(text)
    // }
    const formattedQuery = text.toLowerCase();
    const filtered = userOlddata.filter((item) => {
      return item.name.toLowerCase().includes(formattedQuery) || item.email.toLowerCase().includes(formattedQuery) || item.mobile.toLowerCase().includes(formattedQuery)
    });
    setuserdata(filtered);
    setSearchText(text);

  }

  //Common Delete function
  const DeleteData = async (userid) => {
    UseDB('LocaluserDatabase.realm')
    let local = await readDB('local_db');
    if (netInfo == false) {
      setisloading(true);
      console.log(userid);
      const response = await PostCalls({ "id": userid }, BASE_URL + DELETE_USER)
      console.log(response.status)
      if (response.status == 200) {
        Toast.show('User Deleted Successfully', Toast.SHORT);
        await deleteObj(local.filtered("id=" + userid))
        setTimeout(async () => {
          await getapidata()
        }, 1000);
      }
      else {
        Toast.show('Not Deleted', Toast.SHORT);
      }
    }
    else if (netInfo == true) {
      deleteid.push(userid)
      await deleteObj(local.filtered("id=" + userid))
      setTimeout(() => {
        getLocaldata()
      }, 1000);
      console.log('For delete', deleteid)
      await AsyncStorage.setItem('@MySuperStore:key', JSON.stringify(deleteid))
      Toast.show('User Deleted Successfully', Toast.SHORT);

    }
  }
  //For DeleteAll User
  const DeleteAllUser = async () => {
    if (deleteallarray.length == 0) {
      Toast.show('NO DATA AVAILABLE...', Toast.SHORT)
    }
    else {
      AlertBox('Hold on!', 'Are you sure you want to Delete Everything?', async () => {
        {
          deleteallarray.map(async (itm) => { await DeleteData(itm) },
            setuserdata([]),
            setuserOlddata([]),
            Toast.show('Deleted All', Toast.SHORT),
            setisselectedall(false)
          )
        }
      })
    }
  }

  //For Delete Single User
  const DelteSingleUser = async (userid) => {
    AlertBox('Hold on!', 'Are you sure you want to Delete?', async () => await DeleteData(userid))
    return true;
  }

  //For Logout current user
  function Logout() {
    AsyncStorage.setItem('isLoggedin', JSON.stringify(false));
    AsyncStorage.setItem('user', JSON.stringify(''));
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Tab' },
          {
            name: 'Login'
          },
        ]
      })
    );
  }

  //For selectAll data
  const selectall = () => {

    if (!isselectedall) {
      let temparray = userdata.map((itm) => { return itm.id })
      setdeleteallarray(temparray)
    }
    else {
      setdeleteallarray([])
    }
    setisselectedall(!isselectedall)
    console.log(deleteallarray)
  }

  const highlightText = (text, query) => {
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return (
      <Text>
        {parts.map((part, i) => (
          <Text
            key={i}
            style={
              part.toLowerCase() === query.toLowerCase()
                ? { fontWeight: "bold", color: colors.fail }
                : {}
            }
          >
            {part}
          </Text>

        ))}
      </Text>)
  }

  const renderItem = ({ item }) => {
    let imagepath = []
    userdata.length>0?(imagepath = image.filter((img) => { return (img.id == item.id) }).map((img) => { return img.path })):(null);
    return (
      <><TouchableOpacity

        disabled={isselectedall}
        onPress={() => {
          navigation.navigate('Edit',
            {
              id: item.id,
              name: item.name,
              email: item.email,
              mobile: item.mobile,
              gender: item.gender,
              isNew: false,
              isEdit: false,
              isoffline: netInfo,

            });
        }} activeOpacity={0.7}>
        <View style={styles.databox} borderColor={isselectedall ? colors.fail : colors.LIST_ITEM} backgroundColor={colors.LIST_ITEM}>
          <View style={styles.imgview}>
            {/* {console.log('this is image source', imagepath)} */}
            <Image

              style={styles.usrimg}
              source={imagepath.length > 0 ? { uri: imagepath[0] } : require('../assets/usr.png')} />

          </View>
          <View style={{flex:4, marginLeft: 20 }}>
            <Text style={{ color: colors.grey }}>ID:- {item.id}</Text>
            <Text style={{ color: colors.black }}>Name:-{SearchText ? (highlightText(item.name, SearchText)) : (item.name)}</Text>
            <Text style={{ color: colors.black }}>Email:-{SearchText ? (highlightText(item.email, SearchText)) : (item.email.length>25?item.email.substring(0,25)+'...':item.email)}</Text>
            <Text style={{ color: colors.black }}>Contact No:-{SearchText ? (highlightText(item.mobile, SearchText)) : (item.mobile)}</Text>
            {/* <Text style={{ color: 'black' }}>Gender:-{item.gender == 1 ? 'Female' : 'Male'}</Text> */}
          </View>
          <View style={styles.editdelete}>
            {isselectedall ? <></> :
              <><TouchableOpacity disabled={isselectedall} style={{ marginBottom: 20 }}
                onPress={() => {
                  navigation.navigate('Edit',
                    {
                      id: item.id,
                      name: item.name,
                      email: item.email,
                      mobile: item.mobile,
                      gender: item.gender,

                      isNew: false,
                      isEdit: true,
                      isoffline: netInfo,

                    });

                }}>
                <Icon name='square-edit-outline' color={colors.black} size={30} />
              </TouchableOpacity><TouchableOpacity disabled={isselectedall} onPress={() => { DelteSingleUser(item.id); }}>
                  <Icon name='trash-can' color={colors.black} size={30} />
                </TouchableOpacity></>
            }
          </View>
          <View style={{ justifyContent: 'center' }}><Icon name={isselectedall ? 'check' : null} size={30}></Icon></View>
        </View>

      </TouchableOpacity></>

    )
  }

  if (isloading) {

    return (
      <View style={{ flex: 1, backgroundColor: colors.SCRLVIEW, justifyContent: 'center', alignItems: 'center' }}>
        <Spinner
          visible={isloading}
          cancelable={false}
        />
      </View>
    )
  }

  return (

    <View style={{ flex: 1, backgroundColor: colors.SCRLVIEW }}>
      {/* search View */}
      <View style={{ flexDirection: 'row', marginLeft: 10 }}>
        <Menu
          visible={sortvisible}
          anchor={<TouchableOpacity onPress={showsortMenu}>
            <Icon name={'sort-alphabetical-ascending'} color={colors.white} size={35} style={{ paddingTop: 7, paddingRight: 5 }}></Icon></TouchableOpacity>}

          onRequestClose={hidesortMenu}>

          <MenuItem onPress={() => SortTheList('A-Z')}> <Text>A-Z</Text></MenuItem>


          <MenuItem onPress={() => SortTheList('Z-A')}> <Text>Z-A</Text></MenuItem>


          <MenuItem onPress={() => SortTheList('LastModified')}> <Text>Last Modified</Text></MenuItem>


          <MenuItem onPress={() => SortTheList('LastCreated')}> <Text>Last Inserted</Text></MenuItem>
        </Menu>
        <View style={styles.searchView}>
          <TxtInput placeholder={'Search'} style={styles.searchinput} placeholderColor={colors.black} value={SearchText}
            onchangeText={SearchItem} />
          {SearchText == '' ? null : (<TouchableOpacity onPress={() => { SearchItem(''), setSearchText(''); }}>
            <Icon name={'window-close'} color={colors.black} size={30} style={{ paddingTop: 5, paddingLeft: 5 }}></Icon>
          </TouchableOpacity>)}
        </View>
        <TouchableOpacity onPress={() => { selectall() }}>
          <Icon name={isselectedall ? 'selection-remove' : 'select-all'} color={colors.white} size={35} style={{ paddingTop: 7 }}  ></Icon>
        </TouchableOpacity>
      </View>

      {/* Data View/flatlist */}
      {userdata == '' || userdata == null ? (<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}><View style={styles.nodatafound}>
        <Image source={require('../assets/nodata.png')} /></View></ScrollView>) :
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          data={userdata}
          ref={listRef}
          nestedScrollEnabled={true}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()} />}

      {/* Floating Button */}
      {isselectedall ?
        <TouchableOpacity style={styles.deleteall} onPress={() => DeleteAllUser()}>
          <Icon name='delete-empty' color={colors.white} size={30}><Text style={{ fontSize: 17 }}>Delete All</Text></Icon>
        </TouchableOpacity>
        :
        <TouchableOpacity style={styles.floatingadd} onPress={() => { navigation.navigate('Edit', { isoffline: netInfo, isEdit: true, isNew: true }) }}>
          <Icon name='account-plus' color={colors.white} size={30}></Icon>
        </TouchableOpacity>}

    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  searchinput: {
    borderColor: colors.white,
    height: '80%',
    width: '85%',
  },
  searchView: {
    backgroundColor: colors.white,
    borderRadius: 10,
    width: '80%',
    marginTop: 5,
    height: '70%',
    paddingLeft: 7,
    flexDirection: 'row'
  },
  nodatafound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteall: {
    backgroundColor: colors.BTNBLUE,
    position: 'absolute',
    width: "100%",
    height: '9%',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: '4%',
    borderRadius: 25
  },
  floatingadd: {
    backgroundColor: colors.BTNBLUE,
    position: 'absolute',
    width:60,
    height: '9%',
    alignItems: 'center',
    justifyContent: 'center',
    right: '13%',
    bottom: '4%',
    borderRadius: 30
  },
  databox: {
    margin:5,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    borderWidth: 2
  },
  imgview: {
    flex:1,
    justifyContent: 'center'
  },
  usrimg: {
    alignSelf: 'center',
    height:70,
    width: 70,
    borderRadius: 35
  },
  editdelete: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1
  },
})





















