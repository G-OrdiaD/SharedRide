import { useState } from 'react';
import PassengerRegisterForm from '../components/auth/PassengerRegisterForm';
import DriverRegisterForm from '../components/auth/DriverRegisterForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('passenger');

  return (
    <div className="auth-page min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

        {/* TAB NAVIGATION */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeTab === 'passenger'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('passenger')}
          >
            Passenger
          </button>
          <button
            className={`px-4 py-2 rounded-md font-semibold transition ${
              activeTab === 'driver'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveTab('driver')}
          >
            Driver
          </button>
        </div>

        {/* FORM CONTAINER */}
        <div>
          {activeTab === 'passenger' && <PassengerRegisterForm />}
          {activeTab === 'driver' && <DriverRegisterForm />}
        </div>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
