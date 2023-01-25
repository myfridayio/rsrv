import * as React from "react";
import { View, TouchableOpacity, Image, Text, KeyboardAvoidingView } from "react-native";
import { WebView } from 'react-native-webview';

export default function NetflixCOnnectScreen({navigation}) {

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
                    source={{ uri: 'https://www.netflix.com/account/getmyinfo' }}
                    style={{ marginTop: 20, width: '100%', height: 400 }}
                />
                <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                    <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }}>
                        <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Generate NFTs</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
  }