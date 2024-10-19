// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { FaWallet, FaPlus, FaCoins, FaFire } from 'react-icons/fa';
import { ethers } from 'ethers';
import FiatToken from './contract/FiatToken.json';
import formatAddress from './utils/formatAddress';
import LoadingModal from './LoadingModal';
import toast from 'react-hot-toast';
import axios from 'axios';
import WalletModal from './WalletModal';

const App = () => {
  const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS;
  const [activeTab, setActiveTab] = useState('mint');
  const [hasAccount, setHasAccount] = useState(false);
  const [mintAmount, setMintAmount] = useState(0);
  const [burnAmount, setBurnAmount] = useState(0);
  const [balance, setBalance] = useState({});
  const [account, setAccount] = useState('');
  const sepoliaChainId = '0xaa36a7';
  // eslint-disable-next-line no-unused-vars
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletModal, setWalletModal] = useState({
    isOpen: false,
    walletAddress: '',
    privateKey: '',
  });

  const checkMetaMaskInstalled = () => typeof window.ethereum !== 'undefined';

  const initProviderAndContract = async () => {
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);

      const signer = await _provider.getSigner();

      const _contract = new ethers.Contract(
        treasuryAddress,
        FiatToken.abi,
        signer,
      );
      setContract(_contract);
    } catch (error) {
      console.error('Error initializing contract:', error);
      toast.error('Error initializing contract. Please try again.');
    }
  };

  const getContractBalance = async (address) => {
    try {
      if (!contract) return;
      const balance = await contract.balanceOf(address);
      return Number(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error('Error getting balance:', error);
      toast('Error fetching balance from contract.');
    }
  };

  const handleMint = async () => {
    setLoading(true);
    try {
      console.log('mintAmount', mintAmount);
      const tx = await contract.mint(mintAmount, {
        gasLimit: 1000000,
      });
      await tx.wait();

      toast.success('Tokens minted successfully!');
      setMintAmount(0);

      // Refresh balances
      await updateBalances();
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error(error.message || 'Error minting tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    setLoading(true);
    try {
      if (!contract || !account) return;

      const tx = await contract.burn(burnAmount, {
        gasLimit: 1000000,
      });
      await tx.wait();

      toast.success('Tokens burned successfully!');
      setBurnAmount(0);

      // Refresh balances
      await updateBalances();
    } catch (error) {
      console.error('Error burning tokens:', error);
      toast.error(error.message || 'Error burning tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async () => {
    setLoading(true);
    try {
      const tx = await contract.collectUSDC();
      await tx.wait();

      toast.success('Tokens collected successfully!');

      // Refresh balances
      await updateBalances();
    } catch (error) {
      console.error('Error collecting tokens:', error);
      toast.error(
        error.message || 'Error collecting tokens. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateBalances = async () => {
    setLoading(true);
    if (treasuryAddress) {
      const treasuryBalance = await getContractBalance(treasuryAddress);
      setBalance((prev) => ({ ...prev, [treasuryAddress]: treasuryBalance }));
    }
    if (account) {
      const accountBalance = await getContractBalance(account);
      setBalance((prev) => ({ ...prev, [account]: accountBalance }));
    }
    setLoading(false);
  };

  const createNewWallet = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/create-wallet');
      setWalletModal({
        isOpen: true,
        walletAddress: response.data.walletAddress,
        privateKey: response.data.privateKey,
      });
    } catch (error) {
      toast.error('Error creating wallet: ' + error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const requestAccount = async () => {
    if (!checkMetaMaskInstalled()) {
      toast.error('Please install MetaMask to use this app.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setHasAccount(true);

        await initProviderAndContract();
      } else {
        toast.error(
          'No accounts found. Please make sure you are logged into MetaMask.',
        );
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      toast.error('Error connecting to MetaMask. Please try again.');
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: sepoliaChainId,
                chainName: 'Sepolia',
                rpcUrls: [
                  'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
                ],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding the Sepolia network:', addError);
          toast.error('Error adding the Sepolia network. Please try again.');
        }
      } else {
        console.error('Error switching to Sepolia:', error);
        toast.error('Error switching to Sepolia. Please try again.');
      }
    }
  };

  const checkNetworkAndConnect = async () => {
    if (!checkMetaMaskInstalled()) {
      toast.error('Please install MetaMask to use this app.');
      return;
    }

    const { chainId } = await window.ethereum.request({
      method: 'eth_chainId',
    });

    if (chainId !== sepoliaChainId) {
      toast.error(
        'You are not connected to the Sepolia network. Switching now...',
      );
      await switchToSepolia();
    } else {
      await requestAccount();
    }
  };

  const handleDisconnect = () => {
    setHasAccount(false);
    setAccount('');
    setContract(null);
    setProvider(null);
  };

  useEffect(() => {
    checkNetworkAndConnect();
  }, []);

  useEffect(() => {
    if (hasAccount) {
      updateBalances();
    }
  }, [hasAccount, contract]);

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setHasAccount(true);
        initProviderAndContract();
      } else {
        setHasAccount(false);
        toast.error(
          'No accounts found. Please make sure you are logged into MetaMask.',
        );
      }
    };

    if (checkMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (checkMetaMaskInstalled()) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged,
        );
      }
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-10 lg:p-36">
      <div className="w-full lg:w-1/3 p-10 bg-white shadow-lg rounded-lg mb-4 lg:mb-0 lg:mr-4">
        <div className="mb-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 flex items-center">
            <FaWallet className="mr-2" /> Treasury Wallet
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">
            Current Balance: {balance[treasuryAddress] || 0} USDC
          </p>
          <p className="text-gray-600 truncate text-sm lg:text-base">
            Wallet Address: {formatAddress(treasuryAddress)}
          </p>
        </div>
        <div>
          <h3 className="text-lg lg:text-xl font-semibold mb-4">
            Account Management
          </h3>
          {!hasAccount ? (
            <div>
              <button
                onClick={createNewWallet}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300 ease-in-out w-full mb-2"
                aria-label="Create New Wallet"
              >
                Create New Wallet
              </button>
              <button
                onClick={requestAccount}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out w-full"
                aria-label="Connect with MetaMask"
              >
                <p className="inline-block mr-2">Connect with MetaMask</p>
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 text-sm lg:text-base">
                Account: {formatAddress(account)}
              </p>
              <p className="text-gray-600 text-sm lg:text-base">
                Balance: {balance[account] || 0} USDC
              </p>
              <button
                onClick={handleDisconnect}
                className="bg-gray-300 text-white px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-300 ease-in-out w-full mt-4"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-2/3 p-10 bg-white shadow-lg rounded-lg">
        <div className="mb-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-4">
            Token Management
          </h2>
          <nav className="flex space-x-4 mb-4">
            {['mint', 'collection', 'burn'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition duration-300 ease-in-out ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'mint' && (
            <div id="mint-panel">
              <h3 className="text-lg font-semibold mb-2">Mint Tokens</h3>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Amount to Mint"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4"
              />
              <button
                onClick={handleMint}
                disabled={!hasAccount || !mintAmount}
                className={`px-4 py-2 rounded-lg transition duration-300 ease-in-out flex items-center min-w-[150px] ${
                  !hasAccount || !mintAmount
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                <FaPlus className="mr-2 inline" /> Mint
              </button>
            </div>
          )}

          {activeTab === 'collection' && (
            <div id="collection-panel" className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Collect Tokens</h3>
              <button
                onClick={handleCollect}
                disabled={!hasAccount}
                className={`px-4 py-2 rounded-lg transition duration-300 ease-in-out flex items-center min-w-[150px] ${
                  !hasAccount
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                } text-white`}
              >
                <FaCoins className="mr-2" /> <span>Collect</span>
              </button>
            </div>
          )}

          {activeTab === 'burn' && (
            <div id="burn-panel" className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Burn Tokens</h3>
              <input
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="Amount to Burn"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4"
              />
              <button
                onClick={handleBurn}
                disabled={!hasAccount || !burnAmount}
                className={`px-4 py-2 rounded-lg transition duration-300 ease-in-out flex items-center min-w-[150px] ${
                  !hasAccount || !burnAmount
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                <FaFire className="mr-2" /> Burn
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingModal />}
      <WalletModal
        isOpen={walletModal.isOpen}
        onClose={() => {
          setWalletModal((prevState) => ({
            ...prevState,
            isOpen: false,
          }));
        }}
        walletAddress={walletModal.walletAddress}
        privateKey={walletModal.privateKey}
      ></WalletModal>
    </div>
  );
};

export default App;
