import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth } from '../firebase_web';

const COLORS = ['#090C08', '#474056', '#8A95A5', '#B9C6AE'];

const Start = ({ navigation }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const goToChat = async () => {
        if (!name.trim()) {
            Alert.alert("Missing Information", "Please enter your name");
            return;
        }

        try {
            console.log('Attempting Firebase authentication...');
            const result = await auth.signInAnonymously();
            console.log('Firebase auth successful:', result.user.uid);

            navigation.navigate("Chat", {
                userID: result.user.uid,
                name: name.trim(),
                color: selectedColor,
                firebaseEnabled: true
            });
        } catch (error) {
            console.error('Firebase auth error:', error);

            // Fallback to local mode if Firebase fails
            Alert.alert(
                "Connection Issue",
                "Unable to connect to Firebase. Continue in offline mode?",
                [
                    {
                        text: "Yes, Continue Offline",
                        onPress: () => {
                            navigation.navigate("Chat", {
                                userID: 'local-' + Date.now(),
                                name: name.trim(),
                                color: selectedColor,
                                firebaseEnabled: false
                            });
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ImageBackground
                source={require('../assets/background.jpg')}
                style={styles.container}
                resizeMode="cover"
            >
                <View style={styles.overlay}>
                    <View style={styles.contentBox}>
                        <Text style={styles.title}>Chat App</Text>

                        <TextInput
                            style={styles.textInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Type your username here"
                            placeholderTextColor="#757083"
                        />

                        <Text style={styles.colorText}>Choose Background Color:</Text>
                        <View style={styles.colorContainer}>
                            {COLORS.map((color, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                    accessible={true}
                                    accessibilityLabel={`Select background color ${index + 1}`}
                                    accessibilityHint="Changes the chat background color"
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: selectedColor === color }}
                                />
                            ))}
                        </View>

                        <Pressable
                            style={styles.chatButton}
                            onPress={goToChat}
                            accessible={true}
                            accessibilityLabel="Start Chatting"
                            accessibilityHint="Navigate to the chat screen with Firebase"
                            accessibilityRole="button"
                        >
                            <Text style={styles.chatButtonText}>Start Chatting</Text>
                        </Pressable>
                    </View>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    contentBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 30,
        borderRadius: 20,
        width: '88%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 45,
        fontWeight: '600',
        color: '#757083',
        marginBottom: 30,
        textAlign: 'center',
    },
    textInput: {
        width: "100%",
        padding: 15,
        borderWidth: 2,
        borderColor: '#757083',
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
        backgroundColor: '#FFFFFF',
    },
    colorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#474056',
        marginBottom: 15,
        textAlign: 'center',
    },
    colorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    colorOption: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#757083',
    },
    chatButton: {
        backgroundColor: '#757083',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    chatButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Start;