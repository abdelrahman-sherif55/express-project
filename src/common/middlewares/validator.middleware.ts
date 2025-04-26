import {NextFunction, Request, RequestHandler, Response} from 'express';
import {validationResult} from 'express-validator';

const validatorMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      statusCode: 400,
      status: 'Bad Request',
      message: errors.array()[0].msg,
    });
  } else {
    next();
  }
};

export default validatorMiddleware;