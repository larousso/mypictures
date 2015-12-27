import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routeReducer }     from 'redux-simple-router'
import sandwiches from './sandwiches'
import auth from './auth'


export default combineReducers(Object.assign({}, {sandwiches, auth}, {
    routing: routeReducer
}));
