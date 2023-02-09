import * as React from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, FlatList, ScrollView } from "react-native"
import { FakeNav } from "./Types"
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons"
import { faCheckDouble } from "@fortawesome/free-solid-svg-icons"
import { Button } from './views'
import AsyncStorage from "@react-native-async-storage/async-storage"
import _ from 'underscore'
import Wallet from "./Wallet"
import { sleep, commafy } from "./lib/util"
import loadResource from './lib/util/local'
import { parse } from 'csv-parse'
import Colors from './lib/ui/color'
import { AnyThunk } from "./lib/util/f"

import netflixCsv from './assets/netflix-hue.csv'
import { faToiletPaperSlash } from "@fortawesome/free-solid-svg-icons"
import { FindAllSupportsOnlyThreeFiltersMaxError } from "@metaplex-foundation/js"

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
    const [twitterHandle, setTwitterHandle] = React.useState<string | null>(null)
    const [csvEntries, setCsvEntries] = React.useState<NFLXRecord[]>([])
    const [devices, setDevices] = React.useState<string[]>([])
    const [profiles, setProfiles] = React.useState<string[]>([])
    const [titleCount, setTitleCount] = React.useState(0)
    const [recordCount, setRecordCount] = React.useState(0)
    const [showNetflix, setShowNetflix] = React.useState(false)

    const [doing, setDoing] = React.useState<string[]>([])
    const [done, setDone] = React.useState<{task: string, succeeded: boolean}[]>([])

    const startDoing = (task: string) => {
        setDoing(doing => doing.concat([task]))
    }

    const stopDoing = (task: string) => {
        setDoing(doing => doing.filter(t => t !== task))
    }

    const completeDoing = (task: string, completedName?: string) => {
        stopDoing(task)
        const after = completedName || task
        setDone(done => done.concat([{ task: after, succeeded: true }]))
    }

    const errorDoing = (task: string) => {
        stopDoing(task)
        setDone(done => done.concat([{ task, succeeded: false }]))
    }

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
        startDoing('Checking eligibility')

        const doSuccessfully = async (task: string, ms: number) => {
            startDoing(task)
            await sleep(ms)
            completeDoing(task)
        }

        try {
            const followingJson = await AsyncStorage.getItem('@Friday:twitter:following')
            if (!followingJson) {
                return errorDoing('Error: Missing twitter data')
            }

            const wallet = await Wallet.shared()
            const following = JSON.parse(followingJson) as string[]

            if (_.every(TEAM_TWITTER_ACCOUNTS, handle => following.includes(handle))) {

                await AsyncStorage.setItem('@Friday:mercedes:eligible', new Date().toISOString())

                completeDoing('Twitter connected')
                await sleep(500)
                completeDoing('Twitter NFT earned')
                await sleep(250)
                startDoing('Issuing Twitter NFT')
                const twitterIssue = wallet.grantTwitter()
                .then(() => {
                    completeDoing('Issuing Twitter NFT', 'Issued Twitter NFT')
                })

                const mercedesIssue = doSuccessfully(TEAM_TWITTER_ACCOUNTS[0], 3000)
                .then(() => doSuccessfully(TEAM_TWITTER_ACCOUNTS[1], 3000))
                .then(() => doSuccessfully(TEAM_TWITTER_ACCOUNTS[2], 3000))
                .then(() => doSuccessfully(`Watched "Drive to Survive"`, 3000))
                .then(() => completeDoing('Checking eligibility', 'Checked eligibility'))
                .then(() => startDoing('Issuing Mercedes F1 Fan NFT'))
                .then(() => wallet.grantMercedes())
                .then(() => {
                    completeDoing('Issuing Mercedes F1 Fan NFT', 'Issued Mercedes F1 Fan NFT')
                })

                await Promise.all([sleep(2000), twitterIssue, mercedesIssue]).then(() => sleep(2000))
                navigation.goBack()

            } else {
                await AsyncStorage.setItem('@Friday:mercedes:ineligible', new Date().toISOString())

                completeDoing('Twitter connected')
                await sleep(500)
                completeDoing('Twitter NFT earned')
                await sleep(250)
                startDoing('Issuing Twitter NFT')
                const twitterIssue = wallet.grantTwitter()
                .then(() => {
                    completeDoing('Issuing Twitter NFT', 'Issued Twitter NFT')
                })
                
                errorDoing('Ineligible for Mercedes NFT')

                await Promise.all([sleep(2000), twitterIssue]).then(() => sleep(2000))
                navigation.goBack()
            }
        } catch (e) {
            console.error(e)
            errorDoing('Processing error')
        }
    }

    React.useEffect(() => {
        checkConnected()
        loadNetflixCsv().then(parseCsv).then(setCsvEntries)
        return navigation.addListener('focus', checkConnected)
    }, [])

    const ActivityCenter = () => {
        if (true) {
            return null
        }
        return (
            <View style={styles.taskList}>
                {done.map((task: string) => (
                <View style={styles.taskEntry}>
                    <Text><FontAwesomeIcon icon={faCheck}/> <Text style={[styles.task, styles.taskDone]}>{task}</Text></Text>
                </View>
                ))}
                {doing.map((task: string) =>
                (
                    <View style={styles.taskEntry}>
                        <ActivityIndicator size="small" color={Colors.red}/><Text style={[styles.task, styles.taskActive]}> {doing}</Text>
                    </View>
                ))}
            </View>
        )
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
            <Connectable
                name={twitterHandle ? `@${twitterHandle}` : "Twitter"}
                isConnected={isTwitterConnected}
                onPress={() => navigation.navigate('TwitterConnect')}
                buttonColor='#50A8EF'
                icon={<Image style={{ width: 30, height: 30 }} resizeMode='stretch' source={require('./images/twitter_logo.png')}/>}
            />
            <Connectable
                name={"Netflix"}
                isConnected={isNetflixConnected}
                canDisplay
                isDisplaying={showNetflix}
                display={setShowNetflix}
                onPress={() => navigation.navigate('NetflixConnect')}
                buttonColor='#000'
                icon={<Image style={{ width: 30, height: 30 }} resizeMode='stretch' source={require('./images/netflix_icon.png')}/>}
            />
            <View style={styles.buttonContainer}>
                <Button icon={<FontAwesomeIcon icon={faCheckDouble} color="white"/>} disabled={!isNetflixConnected || !isTwitterConnected} onPress={checkEligibility}>Check Eligibility</Button>
            </View>
            <View style={{ marginTop: 30 }}>
                <ActivityCenter/>
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

interface ConnectableProps {
    name: string,
    isConnected: boolean,
    canDisplay?: boolean,
    isDisplaying?: boolean,
    display?: (should: boolean) => void,
    onPress: AnyThunk,
    icon: React.ReactNode,
    buttonColor: string,
}

const Connectable = ({ name, isConnected, canDisplay, isDisplaying, display, onPress, icon, buttonColor } : ConnectableProps) => {
    return (
        <View style={styles.buttonContainer}>
        { isConnected ?
        <View>
            <Text style={{ color: 'black', fontSize: 16 }}>
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 8, paddingRight: 10 }}/>
                <Text> {name} Connected </Text>
                {canDisplay &&
                    <Button onPress={() => display!(!isDisplaying)} small backgroundColor='#888'>
                        <FontAwesomeIcon icon={isDisplaying ? faEyeSlash : faEye} color="white"/>
                    </Button>
                }
            </Text>
        </View>
        :
        <Button style={{ backgroundColor: buttonColor }} onPress={onPress} icon={icon} title={`Connect ${name}`}/>}
    </View>
    )
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
                at <Text style={styles.deviceType}>{item.country} </Text>
            </Text>
        </View>
    )
  }

  const styles = StyleSheet.create({
    task: {
        fontSize: 18,
        fontWeight: '500',
    },

    taskEntry: {
        padding: 8,
    },

    taskList: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },

    taskDone: {
        color: '#333'
    },

    taskActive: {
        color: '#111'
    },

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