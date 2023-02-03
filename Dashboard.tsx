import * as React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

export default function Dashboard({navigation}) {

    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', width: '100%', backgroundColor: 'white' }}>
            <View>
                <Image
                    style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
            </View>
            <View style={{ alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', bottom: 0, marginBottom: 30 }}>
                <TouchableOpacity style={{ marginBottom: 40}} onPress={() => navigation.navigate('TwitterConnect')}>
                    <Image
                        style={{ width: 200, height: 200 }}
                        resizeMode='stretch'
                        source={require('./images/collection-mercedes.png')}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{  }} onPress={() => navigation.navigate('NetflixConnect')}>
                    <Image
                        style={{ width: 100, height: 100 }}
                        resizeMode='stretch'
                        source={require('./images/netflix_icon.png')}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ marginBottom: 60 }}>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={() => navigation.navigate('NFTGallery')}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>View my NFTs</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  }