import express                                  from 'express'
import User                                     from '../repository/user'
import Album                                    from '../repository/album'
import Picture                                  from '../repository/picture'
import Roles                                    from '../authentication/roles'
import multer                                   from 'multer'
import lwip                                     from 'lwip'
import Jimp                                     from 'jimp'
import fs                                       from 'fs'

const upload = multer({ dest: 'uploads/' });

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
                .subscribe(
                    albums => res.json(albums).end(),
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
            new Album(req.body)
                .save()
                .subscribe(
                    album => res.json(album).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.put('/accounts/:username/albums/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res, next) => {
            req.body.username = req.params.username;
            next();
        },
        (req, res) => {
            new Album(req.body)
                .save(req.params.id)
                .subscribe(
                    album => res.json(album).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.delete('/accounts/:username/albums/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            Album
                .delete(req.params.id)
                .subscribe(
                    album => res.json({}).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });


    app.get('/accounts/:username/albums/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            Album
                .get(req.params.id)
                .subscribe(
                    album => res.json(album).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.get('/accounts/:username/albums/:albumId/pictures',
        HttpUtils.hasRole(Roles.ADMIN),
        upload.array(),
        (req, res) => {
            Picture.listByAlbum(req.params.albumId).subscribe(
                pictures => res.json(pictures).end(),
                err => {
                    HttpUtils.handleErrors(err, res);
                }
            );
        });


    app.post('/accounts/:username/albums/:albumId/pictures',
        HttpUtils.hasRole(Roles.ADMIN),
        upload.array(),
        (req, res) => {
            req.files.map(file => {
                Jimp.read()
                lwip
                    .open(file)
                    .scale()
            });

        });


    app.post('/accounts/:username/albums/:albumId/pictures/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        upload.single('file'),
        (req, res) => {
            console.log('Saving picture', req.file.path, req.body.filename);
            let buffer = new Buffer(fs.readFileSync(req.file.path), 'base64');
            Picture.compressAndSave(req.params.id, req.params.albumId, req.body.filename, buffer).subscribe(
                picture => res.json(picture).end(),
                err => {
                    HttpUtils.handleErrors(err, res);
                }
            );
        });

    app.get('/accounts/:username/albums/:albumId/pictures/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            Picture.get(req.params.id)
                .subscribe(
                    picture => res.json(picture).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.delete('/accounts/:username/albums/:albumId/pictures/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            Picture
                .delete(req.params.id)
                .subscribe(
                    album => res.json({}).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });


    return app;

}