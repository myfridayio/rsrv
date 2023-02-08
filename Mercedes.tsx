import * as React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FakeNav } from "./Types";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { Button } from './views'
import AsyncStorage from "@react-native-async-storage/async-storage"

const TWITTER_TEAM_ACCOUNTS = ['MercedesAMGF1', 'LewisHamilton', 'GeorgeRussell63']
const NETFLIX_TITLE = 'Drive to Survive'

interface Props {
    navigation: FakeNav
}

export default function Mercedes({ navigation }: Props) {
    const [isTwitterConnected, setIsTwitterConnected] = React.useState(false)
    const [isNetflixConnected, setIsNetflixConnected] = React.useState(false)


    const checkConnected = () => {
        AsyncStorage.getItem('@Friday:twitter:date')
        .then(dateConnected => setIsTwitterConnected(!!dateConnected))
        AsyncStorage.getItem('@Friday:netflix:date')
        .then(dateConnected => setIsNetflixConnected(!!dateConnected))
    }

    React.useEffect(() => {
        checkConnected()
        return navigation.addListener('focus', checkConnected)
    }, [])

    React.useEffect(() => {
        if (isTwitterConnected && isNetflixConnected) {
            console.log('holy crap')
        }
    }, [isTwitterConnected, isNetflixConnected])

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
                    <Text style={{ color: 'black', fontSize: 16 }}><FontAwesomeIcon icon={faCheck}/> Twitter Connected</Text>
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