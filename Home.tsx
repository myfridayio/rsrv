import * as React from "react"
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import { FakeNav } from "./Types"
import Wallet from "./Wallet"
import Biometrics from 'react-native-biometrics'
import Colors from './lib/ui/color'

interface Props {
    navigation: FakeNav
}

export default function HomeScreen({ navigation }: Props) {
    const [creating, setCreating] = React.useState(false)

    const createWallet = async () => {
        if (await Wallet.shared()) {
            navigation.navigate('Dashboard') // already initialized wtf?
            return
        }

        setCreating(true)
        const biometrics = new Biometrics()
        biometrics.simplePrompt({promptMessage: 'Confirm fingerprint'})
        .then(async ( { success }: { success: boolean}) => {
            if (success) {
                console.log('successful biometrics provided')
                await Wallet.create()
                navigation.navigate('Dashboard')
            } else {
                console.log('user cancelled biometric prompt')
            }
        })
        .finally(() => setCreating(false))
    }

    React.useEffect(() => {
        Wallet.shared().then(wallet => {
            if (wallet) {
                console.log('to dash')
                navigation.navigate('Dashboard')
            }
        })
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: "#ef390f" }}>
            <View style={{ flex: 1, position: 'absolute', width: '100%', marginTop: 100, alignItems: 'center' }}>
                <Image
                    style={{ width: 80, height: 80, borderWidth: 1, borderColor: 'white' }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
                <Text style={{ marginTop: 100, fontSize: 50, alignContent: 'center', marginHorizontal: 50, textAlign: 'center', fontFamily: 'AkzidenzGroteskBQ-BdCnd', color: 'white' }}>GET PAID FOR YOUR DATA</Text>
            </View>
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, marginBottom: 30}}>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, opacity: creating ? 0.7 : 1.0 }} disabled={creating} onPress={createWallet}>
                    {creating && <ActivityIndicator size="small" color={Colors.red} style={{ marginRight: 20 }}/>}
                    <Text style={{ fontSize:15, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: '#ef390f', fontWeight: 'bold' }}>Create Wallet</Text>
                </TouchableOpacity>
            </View>
      </View>
    );
  }