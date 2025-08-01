import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginThunk, register } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom'; 

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Controls if Register or Sign In form is shown
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState(null); // Used for displaying success/error messages
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let resultAction; 

    try {
      if (isRegistering) {
        // --- REGISTRATION LOGIC ---
        resultAction = await dispatch(register({ name, email, password, phone, isDriver }));
        
        if (register.fulfilled.match(resultAction)) {
          // FIX: Show success message and switch to Sign In form, DO NOT navigate automatically
          setRegistrationStatus({ success: true, message: 'Registration successful! Please sign in.' });
          setName('');
          setEmail('');
          setPassword('');
          setPhone('');
          setIsDriver(false);
          setIsRegistering(false); // Automatically switch to the Sign In form
          
          // Removed automatic navigation here. User will now manually sign in.
        } else {
          // Handle registration rejection
          setRegistrationStatus({ 
            success: false, 
            message: resultAction.error.message || 'Registration failed' 
          });
        }
      } else { 
        // --- LOGIN LOGIC ---
        resultAction = await dispatch(loginThunk({ email, password })); 
        
        if (loginThunk.fulfilled.match(resultAction)) {
          // Handle successful login: show message and then navigate
          setRegistrationStatus({ success: true, message: 'Login successful!' }); 
          
          // Navigate only on successful login
          if (resultAction.payload && resultAction.payload.role) {
            if (resultAction.payload.role === 'driver') {
              navigate('/driver');
            } else {
              navigate('/passenger');
            }
          }
        } else {
          // Handle login rejection
          setRegistrationStatus({
            success: false,
            message: resultAction.error.message || 'Login failed'
          });
        }
      }
    } catch (error) {
      // This catch block handles unexpected errors during dispatch or API call
      setRegistrationStatus({ success: false, message: error.message || 'An unexpected error occurred' });
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