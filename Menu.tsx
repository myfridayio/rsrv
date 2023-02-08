import AsyncStorage from "@react-native-async-storage/async-storage"
import * as React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import Wallet from './Wallet'
import { FakeNav } from "./Types"
import { StyleSheet } from 'react-native'
import { Button } from "./views"

const style = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        gap: 30,
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
            <View style={{ paddingLeft: 20, paddingTop: 40, width: '100%'}}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        style={{ width: 60, height: 60 }}
                        resizeMode='stretch'
                        source={require('./images/friday_logo.png')}
                    />
                </TouchableOpacity>
            </View>
            <Button style={{ marginHorizontal: 80, marginTop: 30 }} onPress={reset}>Reset App</Button>
        </View>
    )
}