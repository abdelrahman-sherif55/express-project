import {RateLimiterMongo} from 'rate-limiter-flexible';
import mongoose from 'mongoose';

const loginLimiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyPrefix: 'login_failures',
  points: 4,
  duration: 60 * 15,
  blockDuration: 60 * 15,
  inMemoryBlockOnConsumed: 4,
  inMemoryBlockDuration: 60 * 15,

});

const routesLimiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyPrefix: 'routes',
  points: 99,
  duration: 60 * 15,
  blockDuration: 60 * 15,
  inMemoryBlockOnConsumed: 99,
  inMemoryBlockDuration: 60 * 15,
});

const rateLimiters = {
  loginLimiter,
  routesLimiter,
};

export function getLimiter(type: 'login' | 'routes') {
  const map = {
    login: rateLimiters.loginLimiter,
    routes: rateLimiters.routesLimiter,
  };
  return map[type];
}
