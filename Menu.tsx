import AsyncStorage from "@react-native-async-storage/async-storage"
import * as React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import Wallet, { NftInfo } from './Wallet'
import { FakeNav } from "./Types"
import { StyleSheet } from 'react-native'
import { Button } from "./views"

const style = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white',
        padding: 40
    }
})

export default function Menu({ navigation }: { navigation: FakeNav }) {

    const reset = () => {
        AsyncStorage.removeItem('@Friday:twitterIssued')
        .then(() => Wallet.reset())
        .then(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            })
        })
    }

    return (
        <View style={style.container}>
            <Button onPress={reset}>Reset App</Button>
        </View>
    )
}