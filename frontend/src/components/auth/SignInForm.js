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
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="form-checkbox">
        <label>
          <input
            type="checkbox"
            checked={isDriver}
            onChange={() => setIsDriver(!isDriver)}
          />
          I'm a driver
        </label>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <button type="submit">Sign In</button>
    </form>
  );
}