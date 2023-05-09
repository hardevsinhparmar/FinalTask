import { StyleSheet, Text, View, Platform, PermissionsAndroid, SafeAreaView, ScrollView, Image, TouchableOpacity, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import TxtInput from '../components/TxtInput';
import Button from '../components/Button';
import { RadioButton } from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Strings } from '../Utils/Strings';
import { CommonStyles } from '../Utils/CommonStyles';
import { CheckNull, validateEmailMobile, validateReg } from '../Utils/InputValidation';
import { colors } from '../components/Colors';
import { UseDB, deleteObj, openDB, readDB, readDBPrimaryKey, writeDB } from '../Utils/DBUtils';
import { ADD_USER, BASE_URL, UPDATE_USER } from '../ApiCalls/Constants';
import { PostCalls } from '../ApiCalls/Api';

const imageschema = {
    name: 'user_image',
    properties:
    {
        id: { type: 'int' },
        path: 'string',
    }, primaryKey: "id",
}
openDB('ImageDatabase.realm', imageschema)
const EditUser = ({ navigation, route }) => {
    const IsNew = route.params.isNew;
    const isEditable = route.params.isEdit
    const [id, setid] = useState(route.params.id)
    const [name, setName] = useState(IsNew ? '' : route.params.name)
    const [email, setEmail] = useState(IsNew ? '' : route.params.email)
    const [mobile, setmobile] = useState(IsNew ? '' : route.params.mobile)
    const [gender, setgender] = useState(IsNew ? null : route.params.gender)
    const [image, setimage] = useState('')
    const [isModalvisible, setisModalvisible] = useState(false)
    const [user, setuser] = useState([])
    const isoffline = route.params.isoffline
    const [error, seterror] = useState('')

    useEffect(() => {
        navigation.setOptions({ headerLeft: () => (<Icon name='chevron-left' size={40} color={colors.black} onPress={() => { navigation.goBack() }}></Icon>) })
        QueueEditUser()
        IsNew?setimage(''):getImage();
        IsNew && isoffline&&setid(Math.floor(Math.random() * 100) + 1);
    }, [])

    //To Check Any Offline queued EditAction is pending or not
    const QueueEditUser = async () => {
        let str = await AsyncStorage.getItem('editusers')
        console.log("from async", JSON.parse(str))
        if (JSON.parse(str) == null || JSON.parse(str) == '') {
            AsyncStorage.setItem('editusers', JSON.stringify([]))
            console.log('null value')
        }
        else {
            setuser(JSON.parse(str))
        }
    }
    //To get the image. It will set the image as null if no found in DB.
    const getImage = async () => {
        try {
            UseDB('ImageDatabase.realm')
            var image_details = await readDBPrimaryKey('user_image', id);
            if (image_details == null) {
                setimage('')
            }
            else {
                setimage(image_details.path)
            }

        } catch (error) { console.log(error) }
    }

    async function saveImage(id, response) {
        try {
            await writeDB('user_image', {
                id: id,
                path: response.assets[0].uri,
            });
            Toast.show('Image Saved', Toast.SHORT);
            setisModalvisible(!isModalvisible)
            getImage()
        } catch (error) { console.log(error); }

    }
    async function updateimage(id, response) {
        let image=await readDB('user_image');
        try {
            await deleteObj(image.filtered("id=" + id))
            await writeDB('user_image', {
                id: id,
                path: response.assets[0].uri,
            });
            setisModalvisible(!isModalvisible)
            getImage();
        } catch (error) { console.log(error); }
    }

    // This is to choose the image to pick from i.e gallary or camera
    const chooseFile = (type) => {
        let options = {
            mediaType: type,
            maxWidth: 300,
            maxHeight: 550,
            quality: 1,
        };
        requestExternalWritePermission()
        launchImageLibrary(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
                setisModalvisible(!isModalvisible)
                return;
            } else if (response.errorCode == 'permission') {
                setisModalvisible(!isModalvisible)
                console.log('Permission not satisfied');
                return;
            } else if (response.errorCode == 'others') {
                console.log(response.errorMessage);
                setisModalvisible(!isModalvisible)
                return;
            }

            if (image == '') {
                saveImage(id, response)

            } else {
                updateimage(id, response)

            }


        });
    };
    const captureImage = async (type) => {
        let options = {
            mediaType: type,
            maxWidth: 300,
            maxHeight: 550,
            quality: 1,
            videoQuality: 'low',
            durationLimit: 30, //Video max duration in seconds
            saveToPhotos: true,
        };
         requestCameraPermission();
         requestExternalWritePermission();
        
            launchCamera(options, (response) => {
                console.log('Response = ', response);

                if (response.didCancel) {
                    console.log('User cancelled camera picker');
                    setisModalvisible(!isModalvisible)
                    return;
                } else if (response.errorCode == 'camera_unavailable') {
                    console.log('Camera not available on device');
                    setisModalvisible(!isModalvisible)
                    return;
                } else if (response.errorCode == 'permission') {
                    console.log('Permission not satisfied');
                    setisModalvisible(!isModalvisible)
                    return;
                } else if (response.errorCode == 'others') {
                    console.log(response.errorMessage);
                    setisModalvisible(!isModalvisible)
                    return;
                }
                if (image == '') {
                    saveImage(id, response)

                } else {
                    updateimage(id, response)

                }

            });
        
    };
    //Android-Camera permission
    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs camera permission',
                    },
                );
                // If CAMERA Permission is granted
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        } else return true;
    };
    const requestExternalWritePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'External Storage Write Permission',
                        message: 'App needs write permission',
                    },
                );
                // If WRITE_EXTERNAL_STORAGE Permission is granted
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
            }
            return false;
        } else return true;
    };

    //Input Validation
    const validateUserData = () => {
        setTimeout(() => {
            seterror('')
        }, 2500)

        if (CheckNull(name) || CheckNull(email) || CheckNull(mobile) || CheckNull(gender)) {
            seterror(Strings.ALL_REQUIRE)
        }
        else if (validateEmailMobile(email, mobile)) {
            seterror(validateEmailMobile(email, mobile))
        }
        else {
            let userdetails = {
                "id": id,
                "name": name,
                "email": email,
                "mobile": mobile,
                "gender": gender
            }
            if (user == null) {
                setuser(usr => [...usr, userdetails])
            }
            else {
                user.push(userdetails)
            }
            editTheUser()

        }
    }
    //Edit user Request Function
    const editTheUser = async () => {
        UseDB('LocaluserDatabase.realm')
        let data = await readDB('local_db')
        if (IsNew == false) {
            if (isoffline == true) {
                if (await data.filtered("id=" + id).length > 0) {
                    await deleteObj(data.filtered("id=" + id))
                    await writeDB('local_db', {
                        id: id,
                        name: name,
                        email: email,
                        mobile: mobile,
                        gender: gender,
                        createdAt: 'null',
                        updatedAt: 'null'
                    });
                }
                UseDB('ImageDatabase.realm')
                AsyncStorage.setItem('editusers', JSON.stringify(user))
                console.log('after', user)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tab' }
                    ],
                })

            }
            else {
                const response = await PostCalls({
                    "id": id,
                    "name": name,
                    "email": email,
                    "mobile": mobile,
                    "gender": gender
                }, BASE_URL + UPDATE_USER)
                console.log(response)
                if (response.status === 200) {
                    deleteObj(data.filtered("id=" + id))
                    UseDB('ImageDatabase.realm')
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Tab' }],
                    })
                    Toast.show('User updated !', Toast.SHORT);
                }
                else {
                    Toast.show('User Not updated !', Toast.SHORT);
                }
            }
        }
        else if (IsNew == true) {

            if (isoffline == true) {
                AsyncStorage.setItem('users', JSON.stringify(user))
                await writeDB('local_db', {
                    id: id,
                    name: name,
                    email: email,
                    mobile: mobile,
                    gender: gender,
                    createdAt: "null",
                    updatedAt: "null"
                })
                UseDB('ImageDatabase.realm')
                console.log('after', user)
                Toast.show("User Added..", Toast.SHORT)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Tab' }
                    ],
                })
            }
            else {
                const response = await PostCalls({
                    "name": name,
                    "email": email,
                    "mobile": mobile,
                    "gender": gender
                }, BASE_URL + ADD_USER)
                if (response.status === 200) {
                    Toast.show("User Added..", Toast.SHORT)
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Tab' }
                        ],
                    })
                }
                else {
                    Toast.show('Error', Toast.SHORT)
                }
            }
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
                <Text style={styles.header}>{IsNew ? 'Add User' : isEditable ? 'Update-User' : 'Profile'}</Text>
                <View style={styles.formwrap}>

                    <View style={{ alignSelf: 'flex-start' }}>
                        <Text style={styles.uid}> USER ID: {id}</Text>
                    </View>
                    {isEditable && !IsNew ?
                        <TouchableOpacity onPress={() => setisModalvisible(!isModalvisible)}>
                            <Image source={image === '' ? require('../assets/usr.png') : { uri: image }} style={CommonStyles.avatar} />
                        </TouchableOpacity>
                        :
                        <Image source={image === '' ? require('../assets/usr.png') : { uri: image }} style={CommonStyles.avatar} />}
                    <Modal
                        animationType={"slide"}
                        transparent={true}
                        visible={isModalvisible}
                        onRequestClose={() => setisModalvisible(!isModalvisible)}
                    >

                        <View style={styles.imagemodal}>
                            <View style={styles.imagemodaloption}>
                                <TouchableOpacity onPress={() => { captureImage('photo') }}>
                                    <Icon name='camera' size={30} color={colors.black} style={{ paddingLeft: 7 }}></Icon>
                                    <Text>camera</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.imagemodaloption, marginLeft = 70]}>
                                <TouchableOpacity onPress={() => { chooseFile('photo') }}>
                                    <Icon name='image-album' size={30} color={colors.black} style={{ paddingLeft: 7 }}></Icon>
                                    <Text>Gallary</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </Modal>

                    <Text style={CommonStyles.errtxt}>{error}</Text>
                    <Text style={styles.txt}>Name:</Text>
                    <TxtInput
                        maxLength={30}
                        value={name}
                        placeholder={Strings.TXT_ENTER_VALUE}
                        onchangeText={(txt) => {
                            setName(txt.replace(Strings.ONLY_TEXT_REGEX, ''))
                            onChange(txt, Strings.ONLY_TEXT_REGEX, Strings.VALID_NAME)
                        }}
                        style={CommonStyles.inputText(isEditable)}
                        editable={isEditable}
                    />

                    <Text style={styles.txt}>Email:</Text>
                    <TxtInput
                        value={email}
                        placeholder={isEditable ? Strings.TXT_ENTER_VALUE : 'Input Disabled'}
                        onchangeText={(txt) => {
                            setEmail(txt)
                            !validateReg(txt, Strings.EMAIL_REGEX) ? seterror(Strings.VALID_EMAIL) : seterror('')
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
                    <Text style={styles.txt}>Gender:</Text>
                    <View style={styles.genderView}>
                        <RadioButton
                            value="first"
                            status={gender === 0 ? 'checked' : 'unchecked'}
                            onPress={() => { setgender(0) }}
                            disabled={!isEditable}
                        /><Text style={{ paddingTop: 7, color: colors.black }}>Male</Text>
                        <RadioButton
                            value="second"
                            status={gender === 1 ? 'checked' : 'unchecked'}
                            onPress={() => { (setgender(1)) }}
                            disabled={!isEditable}
                        /><Text style={{ paddingTop: 7, color: colors.black }}>Female</Text>
                    </View>
                    {isEditable ? <Button Title={'Save'} onPress={validateUserData} /> : null}
                </View>


            </ScrollView>
        </SafeAreaView>

    )
}
export default EditUser

const styles = StyleSheet.create({
    formwrap: {
        backgroundColor: colors.FORM_CONTAINER,
        borderRadius: 20,
        padding: 30,
        margin: 15,
        paddingVertical:30
    },
    txt: {
        fontSize: 14, paddingTop: 10, color: colors.black,

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
    imagemodal: {
        flexDirection: 'row',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 40,
        flex: 1,
        backgroundColor: colors.transparent,
        width:'100%',
        alignItems: 'center',
        bottom: 0,
        position: 'absolute'
    },
    imagemodaloption: {
        justifyContent: 'center',
        flex: 1,
        marginLeft: 50
    },
    genderView: {
        paddingLeft: 10,
        marginBottom: 5,
        marginTop: 5,
        height: 40,
        width: 300,
        flexDirection: 'row'
    },
})











