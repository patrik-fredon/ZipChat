import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Logování příchozího požadavku
  logger.http(`${req.method} ${req.url}`);

  // Zachycení odpovědi
  const originalSend = res.send;
  res.send = function (body) {
    // Logování odpovědi
    logger.http(`Response ${res.statusCode} ${req.method} ${req.url}`);
    return originalSend.call(this, body);
  };

  next();
};

export default loggerMiddleware; 