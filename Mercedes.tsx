import * as React from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, FlatList, ScrollView } from "react-native"
import { FakeNav } from "./Types"
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons"
import { Button } from './views'
import AsyncStorage from "@react-native-async-storage/async-storage"
import _ from 'underscore'
import Wallet from "./Wallet"
import { sleep, commafy } from "./lib/util"
import loadResource from './lib/util/local'
import { parse } from 'csv-parse'
import Colors from './lib/ui/color'

import netflixCsv from './assets/netflix-hue.csv'
import { faToiletPaperSlash } from "@fortawesome/free-solid-svg-icons"

const loadNetflixCsv = async () => {
    return loadResource(netflixCsv)
}

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

interface NFLXRecord {
    title: string,
    duration: string,
    startTime: string,
    bookmark: string,
    deviceType: string,
    latestBookmark: string,
    profileName: string,
    supplementalVideoType: string,
    attributes: string,
    country: string,
}

const fixColumn = (c: string): string => {
    if (!c) {
        return c
    }
    const words = c.toLowerCase().split(/\s+/).map(s => s.trim()).filter(x => !!x)
    let ret = words[0]
    for (const word of words.slice(1)) {
        ret += word[0].toUpperCase() + word.slice(1)
    }
    return ret
}

const fixColumns = (header: string[]): string[] => {
    return header.map(fixColumn)
}

const parseCsv = async (csv: string): Promise<NFLXRecord[]> => {
    return new Promise<NFLXRecord[]>((resolve, reject) => {

        const records: NFLXRecord[] = []
        const parser = parse({ columns: fixColumns })
        let it = true
        parser.on('readable', () => {
            let record
            while ((record = parser.read()) !== null) {
                if (it) {
                    it = false
                    console.log("GOT ONE")
                    console.log(record)
                    console.log('----')
                }
                records.push(record as NFLXRecord)
            }
        })
        parser.on('error', reject)
        parser.on('end', () => {
            resolve(records)
        })
        parser.write(csv)
        parser.end()
    })

}

export default function Mercedes({ navigation }: Props) {
    const [isTwitterConnected, setIsTwitterConnected] = React.useState(false)
    const [isNetflixConnected, setIsNetflixConnected] = React.useState(false)
    const [eligibility, setEligibility] = React.useState<Eligibility>(Eligibility.Unknown)
    const [twitterHandle, setTwitterHandle] = React.useState<string | null>(null)
    const [message, setMessage] = React.useState("")
    const [csvEntries, setCsvEntries] = React.useState<NFLXRecord[]>([])
    const [devices, setDevices] = React.useState<string[]>([])
    const [profiles, setProfiles] = React.useState<string[]>([])
    const [titleCount, setTitleCount] = React.useState(0)
    const [recordCount, setRecordCount] = React.useState(0)
    const [showNetflix, setShowNetflix] = React.useState(false)

    React.useEffect(() => {
        const devices = new Set<string>()
        const profiles = new Set<string>()
        const titles = new Set<string>()
        csvEntries.forEach(entry => {
            devices.add(entry.deviceType)
            profiles.add(entry.profileName)
            titles.add(entry.title)
        })
        setDevices(Array.from(devices))
        setProfiles(Array.from(profiles))
        setTitleCount(titles.size)
        setRecordCount(csvEntries.length)
    }, [csvEntries])


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
                await AsyncStorage.setItem('@Friday:mercedes:eligible', new Date().toISOString())
                console.log('eligible')
                setEligibility(Eligibility.Issuing)
                setMessage('Generating Twitter NFT')
                await wallet.grantTwitter()
                setMessage('Twitter NFT Generated')
                await sleep(1000)
                setMessage('Generating Mercedes NFT')
                await wallet.grantMercedes()
                setEligibility(Eligibility.Issued)
                setMessage('Generated Mercedes NFT!')
                await sleep(2000)
                navigation.goBack()

            } else {
                await AsyncStorage.setItem('@Friday:mercedes:ineligible', new Date().toISOString())
                setMessage('Not eligible for Mercedes NFT')
                if (await wallet.getTwitter()) {
                    await sleep(800)
                    navigation.goBack()
                } else {
                    await sleep(2000)
                    setMessage('Generating Twitter NFT')
                    await wallet.grantTwitter()
                    setMessage('Granted Twitter NFT')
                    await sleep(500)
                    navigation.goBack()
                }
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
        loadNetflixCsv().then(parseCsv).then(setCsvEntries)
        return navigation.addListener('focus', checkConnected)
    }, [])

    React.useEffect(() => {
        if (isTwitterConnected && isNetflixConnected) {
            console.log('N+T connected')
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
                    <Text style={{ color: 'black', fontSize: 16 }}>
                        <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8, paddingRight: 10 }}/>
                        &nbsp;Netflix Connected&nbsp;
                        <Button onPress={() => setShowNetflix(!showNetflix)} small backgroundColor="#888"><FontAwesomeIcon icon={showNetflix ? faEyeSlash : faEye} color="white"/></Button>
                    </Text>
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
            {showNetflix && !!csvEntries && !!csvEntries.length &&
            <View>
                <Text>{commafy(recordCount)} records, {commafy(titleCount)} titles, {commafy(devices.length)} devices, {commafy(profiles.length)} profiles</Text>
                <FlatList
                    data={csvEntries}
                    initialNumToRender={40}
                    renderItem={renderLine}
                    keyExtractor={(item: NFLXRecord) => `${item.startTime}_${item.title}`}
                />
            </View>
            }
        </View>
    );
  }

  let lastLength = 0
  const renderLine = ({ item }: { item: NFLXRecord }) => {
    return (
        <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemText}>
                <Text>{item.startTime}</Text> for <Text>{item.duration}</Text> to <Text>{item.bookmark}</Text>
            </Text>
            <Text style={styles.itemText}>
                <Text style={styles.profileName}>{item.profileName} </Text>
                on <Text style={styles.deviceType}>{item.deviceType} </Text>
            </Text>
        </View>
    )
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

    item: {
        padding: 4
    },

    buttonContainer: {
        paddingVertical: 10
    },

    profileName: {
        fontWeight: '500'
    },

    itemText: {
        fontSize: 14,
        color: '#333',
    },

    deviceType: {
        fontWeight: '500'
    },

    itemTitle: {
        fontWeight: '500',
        fontSize: 14,
        color: Colors.red
    },
  })