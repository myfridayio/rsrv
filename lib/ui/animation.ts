import { Animated, Easing } from 'react-native'

export const pulse = (value: Animated.Value, a: Animated.Value, b: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(
        value,
        {
          toValue: a,
          useNativeDriver: true,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        }
      ),
      Animated.timing(
        value,
        {
          toValue: b,
          useNativeDriver: true,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }
      )
    ])
  )
}