import {NextFunction, Request, RequestHandler, Response} from 'express';
import {validationResult} from 'express-validator';
import {HttpStatusCode} from "../enums/status-code.enum";

const validatorMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      statusCode: HttpStatusCode.BAD_REQUEST,
      status: 'Bad Request',
      message: errors.array()[0].msg,
    });
  } else {
    next();
  }
};

export default validatorMiddleware;