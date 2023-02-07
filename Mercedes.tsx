import * as React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FakeNav } from "./Types";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { Button } from './views'

interface Props {
    navigation: FakeNav
}

export default function Mercedes({ navigation }: Props) {

    return (
        <View style={{ flex: 1, flexDirection: 'column', width: '100%', backgroundColor: 'white' }}>
            <View>
                <Image
                    style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
            </View>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Mercedes F1 Fandom</Text>
            </View>
            <View style={{ alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', bottom: 0, marginBottom: 30 }}>
                <Button style={{ backgroundColor: '#50A8EF'}} onPress={() => navigation.navigate('TwitterConnect')}
                    icon={<Image
                            style={{ width: 30, height: 30 }}
                            resizeMode='stretch'
                            source={require('./images/twitter_logo.png')}
                        />}>
                    Connect Twitter
                </Button>
                <TouchableOpacity style={{ marginBottom: 40}} onPress={() => navigation.navigate('TwitterConnect')}>
                    <Image
                        style={{ width: 100, height: 100 }}
                        resizeMode='stretch'
                        source={require('./images/twitter_logo.png')}
                    />
                    <FontAwesomeIcon icon={ faCheck }/>
                </TouchableOpacity>
                <TouchableOpacity style={{  }} onPress={() => navigation.navigate('NetflixConnect')}>
                    <Image
                        style={{ width: 100, height: 100 }}
                        resizeMode='stretch'
                        source={require('./images/netflix_icon.png')}
                    />
                </TouchableOpacity>
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
    }
  })