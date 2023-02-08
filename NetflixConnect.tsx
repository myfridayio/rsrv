import * as React from "react"
import { View, Image, Text, KeyboardAvoidingView } from "react-native"
import { WebView } from 'react-native-webview'
import { FakeNav } from "./Types"
import AsyncStorage from '@react-native-async-storage/async-storage'

const INFO_URL = 'https://www.netflix.com/account/getmyinfo'
const LOGIN_URL = 'https://www.netflix.com/login'
const LOGIN_URL_HTTP = 'http://www.netflix.com/login'
const SIGNOUT_URL = 'https://www.netflix.com/SignOut'
const LOGOUT_URL = 'https://www.netflix.com/logout'

export default function NetflixConnectScreen({ navigation }:  { navigation: FakeNav }) {
    const ref = React.useRef<WebView>(null)

    const checkIfLoggedIn = (navState: {url: string}) => {

        if (navState.url === INFO_URL) {
            console.log('we did it yay')
            AsyncStorage.setItem('@Friday:netflix:date', new Date().toISOString())
            .then(navigation.goBack)
        } else if (navState.url === `${LOGIN_URL}?nextpage=https%3A%2F%2Fwww.netflix.com%2Faccount%2Fgetmyinfo`) {
            // console.log('at login prompt as expected')
        } else {
            console.log('url', navState.url, typeof navState.url)
        }
        // console.log(navState)
        // console.log(ref)
    }

    const shouldLoad = ({ url }: { url: string }) => {
        if ( url === INFO_URL || url.toLowerCase().startsWith(LOGIN_URL) || url.toLowerCase().startsWith(LOGIN_URL_HTTP)) {
            // console.log('cool')
            return true
        } else if (url.startsWith(LOGOUT_URL) || url.startsWith(SIGNOUT_URL)) {
            return true
        } else {
            console.log('uncool')
            console.log(url)
            return false
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
                <Text style={{ marginTop: 30, fontSize: 60, marginLeft: 40, fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: '#ef390f' }}>CONNECT YOUR NETFLIX ACCOUNT</Text>
                <WebView
                    ref={ref}
                    source={{ uri: INFO_URL }}
                    style={{ marginTop: 20, width: '100%', height: 400 }}
                    injectedJavaScript="/*setTimeout(function() { alert('hi'); }, 200)*/"
                    onNavigationStateChange={checkIfLoggedIn}
                    onShouldStartLoadWithRequest={shouldLoad}
                />
            </View>
        </KeyboardAvoidingView>
    );
  }