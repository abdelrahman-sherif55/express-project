import {RequestHandler} from "express";
import {check} from 'express-validator';
import validatorMiddleware from "../global/middlewares/validator.middleware";

class ExamplesValidation {
    createExample: RequestHandler[] = [
        check('name')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        validatorMiddleware
    ];
    getExample: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware
    ];
    updateExample: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        check('name')
            .notEmpty().withMessage((val, {req}) => req.__('validation_field'))
            .isLength({min: 2, max: 50}).withMessage((val, {req}) => req.__('validation_length_short')),
        validatorMiddleware
    ];
    deleteExample: RequestHandler[] = [
        check('id').isMongoId().withMessage((val, {req}) => req.__('validation_value')),
        validatorMiddleware
    ];
}

const examplesValidation = new ExamplesValidation();
export default examplesValidation;