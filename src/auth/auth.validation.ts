import {RequestHandler} from "express";
import {body} from 'express-validator';
import validatorMiddleware from "../common/middlewares/validator.middleware";
import usersModel from "../users/users.schema";

class AuthValidation {
  signup: RequestHandler[] = [
    body('name')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'name', field_ar: 'الاسم'}))
      .isLength({min: 2, max: 50})
      .withMessage((val, {req}) => req.__('validation_length', {min_length: 2, max_length: 50})),
    body('email')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'email', field_ar: 'البريد الإلكتروني'}))
      .isEmail()
      .withMessage((val, {req}) => req.__('validation_value'))
      .custom(async (value: string, {req}): Promise<boolean> => {
        const user = await usersModel.findOne({email: value});
        if (user) return Promise.reject(new Error(`${req.__('validation_email_check')}`));
        return true;
      }),
    body('password')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'password', field_ar: 'كلمة المرور'}))
      .isLength({min: 6, max: 20})
      .withMessage((val, {req}) => req.__('validation_length_password'))
      .custom((password: string, {req}): boolean => {
        if (password !== req.body.confirmPassword) throw new Error(`${req.__('validation_password_match')}`);
        return true;
      }),
    body('confirmPassword')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {
        field_en: 'confirm Password',
        field_ar: 'تأكيد كلمة المرور'
      }))
      .isLength({min: 6, max: 20})
      .withMessage((val, {req}) => req.__('validation_length_password')),
    validatorMiddleware
  ];
  login: RequestHandler[] = [
    body('email')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'email', field_ar: 'البريد الإلكتروني'}))
      .isEmail()
      .withMessage((val, {req}) => req.__('validation_value')),
    body("password")
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'password', field_ar: 'كلمة المرور'}))
      .isLength({min: 6, max: 20})
      .withMessage((val, {req}) => req.__('validation_length_password')),
    validatorMiddleware,
  ];
  checkEmail: RequestHandler[] = [
    body('email')
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'email', field_ar: 'البريد الإلكتروني'}))
      .isEmail()
      .withMessage((val, {req}) => req.__('validation_value')),
    validatorMiddleware,
  ];
  resetPassword: RequestHandler[] = [
    body("confirmPassword")
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {
        field_en: 'confirm Password',
        field_ar: 'تأكيد كلمة المرور'
      }))
      .isLength({min: 6, max: 20})
      .withMessage((val, {req}) => req.__('validation_length_password')),
    body("password")
      .notEmpty()
      .withMessage((val, {req}) => req.__('validation_field', {field_en: 'password', field_ar: 'كلمة المرور'}))
      .isLength({min: 6, max: 20})
      .withMessage((val, {req}) => req.__('validation_length_password'))
      .custom((val: string, {req}): boolean => {
        if (val !== req.body.confirmPassword) throw new Error(`${req.__('validation_password_match')}`);
        return true;
      }),
    validatorMiddleware,
  ];
}

const authValidation = new AuthValidation();
export default authValidation;