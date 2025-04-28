import {NextFunction, Request, Response} from "express";
import xss from 'xss';

function sanitizeObject(obj: any, options = {}) {
  if (!obj) return;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key], options);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key], options);
    }
  }
}

export function xssSanitizeMiddleware(options = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    sanitizeObject(req.body, options);
    sanitizeObject(req.query, options);
    sanitizeObject(req.params, options);
    next();
  };
}
