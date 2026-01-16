# React Native Chat App

A feature-rich, real-time chat application built with React Native, Expo, and Firebase. The app includes text messaging, image sharing, location sharing, and offline caching capabilities.

## 🚀 Features

- **Real-time Messaging**: Instant chat with Firebase Firestore integration
- **Image Sharing**: Camera capture and photo library with Firebase Storage upload
- **Location Sharing**: GPS coordinates with interactive MapView display
- **Offline Support**: Local message caching with AsyncStorage for offline functionality
- **Network Monitoring**: Automatic connection status detection and Firebase network management
- **Custom Chat UI**: Built from scratch with FlatList, custom message bubbles, and responsive design
- **Blob Conversion**: Proper image-to-blob conversion for Firebase Storage uploads
- **Cross-Platform**: iOS, Android, and Web support through Expo
- **Accessibility**: Screen reader support and comprehensive accessibility features
- **Action Sheet Integration**: Native action sheets for media and location sharing options

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or later) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** (recommended) - `npm install -g @expo/cli`
- **Expo Go** app on your mobile device
- **Android Studio** (for Android emulation) - [Setup guide](https://docs.expo.dev/workflow/android-studio-emulator/)
- **Xcode** (for iOS development on macOS) - [Setup guide](https://docs.expo.dev/workflow/ios-simulator/)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chat-app
```

### 2. Install Dependencies
Run the following commands to install all required packages:

```bash
# Install main dependencies
npm install

# Install Expo-specific packages
npx expo install expo-location
npx expo install react-native-maps
npx expo install expo-image-picker
npx expo install @expo/react-native-action-sheet

# Install development dependencies
npm install --save-dev expo-module-scripts
```

### 3. Firebase Configuration

#### Option A: Use Mock Authentication (Default)
The app comes pre-configured with mock Firebase authentication for immediate testing.

#### Option B: Set Up Real Firebase (Production)
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Storage
3. Get your Firebase config object
4. Replace the mock configuration in `firebase_web.js`:

```javascript
// firebase_web.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Environment Setup (Optional)
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## 🏃‍♂️ Running the Application

### Start Development Server
```bash
npx expo start
```

### Platform-Specific Commands
```bash
# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run on Web
npx expo start --web

# Clear cache and start
npx expo start --clear
```

### Alternative Port (if 8081 is busy)
```bash
npx expo start --port 8085
```

## 📱 Testing the App

### 1. Basic Setup Test
1. Start the development server
2. Scan QR code with Expo Go or run in simulator
3. Enter your name and background color on Start screen
4. Navigate to Chat screen

### 2. Communication Features Testing

#### Text Messaging
1. Type a message in the text input field
2. Press "Send" button or hit Enter key
3. Verify message appears in custom chat bubble with proper styling
4. Check real-time sync across multiple devices connected to same Firebase project

#### Image Sharing
1. Tap the blue "+" button next to text input
2. Select "Choose From Library" or "Take Photo" from action sheet
3. Grant camera/photo permissions when prompted by the system
4. Select image from library or capture new photo with camera
5. Wait for image upload to Firebase Storage (blob conversion happens automatically)
6. Verify image displays properly in chat bubble with 200x200 dimensions
7. Test that image URLs are accessible and persistent

#### Location Sharing
1. Tap the blue "+" button next to text input
2. Select "Share Location" from action sheet menu
3. Grant location permissions when prompted by the system
4. Wait for GPS coordinates to be retrieved
5. Verify interactive MapView appears in chat bubble showing your location
6. Check that map displays correct coordinates with marker pin
7. Test that location data persists in Firebase Firestore

#### Offline Testing
1. Turn off internet connection
2. Send messages (they'll be cached locally)
3. Reconnect to internet
4. Verify messages sync to Firebase

### 3. Cross-Device Testing
1. Run app on multiple devices
2. Send messages from one device
3. Verify real-time message delivery on other devices
4. Test image and location sharing across devices

## 🛠 Troubleshooting

### Common Issues & Solutions

#### Metro Bundler Cache Issues
```bash
npx expo start --clear
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Kill processes on port 8081
npx kill-port 8081
# Or use alternative port
npx expo start --port 8086
```

#### TypeScript Configuration Warnings
The `expo-location/tsconfig.json` warning is cosmetic and doesn't affect functionality. This is a known issue where the package references `tsconfig.base` instead of `tsconfig.base.json`. The app works perfectly despite this warning.

#### Firebase Connection Issues
1. Check internet connection
2. Verify Firebase configuration
3. Check Firebase console for any service issues
4. Review browser console for detailed error messages

#### Permission Errors (Camera/Location)
1. Ensure you're testing on a physical device or properly configured simulator
2. Check device settings for app permissions
3. Reinstall the app if permissions seem stuck

#### Android Studio Emulator Setup
1. Install Android Studio
2. Set up AVD (Android Virtual Device)
3. Start emulator before running `npx expo start --android`

## 📁 Project Structure

```
chat-app/
├── components/
│   ├── Start_firebase.js     # Welcome screen with Firebase authentication
│   ├── Chat_firebase.js      # Main chat interface with custom UI
│   ├── CustomActions.js      # Action sheet for image/location sharing
│   ├── Chat_simple.js        # Simple chat implementation (backup)
│   └── Welcome.js            # Additional welcome screen
├── assets/
│   ├── images/               # App icons and background images
│   └── background.jpg        # Start screen background
├── firebase_web.js           # Firebase configuration and initialization
├── App.js                    # Main navigation with ActionSheetProvider
├── index.js                  # Entry point
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This documentation
```

## 🔧 Key Dependencies

```json
{
  "expo": "~54.0.27",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "firebase": "9.23.0",
  "@react-navigation/native": "^7.1.24",
  "@react-navigation/native-stack": "^7.8.5",
  "@react-native-async-storage/async-storage": "2.2.0",
  "@react-native-community/netinfo": "^11.4.1",
  "expo-image-picker": "~17.0.9",
  "expo-location": "~19.0.8",
  "react-native-maps": "1.20.1",
  "@expo/react-native-action-sheet": "^4.1.1"
}
```

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build for production
eas build --platform all

# Submit to app stores
eas submit
```

### Web Deployment
```bash
# Build for web
npx expo export --platform web

# Deploy to hosting service (Netlify, Vercel, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. **Check this README** for common solutions
2. **Review logs** in the Expo development tools
3. **Check Firebase Console** for backend issues
4. **Visit Expo Documentation**: https://docs.expo.dev/
5. **Firebase Documentation**: https://firebase.google.com/docs

## 🏆 Acknowledgments

- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Real-time messaging powered by [Firebase Firestore](https://firebase.google.com/docs/firestore)
- Image storage via [Firebase Storage](https://firebase.google.com/docs/storage)
- Maps integration with [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- Image handling through [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- Location services with [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- Action sheets via [Expo React Native Action Sheet](https://github.com/expo/react-native-action-sheet)
- Network monitoring with [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)

---

**Happy Chatting! 💬📱**