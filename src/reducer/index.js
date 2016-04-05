import { combineReducers }      from 'redux';
//import multireducer             from 'multireducer';
import { routeReducer }         from 'redux-simple-router'
import auth                     from './auth'
import account                  from './account'
import albums                   from './albums'
import album                    from './album'
import pictures                 from './pictures'
import currentLocation          from './currentLocation'


export default combineReducers(Object.assign({}, {auth, account, album, albums, pictures, currentLocation}, {
    routing: routeReducer
}));
