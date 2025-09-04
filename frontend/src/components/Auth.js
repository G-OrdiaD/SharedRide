import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const user = useSelector((state) => state.auth.user);

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'passenger',
    licenseNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleColor: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (authStatus === 'succeeded' && user) {
      navigate(user.role === 'driver' ? '/driver' : '/passenger');
    } else if (authStatus === 'failed') {
      if (authError !== 'No token found') {
        setMessage({ type: 'error', text: authError || 'Authentication failed.' });
      }
      setLoading(false);
    } else if (authStatus === 'loading') {
      setLoading(true);
    }
  }, [authStatus, user, authError, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        const requestData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        };
        if (formData.role === 'driver') {
          requestData.licenseNumber = formData.licenseNumber;
          requestData.vehicle = {
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            licensePlate: formData.vehiclePlate,
            color: formData.vehicleColor
          };
        }
        await dispatch(register(requestData)).unwrap();
      } else {
        await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => navigate('/');

  return (
    <div className="auth-page">
      {/* Blue header rectangle for the whole page */}
      <div className="auth-header">
        <button
          onClick={handleHomeClick}
          className="auth-home-btn"
        >
          Home
        </button>
      </div>

      {/* Centered form container */}
      <div className="auth-container">
        <div className="auth-form">
          <h2>{isRegister ? 'Register' : 'Login'}</h2>

          {message && (
            <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={loading ? 'loading' : ''}>
            {isRegister && (
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            )}

            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>

            {isRegister && (
              <>
                <div className="form-group">
                  <label>Phone:</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Register as:</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>

                {formData.role === 'driver' && (
                  <>
                    <div className="form-group">
                      <label>Driver License Number:</label>
                      <input 
                        type="text" 
                        name="licenseNumber" 
                        value={formData.licenseNumber} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Vehicle Make:</label>
                      <input 
                        type="text" 
                        name="vehicleMake" 
                        value={formData.vehicleMake} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Vehicle Model:</label>
                      <input 
                        type="text" 
                        name="vehicleModel" 
                        value={formData.vehicleModel} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>License Plate:</label>
                      <input 
                        type="text" 
                        name="vehiclePlate" 
                        value={formData.vehiclePlate} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Vehicle Color:</label>
                      <input 
                        type="text" 
                        name="vehicleColor" 
                        value={formData.vehicleColor} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-light-blue"
            >
              {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
            </button>
          </form>

          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="btn-auth-toggle"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}