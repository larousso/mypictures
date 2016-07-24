import express                                  from 'express'
import bodyParser                               from 'body-parser'
import cookieParser                             from 'cookie-parser'
import methodOverride                           from 'method-override'
import session                                  from 'express-session'
import path                                     from 'path'
import React                                    from 'react'
import passportInit                             from './authentication'
import handleRequest                            from './handleRequest'
import api                                      from './routes/api'
import cookieSession                            from 'cookie-session'
import httpConfig                               from './httpConfig'
import expressWinston                           from 'express-winston'
import logger, {winston}                        from './logger'
import rx                                       from 'rx'
import config                                   from './config'
import clientConfig                              from './clientConfig'
import User                                     from './repository/user'
import DailyRotateFile                          from 'winston-daily-rotate-file'
import Album                                    from './repository/album'
import http                                     from './actions/http'

logger.info('__DEVELOPMENT__', __DEVELOPMENT__);
logger.info('__DBLOCATION__', __DBLOCATION__);
logger.info('__LOGPATH__', __LOGPATH__);
logger.info('__IMAGESPATH__', __IMAGESPATH__);
logger.info('__BASEURL__', __BASEURL__);

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
app.use(cookieParser());
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

app.use(function(req, res, next) {
    req.getAuthToken = () => {
        if(req.cookies && req.cookies._sessiondata) {
            return req.cookies._sessiondata;
        }
    };
    if(req.cookies && req.cookies._sessiondata) {
        http.get(`/api/session`, req.cookies._sessiondata)
            .then( r => {
                req.userSession = r;
                next();
            },
            e => {
                next();
                console.log("error getting session", e)
            });
    } else {
        next();
    }
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

app.get('/album/preview/:albumId',
    (req, res) => {
        console.log('Ici');
        logger.info('Album', req.params.albumId);
        http.rawPost('/api/login', config.usertech)
        .then(
            response => {
                const cookies = response.headers.get('set-cookie');
                const regExp = /^_sessiondata=(.*); Path=.*/gm;
                const session = regExp.exec(cookies)[1];
                console.log('Album id', req.params.albumId);
                return Promise.all([
                    http.get(`/api/albums/${req.params.albumId}`, session),
                    http.get(`/api/albums/${req.params.albumId}/pictures`, session)
                ]);
            },
            err => []
        )
        .then(
            ([album, pictures]) => {
                if(pictures) {
                    const userAgent = req.headers['user-agent'];
                    if (userAgent == 'Facebot' || userAgent == 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' || userAgent == 'facebookexternalhit/1.1') {

                        let preview = pictures.find(t => t.preview) || pictures[0];
                        let thumbnail = `<meta property="og:image" content="${clientConfig.api.baseUrl}/static/thumbnails/${preview.id}" />`;
                        let content = `
                        <html>
                            <meta property="og:url"                content="${__BASEURL__}/album/preview/${album.id}" />
                            <meta property="og:type"               content="album" />
                            <meta property="og:title"              content="${album.title}" />
                            <meta property="og:description"        content="${album.description || ""}" />
                            ${thumbnail}
                        </html>
                        `;

                        logger.info('Facebook robot', content);
                        res.send(content).end();
                    } else {
                        const url = `${__BASEURL__}/auth/facebook?redirect=/account/${album.username}/${album.id}`;
                        logger.info('Sending redirect to album', url, userAgent);
                        res.redirect(url).end();
                    }
                }
            },
            err => {
                logger.error(err);
                res.status(500).send(err).end();
            }
        );
});

app.get('/picture/preview/:albumId/:pictureId',
    (req, res) => {
        http.rawPost('/api/login', config.usertech)
        .then(
            response => {
                const cookies = response.headers.get('set-cookie');
                const regExp = /^_sessiondata=(.*); Path=.*/gm;
                const session = regExp.exec(cookies)[1];
                console.log('Album id', req.params.albumId);
                return Promise.all([
                    http.get(`/api/albums/${req.params.albumId}`, session),
                    http.get(`/api/pictures/${req.params.pictureId}`, session)
                ]);
            },
            err => []
        )
        .then(
            ([album, picture]) => {
                if(picture) {
                    const userAgent = req.headers['user-agent'];
                    if (userAgent == 'Facebot' || userAgent == 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' || userAgent == 'facebookexternalhit/1.1') {

                        let thumbnail = `<meta property="og:image" content="${clientConfig.api.baseUrl}/static/thumbnails/${picture.id}" />`;
                        let content = `
                        <html>
                            <meta property="og:url"                content="${__BASEURL__}/picture/preview/${album.id}/${picture.id}" />
                            <meta property="og:type"               content="album" />
                            <meta property="og:title"              content="${picture.title || picture.filename || ""}" />
                            <meta property="og:description"        content="${picture.description || ""}" />
                            ${thumbnail}
                        </html>
                        `;

                        logger.info('Facebook robot', content);
                        res.send(content).end();
                    } else {
                        const url = `${__BASEURL__}/auth/facebook?redirect=/account/${album.username}/${album.id}/${picture.id}`;
                        logger.info('Sending redirect to album', url, userAgent);
                        res.redirect(url).end();
                    }
                }
            },
            err => {
                logger.error(err);
                res.status(500).send(err).end();
            }
        );
    });

app.use('/api', api());

app.use(handleRequest);


var server = app.listen(httpConfig.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App app listening at http://%s:%s', host, port);
});

