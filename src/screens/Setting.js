import { StyleSheet, Text, View } from 'react-native'
import React,{useEffect} from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons' 
const Setting = ({navigation}) => {
  useEffect(()=>{
    navigation.setOptions({ headerLeft: () =>(<Icon name='chevron-left'  size={40} color={'black'} onPress={()=>{navigation.navigate('Dash')}}></Icon>) })
  })
  
  return (
    <View>
      <Text>Setting</Text>
    </View>
  )
}

export default Setting

const styles = StyleSheet.create({})