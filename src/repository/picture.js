import Database, {dbInstance}       from './database'
import rx                           from 'rx'
import Jimp                         from 'jimp'
import fs                           from 'fs'
import mkdirp                       from 'mkdirp'
import logger                       from '../logger'

const db = dbInstance('picture');
db.ensureIndex('album');

function basePath() {
    return __IMAGESPATH__;
}
function buildAlbumPath(albumId) {
    return `${basePath()}/${albumId}`;
}
function buildPicturePath(id, albumId) {
    return `${buildAlbumPath(albumId)}/${id}`;
}
function buildThumbnailFolderPath(albumId) {
    return `${buildAlbumPath(albumId)}/thumbnails`;
}
function buildThumbnailPath(id, albumId) {
    return `${buildAlbumPath(albumId)}/thumbnails/${id}`;
}

const Schema = {
    id: 'Picture',
    type: 'object',
    properties: {
        title: {
            type: 'string',
            required: false
        },
        filename: {
            type: 'string',
            required: true
        },
        preview: {
            type: 'boolean',
            required: false
        },
        type: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string',
            required: false
        },
        album:{
            type: 'string',
            required: true
        },
        file: {
            type: 'string',
            required: false
        }
    }
};


export default class Picture extends Database {

    constructor(picture) {
        super(db, Schema, picture);
    }

    static get(id) {
        return new Picture().get(id);
    }

    static getPicture(id, albumId) {
        return rx.Observable.fromCallback(fs.readFile)(buildPicturePath(id, albumId), 'utf-8').map(files => files[1]);
    }
    static getThumbnail(id, albumId) {
        return rx.Observable.fromCallback(fs.readFile)(buildThumbnailPath(id, albumId), 'utf-8').map(files => files[1]);
    }

    static compressAndSave(id, album, filename, type, file) {
        logger.info(`Picture.compressAndSave id:${id}, album:${album}, filename:${filename}, type:${type}`);

        return rx.Observable.zip(
                Picture.createMainPicture(id, album, file, type),
                Picture.createThumbnail(id, album, file, type),
                (picture, thumbnail) => ({picture, thumbnail})
            )
            .flatMap(_ => new Picture({id, album, filename, type}).save())
            .flatMap(picture => rx.Observable.zip(
                    Picture.getPicture(id, album),
                    Picture.getThumbnail(id, album),
                    (file, thumbnail) => ({file, thumbnail})
                ).map(files => {
                    let {file, thumbnail} = files;
                    return {file, thumbnail, ...picture};
                })
            );
    }

    static rotatePicture(album, id, rotation) {
        let thumbnailPath = buildThumbnailPath(id, album);
        let folder = buildThumbnailFolderPath(album);

        let albumPath = buildAlbumPath(album);
        let picturePath = buildPicturePath(id, album);
        logger.info(`Picture rotation : album=${album}, picture=${id}`, thumbnailPath, picturePath);
        return Picture.get(id)
            .flatMap(image =>
                rx.Observable.zip(
                    Picture.rotateFile(picturePath, albumPath, image.type, rotation),
                    Picture.rotateFile(thumbnailPath, folder, image.type, rotation),
                    (file, thumbnail) => ({file, thumbnail})
                )
                .flatMap(_ => rx.Observable.zip(
                    Picture.getPicture(id, album),
                    Picture.getThumbnail(id, album),
                    (file, thumbnail) => ({file, thumbnail})
                    ).map(files => {
                        let {file, thumbnail} = files;
                        return {file, thumbnail, ...image};
                    })
                )
            );
    }

    static rotateFile(path, folderPath, type, rotation) {
        const angle = rotation == 'right' ? 90 : 270;
        logger.info('File rotation', path);
        return rx.Observable
            .fromCallback(fs.readFile)(path, 'utf-8').map(files => files[1])
            .map(str => str.substring(str.indexOf(',')))
            .flatMap(file => rx.Observable.fromPromise(Jimp.read(new Buffer(file, 'base64')).then(ok => ok, err => logger.error('Error while rezdin', err))))
            .map(image => image.rotate(angle))
            .flatMap(image => toBuffer(image, type))
            .flatMap(buffer => Picture.createPicture(path, folderPath, buffer));
    }

