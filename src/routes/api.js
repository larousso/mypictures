import express                                  from 'express'
import User                                     from '../repository/user'
import Album                                    from '../repository/album'
import Picture                                  from '../repository/picture'
import Comment                                  from '../repository/comments'
import Roles                                    from '../authentication/roles'
import multer                                   from 'multer'
import fs                                       from 'fs'
import rx                                       from 'rx'
import HttpUtils                                from './HttpUtils'
import logger                                   from '../logger'

const upload = multer({ dest: 'uploads/' });

export default () => {
    const app = express();

    app.get('/accounts/:username',
        HttpUtils.isAuthenticated,
        (req, res) => {
            User.findByName(req.params.username)
                .map(user => user.data)
                .subscribe(
                    user => res.json(user),
                    err => res.json(err).code(400)
                );
        });


    /******************************************************************
     *             ALBUMS
     ******************************************************************/


    app.get('/albums',
        HttpUtils.isAuthenticated,
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
        HttpUtils.isAuthenticated,
        (req, res) => {
            Album
                .listByUsername(req.params.username)
                .flatMap(album => Picture.listThumbnailsByAlbum(album.id).toArray().map(thumbnails => ({thumbnails, ...album})))
                .toArray()
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
                .flatMap(album => Picture.listThumbnailsByAlbum(album.id).toArray().map(thumbnails => ({thumbnails,...album})))
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
                    album => {
                        res.json({})
                    },
                    err => {
                        logger.error('Error deleting album', err);
                        HttpUtils.handleErrors(err, res);
                    },
                    () => {
                        logger.info('Deleting album succed', req.params.id);
                        res.end()
                    }
                );
        });


    app.get('/accounts/:username/albums/:id',
        HttpUtils.isAuthenticated,
        (req, res) => {
            Album
                .get(req.params.id)
                .flatMap(album => Picture.listThumbnailsByAlbum(album.id).toArray().map(thumbnails => ({thumbnails,...album})))
                .subscribe(
                    album => res.json(album).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });



    /******************************************************************
     *             THUMBNAILS
     ******************************************************************/

    app.get('/accounts/:username/albums/:albumId/thumbnails',
        HttpUtils.isAuthenticated,
        upload.array(),
        (req, res) => {
            Picture.listThumbnailsByAlbum(req.params.albumId).toArray().subscribe(
                pictures => res.json(pictures).end(),
                err => {
                    HttpUtils.handleErrors(err, res);
                }
            );
        });


    /******************************************************************
     *             PICTURES
     ******************************************************************/

    app.get('/accounts/:username/albums/:albumId/pictures',
        HttpUtils.isAuthenticated,
        upload.array(),
        (req, res) => {
            Picture.listByAlbum(req.params.albumId).toArray().subscribe(
                pictures => res.json(pictures).end(),
                err => {
                    HttpUtils.handleErrors(err, res);
                }
            );
        });

    app.post('/accounts/:username/albums/:albumId/pictures/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        upload.single('file'),
        (req, res) => {
            rx.Observable.fromNodeCallback(fs.readFile)(req.file.path)
                .map(file => new Buffer(file, 'base64'))
                .flatMap(buffer => Picture.compressAndSave(req.params.id, req.params.albumId, req.body.filename, req.body.type, buffer))
                .do(
                    _ => deleteFile(req.file.path),
                    _ => deleteFile(req.file.path)
                )
                .subscribe(
                    picture => res.json(picture).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.post('/accounts/:username/albums/:albumId/pictures/:id/_actions',
        HttpUtils.hasRole(Roles.ADMIN),
        upload.single('file'),
        (req, res) => {
            const actions = req.body;
            switch (actions.type) {
                case 'rotate' :
                    Picture
                        .rotatePicture(req.params.albumId, req.params.id, actions.value)
                        .subscribe(
                            picture => res.json(picture).end(),
                            err => {
                                HttpUtils.handleErrors(err, res);
                            }
                        );
                    break;
                default :
                    break;
            }
        });

    app.put('/accounts/:username/albums/:albumId/pictures/:id',
        HttpUtils.hasRole(Roles.ADMIN),
        (req, res) => {
            new Picture(req.body)
                .save(req.params.id)
                .subscribe(
                    picture => res.json(picture).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    function deleteFile(file) {
        fs.unlink(file, (err) => {
            if(err)
                logger.error(`Error removing ${req.file.path}`, err);
        });
    }

    app.get('/accounts/:username/albums/:albumId/pictures/:id',
        HttpUtils.isAuthenticated,
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


    /******************************************************************
     *             COMMENTS
     ******************************************************************/

    app.get('/accounts/:username/albums/:albumId/pictures/:id/comments',
        HttpUtils.isAuthenticated,
        (req, res) => {
            Comment.listByPicture(req.params.id)
                .toArray()
                .subscribe(
                    comments => res.json(comments).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.post('/accounts/:username/albums/:albumId/pictures/:id/comments',
        HttpUtils.isAuthenticated,
        (req, res) => {
            new Comment(req.body)
                .save()
                .subscribe(
                    comment => res.json(comment).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.put('/accounts/:username/albums/:albumId/pictures/:id/comments/:commentId',
        HttpUtils.isAuthenticated,
        (req, res) => {
            logger.info('updating comment ', req.params.commentId);
            new Comment(req.body)
                .save(req.params.commentId)
                .subscribe(
                    comment => res.json(comment).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    app.delete('/accounts/:username/albums/:albumId/pictures/:id/comments/:commentId',
        HttpUtils.isAuthenticated,
        (req, res) => {
            logger.info('deleting comment ', req.params.commentId);
            Comment
                .delete(req.params.commentId)
                .subscribe(
                    _ => res.json({}).end(),
                    err => {
                        HttpUtils.handleErrors(err, res);
                    }
                );
        });

    return app;


}