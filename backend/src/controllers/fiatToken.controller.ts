import { Request, Response, NextFunction } from 'express';
import verifySignature from '../utils/verifySignature';
import { HttpException } from '../utils/HttpException';
import FiatTokenService from '../services/fiatToken.service';
import isValidEthereumAddress from './../utils/validateAddress';

export default class FiatTokenController {
  private fiatTokenService = new FiatTokenService();

  public createWallet = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.fiatTokenService.createWallet();
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
