import * as React from "react"
import { View, Text, Button, Image, TouchableOpacity } from "react-native"
import { FakeNav } from "./Types"
import { generateMnemonic } from "@dreson4/react-native-quick-bip39"
import * as Bip39 from 'bip39'
import { Keypair, PublicKey } from '@solana/web3.js'
import Wallet from "./Wallet"
import Biometrics from 'react-native-biometrics'
import * as Keychain from 'react-native-keychain'

interface Props {
    navigation: FakeNav
}

export default function HomeScreen({ navigation }: Props) {
    const generateKey = async () => {
        const tempMnemonics = generateMnemonic(128)
        const seed = Bip39.mnemonicToSeedSync(tempMnemonics).slice(0, 32)
        const keypair = Keypair.fromSeed(seed)
        const publicKey = keypair.publicKey.toBase58()
        const privateKey = JSON.stringify(keypair.secretKey)
        Keychain.setGenericPassword(publicKey, privateKey)
        await Wallet.store(new PublicKey(publicKey))
    }

    const createWallet = async () => {
        const biometrics = new Biometrics()
        biometrics.simplePrompt({promptMessage: 'Confirm fingerprint'})
        .then(async ( { success }: { success: boolean}) => {
            if (success) {
                console.log('successful biometrics provided')
                await generateKey()
                navigation.navigate('Dashboard')
            } else {
                console.log('user cancelled biometric prompt')
            }
        })
/*
        */
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#ef390f" }}>
            <View style={{ flex: 1, position: 'absolute', width: '100%', marginTop: 100, alignItems: 'center' }}>
                <Image
                    style={{ width: 80, height: 80, borderWidth: 1, borderColor: 'white' }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
                <Text style={{ marginTop: 100, fontSize: 50, alignContent: 'center', marginHorizontal: 50, textAlign: 'center', fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: 'white' }}>GET PAID FOR YOUR DATA</Text>
            </View>
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25 }} onPress={createWallet}>
                    <Text style={{ fontSize:15, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: '#ef390f', fontWeight: 'bold' }}>Create Wallet</Text>
                </TouchableOpacity>
            </View>
      </View>
    );
  }