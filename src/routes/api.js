import express                                  from 'express'
import User                                     from '../repository/user'
import Roles                                    from '../authentication/roles'

const hasRole = (role) => (req, res, next) => {
    if(req.isAuthenticated()) {
        if(req.user.role === role) {
            next();
        } else {
            console.log('Unauthorized');
            res.send('Unauthorized').code(401);
        }
    } else {
        res.send('Forbidden').code(403);
    }
};

const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.json({message:'Forbidden'}).code(403);
    }
};

export default () => {
    const app = express();

    app.get('/accounts/:username',
        isAuthenticated,
        (req, res) => {
            console.log("Loading account for username", req.params.username)
            User.findByName(req.params.username)
                .map(user => user.data)
                .subscribe(
                    user => res.json(user),
                    err => res.json(err).code(400)
                );
        });

    return app;

}