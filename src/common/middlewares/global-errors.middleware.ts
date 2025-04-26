import express from 'express';
import ApiErrors from "../utils/api-errors.util";
import {CustomErrors} from '../interfaces/custom-errors.interface';
import {HttpStatusCode} from "../enums/status-code.enum";

const devErrors = (err: CustomErrors, res: express.Response) =>
  res.status(err.statusCode!).json({
    error: err,
    statusCode: err.statusCode,
    status: err.status,
    message: err.message,
    stack: err.stack
  });

const prodErrors = (err: CustomErrors, res: express.Response) =>
  res.status(err.statusCode!).json({
    statusCode: err.statusCode,
    status: err.status,
    message: err.message
  });

const handleJwtExpired = (message: string) => new ApiErrors(message, HttpStatusCode.UNAUTHORIZED);

const globalErrors = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
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