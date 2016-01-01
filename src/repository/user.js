import Database, {dbInstance}         from './database'
import rx               from 'rx'
import Roles            from '../authentication/roles'

const db = dbInstance('users');
db.ensureIndex('username');

const Schema = {
    id: 'User',
    type: 'object',
    properties: {
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            required: false
        },
        surname: {
            type: 'string',
            required: false
        },
        role: {
            type: 'string',
            required: true
        }
    }
};

export default class User extends Database {

    constructor(user) {
        super(db, Schema, user);
    }

    static get(id) {
        return new User().get(id);
    }

    validPassword(password) {
        return this.data.password === password;
    }

    static findByName(username) {
        return Database
            .streamQueryToRx(db.query({username: username}))
            .take(1)
            .map(value => new User(value));
    }

    static deleteAll() {

    }
}

rx.Observable.zip(
    new User({id:'adelegue', username: 'adelegue', name: 'Delègue', surname:'Alexandre', password: 'alex', role: Roles.ADMIN}).save(),
    new User({id:'invite', username: 'invite', name: 'invite', surname:'invite', password: 'invite', role: Roles.GUEST}).save()
).subscribe(ok => console.log("ok", ok), ko => console.log("ko", ko));
