import * as React from "react";
import { View, Text, Button, Image, TouchableOpacity } from "react-native";
import { WebView } from 'react-native-webview';

export default function MoreTokensConnectScreen({navigation}) {
    const [showWebView, setShowWebView] = React.useState(false)

    function showNetflixWebView() {
        if(showWebView) {
            return (
                <WebView
                        source={{ uri: 'https://www.netflix.com/account/getmyinfo' }}
                        style={{ marginTop: 20, width: '100%', height: 400 }}
                    />
            )
        }
        return null
    }
    
    return (
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: '100%', height: '100%'}}
                resizeMode='stretch'
                source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', alignItems: 'center', top: 170, backgroundColor: 'transparent'}}>
                
                <TouchableOpacity onPress={() => setShowWebView(true)}>
                    <Image
                        style={{ width: 100, height: 100, backgroundColor: 'transparent'}}
                        resizeMode='stretch'
                        source={require('./images/netflix_icon.png')}
                    />
                </TouchableOpacity>
                <View style={{ marginTop: 20, width: '100%', height: 400 }}>
                    {showNetflixWebView()}
                </View>
                
            </View>
      </View>
    );
  }