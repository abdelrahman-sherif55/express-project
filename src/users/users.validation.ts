import {RequestHandler} from "express";
import {body, param} from "express-validator";
import validatorMiddleware from "../common/middlewares/validator.middleware";
import usersModel from "./users.schema";

class UsersValidation {
  createUser: RequestHandler[] = [
    body('name')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
    body('email')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isEmail().withMessage((val, {req}) => req.__('validation_value'))
      .custom(async (val: string, {req}) => {
        const user = await usersModel.findOne({email: val});
        if (user) return Promise.reject(new Error(`${req.__('validation_email_check')}`));
        return true;
      }),
    body('password')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
      .custom((val: string, {req}) => {
        if (val !== req.body.confirmPassword) throw new Error(req.__('validation_password_match'));
        return true;
      }),
    body('confirmPassword')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
    body('role').optional().isIn(['user']).withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
  getUser: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
  updateUser: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    body('name').optional()
      .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
    body('active').optional().isBoolean().withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
  changePassword: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    body('password')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
      .custom((val: string, {req}) => {
        if (val !== req.body.confirmPassword) throw new Error(req.__('validation_password_match'));
        return true;
      }),
    body('confirmPassword')
      .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
      .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
    validatorMiddleware
  ];
  deleteUser: RequestHandler[] = [
    param('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware
  ];
}

const usersValidation = new UsersValidation();
export default usersValidation;