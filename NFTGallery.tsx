import * as React from "react";
import 'react-native-url-polyfill/auto'
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { View, Image, FlatList, Text, AsyncStorage, StyleSheet, StatusBar } from "react-native";

export default function NFTGallery({navigation}) {

    const [walletAddress, setWalletAddress] = React.useState("");
    const [centerMessage, setCenterMessage] = React.useState("Loading NFTs.. Hang on!!")
    const [nftsLoaded, setNftsLoaded] = React.useState(false)
    const [listData, setListData] = React.useState([])

    React.useEffect(() => {
        async function getWalletAddress() {
            try {
                const address = await AsyncStorage.getItem('@MyWalletAddress:key');
                if (address !== null) {
                  setWalletAddress(address)
                } else {
                    setCenterMessage('Something went wrong!!')
                }
              } catch (error) {
                setCenterMessage('Something went wrong!!')
              }
        }
        getWalletAddress()
        getNFTs()
    }, [])

    async function getNFTs() {
        const connection = new Connection(clusterApiUrl("devnet"));
        const wallet = Keypair.generate();

        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(wallet))
            .use(bundlrStorage());

        try{
            const owner = new PublicKey(walletAddress);
            const allNFTs = await metaplex.nfts().findAllByOwner({owner: owner});
        } catch (error) {
            setCenterMessage('Looks like you do not have any NFTs')
        }
        
        let nftUrls : String[]= [];
        if(allNFTs.length == 0) {
            setCenterMessage('Looks like you do not have any NFTs')
        } else {
            allNFTs.forEach((nft) => {
                fetch(nft.uri)
                .then(response => response.json())
                .then(json => {
                    if(json.image != undefined) {
                        nftUrls.push(json.image)
                    }
                })
                .catch(error => {
                    //nothing here
                });
            });
            setTimeout(() => {
                setNftsLoaded(true)
                setListData(nftUrls)
            }, 3000)
        }
    }

    function showNFTs() {
        if(nftsLoaded) {
            return(
                <FlatList
                    style={{ marginVertical: 20 }}
                    data={listData}
                    renderItem={({item}) => <Item uri={item} />}
                />
            )
        }
        return(
            <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize:20, alignItems: 'center', justifyContent: 'center', fontFamily: 'AkzidenzGroteskBQ-Reg', color: '#ef390f', fontWeight: 'bold' }}>{centerMessage}</Text>
            </View>
        )
    }

    const Item = ({uri}) => (
        <View style={styles.item}>
          <Image
            style={{height: 150, width: 150}}
            source={{uri: uri,}}
        />
        </View>
      );
    
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Image
                style={{ width: 60, height: 60, marginLeft: 20, marginTop: 40 }}
                resizeMode='stretch'
                source={require('./images/friday_logo.png')}
            />
            {showNFTs()}
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: StatusBar.currentHeight || 0,
    },
    item: {
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
      alignItems: 'center'
    },
    title: {
      fontSize: 32,
    },
  });