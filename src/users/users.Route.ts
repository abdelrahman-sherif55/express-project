import {Router} from 'express';
import usersService from './users.service';
import usersValidation from './users.validation';
import authService from '../auth/auth.service';

const usersRoute: Router = Router();

usersRoute.use(authService.protectRoutes, authService.checkActive, authService.allowedTo('admin'));

usersRoute.route('/')
    .get(usersService.getAllUsers)
    .post(usersService.uploadImage, usersService.saveImage, usersValidation.createUser, usersService.createUser);

usersRoute.route('/:id')
    .get(usersValidation.getUser, usersService.getUser)
    .patch(usersService.uploadImage, usersService.saveImage, usersValidation.updateUser, usersService.updateUser)
    .delete(usersValidation.deleteUser, usersService.deleteUser);

usersRoute.patch('/:id/change-Password', usersValidation.changePassword, usersService.changePassword);

export default usersRoute;