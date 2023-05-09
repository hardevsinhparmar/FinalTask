import { StyleSheet, Text, View, Image, SafeAreaView, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import Button from '../components/Button'
import TxtInput from '../components/TxtInput'
import Toast from 'react-native-simple-toast'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Strings } from '../Utils/Strings'
import { CommonStyles } from '../Utils/CommonStyles'
import { CheckNull, validateEmailMobile, validateReg } from '../Utils/InputValidation';
import { colors } from '../components/Colors'
import { UseDB, openDB, readDB, readDBPrimaryKey, writeDB } from '../Utils/DBUtils'

const userschema = {
    name: 'user_tbl',
    properties: {
        user_id: { type: 'int', default: 0 },
        user_name: 'string',
        user_contact: 'string',
        user_email: 'string',
        user_password: 'string',
    },
    primaryKey: "user_email",
}
openDB('UserDatabase.realm', userschema)

const Register = ({ navigation }) => {
    const [name, setname] = useState('Hardevsinh')
    const [mobile, setmobile] = useState('8141580986')
    const [email, setemail] = useState('aa@aa.com')
    const [password, setpassword] = useState('Parmar@123')
    const [cnfpassword, setcnfpassword] = useState('Parmar@123')
    const [error, seterror] = useState('')
    const [issecure, setissecure] = useState(true)
    UseDB('UserDatabase.realm')

    useEffect(() => {
        navigation.setOptions({ headerLeft: () => (<Icon name='chevron-left' size={40} color={colors.white} onPress={() => { navigation.goBack() }}></Icon>) })
    }, [])

    //OnSubmit input feilds validations
    const HandleSubmit =  async () => {
        console.log(await readDBPrimaryKey('user_tbl', email))
        setTimeout(() => {
            seterror('')
        }, 2500)
        if (CheckNull(name) || CheckNull(email) || CheckNull(mobile) || CheckNull(password) || CheckNull(cnfpassword)) {
            seterror(Strings.ALL_REQUIRE)
        }
        else if (validateEmailMobile(email, mobile)) {
            seterror(validateEmailMobile(email, mobile))
        }
        else if (!validateReg(password, Strings.PASSWORD_REGEX)) {
            seterror(Strings.VALID_PASSWORD)
        }
        else if (cnfpassword != password) {
            seterror(Strings.COFIRM_PASSWORD_MATCH)
        }
        else {
            console.log('add')
            await RegisterUser()
        }

    }

    //Register UserDetails in LocalDB
    const RegisterUser = async () => {
        try {
            if (await readDBPrimaryKey('user_tbl', email) == null) {
                console.log('hey')
                var ID =Math.floor(Math.random() * 100) + 1
                   
                await writeDB('user_tbl', {
                    user_id: ID,
                    user_name: name,
                    user_contact: mobile,
                    user_email: email,
                    user_password: password,
                })
                Toast.show("Register Successfull..", Toast.LONG);
                setTimeout(() => {
                    navigation.navigate('Login')
                }, 1000);
            }
            else {
                seterror('Email Already registered')
            }
        } catch (error) {
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
    return (

        <SafeAreaView>
            <ScrollView style={CommonStyles.scrlview}>
                <Image source={require('../assets/logosyno.png')} style={CommonStyles.synologo} />
                <ScrollView>
                    <View style={styles.formwrap}>
                        <Text style={styles.header}>Register</Text>
                        <Text style={CommonStyles.errtxt}>{error}</Text>

                        <TxtInput maxLength={30} placeholder={'Name'} value={name}
                            onchangeText={(txt) => {
                                setname(txt.replace(Strings.ONLY_TEXT_REGEX, ''))
                                onChange(txt, Strings.ONLY_TEXT_REGEX, Strings.VALID_NAME)
                            }}
                            style={styles.inputtxt} />
                        <TxtInput maxLength={10} keyboardType={'number-pad'} placeholder={'Contact No'} value={mobile}
                            onchangeText={(txt) => {
                                setmobile(txt.replace(Strings.ONLY_NUMBER_REGEX, ''))
                                onChange(txt, Strings.ONLY_NUMBER_REGEX, Strings.VALID_CONTACT)
                            }}
                            style={styles.inputtxt} />
                        <TxtInput placeholder={'Email'} value={email}
                            onchangeText={(txt) => {
                                setemail(txt),
                                    !validateReg(txt, Strings.EMAIL_REGEX) ? seterror(Strings.VALID_EMAIL) : seterror('')
                            }}
                            style={styles.inputtxt} />

                        <TxtInput secureTextEntry={issecure} placeholder={'Password'} value={password}
                            onchangeText={(txt) => { setpassword(txt) }}
                            style={styles.inputtxt} />


                        <View style={{ flexDirection: 'row' }}>
                            <TxtInput secureTextEntry={issecure} placeholder={'Confirm Password'} value={cnfpassword}
                                onchangeText={(txt) => { setcnfpassword(txt) }}
                                style={[styles.inputtxt, { marginLeft: 17 }]} />
                            <TouchableOpacity><Icon name={issecure ? 'eye-off' : 'eye'} size={20} onPress={() => setissecure(!issecure)} style={{ paddingTop: 15 }}></Icon></TouchableOpacity>
                        </View>
                        <Button Title='Submit' onPress={HandleSubmit} />
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.Logintxt}>
                                Already have an account?
                            </Text>
                            <Text style={styles.Login} onPress={() => { navigation.navigate('Login') }}>
                                Login
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </ScrollView>
        </SafeAreaView>

    )
}


export default Register
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
        alignSelf: 'center'
    },
    inputtxt: {
        alignSelf: 'center',
        width: '90%'
    },
    Logintxt: {
        fontSize: 12,
        color: colors.black,
        alignSelf: 'flex-start',
        paddingLeft: 18
    },
    Login: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.BTNBLUE
    },
})
