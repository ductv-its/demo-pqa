import FiatTokenController from '../controllers/fiatToken.controller';
import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';

export class FiatTokenRoute implements Routes {
  public path = '';
  public router = Router();
  public fiatTokenController = new FiatTokenController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/create-wallet`,
      this.fiatTokenController.createWallet,
    );
  }
}
