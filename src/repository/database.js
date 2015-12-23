import levelup from 'levelup'
import Sublevel from 'level-sublevel'
import uuid from 'node-uuid'
import rx from 'rx'

const db = Sublevel(levelup(__DBLOCATION__, { valueEncoding: 'json' }));

export function dbInstance(namespace) {
    return db.sublevel(namespace);
}

const generateId = () => {
    return uuid.v1();
};

export default class Database {

    constructor(db, data) {
        this.db = db;
        this.rx = rx;
        this.data = data;
    }

    get(id) {
        if(id) {
            let context = this;
            return rx.Observable.create(observer => {
                context.db.get(id, (error, value) => {
                    if (error) observer.onError(error);
                    observer.onNext(value);
                    observer.onCompleted();
                })
            });
        } else {
            return rx.Observable.throw(new Error('Missing id'));
        }
    }

    save(id) {
        if(this.data) {
            if(id) this.data.id = id;
            if (!this.data.id) this.data.id = generateId();

            let context = this;
            return rx.Observable.create(observer => {
                context.db.put(context.data.id, context.data, (error) => {
                    if(error) observer.onError(error);
                    observer.onNext();
                    observer.onCompleted();
                });
            });
        } else {
            return rx.Observable.throw(new Error('Missing id or value'));
        }
    }

    delete(id) {
        if(id) {
            let context = this;
            return rx.Observable.create(observer => {
                context.db.get(id, (error) => {
                    if (error) observer.onError(error);
                    observer.onNext();
                    observer.onCompleted();
                })
            });
        } else {
            return rx.Observable.throw(new Error('Missing id'));
        }
    }
}


