import Login from '../screens/Login'
import Register from '../screens/Register'
import { React, useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabNavigator from './Tab/TabNav'
import EditUser from '../screens/EditUser'

const MainStack = () => {
  const [isLoggedinn, setisLogged] = useState('')
  //For checking user is logged in or not 
  useEffect(() => {
    const retdata = async () => {
      try {
        const data = await AsyncStorage.getItem('isLoggedin')
        console.log('User LoggedIn ? =>', JSON.parse(data))
        setisLogged(JSON.parse(data))
      } catch (error) {
        console.log("got error while login state check", error)
      }
    }
    retdata();
  }, [])

  const initialRouteName = isLoggedinn ? 'Tab' : 'Login'
  const stack = createNativeStackNavigator()

  return (
    <>
      <NavigationContainer>
        <stack.Navigator initialRouteName={initialRouteName}>
          <stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <stack.Screen name="Tab" component={TabNavigator} options={{ headerShown: false }} />
          <stack.Screen name="Register" component={Register} options={{ headerStyle: { backgroundColor: '#2C3333' }, headerTintColor: 'white' }} />
          <stack.Screen name="Edit" component={EditUser} options={{ title: '' }} />



        </stack.Navigator>
      </NavigationContainer>
    </>
  )
}

export default MainStack