import {Router} from 'express';
import authService from "./auth.service";
import authValidation from "./auth.validation";

const authRoute: Router = Router();

authRoute.route('/signup').post(authValidation.signup, authService.signup);
authRoute.route('/login').post(authValidation.login, authService.login);
authRoute.route('/forget-password').post(authValidation.checkEmail, authService.forgetPassword);
authRoute.route('/verify-code').post(authService.verifyResetCode);
authRoute.route('/reset-password').patch(authValidation.resetPassword, authService.resetPassword);

export default authRoute;