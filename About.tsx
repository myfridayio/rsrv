import * as React from "react";
import { View, Text, Button, Image } from "react-native";

export default function AboutScreen({navigation}) {
    return (
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: '100%', height: '100%'}}
                resizeMode='stretch'
                source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 20}}>
                <Button
                    onPress={() => navigation.navigate('CreateWallet')}
                    title="New Here!! Create a Wallet"
                    color="black"       
                />
            </View>
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 70}}>
                <Button
                    onPress={() => navigation.navigate('About')}
                    title="Already have a wallet to import"
                    color="black"       
                />
            </View>
      </View>
    );
  }