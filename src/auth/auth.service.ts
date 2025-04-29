import {NextFunction, Request, Response} from 'express'
import asyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Jwt from 'jsonwebtoken';
import usersSchema from "../users/users.schema";
import ApiErrors from "../common/utils/api-errors.util";
import sendEmail from "../common/utils/send-email.util";
import {Users} from "../users/users.interface";
import tokens from "../common/utils/create-token.util";
import {HttpStatusCode} from "../common/enums/status-code.enum";

class AuthService {
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user: Users = await usersSchema.create({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    });
    const tokens = this.createTokens(user, res);
    res.status(HttpStatusCode.CREATED).json({token: tokens.token, refreshToken: tokens.refreshToken});
  });
  login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findOne({email: req.body.email});
    if (!user || !user.password || !(await bcrypt.compare(req.body.password, user.password)))
      return next(new ApiErrors(`${req.__('invalid_login')}`, HttpStatusCode.BAD_REQUEST));
    if (!user.active) return next(new ApiErrors(`${req.__('check_active')}`, HttpStatusCode.FORBIDDEN));
    const tokens = this.createTokens(user, res);
    res.status(HttpStatusCode.OK).json({token: tokens.token, refreshToken: tokens.refreshToken});
  });
  adminLogin = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findOne({email: req.body.email, role: {$in: ['admin']}});
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      return next(new ApiErrors(`${req.__('invalid_login')}`, HttpStatusCode.BAD_REQUEST));
    const tokens = this.createTokens(user, res);
    res.status(HttpStatusCode.OK).json({token: tokens.token, refreshToken: tokens.refreshToken});
  });
  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    this.clearCookies(req, res, next);
    res.status(HttpStatusCode.OK).json({success: true});
  });
  forgetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user: Users | null = await usersSchema.findOne({email: req.body.email});
    if (!user)
      return next(new ApiErrors(`${req.__('check_email')}`, HttpStatusCode.BAD_REQUEST));

    const resetCode: string = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.passwordResetCodeExpires = Date.now() + (10 * 60 * 1000);
    user.passwordResetCodeVerify = false;

    const message: string = `Your Reset Password Code is "${resetCode}"`;
    try {
      await sendEmail({email: user.email, subject: 'Forget Password', message});
      await user.save({validateModifiedOnly: true});
    } catch (err: any) {
      console.log(err);
      return next(new ApiErrors(`${req.__('send_email')}`, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }

    const resetToken: string = tokens.createResetToken(user._id);
    res.cookie('reset', resetToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000
    });
    res.status(HttpStatusCode.OK).json({success: true, reset: resetToken});
  });
  verifyResetCode = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const decodedToken: any = this.verifyToken(req, next);

    const hashedResetCode: string = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
    const user: Users | null = await usersSchema.findOne({
      _id: decodedToken._id,
      passwordResetCode: hashedResetCode,
      passwordResetCodeExpires: {$gt: Date.now()}
    });
    if (!user)
      return next(new ApiErrors(`${req.__('check_code_valid')}`, HttpStatusCode.BAD_REQUEST));
    user.passwordResetCodeVerify = true;
    await user.save({validateModifiedOnly: true});
    res.status(HttpStatusCode.OK).json({success: true});
  });
  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const decodedToken: any = this.verifyToken(req, next);

    const user: Users | null = await usersSchema.findOne({_id: decodedToken._id, passwordResetCodeVerify: true});
    if (!user) return next(new ApiErrors(`${req.__('allowed_to')}`, HttpStatusCode.FORBIDDEN));
    user.password = req.body.password;
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetCodeVerify = undefined;
    user.passwordChangedAt = Date.now();
    await user.save({validateModifiedOnly: true});

    res.clearCookie('reset', {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 0
    });
    res.status(HttpStatusCode.OK).json({success: true, data: `${req.__('password_changed')}`});
  });
  protectRoutes = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) token = req.headers.authorization.split(' ')[1];
    else return next(new ApiErrors(`${req.__('check_login')}`, HttpStatusCode.UNAUTHORIZED));

    const decoded: any = Jwt.verify(token, process.env.JWT_SECRET_KEY!);
    if (decoded.exp - decoded.iat !== 86400) return next(new ApiErrors(`${req.__('check_login')}`, HttpStatusCode.UNAUTHORIZED));

    const user: Users | null = await usersSchema.findById(decoded._id);
    if (!user) return next(new ApiErrors(`${req.__('check_user')}`, HttpStatusCode.UNAUTHORIZED));

    if (user.passwordChangedAt instanceof Date) {
      const changedPasswordTime: number = Math.trunc(user.passwordChangedAt.getTime() / 1000);
      if (changedPasswordTime > decoded.iat) return next(new ApiErrors(`${req.__('check_password_changed')}`, HttpStatusCode.UNAUTHORIZED));
    }

    req.user = user;
    next();
  });
  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: any;
    if (req.headers.authorization && req.headers.authorization.startsWith("Refresh")) token = req.headers.authorization.split(' ')[1];
    else return next(new ApiErrors(`${req.__('check_login')}`, HttpStatusCode.UNAUTHORIZED));

    if (!([undefined, null, 'null', ''].includes(token))) {
      const decoded: any = Jwt.decode(token);
      if (decoded.exp - decoded.iat !== 2592000 || decoded.exp < Math.trunc(Date.now() / 1000)) {
        this.clearCookies(req, res, next);
        return next(new ApiErrors(`${req.__('check_login')}`, HttpStatusCode.UNAUTHORIZED));
      }

      token = tokens.createToken(decoded._id, decoded.role);
      res.cookie('token', token, {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
    } else {
      this.clearCookies(req, res, next);
      return next(new ApiErrors(`${req.__('check_login')}`, HttpStatusCode.UNAUTHORIZED));
    }
    res.status(HttpStatusCode.OK).json({token});
  });
  allowedTo = (...roles: string[]) => asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!(roles.includes(req.user?.role))) return next(new ApiErrors(`${req.__('allowed_to')}`, HttpStatusCode.FORBIDDEN));
    next();
  });
  checkActive = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.active) return next(new ApiErrors(`${req.__('check_active')}`, HttpStatusCode.FORBIDDEN));
    next();
  });
  authLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: 'try again later'
  });

  createTokens(user: Users, res: Response) {
    const token: string = tokens.createToken(user._id, user.role);
    const refreshToken: string = tokens.createRefreshToken(user._id, user.role);
    res.cookie('token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie('refresh', refreshToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    return {token, refreshToken};
  };

  verifyToken(req: Request, next: NextFunction) {
    let resetToken: string = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) resetToken = req.headers.authorization.split(' ')[1]
    else return next(new ApiErrors(`${req.__('allowed_to')}`, HttpStatusCode.FORBIDDEN));
    const decodedToken: any = Jwt.verify(resetToken, process.env.JWT_RESET_SECRET_KEY!);
    return decodedToken;
  };

  clearCookies = (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token', {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 0
    });
    res.clearCookie('refresh', {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
      maxAge: 0
    });
  };
}

const authService = new AuthService();
export default authService;