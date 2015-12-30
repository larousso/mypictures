import Database, {dbInstance}         from './database'
import Secondary        from 'level-secondary';
import rx               from 'rx'
import Roles            from '../authentication/roles'
import {validate}       from 'express-jsonschema'


const db = dbInstance('users');
//db.byName = Secondary(db, 'username');


class Album extends Database {
    constructor(album) {
        super(db, album);
    }
    static schema = {
            id: 'Album',
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    required: true
                },
                description: {
                    type: 'string',
                    required: false
                }
            }
        };
}


export default Album;