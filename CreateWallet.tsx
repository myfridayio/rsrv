import * as React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, TouchableOpacity, Clipboard } from "react-native";
import { Keypair } from '@solana/web3.js';
import {
  generateMnemonic,
} from "@dreson4/react-native-quick-bip39";
import * as Bip39 from 'bip39'

export default function CreateWallet({navigation}) {
    const [walletCreated, setWalletCreated] = React.useState(false)
    const [mnemonics, setmnemonics] = React.useState("")
    const [walletAddress, setWalletAddress] = React.useState("")

    function showCodes() {
        if(walletCreated) {
            const codes = mnemonics.split(" ")
            return(
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginBottom: 20, marginHorizontal: 60, paddingVertical: 40 }}>
                <View style={{ flexDirection: 'column'}}>
                <View style={{ flexDirection: 'row', marginBottom: 20}}>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 20}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[0]}</Text>
                    </View>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[1]}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 20}}>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 20}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[2]}</Text>
                    </View>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[3]}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 20}}>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 20}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[4]}</Text>
                    </View>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[5]}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 20}}>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 20}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[6]}</Text>
                    </View>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[7]}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 20}}>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 20}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[8]}</Text>
                    </View>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[9]}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 20}}>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginRight: 20}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[10]}</Text>
                    </View>
                    <View style={{ backgroundColor: 'white', width: 100, height: 30, justifyContent: 'center', alignItems: 'center', borderRadius: 10}}>
                        <Text style={{color: 'black', fontWeight: 'bold'}}>{codes[11]}</Text>
                    </View>
                </View>
                <TouchableOpacity style={{ height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 25, marginTop: 20 }} onPress={() => Clipboard.setString(mnemonics)}>
                    <Text style={{ fontSize:15, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Copy</Text>
                </TouchableOpacity>
                </View>
            </View>
            )
        }
        return null
    }

    React.useEffect(() => {
        const tempMnemonics = generateMnemonic(128)
        setmnemonics(tempMnemonics)
        setWalletCreated(true)
        const seed = Bip39.mnemonicToSeedSync(tempMnemonics).slice(0, 32);
        const keyPair = Keypair.fromSeed(seed);
        const walletAddress = keyPair.publicKey.toBase58()
        console.log('new wallet address - '+walletAddress)
        storeWalletAddress(walletAddress)
        setWalletAddress(walletAddress)
      }, []);

     function showWalletPublicAddress() {
        if(walletCreated) {
            navigation.navigate('WalletAddress', {
                walletAddress: walletAddress
            })
        }
    }

    async function storeWalletAddress(address: string) {
        try {
            await AsyncStorage.setItem(
              '@MyWalletAddress:key',
              address,
            );
          } catch (error) {
            // Error saving data
          }
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Image
                style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                resizeMode='stretch'
                source={require('./images/friday_logo.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                {showCodes()}
                <Text style={{fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: '#ef390f', textAlign:'center', fontSize: 20, marginHorizontal: 40, marginBottom: 30 }}>{walletCreated ? "Copy code and save at a secure location. This 12 word password is your only way to access your wallet." : ""}</Text>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={showWalletPublicAddress}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Next</Text>
                </TouchableOpacity>
            </View>
      </View>
    );
  }
