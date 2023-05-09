import { StyleSheet } from "react-native";

export const CommonStyles = StyleSheet.create({
  errtxt: {
    fontSize: 15,
    color: 'red',
    alignSelf: 'center',

  },
  
  synologo: {
    resizeMode: 'contain',
    paddingVertical:'25%',
    alignSelf: 'center'
},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center'
  },
  scrlview: {
    backgroundColor: "#2C3333",
    height: '100%'
  },
  inputText: Edit => ({
    color: 'black',
    borderColor: Edit ?
      'black' : 'white',
    backgroundColor: Edit ?
      'white' : '#d8d8d8',
    width: '100%'
  })
})