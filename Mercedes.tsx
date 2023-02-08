import * as React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { FakeNav } from "./Types";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { Button } from './views'
import AsyncStorage from "@react-native-async-storage/async-storage"
import _ from 'underscore'
import Wallet from "./Wallet";
import { walletAdapterIdentity } from "@metaplex-foundation/js";

const TEAM_TWITTER_ACCOUNTS = ['MercedesAMGF1', 'LewisHamilton', 'GeorgeRussell63']
const NETFLIX_TITLE = 'Drive to Survive'

interface Props {
    navigation: FakeNav
}

enum Eligibility {
    Unknown,
    Evaluating,
    Ineligible,
    Issuing,
    Issued,
    Error
}

export default function Mercedes({ navigation }: Props) {
    const [isTwitterConnected, setIsTwitterConnected] = React.useState(false)
    const [isNetflixConnected, setIsNetflixConnected] = React.useState(false)
    const [eligibility, setEligibility] = React.useState<Eligibility>(Eligibility.Unknown)
    const [twitterHandle, setTwitterHandle] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState("")


    const checkConnected = () => {
        AsyncStorage.getItem('@Friday:twitter:date')
        .then(dateConnected => setIsTwitterConnected(!!dateConnected))
        AsyncStorage.getItem('@Friday:netflix:date')
        .then(dateConnected => setIsNetflixConnected(!!dateConnected))
        AsyncStorage.getItem('@Friday:twitter:handle').then(setTwitterHandle)
    }

    const checkEligibility = async () => {
        const eligible = (eligibility: Eligibility, msg: string) => {
            setTimeout(() => {
                setEligibility(eligibility)
                setMessage(msg)
            }, 800)
        }

        try {
            const followingJson = await AsyncStorage.getItem('@Friday:twitter:following')
            if (!followingJson) {
                return eligible(Eligibility.Error, "Malformed data")
            }

            const wallet = await Wallet.shared()
            const following = JSON.parse(followingJson) as string[]

            if (_.every(TEAM_TWITTER_ACCOUNTS, handle => following.includes(handle))) {
                console.log('eligible')
                setEligibility(Eligibility.Issuing)
                setMessage('Generating Twitter NFT')
                await wallet.grantTwitter()
                setMessage('Twitter NFT Generated')
                setTimeout(() => setMessage('Generating Mercedes NFT'), 2000)
                await wallet.grantMercedes()
                setEligibility(Eligibility.Issued)

            } else {
                setMessage('Not eligible for Mercedes NFT')
                eligible(Eligibility.Ineligible, "Not eligible for Mercedes F1 Team Badge")
                setTimeout(() => setMessage('Generating Twitter NFT'), 2000)
                await wallet.grantTwitter()
                setMessage('Granted Twitter NFT')
            }
        } catch (e) {
            setTimeout(() => {
                setEligibility(Eligibility.Error)
                setMessage("Processing error")
            })
        }
    }

    React.useEffect(() => {
        checkConnected()
        return navigation.addListener('focus', checkConnected)
    }, [])

    React.useEffect(() => {
        if (isTwitterConnected && isNetflixConnected) {
            console.log('holy crap')
            setEligibility(Eligibility.Evaluating)
            setMessage("Checking eligibility")
            checkEligibility()
        }
    }, [isTwitterConnected, isNetflixConnected])

    const StatusBlock = () => {
        switch (eligibility) {
            case Eligibility.Unknown:
                return null
            case Eligibility.Evaluating:
            case Eligibility.Issuing:
                return (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#F4401F"/>
                        {!!message && <Text style={{ marginLeft: 30, fontSize: 18 }}>{message}</Text>}
                    </View>
                )
            case Eligibility.Ineligible:
                return (
                    <View>
                        <Text>INELIGIBLE {message}</Text>
                    </View>
                )
            default:
                return null
        }
    }

    return (
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', width: '100%', backgroundColor: 'white' }}>
            <View style={{ paddingLeft: 20, paddingTop: 40, width: '100%'}}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image
                        style={{ width: 60, height: 60 }}
                        resizeMode='stretch'
                        source={require('./images/friday_logo.png')}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Mercedes F1 Team Badge</Text>
            </View>
            <View style={{ marginBottom: 30 }}>
                <Image
                            style={{ width: 100, height: 100 }}
                            resizeMode='stretch'
                            source={require('./images/collection-mercedes.png')}
                        />
            </View>
            <View style={styles.buttonContainer}>
                {isTwitterConnected ?
                <View>
                    <Text style={{ color: 'black', fontSize: 16 }}><FontAwesomeIcon icon={faCheck}/> {twitterHandle ? `@${twitterHandle}` : 'Twitter Connected'}</Text>
                </View>
                :
                <Button style={{ backgroundColor: '#50A8EF'}} onPress={() => navigation.navigate('TwitterConnect')}
                    icon={<Image
                            style={{ width: 30, height: 30 }}
                            resizeMode='stretch'
                            source={require('./images/twitter_logo.png')}
                        />}>
                    Connect Twitter
                </Button>}
            </View>
            <View style={styles.buttonContainer}>
                { isNetflixConnected ?
                <View>
                <Text style={{ color: 'black', fontSize: 16 }}><FontAwesomeIcon icon={faCheck}/> Netflix Connected</Text>
                </View>
                :
                <Button style={{ backgroundColor: '#000'}} onPress={() => navigation.navigate('NetflixConnect')}
                    icon={<Image
                            style={{ width: 30, height: 30 }}
                            resizeMode='stretch'
                            source={require('./images/netflix_icon.png')}
                        />}>
                    Connect Netflix
                </Button>}
            </View>
            <View style={{ marginTop: 30 }}>
                <StatusBlock/>
            </View>
        </View>
    );
  }

  const styles = StyleSheet.create({
    titleContainer: {
        paddingVertical: 10,
        marginVertical: 30,
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        color: 'black',
    },

    buttonContainer: {
        paddingVertical: 10
    },
  })