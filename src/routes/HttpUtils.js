
export default {
    hasRole: (role) => (req, res, next) => {
        if(req.isAuthenticated()) {
            if(req.user.role === role) {
                next();
            } else {
                console.log('Unauthorized');
                res.send('Unauthorized').status(401).end();
            }
        } else {
            console.log('Forbidden');
            res.send('Forbidden').status(403).end();
        }
    },
    isAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            next();
        } else {
            console.log('Forbidden', req.session);
            res.json({message:'Forbidden'}).status(403).end();
        }
    },

    handleErrors: (err, res) => {
        console.log('Errors', err.errors);
        if(err.type === 'business') {
            res.status(400).json(err.errors).end();
        } else {
            res.status(500).json(err.errors).end();
        }

    }
};