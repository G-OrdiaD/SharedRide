import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SignInForm from '../components/auth/SignInForm';
import RegisterForm from '../components/auth/RegisterForm';
import './AuthPage.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [userType, setUserType] = useState('passenger');
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button
          className={activeTab === 'signin' ? 'active' : ''}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={activeTab === 'register' ? 'active' : ''}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
      </div>
      
      <div className="user-type-toggle">
        <button
          className={userType === 'passenger' ? 'active' : ''}
          onClick={() => setUserType('passenger')}
        >
          Passenger
        </button>
        <button
          className={userType === 'driver' ? 'active' : ''}
          onClick={() => setUserType('driver')}
        >
          Driver
        </button>
      </div>
      
      <div className="auth-form">
        {activeTab === 'signin' ? (
          <SignInForm defaultUserType={userType} />
        ) : (
          <RegisterForm userType={userType} />
        )}
      </div>
    </div>
  );
}