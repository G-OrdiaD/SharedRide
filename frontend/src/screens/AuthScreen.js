import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login, register } from '../features/authSlice';
import { Link } from 'react-router-dom';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const resultAction = await dispatch(register({ name, email, password, phone, isDriver }));
        if (register.fulfilled.match(resultAction)) {
          setRegistrationStatus({ success: true, message: 'Registration successful!' });
          setName('');
          setEmail('');
          setPassword('');
          setPhone('');
          setIsDriver(false);
        } else {
          setRegistrationStatus({ 
            success: false, 
            message: resultAction.error.message || 'Registration failed' 
          });
        }
      } else {
        await dispatch(login({ email, isDriver }));
      }
    } catch (error) {
      setRegistrationStatus({ success: false, message: error.message || 'An error occurred' });
    }
  };

  return (
    <div className="auth-screen">
      <h2>{isRegistering ? 'Register' : 'Sign In'}</h2>
      
      {registrationStatus && (
        <div className={`status-message ${registrationStatus.success ? 'success' : 'error'}`}>
          {registrationStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </>
        )}
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={isDriver}
              onChange={(e) => setIsDriver(e.target.checked)}
            />
            I'm a Driver
          </label>
        </div>
        
        <button type="submit" className="submit-btn">
          {isRegistering ? 'Register' : 'Sign In'}
        </button>
      </form>

      <div className="auth-toggle">
        {isRegistering ? (
          <p>
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={() => {
                setIsRegistering(false);
                setRegistrationStatus(null); // Clear status when toggling
              }}
              className="toggle-btn"
            >
              Sign In
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={() => {
                setIsRegistering(true);
                setRegistrationStatus(null); // Clear status when toggling
              }}
              className="toggle-btn"
            >
              Register
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;