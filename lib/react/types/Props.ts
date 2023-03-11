import type { NativeStackScreenProps } from "@react-navigation/native-stack"

type RootStackParamList = {
  Dashboard: undefined
  Connect: undefined
}

type Props<Screen extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, Screen>

export default Props