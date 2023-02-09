import * as React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

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
    disabled?: boolean,
    title?: string,
}

export default function Button({ children, icon, style, large, medium, small, backgroundColor, textColor, disabled, title, onPress }: Props) {
    const sizeStyle = small ? styles.small : ( medium ? styles.medium : styles.large )
    const colorStyle = backgroundColor ? { backgroundColor } : null
    const buttonText = title || (typeof children === 'string' && children)
    return (
        <TouchableOpacity style={{ ...styles.button, ...colorStyle, ...sizeStyle, ...style, opacity: disabled ? 0.7 : 1.0 }} onPress={onPress} disabled={disabled || false}>
            {!!icon && <View style={{ marginLeft: -8, marginRight: 8 }}>{icon}</View>}
            {!!buttonText ? <Text style={styles.text}>{buttonText}</Text> : children}
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