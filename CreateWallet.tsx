import * as React from "react";
import { View, Text, Button, Image, Clipboard } from "react-native";
import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
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
                <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
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
                <Button
                    onPress={() => Clipboard.setString(mnemonics)}
                    title="Copy"
                    color="black"       
                />
                </View>
            </View>
            )
        }
        return null
    }

     function createWallet() {
        console.log('before if')
        if(walletCreated) {
            navigation.navigate('WalletAddress', {
                walletAddress: walletAddress
            })
        } else {
            console.log('inside creating wallet')
            setmnemonics(generateMnemonic(128))
            setWalletCreated(true)
            const seed = Bip39.mnemonicToSeedSync(mnemonics).slice(0, 32);
            const keyPair = Keypair.fromSeed(seed);
            setWalletAddress(keyPair.publicKey.toBase58())
            console.log(mnemonics)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Image
                    style={{ width: '100%', height: '100%'}}
                    resizeMode='stretch'
                    source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 20}}>
                <Button
                    onPress={createWallet}
                    title={walletCreated ? "Next" : "Create a wallet"}
                    color="black"      
                />
            </View>
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 80}}>
            <Text style={{color: 'white', fontWeight: 'bold', textAlign:'center'}}>{walletCreated ? "Copy the codes and secure it somewhere. This is the only way to recover a wallet. Press Next after done." : ""}</Text>
            </View>
            {showCodes()}
      </View>
    );
  }