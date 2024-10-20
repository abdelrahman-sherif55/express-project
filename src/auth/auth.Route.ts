import {Router} from 'express';
import authService from "./auth.service";
import authValidation from "./auth.validation";

const authRoute: Router = Router();

authRoute.route('/signup').post(authValidation.signup, authService.signup);
authRoute.route('/login').post(authValidation.login, authService.login);
authRoute.route('/forgetPassword').post(authValidation.checkEmail, authService.forgetPassword);
authRoute.route('/verifyCode').post(authService.verifyResetCode);
authRoute.route('/resetPassword').put(authValidation.resetPassword, authService.resetPassword);
authRoute.route('/refreshToken').get(authService.protectRoutes, authService.refreshToken);

export default authRoute;