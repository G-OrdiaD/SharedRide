import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, topUpWallet } from '../features/walletSlice';

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
    <div className="wallet-container">
      <div className="balance-card">
        <div className="balance-label">Wallet Balance</div>
        <div className="balance-amount">£{balance.toFixed(2)}</div>
        <div className="usdt-balance">≈ {usdtBalance.toFixed(2)} USDT</div>
      </div>

      <div className="wallet-section">
        <div className="section-title">Top Up Wallet</div>
        
        <div className="quick-amounts">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              className="amount-button"
              onClick={() => setTopUpAmount(amount.toString())}
            >
              <span className="amount-text">£{amount}</span>
            </button>
          ))}
        </div>

        <input
          className="amount-input"
          type="number"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
          placeholder="Enter amount"
        />

        <div className="payment-methods">
          {['card', 'crypto_wallet'].map(method => (
            <button
              key={method}
              className={`method-button ${selectedMethod === method ? 'method-button-selected' : ''}`}
              onClick={() => setSelectedMethod(method)}
            >
              <span className="method-text">
                {method === 'card' ? '💳 Credit Card' : '₿ Crypto Wallet'}
              </span>
            </button>
          ))}
        </div>

        <button className="top-up-button" onClick={handleTopUp}>
          <span className="top-up-button-text">Top Up</span>
        </button>
      </div>

      <div className="wallet-section">
        <div className="section-title">Payment Methods</div>
        <div className="payment-options">
          <div className="payment-option">
            <span>💳 Credit/Debit Card</span>
          </div>
          <div className="payment-option">
            <span>₿ Crypto Wallet</span>
          </div>
          <div className="payment-option">
            <span>💵 Cash</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerWallet;