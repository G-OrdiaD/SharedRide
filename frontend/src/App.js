import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './store';
import AuthScreen from './screens/AuthScreen';
import PassengerHomeScreen from './screens/PassengerHomeScreen';
import DriverHomeScreen from './screens/DriverHomeScreen';
import RideScreen from './screens/RideScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="PassengerHome" component={PassengerHomeScreen} />
          <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
          <Stack.Screen name="Ride" component={RideScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}