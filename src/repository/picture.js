import Database, {dbInstance}       from './database'
import rx                           from 'rx'
import Jimp                         from 'jimp'

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
            required: true
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

    static compressAndSave(id, album, filename, file) {
        return rx.Observable
            .fromPromise(Jimp.read(file))
            .flatMap(image => rx.Observable.create(observer => {
                image.quality(60).getBuffer(Jimp.MIME_JPEG, (err, res) => {
                    if (err) {
                        observer.onError(err);
                    } else {
                        observer.onNext(res);
                        observer.onCompleted();
                    }
                })
            }))
            .flatMap(file => {
                let base64 = `data:${Jimp.MIME_JPEG};base64, ${file.toString('base64')}`;
                return new Picture({id, album, filename, file: base64}).save()
            });
    }

    static listAll() {
        return Database.streamToRx(db.createReadStream());
    };

    static listByAlbum(album) {
        if(!album) {
            return rx.Observable.empty();
        }
        return Database.streamQueryToRx(db.query({album})).toArray();
    }
}