import { useState } from 'react';
import { authService } from '../../api/api';
import { useNavigate } from 'react-router-dom';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'passenger', // Default role
    // Driver-specific fields (conditionally shown)
    licenseNumber: '',
    vehicleInfo: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare data for backend
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      };

      // Add driver-specific fields if applicable
      if (formData.role === 'driver') {
        requestData.licenseNumber = formData.licenseNumber;
        requestData.vehicleInfo = formData.vehicleInfo;
      }

      const response = await authService.register(requestData);
      
      if (response.success) {
        navigate('/dashboard'); // Or role-specific dashboard
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Create Account</h2>
      
      {/* Basic Fields */}
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
      </div>
      
      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
      
      {/* Role Selection */}
      <div className="form-group role-selection">
        <label>Register as:</label>
        <div className="role-options">
          <label>
            <input
              type="radio"
              name="role"
              value="passenger"
              checked={formData.role === 'passenger'}
              onChange={handleChange}
            />
            Passenger
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="driver"
              checked={formData.role === 'driver'}
              onChange={handleChange}
            />
            Driver
          </label>
        </div>
      </div>
      
      {/* Conditional Driver Fields */}
      {formData.role === 'driver' && (
        <>
          <div className="form-group">
            <label>Driver License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required={formData.role === 'driver'}
            />
          </div>
          
          <div className="form-group">
            <label>Vehicle Information</label>
            <input
              type="text"
              name="vehicleInfo"
              value={formData.vehicleInfo}
              onChange={handleChange}
              placeholder="Make, Model, Year, Color"
              required={formData.role === 'driver'}
            />
          </div>
        </>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="submit-btn"
      >
        {isSubmitting ? 'Registering...' : 'Create Account'}
      </button>
    </form>
  );
}