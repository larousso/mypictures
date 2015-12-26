import passport                                 from 'passport'
import {Strategy as LocalStrategy}              from 'passport-local'
import {Strategy as FacebookStrategy}           from 'passport-facebook'
import {User}                                   from '../repository'
import config                                   from '../config'

export default () => {

    passport.serializeUser(function(user, done) {
        console.log("Serializing user", user);
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        console.log("Deserializing user", user);
        done(null, user);
        //User.get(id).subscribe(
        //    user => done(null, user),
        //    err => done(err, null)
        //)
    });


    passport.use(new LocalStrategy((username, password, done) => {
            console.log("Login", username, password);
            User.findByName(username).subscribe(
                user => {
                    if (!user) {
                        return done(null, false, { message: 'Incorrect username.' });
                    }
                    if (!user.validPassword(password)) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    console.log("Login user", user.data);
                    return done(null, user.data);
                },
                err => {
                    done(err);
                }

            );
        }
    ));
    console.log("Initializing facebook", config.facebook);

    passport.use(new FacebookStrategy({
            clientID: config.facebook.clientID,
            clientSecret: config.facebook.clientSecret,
            callbackURL: config.facebook.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            done(null, profile);
            //process.nextTick(function () {
            //    return done(null, profile);
            //});
        }
    ));


    return passport;
};

