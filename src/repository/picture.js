import Database from './database'


class Picture extends Database {
    constructor() {
        super('users');
    }
}


export default new Picture();