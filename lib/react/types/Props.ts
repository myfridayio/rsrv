import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { ScoringResponse } from "../../types/Scores"

type RootStackParamList = {
  Dashboard: undefined
  Connect: undefined
  NFTs: undefined
  Score: { response: ScoringResponse }
}


type Props<Screen extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, Screen>

export default Props