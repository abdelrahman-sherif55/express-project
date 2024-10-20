import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import usersSchema from "../users/users.schema";
import tokens from "../global/utils/createToken";

passport.use(
    new GoogleStrategy({
        clientID: `clint Id here`,
        clientSecret: `client secret here`,
        callbackURL: `baseurl/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await usersSchema.findOne({googleId: profile.id});
            if (!user) {
                let checkUser = await usersSchema.findOne({email: profile._json.email});
                if (checkUser) {
                    if (!checkUser.image && profile._json.picture) checkUser.image = profile._json.picture;
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
            const token = tokens.createToken(user?._id, user?.role!)
            done(null, {token});
        } catch (err) {
            done(err, false)
        }
    })
)