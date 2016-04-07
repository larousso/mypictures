import Database, {dbInstance}         from './database'
import rx               from 'rx'

const db = dbInstance('comments');
db.ensureIndex('pictureId');

const Schema = {
    id: 'Comment',
    type: 'object',
    properties: {
        pictureId: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        comment: {
            type: 'string',
            required: true
        },
        date: {
            type: 'string',
            required: true
        }
    }
};


export default class Comment extends Database {
    constructor(album) {
        super(db, Schema, album);
    }

    static get(id) {
        return new Comment().get(id);
    }
    static delete(id) {
        return new Comment().delete(id);
    }

    static listAll() {
        return Database.streamToRx(db.createReadStream());
    };

    static listByPicture(id) {
        if(!id) {
            return rx.Observable.empty();
        }
        return Database.streamQueryToRx(db.query({pictureId: id}));
    }
}