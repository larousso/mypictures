import express                                  from 'express'
import cookieParser                             from 'cookie-parser'
import bodyParser                               from 'body-parser'
import methodOverride                           from 'method-override'
import session                                  from 'express-session'
import path                                     from 'path'
import React                                    from 'react'
import qs                                       from 'query-string'
import passportInit                             from './passportInit'
import handleRequest                            from './handleRequest'

const passport = passportInit();

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(session({
    secret: 'my_precious',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook', passport.authenticate('facebook'), (req, res) => {
    req.session.redirect = req.query.redirect;
});

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/unauthorized' }),
    function(req, res) {
        res.redirect(req.session.redirect || "/");
        delete req.session.redirect;
    }
);

app.post('/api/login',
    passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        console.log("Login ok", req.user);
        const user = req.user;
        res.json({ id: user.id, username: user.name });
    });

app.get('/api', function(req, res) {
    res.send('hello world');
});

app.use(express.static(path.join(__dirname, '..', 'static')));

app.use(handleRequest);


var server = app.listen(9000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

