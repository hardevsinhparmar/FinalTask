import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from './Colors'

const Button = ({ Title, style, onPress }) => {
  return (
    <>
      <TouchableOpacity style={[styles.buttonview, style]} onPress={onPress}>
        <Text style={styles.buttonText} >{Title}</Text>
      </TouchableOpacity>
    </>
  )
}

export default Button

const styles = StyleSheet.create({
  buttonview: {
    backgroundColor: colors.BTNBLUE,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
  },
})