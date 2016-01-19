import Database, {dbInstance}       from './database'
import rx                           from 'rx'
import Jimp                         from 'jimp'
import fs                           from 'fs'

const db = dbInstance('picture');
db.ensureIndex('album');

function basePath() {
    return '/Users/adelegue/tmpPictures';
}
function buildAlbumPath(albumId) {
    return `${basePath()}/${albumId}`;
}
function buildPicturePath(id, albumId) {
    return `${buildAlbumPath(albumId)}/${id}`;
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

    static compressAndSave(id, album, filename, type, file) {
        console.log(`Picture.compressAndSave id:${id}, album:${album}, filename:${filename}, type:${type}`);
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
            .flatMap(buffer => Picture.createPicture(id, album, buffer))
            .flatMap(_ => new Picture({id, album, filename, type}).save())
            .flatMap(picture => Picture.getPicture(id, album).map(file => ({file, ...picture})));
    }

    static createPicture(id, albumId, buffer) {
        let albumPath = buildAlbumPath(albumId);
        let picturePath = buildPicturePath(id, albumId);
        console.log('3', picturePath);

        let data = `data:${Jimp.MIME_JPEG};base64, ${buffer.toString('base64')}`;

        console.log(`Creating picture ${picturePath}`);
        return rx.Observable.fromCallback(fs.stat)(albumPath).flatMap(stats => {
            if(stats.isDirectory()) {
                console.log(`Directory ${albumPath} exists, creating file ${picturePath}`);
                return rx.Observable.fromCallback(fs.writeFile)(picturePath, data, 'utf-8');
            } else {
                return rx.Observable.throw(`${albumPath} is not a directory`);
            }
        }).catch(_ => {
            console.log(`Directory ${albumPath} doesn\'t exists, creating directory and file ${picturePath}`);
            return rx.Observable
                .fromCallback(fs.mkdir)(albumPath)
                .flatMap(_ => rx.Observable.fromCallback(fs.writeFile)(picturePath, data, 'utf-8'));
        });
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
            .flatMap(picture => Picture.getPicture(picture.id, album).map(file => ({file, ...picture})));
    }

    static deleteByAlbum(album) {
        console.log('Deleting pictures by album', album);
        return Picture.listByAlbum(album)
            .flatMap(p => Picture.delete(p.id))
            .flatMap(p => rx.Observable.fromCallback(fs.rmdir)(buildAlbumPath(album)));
    }

    static delete(id) {
        return Picture.get(id)
            .flatMap(p => Picture.deletePicture(id, p.album).map(_ => p))
            .flatMap(p => new Picture(p).delete());
    }

    static deletePicture(id, albumId) {
        let path = buildPicturePath(id, albumId);
        console.log(`Deleting picture ${path}`);
        return rx.Observable.fromCallback(fs.unlink)(path);
    }
}

function calcScale(image) {
    return 1024 / image.bitmap.width;
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