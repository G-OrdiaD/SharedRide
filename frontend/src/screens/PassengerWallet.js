import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, topUpWallet } from '../../features/walletSlice';

const PassengerWallet = () => {
  const dispatch = useDispatch();
  const { balance, isLoading } = useSelector((state) => state.wallet);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [usdtBalance, setUsdtBalance] = useState(0);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    setUsdtBalance(balance * 1.2);
  }, [balance]);

  const handleTopUp = async () => {
    if (topUpAmount && parseFloat(topUpAmount) > 0) {
      await dispatch(topUpWallet({
        amount: parseFloat(topUpAmount),
        paymentMethod: selectedMethod
      }));
      setTopUpAmount('');
    }
  };

  const quickAmounts = [10, 20, 50, 100];

  return (
    <ScrollView className="wallet-container">
      <View className="balance-card">
        <Text className="balance-label">Wallet Balance</Text>
        <Text className="balance-amount">£{balance.toFixed(2)}</Text>
        <Text className="usdt-balance">≈ {usdtBalance.toFixed(2)} USDT</Text>
      </View>

      <View className="wallet-section">
        <Text className="section-title">Top Up Wallet</Text>
        
        <View className="quick-amounts">
          {quickAmounts.map(amount => (
            <TouchableOpacity
              key={amount}
              className="amount-button"
              onPress={() => setTopUpAmount(amount.toString())}
            >
              <Text className="amount-text">£{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          className="amount-input"
          value={topUpAmount}
          onChangeText={setTopUpAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />

        <View className="payment-methods">
          {['card', 'crypto_wallet'].map(method => (
            <TouchableOpacity
              key={method}
              className={`method-button ${selectedMethod === method ? 'method-button-selected' : ''}`}
              onPress={() => setSelectedMethod(method)}
            >
              <Text className="method-text">
                {method === 'card' ? '💳 Credit Card' : '₿ Crypto Wallet'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="top-up-button" onPress={handleTopUp}>
          <Text className="top-up-button-text">Top Up</Text>
        </TouchableOpacity>
      </View>

      <View className="wallet-section">
        <Text className="section-title">Payment Methods</Text>
        <View className="payment-options">
          <View className="payment-option">
            <Text>💳 Credit/Debit Card</Text>
          </View>
          <View className="payment-option">
            <Text>₿ Crypto Wallet</Text>
          </View>
          <View className="payment-option">
            <Text>💵 Cash</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PassengerWallet;