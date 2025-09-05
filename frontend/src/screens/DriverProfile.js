import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import { fetchRatings } from '../../features/ratingsSlice';

const DriverProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const { averageRating, feedbackList, isLoading } = useSelector((state) => state.ratings);
  const [profile, setProfile] = useState(null);
  const [editableFields, setEditableFields] = useState({
    phone: '',
    homeAddress: ''
  });

  useEffect(() => {
    if (user) {
      const mockDriverData = {
        vehicle: user.vehicle || {},
        licenseNumber: user.licenseNumber || '',
        homeAddress: '123 Driver Street, London',
        profilePicture: null,
        totalTrips: 147
      };

      setProfile(mockDriverData);
      setEditableFields({
        phone: user.phone,
        homeAddress: mockDriverData.homeAddress
      });
    }
  }, [user]);

  const handleSave = async () => {
    console.log('Saving:', editableFields);
  };

  if (!profile || !user) {
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
          {profile.profilePicture ? (
            <Image source={{ uri: profile.profilePicture }} className="avatar-image" />
          ) : (
            <View className="avatar-placeholder">
              <Text className="avatar-text">{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity className="upload-button">
            <Text className="upload-text">Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <Text className="user-name">{user.name}</Text>
        <Text className="driver-rating">⭐ {averageRating.toFixed(1)} • {profile.totalTrips} trips</Text>
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
          <Text className="field-value">{user.email}</Text>
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

        <View className="field-group">
          <Text className="field-label">Home Address</Text>
          <TextInput
            className="editable-input"
            value={editableFields.homeAddress}
            onChangeText={(text) => setEditableFields({ ...editableFields, homeAddress: text })}
            multiline
          />
        </View>
      </View>

      <View className="profile-section">
        <Text className="section-title">Driver Information</Text>
        
        <View className="field-group">
          <Text className="field-label">License Number</Text>
          <Text className="field-value">{profile.licenseNumber}</Text>
          <Text className="field-note">Cannot be changed</Text>
        </View>

        <View className="field-group">
          <Text className="field-label">Vehicle Make</Text>
          <Text className="field-value">{profile.vehicle.make || 'Not set'}</Text>
        </View>

        <View className="field-group">
          <Text className="field-label">Vehicle Model</Text>
          <Text className="field-value">{profile.vehicle.model || 'Not set'}</Text>
        </View>

        <View className="field-group">
          <Text className="field-label">License Plate</Text>
          <Text className="field-value">{profile.vehicle.licensePlate || 'Not set'}</Text>
        </View>

        <View className="field-group">
          <Text className="field-label">Vehicle Color</Text>
          <Text className="field-value">{profile.vehicle.color || 'Not set'}</Text>
        </View>
      </View>

      <View className="profile-section">
        <Text className="section-title">Ratings & Feedback</Text>
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

export default DriverProfile;