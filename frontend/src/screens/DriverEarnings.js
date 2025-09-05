import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarnings } from '../features/earningsSlice';

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
      <div className="loading-container">
        <div>Loading...</div>
        <div className="loading-text">Loading earnings data...</div>
      </div>
    );
  }

  return (
    <div className="earnings-container">
      <div className="earnings-header">
        <div className="earnings-title">Earnings Dashboard</div>
      </div>

      <div className="earnings-card">
        <div className="card-title">Today's Earnings</div>
        <div className="earnings-amount">£{today.toFixed(2)}</div>
        <div className="usdt-amount">≈ {usdtEarnings.today.toFixed(2)} USDT</div>
      </div>

      <div className="earnings-card">
        <div className="card-title">Total Earnings</div>
        <div className="earnings-amount total">£{total.toFixed(2)}</div>
        <div className="usdt-amount">≈ {usdtEarnings.total.toFixed(2)} USDT</div>
      </div>

      <div className="summary-card">
        <div className="summary-title">Earnings Summary</div>
        <div className="summary-row">
          <div className="summary-label">Completed Rides Today:</div>
          <div className="summary-value">{(today / 15).toFixed(0)}</div>
        </div>
        <div className="summary-row">
          <div className="summary-label">Average per Ride:</div>
          <div className="summary-value">£{(today / (today / 15 || 1)).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;