// Main chat screen with Firebase integration, image sharing, and location sharing
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert, SafeAreaView, Keyboard, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, storage } from '../firebase_web';
import CustomActions from './CustomActions';

// Chat component with real-time messaging and media sharing
const Chat = ({ route, navigation, isConnected }) => {
    const { userID, name, color, firebaseEnabled = false } = route.params;
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [isOnline, setIsOnline] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        navigation.setOptions({ title: name });
        loadCachedMessages();

        if (firebaseEnabled && db && isConnected) {
            setupFirebaseListener();
        }

        // Keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => setKeyboardHeight(event.endCoordinates.height)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, [name, isConnected]);

    // Set up real-time listener for Firebase messages
    const setupFirebaseListener = () => {
        try {
            console.log('Setting up Firebase Firestore listener...');
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

            // Listen for real-time message updates
            const unsubscribe = onSnapshot(q,
                async (snapshot) => {
                    console.log('Received', snapshot.docs.length, 'messages from Firestore');
                    const firebaseMessages = snapshot.docs.map(doc => {
                        const data = doc.data();
                        const message = {
                            _id: doc.id,
                            text: String(data.text || ''),
                            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                            user: {
                                _id: String(data.userID || 'unknown'),
                                name: String(data.user || 'Anonymous'),
                            },
                        };

                        // Add image field if present
                        if (data.image) {
                            message.image = data.image;
                        }

                        // Add location field if present
                        if (data.location) {
                            message.location = {
                                latitude: data.location.latitude,
                                longitude: data.location.longitude,
                            };
                        }

                        return message;
                    });

                    setMessages(firebaseMessages);
                    setIsOnline(true);

                    // Cache messages to AsyncStorage for offline use
                    try {
                        await AsyncStorage.setItem('messages', JSON.stringify(firebaseMessages));
                        console.log('Messages cached to AsyncStorage');
                    } catch (storageError) {
                        console.error('Error caching messages:', storageError);
                    }
                },
                (error) => {
                    console.error('Firebase listener error:', error);
                    setIsOnline(false);
                }
            );

            return unsubscribe;
        } catch (error) {
            console.error('Error setting up Firebase listener:', error);
            setIsOnline(false);
            return null;
        }
    };

    const loadCachedMessages = async () => {
        try {
            console.log('Loading cached messages from AsyncStorage...');
            const cachedData = await AsyncStorage.getItem('messages');

            if (cachedData) {
                const parsedMessages = JSON.parse(cachedData);
                const messagesWithDates = parsedMessages.map(msg => {
                    const message = {
                        ...msg,
                        text: String(msg.text || ''),
                        createdAt: new Date(msg.createdAt),
                        user: {
                            _id: String(msg.user?._id || 'unknown'),
                            name: String(msg.user?.name || 'Anonymous'),
                        },
                    };

                    // Preserve image data if present
                    if (msg.image) {
                        message.image = msg.image;
                    }

                    // Preserve location data if present
                    if (msg.location) {
                        message.location = {
                            latitude: msg.location.latitude,
                            longitude: msg.location.longitude,
                        };
                    }

                    return message;
                });
                setMessages(messagesWithDates);
                console.log('Loaded', messagesWithDates.length, 'cached messages');
            } else {
                // Set welcome message if no cached messages
                const welcomeMessage = {
                    _id: 'welcome',
                    text: String(`Hello ${name || 'User'}! Welcome to the chat!`),
                    createdAt: new Date(),
                    user: {
                        _id: 'system',
                        name: 'System',
                    },
                };
                setMessages([welcomeMessage]);
            }
        } catch (error) {
            console.error('Error loading cached messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim()) return;

        const newMessage = {
            _id: Math.random().toString(),
            text: String(messageText),
            createdAt: new Date(),
            user: {
                _id: String(userID),
                name: String(name || 'Anonymous'),
            },
        };

        await handleSend(newMessage);
        setMessageText('');
    };

    // Handle sending messages (text, images, or location)
    const handleSend = async (message) => {
        // Show message immediately in UI
        setMessages(previousMessages => [message, ...previousMessages]);

        // Send to Firebase if connected
        if (firebaseEnabled && db && isConnected && isOnline) {
            try {
                const firebaseMessage = {
                    text: message.text || '',
                    createdAt: new Date(),
                    user: message.user.name || 'Anonymous',
                    userID: message.user._id,
                };

                // Add image field if present
                if (message.image) {
                    firebaseMessage.image = message.image;
                }

                // Add location field if present
                if (message.location) {
                    firebaseMessage.location = {
                        latitude: message.location.latitude,
                        longitude: message.location.longitude,
                    };
                }

                await addDoc(collection(db, "messages"), firebaseMessage);
                console.log('Message sent to Firebase:', message.image ? 'image' : message.location ? 'location' : 'text');
            } catch (error) {
                console.error('Error sending message to Firebase:', error);
                Alert.alert('Error', 'Failed to send message to Firebase');
            }
        } else {
            // Cache message locally for offline use
            try {
                const updatedMessages = [message, ...messages];
                await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
                console.log('Message cached locally');
            } catch (error) {
                console.error('Error caching message:', error);
            }
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.user._id === userID;
        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.otherMessage
            ]}>
                <Text style={[
                    styles.senderName,
                    { color: isMyMessage ? '#fff' : '#666' }
                ]}>
                    {String(item.user?.name || 'Unknown')}
                </Text>

                {/* Render image if present */}
                {item.image && (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.messageImage}
                        resizeMode="cover"
                    />
                )}

                {/* Render location if present */}
                {item.location && (
                    <MapView
                        style={styles.messageMap}
                        region={{
                            latitude: item.location.latitude,
                            longitude: item.location.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker
                            coordinate={{
                                latitude: item.location.latitude,
                                longitude: item.location.longitude,
                            }}
                        />
                    </MapView>
                )}

                {/* Render text if present */}
                {item.text && (
                    <Text style={[
                        styles.messageText,
                        { color: isMyMessage ? '#fff' : '#000' }
                    ]}>
                        {String(item.text)}
                    </Text>
                )}

                <Text style={[
                    styles.messageTime,
                    { color: isMyMessage ? '#fff' : '#666' }
                ]}>
                    {item.createdAt?.toLocaleTimeString ? item.createdAt.toLocaleTimeString() : String(item.createdAt)}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={[styles.container, { backgroundColor: color }]}>
                {/* Status Bar */}
                <View style={[
                    styles.statusBar,
                    isConnected && isOnline ? styles.onlineBar : styles.offlineBar
                ]}>
                    <Text style={styles.statusText}>
                        {isConnected && isOnline
                            ? 'Firebase Connected - Real-time chat'
                            : isConnected === false
                                ? 'Offline - Showing cached messages'
                                : 'Local Mode - Messages saved locally'
                        }
                    </Text>
                </View>

                {/* Messages List */}
                <FlatList
                    style={[
                        styles.messagesContainer,
                        { marginBottom: keyboardHeight > 0 ? keyboardHeight + 60 : 60 }
                    ]}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id.toString()}
                    inverted={true}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />

                {/* Input Area */}
                {isConnected !== false && (
                    <View style={[
                        styles.inputContainer,
                        {
                            position: 'absolute',
                            bottom: keyboardHeight > 0 ? keyboardHeight : 0,
                            left: 0,
                            right: 0,
                        }
                    ]}>
                        <View style={styles.inputRow}>
                            <CustomActions
                                onSend={handleSend}
                                storage={storage}
                                userID={userID}
                            />
                            <TextInput
                                style={styles.textInput}
                                value={messageText}
                                onChangeText={setMessageText}
                                placeholder="Type your message..."
                                multiline={true}
                                maxLength={500}
                                returnKeyType="send"
                                blurOnSubmit={false}
                                onSubmitEditing={sendMessage}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    !messageText.trim() && styles.sendButtonDisabled
                                ]}
                                onPress={sendMessage}
                                disabled={!messageText.trim()}
                            >
                                <Text style={styles.sendButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
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
    messagesContainer: {
        flex: 1,
        padding: 10,
    },
    messageContainer: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: '#007AFF',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#E5E5EA',
        alignSelf: 'flex-start',
    },
    senderName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#666',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 5,
    },
    messageMap: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 5,
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        marginTop: 5,
        textAlign: 'right',
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#fff',
        paddingBottom: Platform.OS === 'ios' ? 0 : 10,
    },
    inputRow: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Chat;