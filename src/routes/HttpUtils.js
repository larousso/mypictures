import logger from '../logger'

export default {
    hasRole: (role) => (req, res, next) => {
        if(req.isAuthenticated()) {
            if(req.user.role === role) {
                next();
            } else {
                res.send('Unauthorized').status(401).end();
            }
        } else {
            res.send('Forbidden').status(403).end();
        }
    },
    isAuthenticated: (req, res, next) => {
        if(req.isAuthenticated()) {
            next();
        } else {
            res.json({message:'Forbidden'}).status(403).end();
        }
    },

    handleErrors: (err, res) => {
        logger.log('error', 'Errors', err.errors);
        if(err.type === 'business') {
            res.status(400).json(err.errors).end();
        } else {
            res.status(500).json(err.errors).end();
        }

    }
};