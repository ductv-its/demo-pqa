import { useState } from 'react';
import { FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';
import CryptoJS from 'crypto-js';

// eslint-disable-next-line react/prop-types
const WalletModal = ({ isOpen, onClose, walletAddress, privateKey }) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const decodePrivateKey = CryptoJS.AES.decrypt(privateKey, secretKey).toString(
    CryptoJS.enc.Utf8,
  );
  const handleCopy = () => {
    navigator.clipboard.writeText(decodePrivateKey);
    alert('Private key copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
        <h2 className="text-xl font-bold mb-4">Wallet Details</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Wallet Address:</label>
          <p className="bg-gray-100 p-2 rounded-lg break-all">
            {walletAddress}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Private Key:</label>
          <div className="relative">
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={decodePrivateKey}
              readOnly
              className="bg-gray-100 p-2 rounded-lg w-full"
            />
            <button
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="absolute inset-y-0 right-0 px-3 py-2"
            >
              {showPrivateKey ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleCopy}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center"
          >
            <FaCopy className="mr-2" /> Copy Private Key
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 ease-in-out"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default WalletModal;
