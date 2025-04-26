import dotenv from "dotenv";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import usersSchema from "../users/users.schema";
import tokens from "../common/utils/create-token.util";
import {Users} from "../users/users.interface";

dotenv.config();

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK!
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user: Users | null = await usersSchema.findOne({googleId: profile.id});
      if (!user) {
        let checkUser = await usersSchema.findOne({email: profile._json.email});
        if (checkUser) {
          if (!checkUser.image && profile._json.picture) checkUser.image = profile._json.picture
          else checkUser.image = checkUser.image.split(`${process.env.BASE_URL}/images/users/`)[1]
          checkUser.googleId = profile.id;
          await checkUser.save({validateModifiedOnly: true});
        } else {
          checkUser = await usersSchema.create({
            name: profile._json.name,
            email: profile._json.email,
            image: profile._json.picture,
            hasPassword: false,
            googleId: profile.id
          });
        }
        user = checkUser;
      }
      const token = tokens.createToken(user?._id, user?.role!);
      const refreshToken = tokens.createRefreshToken(user?._id, user?.role!);
      done(null, {token, refreshToken});
    } catch (err) {
      done(err, false)
    }
  })
)