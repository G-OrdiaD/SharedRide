import { useState } from 'react';
import { authService } from '../../api/api';
import { useAuth } from '../../hooks/useAuth';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        login({ ...response.data, isDriver });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto flex flex-col items-center font-modern">

      <div className="form-group w-full mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full py-3 px-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon transition-all"
        />
      </div>

      <div className="form-group w-full mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full py-3 px-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon transition-all"
        />
      </div>

      <div className="form-checkbox w-full mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDriver}
            onChange={() => setIsDriver(!isDriver)}
            className="h-4 w-4 accent-maroon"
          />
          I'm a driver
        </label>
      </div>

      {error && (
        <div className="w-full mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="bg-maroon hover:bg-maroon-dark text-white font-bold py-3 px-6 rounded w-full transition-all shadow-md hover:shadow-lg"
      >
        Sign In
      </button>
    </form>
  );
}