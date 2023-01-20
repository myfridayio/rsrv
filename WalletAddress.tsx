import * as React from "react";
import { View, Text, Button, Image } from "react-native";
import QRCode from 'react-native-qrcode-svg';

export default function WalletAddressScreen({route, navigation}) {

    return (
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: '100%', height: '100%'}}
                resizeMode='stretch'
                source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 20}}>
                <Button
                    onPress={() => navigation.navigate('TwitterConnect')}
                    title="Get Tokens"
                    color="black"       
                />
            </View>
            <View style={{position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <QRCode
                size={200}
                value={route.params.walletAddress}
                logoSize={30}
                logoMargin={2}
                logoBorderRadius={10}
                logo={{uri: 'https://static.wixstatic.com/media/3f1c05_4dd6905cee4148f6adf8f22d4ba791dc~mv2.jpg/v1/fill/w_78,h_78,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/3f1c05_4dd6905cee4148f6adf8f22d4ba791dc~mv2.jpg'}}
            />
            </View>
      </View>
    );
  }