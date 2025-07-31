import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import RideRequestModal from '../components/RideRequestModal';

const PassengerHomeScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        <Marker coordinate={region} />
      </MapView>
      
      <Button title="Request Ride" onPress={() => setModalVisible(true)} />
      
      <RideRequestModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onRequest={(rideDetails) => {
          setModalVisible(false);
          navigation.navigate('Ride', rideDetails);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
});

export default PassengerHomeScreen;