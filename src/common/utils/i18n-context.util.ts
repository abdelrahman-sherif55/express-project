import {Request} from 'express';

const DEFAULT_LOCALE: string = process.env.DEFAULT_LOCALE || 'en';

export function I18nContext(req: Request): string {
  const lang = req.query.lang;

  if (typeof lang === 'string' && lang.trim()) return lang;

  return DEFAULT_LOCALE;
}
