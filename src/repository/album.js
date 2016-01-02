import Database, {dbInstance}         from './database'
import rx               from 'rx'

const db = dbInstance('albums');
db.ensureIndex('username');

const Schema = {
    id: 'Album',
    type: 'object',
    properties: {
        title: {
            type: 'string',
            required: true
        },
        username: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string',
            required: false
        }
    }
};

export default class Album extends Database {
    constructor(album) {
        super(db, Schema, album);
    }

    static get(id) {
        return new Album().get(id);
    }
    static delete(id) {
        return new Album().delete(id);
    }

    static listAll() {
        return Database.streamToRx(db.createReadStream());
    };

    static listByUsername(username) {
        if(!username) {
            return rx.Observable.empty();
        }
        return Database.streamQueryToRx(db.query({username: username})).toArray();
    }
}