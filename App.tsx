/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {type PropsWithChildren, useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  TextInput,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';
import { Keypair, Connection, clusterApiUrl } from '@solana/web3.js';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

const Section: React.FC<
  PropsWithChildren<{
    title: string;
  }>
> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [keypair, setKeypair] = useState<Keypair>(() => Keypair.generate());
  const [twitterId, setTwitterId] = useState("");
  const [twitterUserName, setTwitterUserName] = useState("sandeepperla");
  const [name, setName] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [followingCount, setFollowingCount] = useState("");
  const [version, setVersion] = useState<any>('');

  const randomKeypair = () => {
    setKeypair(() => Keypair.generate());
  };
  const token = 'AAAAAAAAAAAAAAAAAAAAAA7TjwEAAAAAjQjSffSrlDSlMU2E8iVIbRzO2iw%3DrA7RWtjtutQYqwwMfQeXUQ2kPjRC4pZ0G4POVJnEMlHkceoaqj'

  const getTwitterId = () => {
    setName("");
    if(twitterUserName != "") {
      return fetch(`https://api.twitter.com/2/users/by/username/${twitterUserName}`, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => response.json())
      .then(json => {
        setTwitterId(json.data.id)
        setName(`Name - ${json.data.name}`)
        setTimeout(() => getFollowerCount(), 500)
      })
      .catch((error) => {
        setName('Handle doesn\'t exist');
      });
    }
  }

  const getFollowerCount = () => {
    console.log('twitter id - '+twitterId)
    if(twitterId != "") {
      return fetch(`https://api.twitter.com/2/users/${twitterId}/followers`, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => response.json())
      .then(json => {
        setFollowerCount(`Total Followers - ${json.meta.result_count}`)
        setTimeout(() => getFollowingCount(), 500)
      })
      .catch((error) => {
        setFollowerCount('Something went wrong with followers count');
      });
    }
  }

  const getFollowingCount = () => {
    console.log('twitter id - '+twitterId)
    if(twitterId != "") {
      return fetch(`https://api.twitter.com/2/users/${twitterId}/following`, {
        method: 'GET',
        headers: {
        'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => response.json())
      .then(json => {
        setFollowingCount(`Total Following - ${json.meta.result_count}`)
      })
      .catch((error) => {
        setFollowingCount('Something went wrong with following count');
      });
    }
  }
  
  useEffect(() => {
    const conn = new Connection(clusterApiUrl('devnet'));
    conn.getVersion().then(r => {
      setVersion(r);
    });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Button title="New Keypair" onPress={randomKeypair} />
      {version ? (
        <Section title="Version">{JSON.stringify(version, null, 2)}</Section>
        ) : null}
        {keypair ? (
          <Section title="Keypair">{JSON.stringify(keypair?.publicKey?.toBase58(), null, 2)}</Section>
        ) : null}
        <View style={{ height: 3, marginTop: 10, backgroundColor: 'yellow', width: '100%'}} />
        <View style={{padding: 10}}>
          <TextInput
            style={{height: 40}}
            autoCapitalize='none'
            placeholder="Your Twitter handle here"
            onChangeText={newText => setTwitterUserName(newText)}
            defaultValue={twitterUserName}
          />
        </View>
        <Button title="Get Twitter info" onPress={getTwitterId} />
        <ScrollView>
          <Text style={{fontSize: 20}}>{name}</Text>
          <Text style={{fontSize: 20}}>{followerCount}</Text>
          <Text style={{fontSize: 20}}>{followingCount}</Text>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
