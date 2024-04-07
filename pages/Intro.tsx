import * as React from "react";
import { Image, StyleSheet, View, Text } from "react-native"
import LinearGradient from "react-native-linear-gradient";
import { Props } from "../lib/react/types";

export default function Intro({ navigation }: Props<'Intro'>) {

    React.useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Connect')
          }, 3000);
      }, []);

    return (
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }} end={{x: 1.2, y: 1.0}}
        locations={[ 0.0, 0.3, 0.65, 1.0 ]}
        colors={['#05D3D1', '#00B6C3', '#004C91', '#001840']}
        style={{ height: '100%', width: '100%' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%'}}>
            <Image style={{height: 200, width: 200}} source={require('../images/RSRV_logo_white.png')} />
            <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold'}}>NEVER TOUCH FIAT AGAIN</Text>
        </View>
      </LinearGradient>
    );
  }


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white'
    },
  })