//import level from 'level'
import levelup from 'level'
import Sublevel from 'level-sublevel'
import uuid from 'node-uuid'
import rx from 'rx'
import jsonschema from 'jsonschema'
import levelQuery from 'level-queryengine'
import jsonqueryEngine from 'jsonquery-engine'

const levelupDB = levelup(__DBLOCATION__, { valueEncoding: 'json' });
const db = Sublevel(levelupDB);

export function dbInstance(namespace) {
    const levelQueryDb = levelQuery(db.sublevel(namespace));
    levelQueryDb.query.use(jsonqueryEngine());
    return levelQueryDb;
}

const generateId = () => {
    return uuid.v1();
};

const validate = (obj, schema) => {
    if(schema && obj) {
        let validator = new jsonschema.Validator();
        let validation = validator.validate(obj, schema, {propertyName: 'obj'});

        if(!validation.valid) {
            let messages = validation.errors.reduce((acc, elt) => {
                let {property, message} = elt;
                if(!acc[property]) acc[property] = [];
                acc[property].push({property, message}, ...acc[property]);
                return acc;
            }, {});
            return messages;
        }
    }
}

export default class Database {

    constructor(db, schema, data) {
        this.db = db;
        this.rx = rx;
        this.data = data;
        this.schema = schema;
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
                let validation = validate(this.data, this.schema);
                if(validation) {
                    observer.onError({type:'business', errors: validation});
                } else {
                    context.db.put(context.data.id, context.data, (error) => {
                        if(error) {
                            observer.onError({type:'business', errors: error});
                        } else {
                            observer.onNext(context.data);
                            observer.onCompleted();
                        }
                    });
                }
            })
        } else {
            return rx.Observable.throw(new Error('Missing id or value'));
        }
    }

    delete(id) {
        let deleteId = id || this.data.id;
        if(deleteId) {
            let context = this;
            return rx.Observable.create(observer => {
                context.db.del(deleteId, (error) => {
                    if (error) observer.onError(error);
                    observer.onNext();
                    observer.onCompleted();
                })
            })
        } else {
            return rx.Observable.throw(new Error('Missing id'));
        }
    }

    static streamToRx(stream) {
        return rx.Observable.create(observer => {
            stream
                .on('data', (data) => {
                    observer.onNext(data.value);
                })
                .on('error', (errors) => {
                    observer.onError({type:'technical', errors});
                })
                .on('close', function () {
                    observer.onCompleted();
                })
                .on('end', function () {
                    observer.onCompleted();
                });
        });
    }
    static streamQueryToRx(stream) {
        return rx.Observable.create(observer => {
            stream
                .on('data', (data) => {
                    observer.onNext(data);
                })
                .on('error', (errors) => {
                    observer.onError({type:'technical', errors});
                })
                .on('close', function () {
                    observer.onCompleted();
                })
                .on('end', function () {
                    observer.onCompleted();
                });
        });
    }
}


