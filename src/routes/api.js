import express                                  from 'express'
import User                                     from '../repository/user'
import Album                                    from '../repository/album'
import Roles                                    from '../authentication/roles'
import {validate}                               from 'express-jsonschema'

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

    app.use(function(err, req, res, next) {
        var responseData;
        if (err.name === 'JsonSchemaValidation') {

            // Log the error however you please
            console.log(err.message);
            // logs "express-jsonschema: Invalid data found"

            // Set a bad request http response status
            res.status(400);

            // Format the response body
            responseData = {
                statusText: 'Bad Request',
                jsonSchemaValidation: true,
                validations: err.validations  // All of your validation information
            };

            // Respond with the right content type
            if (req.xhr || req.get('Content-Type') === 'application/json') {
                res.json(responseData);
            } else {
                res.render('badrequestTemplate', responseData);
            }

        } else {
            // pass error to next error middleware handler
            next(err);
        }
    });

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

    app.post('/accounts/:username/albums',
        hasRole(Roles.ADMIN),
        validate({body:Album.schema}),
        (req, res) => {
            console.log("Creating album on account", req.params.username)
            let username = req.params.username;
            new Album({username, ...req.body})
                .save()
                .subscribe(
                    album => res.json(album),
                    err => res.json(err).code(400)
                );
        });

    return app;

}