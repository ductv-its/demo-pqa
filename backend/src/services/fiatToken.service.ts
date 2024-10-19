import { ethers } from 'ethers';
import { HttpException } from '../utils/HttpException';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import FiatToken from '../contract/FiatToken.json';
dotenv.config();

class FiatTokenService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contractAddress: string;
  private fiatToken: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.INFURA_API_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
    this.fiatToken = new ethers.Contract(
      this.contractAddress,
      FiatToken.abi,
      this.wallet,
    );
  }

  public async createWallet(): Promise<{
    walletAddress: string;
    privateKey: string;
  }> {
    try {
      const newWallet = ethers.Wallet.createRandom();
      const privateKey = CryptoJS.AES.encrypt(
        newWallet.privateKey,
        process.env.SECRET_KEY,
      ).toString();
      return {
        walletAddress: newWallet.address,
        privateKey,
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new HttpException(500, 'Wallet creation failed');
    }
  }
}

export default FiatTokenService;
