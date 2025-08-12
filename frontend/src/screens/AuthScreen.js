import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../features/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('register') === 'true');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (authStatus === 'succeeded') {
      navigate(user?.role === 'driver' ? '/driver' : '/passenger');
    } else if (authStatus === 'failed') {
      // Check for the specific message and ignore it
      if (authError !== 'No token found') {
        setMessage({ type: 'error', text: authError || 'Authentication failed.' });
      }
      setLoading(false);
    } else if (authStatus === 'loading') {
      setLoading(true);
    }
  }, [authStatus, user, authError, navigate]);
  
  // This useEffect ensures the component's state updates when the URL search param changes.
  useEffect(() => {
    setIsRegister(searchParams.get('register') === 'true');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (isRegister) {
        await dispatch(register({ name, email, password, phone, isDriver })).unwrap();
      } else {
        await dispatch(login({ email, password })).unwrap();
      }
    } catch (error) {
      console.error('AuthScreen: Dispatch error caught:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 font-bold"
        >
          &larr; Home
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {isRegister ? 'Register' : 'Sign In'}
        </h2>

        {message && (
          <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Name:
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          {isRegister && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone:
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isDriver"
                  checked={isDriver}
                  onChange={(e) => setIsDriver(e.target.checked)}
                  className="mr-2 leading-tight"
                />
                <label className="text-gray-700 text-sm" htmlFor="isDriver">
                  Register as Driver
                </label>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          >
            {loading ? (isRegister ? 'Registering...' : 'Signing In...') : (isRegister ? 'Register' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isRegister ? 'Already have an account?' : 'Don\'t have an account?'}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-500 hover:text-blue-800 font-bold ml-2 focus:outline-none"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;