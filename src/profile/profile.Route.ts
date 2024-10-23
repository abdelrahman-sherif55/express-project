import {Router} from 'express';
import profileService from './profile.service';
import profileValidation from './profile.validation';
import authService from '../auth/auth.service';

const profileRoute: Router = Router();

profileRoute.use(authService.protectRoutes, authService.checkActive);
profileRoute.route('/')
    .get(profileService.setUserId, profileService.getProfile)
    .put(profileService.setUserId, profileService.uploadProfileImage, profileService.resizeProfileImage, profileValidation.updateProfile, profileService.updateProfile)

profileRoute.put('/createPassword', profileValidation.createPassword, profileService.createPassword);
profileRoute.put('/changePassword', profileValidation.changePassword, profileService.changePassword);

export default profileRoute;