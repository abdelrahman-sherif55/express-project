import {RequestHandler} from "express";
import {body, param} from 'express-validator';
import validatorMiddleware from "../common/middlewares/validator.middleware";

class ExamplesValidation {
  createExample: RequestHandler[] = [
    body('name.en')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {
        field_en: 'name in English',
        field_ar: 'الاسم باللغة الإنجليزية'
      }))
      .isLength({min: 2, max: 50})
      .withMessage((val, {req}) => req.__('validation_length', {
        min_length: 2,
        max_length: 50,
        field_en: 'name in English',
        field_ar: 'الاسم باللغة الإنجليزية'
      })),
    body('name.ar')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {
        field_en: 'name in Arabic',
        field_ar: 'الاسم باللغة العربية'
      }))
      .isLength({min: 2, max: 50})
      .withMessage((val, {req}) => req.__('validation_length', {
        min_length: 2,
        max_length: 50,
        field_en: 'name in Arabic',
        field_ar: 'الاسم باللغة العربية'
      })),
    validatorMiddleware
  ];
  getExample: RequestHandler[] = [
    param('id')
      .isMongoId()
      .withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
  updateExample: RequestHandler[] = [
    param('id')
      .isMongoId()
      .withMessage((val, {req}) => req.__('validation_value')),
    body('name.en')
      .optional()
      .isLength({min: 2, max: 50})
      .withMessage((val, {req}) => req.__('validation_length', {
        min_length: 2,
        max_length: 50,
        field_en: 'name in Arabic',
        field_ar: 'الاسم باللغة العربية'
      })),
    body('name.ar')
      .optional()
      .isLength({min: 2, max: 50})
      .withMessage((val, {req}) => req.__('validation_length', {
        min_length: 2,
        max_length: 50,
        field_en: 'name in Arabic',
        field_ar: 'الاسم باللغة العربية'
      })),
    validatorMiddleware
  ];
  deleteExample: RequestHandler[] = [
    param('id')
      .isMongoId()
      .withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
}

const examplesValidation = new ExamplesValidation();
export default examplesValidation;