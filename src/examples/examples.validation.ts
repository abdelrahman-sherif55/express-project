import {RequestHandler} from "express";
import {body, param} from 'express-validator';
import validatorMiddleware from "../common/middlewares/validator.middleware";

class ExamplesValidation {
  createExample: RequestHandler[] = [
    body('name')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
    validatorMiddleware
  ];
  getExample: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
  updateExample: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    body('name')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
    validatorMiddleware
  ];
  deleteExample: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
}

const examplesValidation = new ExamplesValidation();
export default examplesValidation;