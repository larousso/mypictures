import express                                  from 'express'
import bodyParser                               from 'body-parser'
import methodOverride                           from 'method-override'
import session                                  from 'express-session'
import morgan                                   from 'morgan'
import path                                     from 'path'
import React                                    from 'react'
import qs                                       from 'query-string'
import passportInit                             from './authentication'
import handleRequest                            from './handleRequest'
import Roles                                    from './authentication/roles'

const app = express();

//app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(session({
    secret: 'mypicturessecret',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: {secure: false}
}));
const passport = passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '..', 'static')));

app.get('/auth/facebook', (req, res, next) => {
    console.log("Facebook", req.query);
    req.session.redirect = req.query.redirect;
    next();
}, passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/unauthorized' }),
    function(req, res) {
        console.log("Facebook redirect", req.query);
        res.redirect(req.session.redirect || "/");
        delete req.session.redirect;
    }
);

app.post('/api/login',
    passport.authenticate('local'),
    (req, res) => {
        res.json(req.user);
});

const hasRole = (role) => (req, res, next) => {
    if(req.isAuthenticated()) {
        if(req.user.role === role) {
            next();
        } else {
            console.log('Unauthorized');
            res.send('Unauthorized').code(401);
        }
    } else {
        res.send('Forbidden').code(403);
    }
};


app.get('/api', hasRole(Roles.ADMIN), function(req, res) {
    console.log("Auth session", req.sessionID, req.session);
    res.send('hello world');
});

app.use(handleRequest);


var server = app.listen(9000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

