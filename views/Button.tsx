import * as React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"

interface Props {
    children?: React.ReactNode
    onPress: (() => void) | (() => Promise<void>),
    style?: {} | null,
    icon?: React.ReactNode,
    large?: boolean,
    medium?: boolean,
    small?: boolean,
    backgroundColor?: string,
    textColor?: string,
}

export default function Button({ children, icon, style, large, medium, small, backgroundColor, textColor, onPress }: Props) {
    const sizeStyle = small ? styles.small : ( medium ? styles.medium : styles.large )
    const colorStyle = backgroundColor ? { backgroundColor } : null
    return (
        <TouchableOpacity style={{ ...styles.button, ...colorStyle, ...sizeStyle, ...style }} onPress={onPress}>
            {!!icon && <View style={{ marginLeft: -8, marginRight: 8 }}>{icon}</View>}
            {typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4401F',
    },

    large: {
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 22,
        height: 44
    },

    medium: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 15,
        height: 30
    },

    small: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 10,
        height: 20
    },

    text: {
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase'

    }
})