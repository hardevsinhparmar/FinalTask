import { StyleSheet, TextInput } from 'react-native'
import React from 'react'

const TxtInput = ({ placeholder, style, value, onchangeText, secureTextEntry, keyboardType, editable, maxLength }) => {
  return (
    <TextInput placeholder={placeholder}
      style={[styles.txtinput, style]}
      value={value}
      onChangeText={onchangeText}
      placeholderTextColor='black'
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      maxLength={maxLength}
      minl
    />
  )
}

export default TxtInput

const styles = StyleSheet.create({
  txtinput: {
    paddingLeft: 10,
    marginBottom: 5,
    marginTop: 5,
    paddingVertical:5,

    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,

  }
})