import Database, {dbInstance}         from './database'
import Secondary        from 'level-secondary';
import rx               from 'rx'
import Roles            from '../authentication/roles'

const db = dbInstance('users');
db.byName = Secondary(db, 'username');

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

rx.Observable.zip(
    new User({id:'adelegue', username: 'adelegue', name: 'Delègue', surname:'Alexandre', password: 'alex', role: Roles.ADMIN}).save(),
    new User({id:'invite', username: 'invite', name: 'invite', surname:'invite', password: 'invite', role: Roles.GUEST}).save()
).subscribe(ok => console.log("ok", ok), ko => console.log("ko", ko));

export default User;