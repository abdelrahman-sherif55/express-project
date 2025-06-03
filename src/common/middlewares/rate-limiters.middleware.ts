import asyncHandler from "express-async-handler";
import {NextFunction, Request, Response} from "express";
import {getLimiter} from "../utils/rate-limiters.util";
import {RateLimiterMongo} from "rate-limiter-flexible";
import ApiErrors from "../utils/api-errors.util";
import {HttpStatusCode} from "../enums/status-code.enum";

export const rateLimiter = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.headers["x-forwarded-for"] || req.ip;
  const limiter: RateLimiterMongo = getLimiter('routes');
  const key = `${req.originalUrl}:${ip}`;
  try {
    await limiter.consume(key)
    next();
  } catch (rejRes: any) {
    if (typeof rejRes === 'object' && rejRes?.remainingPoints === 0) {
      return next(new ApiErrors(`${req.__('rate_limit', {time: (Math.round(rejRes.msBeforeNext / 1000 / 60)).toString()})}`, HttpStatusCode.TOO_MANY_REQUESTS))
    }
    next();
  }
});