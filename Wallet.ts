
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Metaplex, keypairIdentity, bundlrStorage, Nft, Metadata } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import _ from 'underscore'


const connection = new Connection(clusterApiUrl("devnet"))
const tempKeypair = Keypair.generate() // should this be my keypair? confused...

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(tempKeypair))
    .use(bundlrStorage())


export default class Wallet {

    isLoaded: boolean = false
    publicKey: string | null = null
    lastError: string | null = null

    private constructor() {
    }

    private static _shared: Wallet | null
    static async shared(): Promise<Wallet> {
        if (!this._shared) {
            const wallet = new Wallet()
            this._shared = wallet
            await wallet.load()
        }
        return this._shared
    }

    static async reset() {
        await AsyncStorage.removeItem('@Friday:publicKey')
        this._shared = null
    }

    static async store(publicKey: PublicKey) {
        await AsyncStorage.setItem('@Friday:publicKey', publicKey.toString())
    }

    async load(cycle=0): Promise<Wallet> {
        if (this.isLoaded) {
            return this
        }
        await AsyncStorage.getItem('@Friday:publicKey')
        .then((publicKey: string | null) => {
            this.isLoaded = true
            this.publicKey = publicKey
        })
        return this
    }


    async getNfts(): Promise<Metadata[]> {
        const me = await this.publicKeyOrFail()
        const allNFTs = await metaplex.nfts().findAllByOwner({ owner: me }) as Metadata[]

        return (await Promise.all(allNFTs.map(async (nft: Metadata) => {
            const response = await fetch(nft.uri)
            const json = (await response.json()) as { image: string | null, name: string }
            return { ...nft, json, jsonLoaded: true } as Metadata
        }))).filter(x => !!x)
    }

    async publicKeyOrFail(): Promise<PublicKey> {
        const pk = (await this.load()).publicKey
        if (pk) {
            return new PublicKey(pk)
        } else {
            throw 'Invalid State: publicKey is null'
        }
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
        const me = await this.publicKeyOrFail()
        const handle = await AsyncStorage.getItem('@Friday:twitter:handle')
        const person = handle!.includes('kiril') ? 'kiril' : 'hue' // LMFAO right?
        await generate(me.toString(), 'twitter', person)
        return this.getTwitter()
    }

    async grantMercedes() {
        let mercedes = await this.getMercedes()
        if (mercedes) {
            return mercedes
        }
        const me = await this.publicKeyOrFail()
        const handle = await AsyncStorage.getItem('@Friday:twitter:handle')
        const person = handle!.includes('kiril') ? 'kiril' : 'hue' // LMFAO right?
        await generate(me.toString(), 'mercedes', person)
        return this.getMercedes()
    }
}

const LOCAL_BASE = 'http://10.0.2.2:3131/mint'
const generate = async (walletPK: string, type: string, person: string) => {
    await fetch(`${LOCAL_BASE}?ownerKey=${walletPK}&type=${type}&person=${person}`)
}