import Database, {dbInstance}       from './database'
import rx                           from 'rx'
import Jimp                         from 'jimp'
import fs                           from 'fs'

const db = dbInstance('picture');
db.ensureIndex('album');

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
    static delete(id) {
        return new Picture().delete(id);
    }

    static compressAndSave(id, album, filename, type, file) {
        console.log(`Picture.compressAndSave id:${id}, album:${album}, filename:${filename}, type:${type}`);
        return rx.Observable
            .fromPromise(Jimp.read(file))
            .flatMap(image => {
                let scale = calcScale(image);
                switch (type) {
                    case Jimp.MIME_JPEG: return toBuffer(image.scale(scale).quality(80), Jimp.MIME_JPEG);
                    case Jimp.MIME_PNG: return toBuffer(image.scale(scale), Jimp.MIME_PNG);
                    case Jimp.MIME_BMP: return toBuffer(image.scale(scale), Jimp.MIME_BMP);
                    default : throw new Error(`Type ${type} is not handled`);
                }
            })
            .flatMap(file => rx.Observable.fromCallback(fs.writeFile)(`/Users/adelegue/tmpPictures/${id}`, `data:${Jimp.MIME_JPEG};base64, ${file.toString('base64')}`, 'utf-8'))
            .flatMap(file =>
                //new Picture({id, album, filename, type, file: `data:${Jimp.MIME_JPEG};base64, ${file.toString('base64')}`}).save()
                new Picture({id, album, filename, type}).save()
            )
            .flatMap(picture => rx.Observable.fromCallback(fs.readFile)(`/Users/adelegue/tmpPictures/${picture.id}`, 'utf-8').map(file => ({file:file[1], ...picture})));
    }

    static listAll() {
        return Database.streamToRx(db.createReadStream());
    };

    static deleteByAlbum(album) {
        Picture
            .listByAlbum(album)
            .flatMap(p => new Picture(p)
                .delete()
                .map(_ => ({id}))
                .catch(err => ({error:err, id: p.id}))
            )
            .filter(alt => elt.error)
            .toArray()
            .flatMap(arr => {
                if(arr && arr.length > 0) {
                    return rx.Observable.throw(arr);
                } else {
                    return rx.Observable.just();
                }
            });
    }

    static listByAlbum(album) {
        if(!album) {
            return rx.Observable.empty();
        }
        return Database
            .streamQueryToRx(db.query({album}))
            .flatMap(picture => rx.Observable.fromCallback(fs.readFile)(`/Users/adelegue/tmpPictures/${picture.id}`, 'utf-8').map(file => ({file:file[1], ...picture})))
            .toArray();
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