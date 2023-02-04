import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Wallet, { NftInfo } from './Wallet'
import { FakeNav } from "./Types"
import { StyleSheet, StatusBar } from 'react-native';



const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: StatusBar.currentHeight || 0,
    },
    item: {
      padding: 16,
      marginRight: 'auto',
      marginLeft: 'auto',
      marginVertical: 20,
      alignItems: 'center',
      backgroundColor: '#F4401F',
      borderRadius: 2
    },
    nftImage: {
        height: 150, width: 150, borderRadius: 2
    },
    nftTitle: {
        marginBottom: 10, fontWeight: "bold", color: "white"
    },
    title: {
      fontSize: 32,
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 22,
        height: 44,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4401F',
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 25,
        marginRight: 25,
        textTransform: 'uppercase'
    },

    message: {
        textAlign: 'center',
        marginVertical: 30,
    },
  })

const NftView = ({ nft }: { nft: NftInfo }) => (
    <View style={styles.item}>
        <Text style={styles.nftTitle}>{nft.json.name}</Text>
        <Image
            style={ styles.nftImage }
            source={{ uri: nft.json.image || undefined }} />
    </View>
)

export default function Dashboard({ navigation }: { navigation: FakeNav }) {

    const [alreadyIssued, setAlreadyIssued] = React.useState(false)
    const [nfts, setNfts] = React.useState<NftInfo[]>([])
    const [message, setMessage] = React.useState("")

    const checkIssued = () => {
        AsyncStorage.getItem('@Friday:twitterIssued')
        .then(issued => setAlreadyIssued(!!issued))
    }

    React.useEffect(() => {
        console.log('adding listener')
        const removeListener = navigation.addListener('focus', () => {
            console.log('onFocus')
            checkIssued()
        })
        return () => {
            console.log('removing listener')
            removeListener()
        }
    }, [])

    React.useEffect(() => {
        checkIssued()

        setMessage('Loading NFTs...')
        Wallet.shared().then(async (wallet) => {
            setNfts(await wallet.getNftInfo())
            setMessage("Got NFTs")
            setTimeout(() => setMessage(''), 500)
        })
        .catch(error => {
            console.error(error)
            setMessage('Error loading NFTs!')
        })
    }, [])

    nfts.forEach(nft => {
        console.log(`https://explorer.solana.com/address/${nft.mintAddress.toString()}?cluster=devnet`)
    })

    return (
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', width: '100%', backgroundColor: 'white' }} onLayout={() => console.log('layout')}>
            <View>
                <Image
                    style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                    resizeMode='stretch'
                    source={require('./images/friday_logo.png')}
                />
            </View>
            <View style={{ alignSelf: 'stretch', flexDirection: 'column', alignItems: 'center', bottom: 0, marginBottom: 30 }}>
                {alreadyIssued &&
                <>
                    <Image
                        style={{ width: 200, height: 200 }}
                        resizeMode='stretch'
                        source={require('./images/collection-mercedes.png')}
                    />
                    <TouchableOpacity style={{ ...styles.button, marginVertical: 40}} onPress={() => navigation.navigate('TwitterConnect')}>
                        <Text style={styles.buttonText}>Connect Twitter</Text>
                    </TouchableOpacity>
                </>}
                {nfts.map(nft => <NftView key={nft.mintAddress.toString()} nft={nft}/>)}
                {/*
                <TouchableOpacity style={{  }} onPress={() => navigation.navigate('NetflixConnect')}>
                    <Image
                        style={{ width: 100, height: 100 }}
                        resizeMode='stretch'
                        source={require('./images/netflix_icon.png')}
                    />
                </TouchableOpacity>
            */}
            </View>
            <View/>
            <Text style={styles.message}>{message || ''}</Text>
            {/*
            <View style={{ marginBottom: 60 }}>
                <TouchableOpacity style={{ height: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 60, backgroundColor: 'white', borderRadius: 25, borderWidth: 1 }} onPress={() => navigation.navigate('NFTGallery')}>
                    <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: 'grey', fontWeight: 'bold' }}>View my NFTs</Text>
                </TouchableOpacity>
            </View>
        */}
        </View>
    );
  }