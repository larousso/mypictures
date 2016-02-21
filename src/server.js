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
import api                                      from './routes/api'
import cookieSession                            from 'cookie-session'
import httpConfig                               from './httpConfig'
import expressWinston                           from 'express-winston'
import logger, {winston}                        from './logger'
import rx                                       from 'rx'
import config                                   from './config'
import User                                     from './repository/user'
import DailyRotateFile                          from 'winston-daily-rotate-file'

logger.info('__DEVELOPMENT__', __DEVELOPMENT__);
logger.info('__DBLOCATION__', __DBLOCATION__);
logger.info('__LOGPATH__', __LOGPATH__);
logger.info('__IMAGESPATH__', __IMAGESPATH__);

const app = express();

app.use(expressWinston.logger({
    transports: [new (DailyRotateFile)({ filename: `${__LOGPATH__}/access.log` })],
    meta: true,
    msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}",
    expressFormat: true,
    colorStatus: true
}));

if(config.users) {
    rx.Observable
        .from(config.users)
        .flatMap(u => new User(u).save())
        .toArray()
        .subscribe(
            ok => logger.info("Loading users to database done", ok),
            ko => logger.info("Error while loading users to database", ko)
        );
}

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(methodOverride());
app.use(session({
    secret: 'mypicturessecret',
    resave: true,
    rolling: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge:  (60 * 60 * 1000) }
}));

const passport = passportInit();
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '..', 'static')));

app.use(function(req, res, next) {
    GLOBAL.navigator = {
        userAgent: req.headers['user-agent']
    };
    next();
});

app.get('/auth/facebook', (req, res, next) => {
    req.session.redirect = req.query.redirect;
    next();
}, passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/unauthorized' }),
    function(req, res) {
        res.redirect(req.session.redirect || "/");
        delete req.session.redirect;
    }
);

app.post('/api/login',
    passport.authenticate('local'),
    (req, res) => {
        logger.info('Login', req.user);
        res.json(req.user);
        res.end();
});

app.use('/api', api());

app.use(handleRequest);


var server = app.listen(httpConfig.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App app listening at http://%s:%s', host, port);
});

