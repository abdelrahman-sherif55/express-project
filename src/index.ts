import './global/interfaces';
import {Application, NextFunction, Request, Response} from "express";
import csurf from "csurf";
import globalErrors from "./global/middlewares/globalErrors.middleware";
import verifyPaymob from "./global/middlewares/verifyPaymob.middleware";
import ApiErrors from "./global/utils/apiErrors";
import examplesRoute from "./examples/examples.Route";
import googleRoute from "./google/google.Route";
import authRoute from "./auth/auth.Route";
import usersRoute from "./users/users.Route";
import profileRoute from "./profile/profile.Route";

const mountRoutes = (app: Application): void => {
    app.post('/paymob-webhook', verifyPaymob, (req: Request, res: Response, next: NextFunction) => {
        if (req.body.obj.success === true) {
            res.redirect(307, `/api/v1/${req.body.obj.payment_key_claims.extra.routeName}`);
        } else {
            return next(new ApiErrors('invalid payment', 403));
        }
    });
    app.use(
        csurf({
            cookie: {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
            },
        }),
    );
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.cookie('_coo_123', req.csrfToken());
        next();
    });
    app.use('/auth/google', googleRoute);
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/users', usersRoute);
    app.use('/api/v1/profile', profileRoute);
    app.use('/api/v1/examples', examplesRoute);
    app.all('*', (req: Request, res: Response, next: NextFunction) => {
        next(new ApiErrors(`The router ${req.originalUrl} is not found`, 400))
    });
    app.use(globalErrors);
};

export default mountRoutes;