import { Alert } from "react-native"

export function AlertBox(title, message, onpress) {

  Alert.alert(title, message, [
    {
      text: 'Cancel',
      onPress: () => null,
    },
    {
      text: 'YES', onPress: onpress
    },
  ])
}


