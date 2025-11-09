import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen  from './screens/EditProfile';
import JustifyScreen from './screens/JustScreen' ;
import HelpScreen from './screens/HelpScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';

import { AuthProvider, useAuth } from './providers/AuthProvider';

const Stack = createNativeStackNavigator();

function Routes() {
  const { session } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ReportScreen" component={ReportScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="JustScreen" component={JustifyScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Forgot" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Routes />
      </NavigationContainer>
    </AuthProvider>
  );
}
