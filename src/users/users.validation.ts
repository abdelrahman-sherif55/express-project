import fs from "fs";
import {RequestHandler} from "express";
import {check} from "express-validator";
import bcrypt from 'bcryptjs';
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
                if (user) throw new Error(`${req.__('validation_email_check')}`);
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
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware
    ];
    updateUser: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        check('name').optional()
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        check('active').optional().isBoolean().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware
    ];
    changeUserPassword: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
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
    updateProfile: RequestHandler[] = [
        check('name').optional()
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        validatorMiddleware
    ];
    createPassword: RequestHandler[] = [
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
    changePassword: RequestHandler[] = [
        check('currentPassword')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 6, max: 20}).withMessage((val, {req}) => req.__('validation_length_password'))
            .custom(async (val: string, {req}) => {
                const user = await usersModel.findById(req.user._id);
                const isValidPassword: boolean = await bcrypt.compare(val, user!.password);
                if (!isValidPassword) throw new Error(req.__('validation_value'));
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
    deleteUser: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('invalid_id')),
        validatorMiddleware
    ];
    deleteUserImage = (image: string): void => {
        const imagePath: string = `uploads/images/users/${image}`;
        fs.unlink(imagePath, (err): void => {
            if (err) console.error(`Error deleting image ${image}: ${err}`);
            else console.log(`Successfully deleted image ${image}`);
        });
    };
}

const usersValidation = new UsersValidation();
export default usersValidation;