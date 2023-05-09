import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import Toast from 'react-native-simple-toast';
import Button from '../components/Button'
import TxtInput from '../components/TxtInput'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Strings } from '../Utils/Strings'
import { CommonStyles } from '../Utils/CommonStyles';
import { CheckNull, validateReg } from '../Utils/InputValidation';
import { colors } from '../components/Colors';
import Spinner from 'react-native-loading-spinner-overlay';

import { UseDB, readDBPrimaryKey } from '../Utils/DBUtils';


const Login = ({ navigation }) => {
    UseDB('UserDatabase.realm')
    const [email, setemail] = useState('aa@aa.com')
    const [password, setpassword] = useState('Parmar@123')
    const [error, seterror] = useState('')
    const [isloading, setisloading] = useState(true)
    const [issecure, setissecure] = useState(true)

    //For identify user is alreay loggedin or not 
    useEffect(() => {
        UserLoginStatus();
    }, [])

    const UserLoginStatus = async () => {
        try {
            const data = await AsyncStorage.getItem('isLoggedin')
            console.log('Is User already LoggedIn?', JSON.parse(data))
            JSON.parse(data) && navigation.navigate("Tab")
            setTimeout(() => {
                setisloading(false)
            }, 3000);

        } catch (error) {
            console.log("got error while login state check", error)
        }

    }

    //Input fields validation
    const validateform = () => {
        setTimeout(() => {
            seterror('')
        }, 2500)
        if (CheckNull(email) || CheckNull(password)) {
            seterror(Strings.ALL_REQUIRE)
        }
        else if (!validateReg(email, Strings.EMAIL_REGEX)) {
            seterror(Strings.VALID_EMAIL)
        }
        else if (!validateReg(password, Strings.PASSWORD_REGEX)) {
            seterror(Strings.VALID_PASSWORD)
        }
        else {
            loginuser()
        }
    }

    //Authenticate user based on localstorage data
    const loginuser = async () => {
        try {
            var user_details = await readDBPrimaryKey('user_tbl', email)
            console.log(user_details)

            if (user_details == null) {
                Toast.show("Register First!!", Toast.LONG)
            }
            else {
                if (user_details.user_email == email && user_details.user_password == password) {
                    console.log('welcom')
                    await AsyncStorage.setItem('isLoggedin', JSON.stringify(true))
                    await AsyncStorage.setItem('user', JSON.stringify(email))
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [
                                { name: 'Login' },
                                {
                                    name: 'Tab'
                                },
                            ]
                        })
                    )
                }
                else {
                    console.log(Strings.VALID_EMAIL + 'OR' + Strings.VALID_PASSWORD)
                }
            }
        } catch (error) {
            console.log(error.message)
        }
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
        <SafeAreaView>
            <ScrollView style={CommonStyles.scrlview}>
                <Image source={require('../assets/logosyno.png')} style={CommonStyles.synologo} />

                <View style={styles.formwrap}>
                    <Text style={styles.header}>Login</Text>
                    <Text style={CommonStyles.errtxt}>{error}</Text>
                    <TxtInput placeholder={'Email'} value={email}
                        onchangeText={(txt) => {
                            setemail(txt)
                            !validateReg(email, Strings.EMAIL_REGEX) ? seterror(Strings.VALID_EMAIL) : seterror('')
                        }}
                        style={styles.inputtxt} />



                    <View style={{ flexDirection: 'row' }}>
                        <TxtInput secureTextEntry={issecure} placeholder={'Password'} value={password}
                            onchangeText={(value) => {
                                setpassword(value)
                                password.length < 7 ? seterror(Strings.VALID_PASSWORD_LENGTH) : seterror('')
                            }} style={[styles.inputtxt, { marginLeft: 17 }]} />
                        <TouchableOpacity><Icon name={issecure ? 'eye-off' : 'eye'} size={20} onPress={() => setissecure(!issecure)} style={{ paddingTop: 15 }}></Icon></TouchableOpacity>
                    </View>
                    <Button Title='Submit' onPress={validateform} />
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.Registertxt}>
                            Don't have an account?
                        </Text>
                        <Text style={styles.Register} onPress={() => { navigation.navigate('Register') }}>
                            Sign Up
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>

    )
}
export default Login
const styles = StyleSheet.create({
    formwrap: {
        backgroundColor: colors.FORM_CONTAINER,
        borderRadius: 20,
        padding: 30,
        margin: 15,
    },

    header: {
        fontSize: 26,
        color: colors.black,
        paddingLeft: 15
    },
    Registertxt: {
        fontSize: 12,
        color: colors.black,
        alignSelf: 'flex-start',
        paddingLeft: 18
    },
    Register: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.BTNBLUE
    },
    inputtxt: {
        alignSelf: 'center',
        width: '90%',
    },

})
