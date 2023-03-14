import * as React from "react";
import { View, Text, TouchableOpacity, Image, Clipboard } from "react-native";
import QRCode from 'react-native-qrcode-svg';

export default function WalletAddressScreen({route, navigation}) {

    function showQRCode() {
        return(
            <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', marginBottom: 100, marginHorizontal: 60, paddingVertical: 40 }}>
                <View style={{ flexDirection: 'column'}}>
                    <QRCode
                        size={200}
                        value={route.params.walletAddress}
                        logoSize={30}
                        logoMargin={2}
                        logoBorderRadius={10}
                        logo={{uri: 'https://static.wixstatic.com/media/3f1c05_4dd6905cee4148f6adf8f22d4ba791dc~mv2.jpg/v1/fill/w_78,h_78,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/3f1c05_4dd6905cee4148f6adf8f22d4ba791dc~mv2.jpg'}}
                    />
                    <TouchableOpacity style={{ height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: 25, marginTop: 20 }} onPress={() => Clipboard.setString(route.params.walletAddress)}>
                        <Text style={{ fontSize:15, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Copy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Image
                style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                resizeMode='stretch'
                source={require('./images/friday_logo.jpg')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                {showQRCode()}
                <Text style={{fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: '#ef390f', textAlign:'center', fontSize: 20, marginHorizontal: 40, marginBottom: 30 }}>This is your wallet public key</Text>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={() => navigation.navigate('Dashboard')}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }