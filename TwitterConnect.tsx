import * as React from "react"
import { View, TextInput, TouchableOpacity, Image, Text, KeyboardAvoidingView } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'

const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAA7TjwEAAAAAjQjSffSrlDSlMU2E8iVIbRzO2iw%3DrA7RWtjtutQYqwwMfQeXUQ2kPjRC4pZ0G4POVJnEMlHkceoaqj'

const LOCAL_BASE = 'http://10.0.2.2:3131/mint'

const twitter = async (url) => {
    const config = { method: 'GET', headers: { 'Authorization': `Bearer ${TOKEN}` } }
    const response = await fetch(url, config)
    return response.json()
}

const local = async (walletPK, type, person) => {
    await fetch(`${LOCAL_BASE}?ownerKey=${walletPK}&type=${type}&person=${person}`)
}

export default function TwitterConnectScreen({navigation}) {

    const [centerText, setCenterText] = React.useState(null)
    const [twitterHandle, setTwitterHandle] = React.useState(null)
    const [twitterId, setTwitterId] = React.useState(null)

    /*
    React.useEffect(() => {
        getTwitterId()
    }, [twitterHandle])
*/

    React.useEffect(() => {
        checkFollowing()
    }, [twitterId])

    const getTwitterId = async () => {
        if (!twitterHandle || !twitterHandle.trim()) {
            setCenterText('Invalid twitter handle')
            return
        }

        let username = twitterHandle.trim()
        if (username.startsWith('@')) {
            username = username.substring(1)
        }

        try {
            const json = await twitter(`https://api.twitter.com/2/users/by/username/${username}`)

            const { data: { id } } = json

            if (id) {
                console.log('got twitter id', id)
                setTwitterId(id)
                setCenterText('')
            } else {
                setCenterText(`Unable to find  ${username}`)
                console.log('unable to get twitter id', username)
            }
        } catch(error) {
            console.error(error)
        }
    }

    const checkFollowing = async () => {
        console.log('checkFollowing')
        if (!twitterId) {
            return
        }

        const alreadyIssued = await AsyncStorage.getItem('@Friday:twitterIssued')
        if (alreadyIssued) {
            console.log('skipping mint already done')
            return
        }

        const json = await twitter(`https://api.twitter.com/2/users/${twitterId}/following`)
        console.log(json)

        let list: string[] = [];
        json.data.forEach((element: { username: string; }) => {
            list.push(element.username);
            console.log(element.username)
        });

        const person = twitterHandle.includes('kiril') ? 'kiril' : 'hue' // LMFAO right?
        const walletPK = await AsyncStorage.getItem('@MyWalletAddress:key');

        if(list.includes('MercedesAMGF1') && list.includes('LewisHamilton') && list.includes('GeorgeRussell63')) {
            console.log('You are a true fan. You are entitled to get a twitter nft and a Mercedes NFT')
            await local(walletPK, 'twitter', person)
            await local(walletPK, 'mercedes', person)
            await AsyncStorage.setItem('@Friday:twitterIssued', 'both')
            setCenterText('You are a true fan. You are entitled to get a twitter NFT and a Mercedes NFT')
        } else {
            console.log('you only get a twitter nft')
            await local(walletPK, 'twitter', person)
            await AsyncStorage.setItem('@Friday:twitterIssued', 'justtwitter')
            setCenterText('You are only entitled to get a twitter NFT')
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <Image
                    style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
                <Text style={{ marginTop: 50, fontSize: 60, marginLeft: 40, fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: '#ef390f' }}>CONNECT YOUR TWITTER ACCOUNT</Text>
                <TextInput
                        style={{height: 40, backgroundColor: '#f0f0f0', marginTop: 50, marginHorizontal: 40, color: "black"}}
                        autoCapitalize='none'
                        placeholderTextColor="#000000"
                        placeholder="  Your Twitter handle name here"
                        onChangeText={setTwitterHandle}
                    />
                <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: '600', marginHorizontal: 30, marginBottom: 10 }}>{centerText}</Text>
                    <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={()=>getTwitterId()}>
                        <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Generate NFTs</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
  }
