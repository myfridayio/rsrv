
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Metaplex, keypairIdentity, bundlrStorage, Nft, Metadata, JsonMetadata } from "@metaplex-foundation/js"
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js"
import _ from 'underscore'
import * as Bip39 from 'bip39'
import * as Keychain from 'react-native-keychain'
import { generateMnemonic } from "@dreson4/react-native-quick-bip39"
import { repeatUntil } from './lib/util/f'


const connection = new Connection(clusterApiUrl("mainnet-beta"))
const tempKeypair = Keypair.generate() // should this be my keypair? confused...


const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(tempKeypair))
    .use(bundlrStorage())


export default class Wallet {
    private _publicKey: PublicKey
    private _publicKeyString: string

    private constructor(publicKey: PublicKey) {
        this._publicKey = publicKey
        this._publicKeyString = publicKey.toString()
    }

    get publicKey() {
        return this._publicKey
    }

    get publicKeyString() {
        return this._publicKeyString
    }

    private static _shared: Wallet | null
    static async shared() {
        if (!this._shared) {
            const keyString = await AsyncStorage.getItem('@Friday:publicKey')
            if (!keyString) {
                return null
            }
            this._shared = new Wallet(new PublicKey(keyString))
        }
        return this._shared
    }

    static async reset() {
        await AsyncStorage.removeItem('@Friday:publicKey')
        this._shared = null
    }

    static async store(publicKey: PublicKey) {
        await AsyncStorage.setItem('@Friday:publicKey', publicKey.toString())
        return this.reload()
    }

    static async reload() {
        this._shared = null
        return this.shared()
    }

    static async create() {
        const tempMnemonics = generateMnemonic(128)
        const seed = Bip39.mnemonicToSeedSync(tempMnemonics).slice(0, 32)
        const keypair = Keypair.fromSeed(seed)
        const publicKey = keypair.publicKey.toBase58()
        const privateKey = JSON.stringify(keypair.secretKey)
        console.log(`${publicKey}`)
        Keychain.setGenericPassword(publicKey, privateKey)

        /*
        const wallet = (await this.store(new PublicKey(publicKey)))!
        await connection.requestAirdrop(wallet.publicKey, 1e8)
        const checkAccount = async () => connection.getAccountInfo(wallet.publicKey, 'processed')
        const isNotNull = (a: {}) => a !== null

        const started = new Date().getTime()
        repeatUntil(checkAccount, isNotNull, 1000, 10000)
        .then(info => {
            console.log(`WALLET: https://explorer.solana.com/address/${publicKey}?cluster=devnet`)
        })
        .catch(e => {
            console.log('unable to retrieve account info')
            console.error(e)
        })
        */
    }


    async getNfts(): Promise<Metadata[]> {
        const allNFTs = await metaplex.nfts().findAllByOwner({ owner: this.publicKey }).catch(e => []) as Metadata[]

        return (await Promise.all(allNFTs.map(async (nft: Metadata) => {
            const response = await fetch(nft.uri)
            const json = (await response.json()) as JsonMetadata
            return { ...nft, json, jsonLoaded: true } as Metadata
        }))).filter(x => !!x)
    }

    async getTwitter() {
        const nfts = await this.getNfts()
        for (const nft of nfts) {
            if (nft.name === 'Twitter Data Owner') {
                return nft
            }
        }
        return null
    }

    async getMercedes() {
        const nfts = await this.getNfts()
        for (const nft of nfts) {
            if (nft.name === 'Mercedes F1 Fan') {
                return nft
            }
        }
        return null
    }

    async grantTwitter() {
        let twitter = await this.getTwitter()
        if (twitter) {
            return twitter
        }
        const handle = await AsyncStorage.getItem('@Friday:twitter:handle')
        const person = handle!.includes('kiril') ? 'kiril' : 'hue' // LMFAO right?
        await generate(this._publicKeyString, 'twitter', person)
        return this.getTwitter()
    }

    async grantMercedes() {
        let mercedes = await this.getMercedes()
        if (mercedes) {
            return mercedes
        }
        const handle = await AsyncStorage.getItem('@Friday:twitter:handle')
        const person = handle!.includes('kiril') ? 'kiril' : 'hue' // LMFAO right?
        await generate(this._publicKeyString, 'mercedes', person)
        return this.getMercedes()
    }
}

const LOCAL_BASE = 'http://10.0.2.2:3131/mint'
const generate = async (walletPK: string, type: string, person: string) => {
    await fetch(`${LOCAL_BASE}?ownerKey=${walletPK}&type=${type}&person=${person}`)
}