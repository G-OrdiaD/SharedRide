import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();

  const handleAuth = async () => {
    try {
      // API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      dispatch(login({ token: data.token, role: data.role }));
      
      if (data.role === 'passenger') {
        navigation.navigate('PassengerHome');
      } else {
        navigation.navigate('DriverHome');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />
      <Text style={styles.switchText} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Create new account' : 'Already have an account? Login'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 },
  switchText: { color: 'blue', textAlign: 'center', marginTop: 10 }
});

export default AuthScreen;