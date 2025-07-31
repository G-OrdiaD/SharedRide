import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../features/authSlice';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, isDriver }));
  };

  return (
    <div className="auth-screen">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
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
            I'm a driver
          </label>
        </div>
        
        <button type="submit" className="submit-btn">Sign In</button>
      </form>
    </div>
  );
};

export default AuthScreen;