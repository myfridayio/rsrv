import * as React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"

interface Props {
    title: string,
    onPress: (() => void) | (() => Promise<void>),
    style?: {} | null
}

export default function Button({ title, style, onPress }: Props) {
    return (
        <TouchableOpacity style={{ ...styles.button, ...style }} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
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
})