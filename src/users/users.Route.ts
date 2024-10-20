import {Router} from 'express';
import usersService from './users.service';
import usersValidation from './users.validation';
import authService from '../auth/auth.service';

const usersRoute: Router = Router();

usersRoute.use(authService.protectRoutes, authService.checkActive);
usersRoute.route('/me')
    .get(usersService.setUserId, usersService.getUser)
    .put(usersService.setUserId, usersService.uploadUserImage, usersService.resizeUserImage, usersValidation.updateProfile, usersService.updateProfile)
    .delete(authService.allowedTo('user'), usersService.setUserId, usersValidation.deleteUser, usersService.deleteUser)

usersRoute.put('/createPassword', usersValidation.createPassword, usersService.createPassword);
usersRoute.put('/changePassword', usersValidation.changePassword, usersService.changePassword);

usersRoute.use(authService.allowedTo('manager'));
usersRoute.route('/')
    .get(usersService.getAllUsers)
    .post(usersService.uploadUserImage, usersService.resizeUserImage, usersValidation.createUser, usersService.createUser);
usersRoute.route('/:id')
    .get(usersValidation.getUser, usersService.getUser)
    .put(usersService.uploadUserImage, usersService.resizeUserImage, usersValidation.updateUser, usersService.updateUser)
    .delete(usersValidation.deleteUser, usersService.deleteUser);
usersRoute.put('/:id/changePassword', usersValidation.changeUserPassword, usersService.changeUserPassword);

export default usersRoute;