import React from 'react';

const CustomAlertDialog = ({ message, onClose }) => {
    if (!message) return null; // Don't render if there's no message

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full relative">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Notification</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default CustomAlertDialog;