import * as React from "react";
import 'react-native-url-polyfill/auto'
import { View, Text, Button, Image, TouchableOpacity, NativeModules } from "react-native";
import { WebView } from 'react-native-webview';
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { Client, auth } from "twitter-api-sdk";


export default function MoreTokensConnectScreen({navigation}) {
    const [showWebView, setShowWebView] = React.useState(false)
    const { RNTwitterSignIn } = NativeModules;


    // RNTwitterSignIn.init('yuvtrGYizL4y2zhvqsh8wt6wI', '32zGDBWm0BP2lljPKK0macR4ZgubIxAKklGXkT22TRqYgIdHhH').then(() =>
    //     console.log('Twitter SDK initialized'),
    // );

    // useEffect(() => {
    //     RNTwitterSignIn.init('yuvtrGYizL4y2zhvqsh8wt6wI', '32zGDBWm0BP2lljPKK0macR4ZgubIxAKklGXkT22TRqYgIdHhH').then(() =>
    //         console.log('Twitter SDK initialized'),
    //     );
    //   }, []);

    function twitterSignIn() {
        RNTwitterSignIn.init('yuvtrGYizL4y2zhvqsh8wt6wI', '32zGDBWm0BP2lljPKK0macR4ZgubIxAKklGXkT22TRqYgIdHhH')
        RNTwitterSignIn.logIn()
          .then((loginData: { authToken: any; authTokenSecret: any; }) => {
            const { authToken, authTokenSecret } = loginData
            if (authToken && authTokenSecret) {
              console.log(authToken)
            }
          })
          .catch((error: any) => {
            console.log(error)
          }
        )
        // const authClient = new auth.OAuth2User({
        //     client_id: 'yuvtrGYizL4y2zhvqsh8wt6wI',
        //     client_secret:'32zGDBWm0BP2lljPKK0macR4ZgubIxAKklGXkT22TRqYgIdHhH',
        //     callback: "twittersdk://",
        //     scopes: ["tweet.read", "users.read"],
        //   });
        // const client = new Client(authClient);
        // const authUrl = authClient.generateAuthURL({
        //     code_challenge_method: "s256",
        //     state: "my-state"
        // });
        // console.log(authUrl)
      }

    function showNetflixWebView() {
        if(showWebView) {
            return (
                <WebView
                        source={{ uri: 'https://www.netflix.com/account/getmyinfo' }}
                        style={{ marginTop: 20, width: '100%', height: 400 }}
                    />
            )
        }
        return null
    }

    // const twitterAuth = async () => {
    //     console.log('point 1')
    //     await RNTwitterSignIn.init('yuvtrGYizL4y2zhvqsh8wt6wI', '32zGDBWm0BP2lljPKK0macR4ZgubIxAKklGXkT22TRqYgIdHhH');
    //     console.log('point 2'); 
    // }

    async function showNfts() {
        const connection = new Connection(clusterApiUrl("devnet"));
        const wallet = Keypair.generate();

        const metaplex = Metaplex.make(connection)
            .use(keypairIdentity(wallet))
            .use(bundlrStorage());

        const owner = new PublicKey("2R4bHmSBHkHAskerTHE6GE1Fxbn31kaD5gHqpsPySVd7");
        const allNFTs = await metaplex.nfts().findAllByOwner({owner: owner});

        console.log(JSON.stringify(allNFTs));
    }
    
    return (
        <View style={{ flex: 1 }}>
            <Image
                style={{ width: '100%', height: '100%'}}
                resizeMode='stretch'
                source={require('./images/getstarted.png')}
            />
            <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', alignItems: 'center', top: 170, backgroundColor: 'transparent'}}>
                
                <TouchableOpacity onPress={() => twitterSignIn()}>
                    <Image
                        style={{ width: 100, height: 100, backgroundColor: 'transparent'}}
                        resizeMode='stretch'
                        source={require('./images/netflix_icon.png')}
                    />
                </TouchableOpacity>
                <View style={{ marginTop: 20, width: '100%', height: 400 }}>
                    {showNetflixWebView()}
                </View>
                
            </View>
      </View>
    );
  }