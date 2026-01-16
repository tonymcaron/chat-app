import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { GiftedChat, InputToolbar, Bubble } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from '../firebase_web';

const Chat = ({ route, navigation, isConnected }) => {
    const { userID, name, color, firebaseEnabled = false } = route.params;
    const [messages, setMessages] = useState([]);
    const [isOnline, setIsOnline] = useState(firebaseEnabled);

    // Simple initialization effect
    useEffect(() => {
        navigation.setOptions({ title: name });

        // Set initial welcome message
        setMessages([
            {
                _id: 1,
                text: `Hello ${name || 'User'}! Welcome to the chat!`,
                createdAt: new Date(),
                user: {
                    _id: 'system',
                    name: 'System',
                },
            }
        ]);
    }, []);

    // Firebase listener effect - only run when we have a real connection
    useEffect(() => {
        if (!firebaseEnabled || !db || isConnected !== true) return;

        console.log('Setting up Firebase listener...');
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const firebaseMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                    user: {
                        _id: data.userID || 'unknown',
                        name: data.user || 'Anonymous',
                    },
                };
            });

            setMessages(firebaseMessages);
            setIsOnline(true);
        });

        return () => unsubscribe();
    }, [firebaseEnabled, isConnected]);

    const onSend = async (messages = []) => {
        const message = messages[0];

        if (isConnected === true && isOnline && db) {
            try {
                await addDoc(collection(db, "messages"), {
                    text: message.text,
                    createdAt: message.createdAt,
                    user: message.user.name,
                    userID: message.user._id
                });
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages(previousMessages => [message, ...previousMessages]);
            }
        } else {
            setMessages(previousMessages => [message, ...previousMessages]);
        }
    };

    const renderInputToolbar = (props) => {
        if (isConnected === false) return null;
        return <InputToolbar {...props} />;
    };

    const renderBubble = (props) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: { backgroundColor: '#007AFF' },
                    left: { backgroundColor: '#E5E5EA' }
                }}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            <View style={[
                styles.statusBar,
                isConnected === true && isOnline ? styles.onlineBar : styles.offlineBar
            ]}>
                <Text style={styles.statusText}>
                    {isConnected === true && isOnline
                        ? 'Firebase Connected - Real-time chat'
                        : isConnected === false
                            ? 'Offline Mode'
                            : 'Local Mode'
                    }
                </Text>
            </View>

            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                    _id: userID,
                    name: name || 'Anonymous',
                }}
                renderInputToolbar={renderInputToolbar}
                renderBubble={renderBubble}
                showUserAvatar={false}
                showAvatarForEveryMessage={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBar: {
        padding: 8,
        alignItems: 'center',
    },
    onlineBar: {
        backgroundColor: '#4CAF50',
    },
    offlineBar: {
        backgroundColor: '#ff9500',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default Chat;