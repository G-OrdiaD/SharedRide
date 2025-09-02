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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">

        {/* Home Button */}
        <button
          onClick={handleHomeClick}
          className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 font-bold"
        >
          &larr; Home
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {isRegister ? 'Register' : 'Login'}
        </h2>

        {message && (
          <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
          </div>

          {isRegister && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Register as:</label>
                <select name="role" value={formData.role} onChange={handleChange} className="shadow border rounded w-full py-2 px-3">
                  <option value="passenger">Passenger</option>
                  <option value="driver">Driver</option>
                </select>
              </div>

              {formData.role === 'driver' && (
                <div className="space-y-2 mb-4">
                  <input type="text" name="licenseNumber" placeholder="Driver License Number" value={formData.licenseNumber} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
                  <input type="text" name="vehicleMake" placeholder="Vehicle Make" value={formData.vehicleMake} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
                  <input type="text" name="vehicleModel" placeholder="Vehicle Model" value={formData.vehicleModel} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
                  <input type="text" name="vehiclePlate" placeholder="License Plate" value={formData.vehiclePlate} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
                  <input type="text" name="vehicleColor" placeholder="Vehicle Color" value={formData.vehicleColor} onChange={handleChange} className="shadow border rounded w-full py-2 px-3" required />
                </div>
              )}
            </>
          )}

          <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4">
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-500 hover:underline font-bold">
            {isRegister ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}