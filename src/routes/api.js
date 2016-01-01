import express                                  from 'express'
import User                                     from '../repository/user'
import Album                                    from '../repository/album'
import Roles                                    from '../authentication/roles'

const HttpUtils = {
    hasRole: (role) => (req, res, next) => {
        if(req.isAuthenticated()) {
            if(req.user.role === role) {
                next();
            } else {
                console.log('Unauthorized');
                res.send('Unauthorized').status(401).end();
            }
        } else {
            console.log('Forbidden');
            res.send('Forbidden').status(403).end();
        }
    },
    isAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            next();
        } else {
            console.log('Forbidden', req.session);
            res.json({message:'Forbidden'}).status(403).end();
        }
    },

    handleErrors: (err, res) => {
        console.log('Errors', err.errors);
        if(err.type === 'business') {
            res.status(400).json(err.errors).end();
        } else {
            res.status(500).json(err.errors).end();
        }

    }
};


export default () => {
    const app = express();

    app.get('/accounts/:username',
        HttpUtils.isAuthenticated,
        (req, res) => {
            console.log("Loading account for username", req.params.username)
            User.findByName(req.params.username)
                .map(user => user.data)
                .subscribe(
                    user => res.json(user),
                    err => res.json(err).code(400)
                );
        });

    app.get('/albums',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            Album.listAll()
                .toArray()
                .subscribe(
                    albums => res.json(albums),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.get('/accounts/:username/albums',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            Album
                .listByUsername(req.params.username)
                .toArray()
                .subscribe(
                    albums => res.json(albums),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.post('/accounts/:username/albums',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res, next) => {
            req.body.username = req.params.username;
            next();
        },
        (req, res) => {
            console.log("Creating album on account", req.body)
            new Album(req.body)
                .save()
                .subscribe(
                    album => res.json(album),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    return app;

}