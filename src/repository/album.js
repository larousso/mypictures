import Database from './database'


class Album extends Database {
    constructor() {
        super('users');
    }
}


export default new Album();