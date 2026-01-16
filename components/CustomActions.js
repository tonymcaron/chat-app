// CustomActions component for handling image and location sharing in chat
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Component for action button that allows users to share images and location
const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID }) => {
    const { showActionSheetWithOptions } = useActionSheet();

    // Show action sheet with options for image/location sharing
    const onActionPress = () => {
        const options = ['Choose From Library', 'Take Photo', 'Share Location', 'Cancel'];
        const cancelButtonIndex = 3;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            (buttonIndex) => {
                switch (buttonIndex) {
                    case 0:
                        pickImage();
                        break;
                    case 1:
                        takePhoto();
                        break;
                    case 2:
                        getLocation();
                        break;
                    default:
                        break;
                }
            }
        );
    };

    // Upload image to Firebase Storage and send message with image URL
    const uploadAndSendImage = async (imageURI) => {
        try {
            // Convert image URI to blob for Firebase upload
            const response = await fetch(imageURI);
            const blob = await response.blob();

            // Create unique filename to prevent conflicts
            const filename = imageURI.split('/').pop() || 'image.jpg';
            const timestamp = Date.now();
            const uniqueRef = `${userID}_${timestamp}_${filename}`;
            const imageRef = ref(storage, `images/${uniqueRef}`);

            // Upload image blob to Firebase Storage
            await uploadBytes(imageRef, blob);

            // Get public download URL for the uploaded image
            const downloadURL = await getDownloadURL(imageRef);

            // Send message containing the image URL
            onSend({
                _id: Math.random().toString(),
                text: '',
                createdAt: new Date(),
                user: {
                    _id: userID,
                    name: 'User',
                },
                image: downloadURL,
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
    };

    // Allow user to select image from device library
    const pickImage = async () => {
        // Request permission to access photo library
        let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissions?.granted) {
            // Open image picker
            let result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                // Upload and send selected image
                await uploadAndSendImage(result.assets[0].uri);
            }
        } else {
            Alert.alert("Permissions haven't been granted.");
        }
    };

    // Allow user to take photo with device camera
    const takePhoto = async () => {
        // Request camera permission
        let permissions = await ImagePicker.requestCameraPermissionsAsync();
        if (permissions?.granted) {
            // Open camera
            let result = await ImagePicker.launchCameraAsync();
            if (!result.canceled) {
                // Upload and send captured photo
                await uploadAndSendImage(result.assets[0].uri);
            }
        } else {
            Alert.alert("Permissions haven't been granted.");
        }
    };

    // Get user's current location and send as message
    const getLocation = async () => {
        // Request location permission
        let permissions = await Location.requestForegroundPermissionsAsync();
        if (permissions?.granted) {
            // Get current GPS coordinates
            try {
                let location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                // Send message with location coordinates
                onSend({
                    _id: Math.random().toString(),
                    text: '',
                    createdAt: new Date(),
                    user: {
                        _id: userID,
                        name: 'User',
                    },
                    location: {
                        latitude,
                        longitude,
                    },
                });
            } catch (error) {
                console.error('Error getting location:', error);
                Alert.alert('Error', 'Failed to get location. Please try again.');
            }
        } else {
            Alert.alert("Location permissions haven't been granted.");
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onActionPress}
            accessible={true}
            accessibilityLabel="More actions"
            accessibilityHint="Choose to send an image, take a photo, or share location"
        >
            <Text style={styles.iconText}>+</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginBottom: 10,
        borderRadius: 13,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

export default CustomActions;