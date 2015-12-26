import express                                  from 'express'
import bodyParser                               from 'body-parser'
import methodOverride                           from 'method-override'
import session                                  from 'express-session'
import morgan                                   from 'morgan'
import path                                     from 'path'
import React                                    from 'react'
import qs                                       from 'query-string'
import passportInit                             from './passportInit'
import handleRequest                            from './handleRequest'

const app = express();
let passport = passportInit();

//app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(session({
    secret: 'mypicturessecret',
    name: "alex",
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: {secure: false}
    //cookie: {secure: false, httpOnly: false, maxAge: (4 * 60 * 60 * 1000) }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '..', 'static')));
//
//app.get('/auth/facebook', passport.authenticate('facebook'), (req, res) => {
//    req.session.redirect = req.query.redirect;
//});
//
//app.get('/auth/facebook/callback',
//    passport.authenticate('facebook', { failureRedirect: '/unauthorized' }),
//    function(req, res) {
//        res.redirect(req.session.redirect || "/");
//        delete req.session.redirect;
//    }
//);

//app.use ((req, res, next) => {
//    res.header('Access-Control-Allow-Origin', 'http://localhost:9000');
//    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-AUTHENTICATION, X-IP, Content-Type, Accept');
//    res.header('Access-Control-Allow-Credentials', true);
//    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//    next();
//});

app.post('/api/login',
    passport.authenticate('local'),
    (req, res, next) => {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        console.log("Login ok", req.user);
        console.log("Session", req.session);
        const user = req.user;
        let session = req.session;
        session.myUser = { id: user.id, username: user.name };
        res.json({ id: user.id, username: user.name });

    });

app.get('/api', function(req, res) {
    console.log("Auth session", req.sessionID, req.session);
    res.send('hello world');
});

app.use(handleRequest);


var server = app.listen(9000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

