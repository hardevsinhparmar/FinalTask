import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DrawerNavigator from '../drawer/DrawerNav';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Profile from '../../screens/Profile';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const stack = createNativeStackNavigator()


const tab = createBottomTabNavigator()
const TabNavigator = ({ navigation }) => {
  return (
    <tab.Navigator screenOptions={{
      headerShown: false,
      tabBarShowLabel: false

    }}>
      <tab.Screen name="Drawer" component={DrawerNavigator} options={{ tabBarStyle: { height: 40 }, tabBarActiveBackgroundColor: '#2C3333', tabBarIcon: ({ focused }) => (<Icon name='home' size={30} color={focused ? 'white' : 'grey'} onPress={() => navigation.navigate('Dash')}></Icon>) }} />
      <tab.Screen name="Profile" component={Profile} options={{ tabBarStyle: { height: 40 }, headerShown: true, tabBarActiveBackgroundColor: '#2C3333', tabBarIcon: ({ focused }) => (<Icon name='account-circle' size={30} color={focused ? 'white' : 'grey'}></Icon>) }} />
    </tab.Navigator>

  )
}

export default TabNavigator