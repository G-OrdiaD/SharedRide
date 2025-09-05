import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { fetchRatings } from '../../features/ratingsSlice';

const PassengerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { averageRating, feedbackList, isLoading } = useSelector((state) => state.ratings);
  const [editableFields, setEditableFields] = useState({
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setEditableFields({
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    console.log('Saving passenger profile:', editableFields);
  };

  if (!user) {
    return (
      <View className="loading-container">
        <ActivityIndicator size="large" />
        <Text className="loading-text">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="profile-container">
      <View className="profile-header">
        <View className="avatar-container">
          <View className="avatar-placeholder">
            <Text className="avatar-text">{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <TouchableOpacity className="upload-button">
            <Text className="upload-text">Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <Text className="user-name">{user.name}</Text>
        <Text className="user-rating">⭐ {averageRating.toFixed(1)}</Text>
      </View>

      <View className="profile-section">
        <Text className="section-title">Personal Information</Text>
        
        <View className="field-group">
          <Text className="field-label">Full Name</Text>
          <Text className="field-value">{user.name}</Text>
          <Text className="field-note">Cannot be changed</Text>
        </View>

        <View className="field-group">
          <Text className="field-label">Email</Text>
          <TextInput
            className="editable-input"
            value={editableFields.email}
            onChangeText={(text) => setEditableFields({ ...editableFields, email: text })}
            keyboardType="email-address"
          />
        </View>

        <View className="field-group">
          <Text className="field-label">Phone Number</Text>
          <TextInput
            className="editable-input"
            value={editableFields.phone}
            onChangeText={(text) => setEditableFields({ ...editableFields, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View className="profile-section">
        <Text className="section-title">Ratings from Drivers</Text>
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          feedbackList.map((feedback, index) => (
            <View key={index} className="feedback-item">
              <Text className="feedback-rating">⭐ {feedback.score}</Text>
              {feedback.feedback && <Text className="feedback-text">"{feedback.feedback}"</Text>}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity className="save-button" onPress={handleSave}>
        <Text className="save-button-text">Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PassengerProfile;