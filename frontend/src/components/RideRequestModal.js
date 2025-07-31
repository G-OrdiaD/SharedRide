import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Button, Picker } from 'react-native';

const RideRequestModal = ({ visible, onClose, onRequest }) => {
  const [rideType, setRideType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleRequest = () => {
    onRequest({ rideType, paymentMethod });
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Request a Ride</Text>
        
        <Text>Ride Type:</Text>
        <Picker
          selectedValue={rideType}
          onValueChange={(itemValue) => setRideType(itemValue)}
        >
          <Picker.Item label="Standard" value="standard" />
          <Picker.Item label="Pool" value="pool" />
          <Picker.Item label="Luxury" value="luxury" />
        </Picker>
        
        <Text>Payment Method:</Text>
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(itemValue) => setPaymentMethod(itemValue)}
        >
          <Picker.Item label="Credit Card" value="credit_card" />
          <Picker.Item label="Wallet" value="wallet" />
          <Picker.Item label="Cash" value="cash" />
        </Picker>
        
        <View style={styles.buttonContainer}>
          <Button title="Cancel" onPress={onClose} color="gray" />
          <Button title="Request" onPress={handleRequest} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 20
  }
});

export default RideRequestModal;