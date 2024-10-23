import {Router} from 'express';
import usersService from './users.service';
import usersValidation from './users.validation';
import authService from '../auth/auth.service';

const usersRoute: Router = Router();

usersRoute.use(authService.protectRoutes, authService.checkActive, authService.allowedTo('manager'));

usersRoute.route('/')
    .get(usersService.getAllUsers)
    .post(usersService.uploadUserImage, usersService.resizeUserImage, usersValidation.createUser, usersService.createUser);

usersRoute.route('/:id')
    .get(usersValidation.getUser, usersService.getUser)
    .put(usersService.uploadUserImage, usersService.resizeUserImage, usersValidation.updateUser, usersService.updateUser)
    .delete(usersValidation.deleteUser, usersService.deleteUser);

usersRoute.put('/:id/changePassword', usersValidation.changeUserPassword, usersService.changeUserPassword);

export default usersRoute;