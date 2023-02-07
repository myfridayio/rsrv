import * as React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"

interface Props {
    children?: React.ReactNode
    onPress: (() => void) | (() => Promise<void>),
    style?: {} | null,
    icon?: React.ReactNode
}

export default function Button({ children, icon, style, onPress }: Props) {
    return (
        <TouchableOpacity style={{ ...styles.button, ...style }} onPress={onPress}>
            {!!icon && <View style={{ marginLeft: -8, marginRight: 8 }}>{icon}</View>}
            {typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 22,
        height: 44,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4401F',
    },

    text: {
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase'

    }
})