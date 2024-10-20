import {RequestHandler} from "express";
import {check} from 'express-validator';
import validatorMiddleware from "../global/middlewares/validator.middleware";
import usersModel from "../users/users.schema";

class AuthValidation {
    signup: RequestHandler[] = [
        check('name')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        check('email')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isEmail().withMessage((val, {req}) => req.__('validation_value'))
            .custom(async (value: string, {req}): Promise<boolean> => {
                const user = await usersModel.findOne({email: value});
                if (user) return Promise.reject(new Error(`${req.__('validation_email_check')}`));
                return true;
            }),
        check('password')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
            .custom((password: string, {req}): boolean => {
                if (password !== req.body.confirmPassword) throw new Error(`${req.__('validation_password_match')}`);
                return true;
            }),
        check('confirmPassword')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
        validatorMiddleware
    ];
    login: RequestHandler[] = [
        check('email')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isEmail().withMessage((val, {req}) => req.__('validation_value')),
        check("password")
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
        validatorMiddleware,
    ];
    checkEmail: RequestHandler[] = [
        check('email')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isEmail().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware,
    ];
    resetPassword: RequestHandler[] = [
        check("confirmPassword")
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
        check("password")
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
            .custom((val: string, {req}): boolean => {
                if (val !== req.body.confirmPassword) throw new Error(`${req.__('validation_password_match')}`);
                return true;
            }),
        validatorMiddleware,
    ];
}

const authValidation = new AuthValidation();
export default authValidation;