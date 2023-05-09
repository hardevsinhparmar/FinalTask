import { StyleSheet } from 'react-native'
import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import HomeScreen from '../../screens/HomeScreen';
import Setting from '../../screens/Setting';


const drawer = createDrawerNavigator();


const DrawerNavigator = () => {
  return (
    <drawer.Navigator initialRouteName='Dash' screenOptions={{ drawerStyle: { backgroundColor: '#2C3333' }, drawerActiveTintColor: 'white', drawerInactiveTintColor: 'white' }} >
      <drawer.Screen name='Dash' component={HomeScreen} options={{ title: 'Dashboard', drawerIcon: () => (<Icon name="home" size={24} color={'white'} />) }} />
      <drawer.Screen name="Setting" component={Setting} options={{ drawerIcon: () => (<Icon name="cog" size={24} color={'white'} />) }} />

    </drawer.Navigator>
  )
}

export default DrawerNavigator

const styles = StyleSheet.create({})