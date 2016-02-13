import passport                                 from 'passport'
import {Strategy as LocalStrategy}              from 'passport-local'
import {Strategy as FacebookStrategy}           from 'passport-facebook'
import {User}                                   from '../repository'
import config                                   from '../config'
import Roles                                    from './roles'

export default () => {

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy((username, password, done) => {
            User.findByName(username).subscribe(
                user => {
                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user.data);
                },
                err => {
                    done(err);
                }

            );
        }
    ));

    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            done(null, facebookToUser(profile));
        }
    ));


    function facebookToUser(profile) {
        return {
            id:profile.id,
            username: profile.displayName,
            name: profile.name.familyName,
            surname: profile.name.givenName,
            role: Roles.GUEST
        }
    }

    return passport;
};

