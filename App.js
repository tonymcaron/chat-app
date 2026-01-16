// Main App component with Firebase integration and network monitoring
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

// Import screen components and Firebase config
import Start from './components/Start_firebase';
import Chat from './components/Chat_firebase';
import { db } from './firebase_web';

// Navigation stack setup
const Stack = createNativeStackNavigator();

const App = () => {
  console.log("App starting - Firebase enabled version with network monitoring...");

  // Monitor internet connection status
  const netInfo = useNetInfo();

  useEffect(() => {
    console.log("Network connectivity changed:", netInfo.isConnected);

    if (netInfo.isConnected !== null) {
      if (netInfo.isConnected && db) {
        // Enable Firestore network when online
        enableNetwork(db).then(() => {
          console.log("Firestore network enabled");
        }).catch((error) => {
          console.error("Error enabling Firestore network:", error);
        });
      } else if (!netInfo.isConnected && db) {
        // Disable Firestore network when offline
        disableNetwork(db).then(() => {
          console.log("Firestore network disabled");
        }).catch((error) => {
          console.error("Error disabling Firestore network:", error);
        });

        // Show alert when connection is lost
        Alert.alert(
          "Connection Lost",
          "You are now offline. Messages will be saved locally until connection is restored."
        );
      }
    }
  }, [netInfo.isConnected]);

  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
        >
          <Stack.Screen
            name="Start"
            component={Start}
          />
          <Stack.Screen
            name="Chat"
          >
            {props => (
              <Chat
                {...props}
                isConnected={netInfo.isConnected}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </ActionSheetProvider>
  );
}

export default App;