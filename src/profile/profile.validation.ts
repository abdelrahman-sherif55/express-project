import {RequestHandler} from "express";
import {body} from "express-validator";
import bcrypt from 'bcryptjs';
import validatorMiddleware from "../global/middlewares/validator.middleware";

class ProfileValidation {
    updateProfile: RequestHandler[] = [
        body('name').optional()
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        validatorMiddleware
    ];
    createPassword: RequestHandler[] = [
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
    changePassword: RequestHandler[] = [
        body('currentPassword')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
            .custom(async (val: string, {req}) => {
                const user = req.user;
                const isValidPassword: boolean = await bcrypt.compare(val, user.password);
                if (!isValidPassword) throw new Error(req.__('validation_value'));
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
        validatorMiddleware
    ];
}

const profileValidation = new ProfileValidation();
export default profileValidation;