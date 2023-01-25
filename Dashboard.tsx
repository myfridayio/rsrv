import * as React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

export default function Dashboard({navigation}) {

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Image
                style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                resizeMode='stretch'
                source={require('./images/friday_logo.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', marginBottom: 150, marginHorizontal: 60, paddingVertical: 40 }}>
                    <TouchableOpacity style={{ width: 100, height: 100, marginBottom: 40}} onPress={() => navigation.navigate('TwitterConnect')}>
                        <Image
                            style={{ width: 100, height: 100}}
                            resizeMode='stretch'
                            source={require('./images/twitter_logo.png')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 100, height: 100 }} onPress={() => navigation.navigate('NetflixConnect')}>
                        <Image
                            style={{ width: 100, height: 100 }}
                            resizeMode='stretch'
                            source={require('./images/netflix_icon.png')}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={() => navigation.navigate('NFTGallery')}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>View my NFTs</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }