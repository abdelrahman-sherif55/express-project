import {RequestHandler} from "express";
import {check} from "express-validator";
import validatorMiddleware from "../global/middlewares/validator.middleware";
import usersModel from "./users.schema";

class UsersValidation {
    createUser: RequestHandler[] = [
        check('name')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        check('email')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isEmail().withMessage((val, {req}) => req.__('validation_value'))
            .custom(async (val: string, {req}) => {
                const user = await usersModel.findOne({email: val});
                if (user) return Promise.reject(new Error(`${req.__('validation_email_check')}`));
                return true;
            }),
        check('password')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
            .custom((val: string, {req}) => {
                if (val !== req.body.confirmPassword) throw new Error(req.__('validation_password_match'));
                return true;
            }),
        check('confirmPassword')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
        validatorMiddleware
    ];
    getUser: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware
    ];
    updateUser: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        check('name').optional()
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        check('active').optional().isBoolean().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware
    ];
    changePassword: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        check('password')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
            .custom((val: string, {req}) => {
                if (val !== req.body.confirmPassword) throw new Error(req.__('validation_password_match'));
                return true;
            }),
        check('confirmPassword')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password')),
        validatorMiddleware
    ];
    deleteUser: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware
    ];
}

const usersValidation = new UsersValidation();
export default usersValidation;