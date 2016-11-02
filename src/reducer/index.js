import { combineReducers }      from 'redux';
//import multireducer             from 'multireducer';
import { routerReducer }         from 'react-router-redux'
import auth                     from './auth'
import account                  from './account'
import albums                   from './albums'
import album                    from './album'
import editedAlbum                    from './editedAlbum'
import pictures                 from './pictures'
import picture                  from './picture'
import currentLocation          from './currentLocation'


function authToken(state = {}, action = {}) {
    return state;
}

export default combineReducers(
    {authToken, auth, account, editedAlbum, album, albums, pictures, picture, currentLocation, routing: routerReducer}
);
