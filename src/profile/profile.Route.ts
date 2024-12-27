import {Router} from 'express';
import profileService from './profile.service';
import profileValidation from './profile.validation';
import authService from '../auth/auth.service';

const profileRoute: Router = Router();

profileRoute.use(authService.protectRoutes, authService.checkActive);
profileRoute.route('/')
    .get(profileService.setUserId, profileService.getProfile)
    .patch(profileService.uploadImage, profileService.saveImage, profileValidation.updateProfile, profileService.updateProfile)

profileRoute.patch('/create-password', profileValidation.createPassword, profileService.createPassword);
profileRoute.patch('/change-password', profileValidation.changePassword, profileService.changePassword);

export default profileRoute;