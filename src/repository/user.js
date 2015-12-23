import Database, {dbInstance}         from './database'
import Secondary        from 'level-secondary';
import rx               from 'rx'

const db = dbInstance('users');
db.byName = Secondary(db, 'name');

class User extends Database {

    constructor(user) {
        super(db, user);
    }

    validPassword(password) {
        return this.data.password === password;
    }

    static findByName(username) {
        return rx.Observable.create(observer => {
            db.byName.get(username, (error, value) => {
                if (error) observer.onError(error);
                observer.onNext(new User(value));
                observer.onCompleted();
            })
        });
    }
}


console.log("Creating user alex");
new User({id:'alex', name: 'alex', password: 'alex'})
    .save()
    .subscribe(ok => console.log("ok", ok), ko => console.log("ko", ko));

export default User;