import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native'
import TxtInput from '../components/TxtInput';
import Toast from 'react-native-simple-toast'
import Button from '../components/Button';
import { Strings } from '../Utils/Strings';
import { CheckNull, validateEmailMobile, validateReg } from '../Utils/InputValidation';
import { CommonStyles } from '../Utils/CommonStyles';
import { AlertBox } from '../Utils/AlertBox';
import { colors } from '../components/Colors';
import { UseDB, deleteObj, readDBPrimaryKey, writeDB } from '../Utils/DBUtils';




const Profile = ({ navigation }) => {
  UseDB('UserDatabase.realm')
  const [isEditable, setIsEditable] = useState(false);
  const [name, setname] = useState('')
  const [mobile, setmobile] = useState('')
  const [id, setid] = useState('')
  const [password, setpassword] = useState('')
  const [email, setemail] = useState('')
  const [isloading, setisloading] = useState(true)
  const [issecure, setissecure] = useState(true)
  const [error, seterror] = useState('')


  useEffect(() => {
    navigation.setOptions({ headerLeft: () => (<Icon name='chevron-left' size={40} color={colors.black} onPress={back}></Icon>) })
    getdata()
  }, [])

  //Get Currentuser data
  const getdata = async () => {
    const data = await AsyncStorage.getItem('user')
    var user_details = await readDBPrimaryKey('user_tbl', JSON.parse(data));
    setisloading(false)
    setname(user_details.user_name)
    setmobile(user_details.user_contact)
    setid(user_details.user_id)
    setemail(user_details.user_email)
    setpassword(user_details.user_password)

  }

  //Handler to enable of disable TextInput
  //Make TextInput Enable/Disable
  const UpdateEditable = () => {
    setIsEditable(true);
    setissecure(!issecure)
  };

  const ValidateProfile = () => {

    setTimeout(() => {
      seterror('')
    }, 2500)
    if (CheckNull(name) || CheckNull(email) || CheckNull(mobile) || CheckNull(password)) {
      seterror(Strings.ALL_REQUIRE)
    }
    else if (validateEmailMobile(email, mobile)) {
      seterror(validateEmailMobile(email, mobile))
    }
    else if (!validateReg(password, Strings.PASSWORD_REGEX)) {
      seterror(Strings.VALID_PASSWORD)
    }
    else {
      UpdateProfile()
    }
  }

  const UpdateProfile = async () => {
    let userEmail = await AsyncStorage.getItem('user')
    try {
      await deleteObj(await readDBPrimaryKey('user_tbl', JSON.parse(userEmail)))
      await writeDB('user_tbl', {
        user_id: id,
        user_name: name,
        user_contact: mobile,
        user_password: password,
        user_email: email
      })
      await AsyncStorage.setItem('user', JSON.stringify(email))
      Toast.show("Updated", Toast.SHORT)
      setIsEditable(false)
      setissecure(true)
    } catch (error) {
      console.log(error)
    }
  }

  const DeleteProfile = () => {
    try {
      AlertBox('Hold on!', 'Do you want to Delete Profile?', async () => {
        await deleteObj(await readDBPrimaryKey('user_tbl', email))
        Toast.show('Profile deleted successfully', Toast.SHORT)
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
        )
      })
    }
    catch (error) {
      console.log(error)
    }
  }


  const onChange = (txt, reg, error) => {
    if (validateReg(txt, reg)) {
      seterror(error)
    }
    else {
      seterror('')
    }

  }
  const back = () => {
    if (isEditable) {
      AlertBox('Hold on!', 'Do you want to save updated details?', () => {
        ValidateProfile()
        navigation.goBack()
      })
    }
    else {
      navigation.goBack()
    }
  }


  if (isloading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={'large'} />
      </View>
    )
  }
  return (
    <SafeAreaView>
      <ScrollView style={CommonStyles.scrlview}>
        <Text style={styles.header} >Profile</Text>
        <View style={styles.formwrap}>

          <View style={{ alignSelf: 'flex-start' }}>
            <Text style={styles.uid}> USER ID: {id}</Text>
          </View>

          <View style={styles.editdelView}>
            <Text style={styles.edit} onPress={UpdateEditable}> Edit
              <Icon name='account-edit-outline' size={18} color={colors.blue} onPress={UpdateEditable}></Icon>
            </Text>
            <Text style={styles.delete} onPress={DeleteProfile}> Delete
              <Icon name='account-edit-outline' size={18} color={colors.fail} onPress={DeleteProfile}></Icon>
            </Text>
          </View>
          <Image
            style={CommonStyles.avatar}
            source={require('../assets/usr.png')}
          />
          <Text style={CommonStyles.errtxt}>{error}</Text>
          <Text style={styles.txt}>Name:</Text>
          <TxtInput
            maxLength={30}
            value={name}
            placeholder={isEditable ? Strings.TXT_ENTER_VALUE : 'Input Disabled'}
            onchangeText={(txt) => {
              setname(txt.replace(Strings.ONLY_TEXT_REGEX, ''))
              onChange(txt, Strings.ONLY_TEXT_REGEX, Strings.VALID_NAME)
            }}
            style={CommonStyles.inputText(isEditable)}
            editable={isEditable}
          />
          <Text style={styles.txt}>Contact No:</Text>
          <TxtInput
            maxLength={10}
            value={mobile}
            placeholder={isEditable ? Strings.TXT_ENTER_VALUE : 'Input Disabled'}
            onchangeText={(txt) => {
              setmobile(txt.replace(Strings.ONLY_NUMBER_REGEX, ''))
              onChange(txt, Strings.ONLY_NUMBER_REGEX, Strings.VALID_CONTACT)
            }}
            style={CommonStyles.inputText(isEditable)}
            editable={isEditable}

          />
          <Text style={styles.txt}>Email:</Text>
          <TxtInput
            value={email}
            placeholder={isEditable ? Strings.TXT_ENTER_VALUE : 'Input Disabled'}
            onchangeText={(txt) => {
              setemail(txt)
              !validateReg(txt, Strings.EMAIL_REGEX) ? seterror(Strings.VALID_EMAIL) : seterror('')
            }}
            style={CommonStyles.inputText(isEditable)}
            editable={isEditable}
          />

          <Text style={styles.txt}>Password:</Text>
          <View style={{ flexDirection: 'row' }}>
            <TxtInput
              value={password}
              secureTextEntry={issecure}
              placeholder={isEditable ? Strings.TXT_ENTER_VALUE : 'Input Disabled'}
              onchangeText={(txt) => { setpassword(txt) }}
              style={CommonStyles.inputText(isEditable)}
              editable={isEditable}
            /><TouchableOpacity><Icon name={issecure ? 'eye-off' : 'eye'} size={20} onPress={() => setissecure(!issecure)} style={{ paddingTop: 15 }}></Icon></TouchableOpacity></View>
          {isEditable ? <Button Title={'Save'} onPress={ValidateProfile} style={styles.btn} /> : null}
        </View>

      </ScrollView>
    </SafeAreaView>

  )
}

export default Profile

const styles = StyleSheet.create({
  formwrap: {
    backgroundColor: colors.FORM_CONTAINER,
    borderRadius: 20,
    padding: 30,
    margin: 15,
    paddingVertical:30
},
  txt: {
    fontSize: 14,
    paddingTop: 10,
    color: colors.black,
  },
  header: {
    fontSize: 26,
    color: colors.white,
    alignSelf: 'center'
  },
  uid: {
    fontSize: 20,
    color: colors.grey
  },
  editdelView: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  edit: {
    fontSize: 15,
    color: colors.blue
  },
  delete: {
    fontSize: 15,
    color: colors.fail
  },
  btn: {
    width: '90%',
    marginTop: 20,
    marginLeft: 20
  },

})