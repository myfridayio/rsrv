import * as React from "react"
import { View, TextInput, TouchableOpacity, Image, Text, KeyboardAvoidingView } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'
import Wallet from "./Wallet"
import { FakeNav } from "./Types"
import _ from "underscore"

const TOKEN = 'AAAAAAAAAAAAAAAAAAAAAA7TjwEAAAAAjQjSffSrlDSlMU2E8iVIbRzO2iw%3DrA7RWtjtutQYqwwMfQeXUQ2kPjRC4pZ0G4POVJnEMlHkceoaqj'

const LOCAL_BASE = 'http://10.0.2.2:3131/mint'
const TWITTER_BASE = 'https://api.twitter.com/2/'

const twitter = async (path: string) => {
    const url = new URL(path, TWITTER_BASE).toString()
    console.log(url)
    const config = { method: 'GET', headers: { 'Authorization': `Bearer ${TOKEN}` } }
    const response = await fetch(url, config)
    return response.json()
}

const generate = async (walletPK: string, type: string, person: string) => {
    await fetch(`${LOCAL_BASE}?ownerKey=${walletPK}&type=${type}&person=${person}`)
}

export default function TwitterConnectScreen({ navigation }: { navigation: FakeNav }) {

    const [centerText, setCenterText] = React.useState<string | null>(null)
    const [twitterHandle, setTwitterHandle] = React.useState<string | null>(null)
    const [twitterId, setTwitterId] = React.useState<string | null>(null)
    const [alreadyIssued, setAlreadyIssued] = React.useState<boolean | undefined>()
    const [password, setPassword] = React.useState<string | undefined>()

    React.useEffect(() => {
        AsyncStorage.getItem('@Friday:twitterIssued')
        .then(issued => setAlreadyIssued(!!issued))
    }, [])

    React.useEffect(() => {
        if (alreadyIssued) {
            navigation.goBack()
        }
    }, [alreadyIssued])

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
            const json = await twitter(`users/by/username/${username}`)

            const { data: { id } } = json

            if (id) {
                console.log('got twitter id', id)
                await AsyncStorage.setItem('@Friday:twitter:handle', username)
                await AsyncStorage.setItem('@Friday:twitter:id', id)
                setTwitterId(id)
                setCenterText('')
            } else {
                setCenterText(`Unable to find  ${username}`)
                console.log('unable to get twitter id', username)
            }
        } catch(error) {
            console.error(error)
            setCenterText('Error loading twitter info')
        }
    }

    const getFollowing = async (refresh = false) => {
        const saved = await AsyncStorage.getItem('@Friday:twitter:following')
        if (saved && !refresh) {
            return JSON.parse(saved)
        }

        const followingResponse = await twitter(`users/${twitterId}/following`)
        const following = followingResponse.data.map(({ username }: { username: string }) => username)
        await AsyncStorage.setItem('@Friday:twitter:following', JSON.stringify(following))
        await AsyncStorage.setItem('@Friday:twitter:date', new Date().toISOString())
        return following
    }

    const checkFollowing = async () => {
        console.log('checkFollowing')
        if (!twitterId) {
            console.log('no twitter id')
            return
        }

        const alreadyIssued = await AsyncStorage.getItem('@Friday:twitterIssued')
        if (alreadyIssued) {
            console.log('skipping mint already done')
            return
        }

        const following = await getFollowing()

        const person = twitterHandle!.includes('kiril') ? 'kiril' : 'hue' // LMFAO right?
        const walletPK = await (await Wallet.shared()).publicKey
        if (!walletPK) {
            setCenterText('Errore retrieving wallet public key')
            return
        }

        const teamMercedes = ['MercedesAMGF1', 'LewisHamilton', 'GeorgeRussell63']

        if (_.every(teamMercedes, (x) => following.includes(x))) {
            console.log('You are a true fan. You are entitled to get a twitter nft and a Mercedes NFT')
            setCenterText('Minting NFTs...')
            await generate(walletPK, 'twitter', person)
            await generate(walletPK, 'mercedes', person)
            await AsyncStorage.setItem('@Friday:twitterIssued', 'true')
            await AsyncStorage.setItem('@Friday:mercedesIssued', 'true')
            navigation.goBack()
        } else {
            console.log('you only get a twitter nft')
            setCenterText('Minting NFT...')
            await generate(walletPK, 'twitter', person)
            await AsyncStorage.setItem('@Friday:twitterIssued', 'true')
            navigation.goBack()
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
                <Text style={{ marginTop: 50, fontSize: 60, marginLeft: 40, marginBottom: 30, fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: '#ef390f' }}>Log into Twitter</Text>
                <TextInput
                        style={{height: 40, backgroundColor: '#f0f0f0', marginTop: 20, marginHorizontal: 40, color: "black"}}
                        autoCapitalize='none'
                        placeholderTextColor="#000000"
                        placeholder="e.g. '@jack' or 'jack'"
                        onChangeText={setTwitterHandle}
                    />
                <TextInput
                        style={{height: 40, backgroundColor: '#f0f0f0', marginTop: 20, marginHorizontal: 40, color: "black"}}
                        autoCapitalize='none'
                        placeholderTextColor="#000000"
                        placeholder="*******"
                        secureTextEntry={true}
                        onChangeText={setPassword}
                    />
                    
                <View style={{ width: '100%', justifyContent: 'center', bottom: 0, marginTop: 30}}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: '600', marginHorizontal: 30, marginBottom: 10 }}>{centerText}</Text>
                    <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={()=>getTwitterId()}>
                        <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Check Eligibility</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
  }
