import 'react-native-gesture-handler';
import { Alert } from 'react-native';
import MainStack from './src/Navigation/MainStack'
import messaging from '@react-native-firebase/messaging'
import { useEffect } from 'react';
import {PermissionsAndroid} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
const App = () => {
  useEffect(()=>{
    SplashScreen.hide()
    getDeviceToken()
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
    });
  },[])
  const getDeviceToken=async()=>{
    let token= await messaging().getToken();
    console.log(token)
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);
  return (

    <MainStack />
  
  )
}

export default App
