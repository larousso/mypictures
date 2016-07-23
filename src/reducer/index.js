import { combineReducers }      from 'redux';
//import multireducer             from 'multireducer';
import { routeReducer }         from 'redux-simple-router'
import auth                     from './auth'
import account                  from './account'
import albums                   from './albums'
import album                    from './album'
import pictures                 from './pictures'
import picture                  from './picture'
import currentLocation          from './currentLocation'


function authToken(state = {}, action = {}) {
    return state;
}

export default combineReducers(Object.assign({}, {authToken, auth, account, album, albums, pictures, picture, currentLocation}, {
    routing: routeReducer
}));
