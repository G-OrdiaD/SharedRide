import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/authSlice';
import { fetchWallet, topUpWallet } from '../features/walletSlice';
import CustomAlertDialog from '../components/CustomAlertDialog';

const PassengerWallet = () => {
  const user = useSelector(state => state.auth.user);
  const isAuthReady = useSelector(state => state.auth.status !== 'idle');
  const { balance, isLoading } = useSelector(state => state.wallet);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [usdtBalance, setUsdtBalance] = useState(0);

  useEffect(() => {
    if (isAuthReady && (!user || user.role !== 'passenger')) navigate('/');
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  useEffect(() => {
    setUsdtBalance(balance * 1.2);
  }, [balance]);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };
  const handleGoHome = () => navigate('/passenger');
  const handleGoToProfile = () => navigate('/passenger/profile');

  const handleTopUp = async () => {
    if (topUpAmount && parseFloat(topUpAmount) > 0) {
      try {
        await dispatch(topUpWallet({
          amount: parseFloat(topUpAmount),
          paymentMethod: selectedMethod
        })).unwrap();
        
        setAlertMessage('Topup complete');
        setShowAlert(true);
        setTopUpAmount('');
      } catch (error) {
        setAlertMessage('Topup failed');
        setShowAlert(true);
      }
    }
  };

  const quickAmounts = [10, 20, 50, 100];

  if (!user || user.role !== 'passenger') return <p>Redirecting to login...</p>;

  return (
    <div className="min-h-screen bg-silver flex flex-col items-center p-4 font-modern">
      
      {/* Blue Header Rectangle */}
      <div style={{backgroundColor: '#1E40AF', width: '100%', padding: '0.75rem 1.5rem', marginBottom: '1.5rem'}}>
        <div style={{maxWidth: '28rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '0.5rem'}}>
          <button
            onClick={handleGoHome}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Home
          </button>
          <button
            onClick={() => navigate('/passenger/wallet')}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Wallet
          </button>
          <button
            onClick={handleGoToProfile}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            style={{backgroundColor: '#ADD8E6', color: 'white', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', flex: 1}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1E3A8A'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ADD8E6'}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          
          {/* Wallet Balance */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Wallet Balance</h2>
            <div className="text-4xl font-bold text-green-600 mb-1">£{balance.toFixed(2)}</div>
            <div className="text-gray-600">≈ {usdtBalance.toFixed(2)} USDT</div>
          </div>

          {/* Top Up Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Top Up Wallet</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setTopUpAmount(amount.toString())}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
                >
                  £{amount}
                </button>
              ))}
            </div>

            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-center text-lg"
            />

            <div className="flex gap-2 mb-4">
              {['card', 'crypto_wallet'].map(method => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`flex-1 px-4 py-2 rounded-md ${
                    selectedMethod === method 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {method === 'card' ? '💳 Card' : '₿ Crypto'}
                </button>
              ))}
            </div>

            <button 
              onClick={handleTopUp}
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              Top Up
            </button>
          </div>

        </div>
      </div>

      {showAlert && <CustomAlertDialog message={alertMessage} onClose={() => setShowAlert(false)} />}
    </div>
  );
};

export default PassengerWallet;