import express from 'express';
import ApiErrors from "../utils/apiErrors";
import {CustomErrors} from '../interfaces/customErrors.interface';

const devErrors = (err: CustomErrors, res: express.Response) =>
  res.status(err.statusCode!).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack
  });

const prodErrors = (err: CustomErrors, res: express.Response) =>
  res.status(err.statusCode!).json({
    status: err.status,
    message: err.message
  });

const handleJwtExpired = (message: string) => new ApiErrors(message, 401);

const globalErrors = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') err = handleJwtExpired(`${req.__('session_expired')}`);
    devErrors(err, res);
  } else {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') err = handleJwtExpired(`${req.__('session_expired')}`);
    prodErrors(err, res);
  }
};

export default globalErrors;