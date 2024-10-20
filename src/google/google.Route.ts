import {Request, Response, Router} from 'express';
import passport from "passport";
import './passport.service'

const googleRoute: Router = Router();

googleRoute.get('/', passport.authenticate('google', {scope: ['profile', 'email']}));
googleRoute.get('/callback', passport.authenticate('google', {session: false}), (req: Request, res: Response) => {
    const token = req.user.token;
    res.status(200).redirect(`https://google.com?login=${token}`)
});

export default googleRoute;