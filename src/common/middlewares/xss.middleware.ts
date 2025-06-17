import {NextFunction, Request, Response} from "express";
import xss from 'xss';

// function sanitizeObject(obj: any, options = {}) {
//   if (!obj) return;
//   for (const key in obj) {
//     if (typeof obj[key] === 'string') {
//       obj[key] = xss(obj[key], options);
//     } else if (typeof obj[key] === 'object' && obj[key] !== null) {
//       sanitizeObject(obj[key], options);
//     }
//   }
// }

function sanitizeObject(obj: any, options = {}) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = xss(obj[i], options);
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        sanitizeObject(obj[i], options);
      }
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key], options);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key], options);
      }
    }
  }
}

function sanitizeHeaders(headers: any, options = {}) {
  const ignored = ['Authorization'];
  for (const key in headers) {
    if (ignored.includes(key.toLowerCase())) continue;

    if (typeof headers[key] === 'string') {
      headers[key] = xss(headers[key], options);
    } else if (typeof headers[key] === 'object' && headers[key] !== null) {
      sanitizeObject(headers[key], options);
    }
  }
}

export function xssSanitizeMiddleware(options = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    sanitizeObject(req.body, options);
    sanitizeObject(req.query, options);
    sanitizeObject(req.params, options);
    sanitizeHeaders(req.headers, options);
    next();
  };
}