    static createMainPicture(id, album, file, type) {
        let albumPath = buildAlbumPath(album);
        let picturePath = buildPicturePath(id, album);
        return rx.Observable
            .fromPromise(Jimp.read(file))
            .map(image => {
                let scale = calcScale(image);
                if(scale < 1) {
                    return image.scale(scale);
                } else {
                    return image;
                }
            })
            .flatMap(image => {
                switch (type) {
                    case Jimp.MIME_JPEG: return toBuffer(image.quality(60), Jimp.MIME_JPEG);
                    case Jimp.MIME_PNG: return toBuffer(image, Jimp.MIME_PNG);
                    case Jimp.MIME_BMP: return toBuffer(image, Jimp.MIME_BMP);
                    default : throw new Error(`Type ${type} is not handled`);
                }
            })
            .flatMap(buffer => Picture.createPicture(picturePath, albumPath, buffer));
    }

    static createThumbnail(id, album, file, type) {
        let thumbnailPath = buildThumbnailPath(id, album);
        let folder = buildThumbnailFolderPath(album);
        return rx.Observable
            .fromPromise(Jimp.read(file))
            .map(image => image.scale(scaleThumbnail(image)))
            .flatMap(image => {
                switch (type) {
                    case Jimp.MIME_JPEG: return toBuffer(image.quality(50), Jimp.MIME_JPEG);
                    case Jimp.MIME_PNG: return toBuffer(image, Jimp.MIME_PNG);
                    case Jimp.MIME_BMP: return toBuffer(image, Jimp.MIME_BMP);
                    default : throw new Error(`Type ${type} is not handled`);
                }
            })
            .flatMap(buffer => Picture.createPicture(thumbnailPath, folder, buffer))
    }

    static createPicture(picturePath, albumPath, buffer) {
        let data = `data:${Jimp.MIME_JPEG};base64, ${buffer.toString('base64')}`;
        return createFolder(albumPath)
            .flatMap(_ => rx.Observable.fromCallback(fs.writeFile)(picturePath, data, 'utf-8'));
    }

    static listAll() {
        return Database.streamToRx(db.createReadStream());
    }

    static listByAlbum(album) {
        if(!album) {
            return rx.Observable.empty();
        }
        return Database
            .streamQueryToRx(db.query({album}))
            .flatMap(picture => rx.Observable.zip(
                    Picture.getPicture(picture.id, album),
                    Picture.getThumbnail(picture.id, album),
                    (file, thumbnail) => ({file, thumbnail, ...picture})
                ));
    }

    static listThumbnailsByAlbum(album) {
        if(!album) {
            return rx.Observable.empty();
        }
        return Picture.listByAlbum(album).count().flatMap(count => {
            if(count > 0) {
                logger.debug('Count ', album, count);
                return Database
                    .streamQueryToRx(db.query({album}))
                    .flatMap(picture =>
                        Picture.getThumbnail(picture.id, album).map(thumbnail => ({thumbnail, ...picture}))
                    )
                    .filter(p => p.thumbnail);
            } else {
                return rx.Observable.just({});
            }
        });
    }

    static deleteByAlbum(album) {
        logger.info('Delete by album', album)
        return Picture.listByAlbum(album).count().flatMap(count => {
            if(count > 0) {
                logger.info(`${count} pictures to delete for album ${album}`);
                return Picture.listByAlbum(album)
                    .flatMap(p => Picture.delete(p.id))
                    .toArray()
                    .flatMap(p => rx.Observable.fromCallback(fs.rmdir)(buildAlbumPath(album)));
            } else {
                return rx.Observable.just({});
            }
        });
    }

    static delete(id) {
        return Picture.get(id)
            .flatMap(p => Picture.deletePicture(id, p.album).map(_ => p))
            .flatMap(p => new Picture(p).delete());
    }

    static deletePicture(id, albumId) {
        let path = buildPicturePath(id, albumId);
        let thumbnail = buildThumbnailPath(id, albumId);
        return rx.Observable.zip(
            rx.Observable.fromCallback(fs.unlink)(path),
            rx.Observable.fromCallback(fs.unlink)(thumbnail),
            (cb1, cb2) => ({})
        );
    }
}

function createFolder(folder) {
    return rx.Observable.fromCallback(fs.stat)(folder).flatMap(stats => {
        if(stats.isDirectory()) {
            return rx.Observable.just({folder});
        } else {
            return rx.Observable.throw(`${folder} is not a directory`);
        }
    }).catch(_ => {
        return rx.Observable
            .fromCallback(mkdirp)(folder).map(_ => ({folder}));
    });
}

function calcScale(image) {
    return 1024 / image.bitmap.width;
}
function scaleThumbnail(image) {
    return 200 / image.bitmap.height;
}
function toBuffer(image, type) {
    return rx.Observable.create(observer => {
        image.getBuffer(type, (err, buffer) => {
            if(err) {
                observer.onError(err);
            } else {
                observer.onNext(buffer);
                observer.onCompleted();
            }
        })
    });
}