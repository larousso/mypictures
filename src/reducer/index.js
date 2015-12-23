import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routeReducer }     from 'redux-simple-router'
import sandwiches from './sandwiches'


export default combineReducers(Object.assign({}, {sandwiches}, {
    routing: routeReducer
}));
