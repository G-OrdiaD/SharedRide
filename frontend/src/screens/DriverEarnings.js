import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarnings } from '../../features/earningsSlice';

const DriverEarnings = () => {
  const dispatch = useDispatch();
  const { today, total, isLoading } = useSelector((state) => state.earnings);
  const [usdtEarnings, setUsdtEarnings] = useState({ today: 0, total: 0 });

  useEffect(() => {
    dispatch(fetchEarnings());
  }, [dispatch]);

  useEffect(() => {
    const conversionRate = 1.2;
    setUsdtEarnings({
      today: today * conversionRate,
      total: total * conversionRate
    });
  }, [today, total]);

  if (isLoading) {
    return (
      <View className="loading-container">
        <ActivityIndicator size="large" />
        <Text className="loading-text">Loading earnings data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="earnings-container">
      <View className="earnings-header">
        <Text className="earnings-title">Earnings Dashboard</Text>
      </View>

      <View className="earnings-card">
        <Text className="card-title">Today's Earnings</Text>
        <Text className="earnings-amount">£{today.toFixed(2)}</Text>
        <Text className="usdt-amount">≈ {usdtEarnings.today.toFixed(2)} USDT</Text>
      </View>

      <View className="earnings-card">
        <Text className="card-title">Total Earnings</Text>
        <Text className="earnings-amount total">£{total.toFixed(2)}</Text>
        <Text className="usdt-amount">≈ {usdtEarnings.total.toFixed(2)} USDT</Text>
      </View>

      <View className="summary-card">
        <Text className="summary-title">Earnings Summary</Text>
        <View className="summary-row">
          <Text className="summary-label">Completed Rides Today:</Text>
          <Text className="summary-value">{(today / 15).toFixed(0)}</Text>
        </View>
        <View className="summary-row">
          <Text className="summary-label">Average per Ride:</Text>
          <Text className="summary-value">£{(today / (today / 15 || 1)).toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DriverEarnings;