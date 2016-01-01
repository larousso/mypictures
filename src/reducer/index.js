import { combineReducers }      from 'redux';
import multireducer             from 'multireducer';
import { routeReducer }         from 'redux-simple-router'
import sandwiches               from './sandwiches'
import auth                     from './auth'
import account                  from './account'
import albums                   from './albums'


export default combineReducers(Object.assign({}, {auth, account, albums}, {
    routing: routeReducer
}));
