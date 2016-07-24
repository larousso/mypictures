import { push }                 from 'react-router-redux'
import http                         from './http'
import {LOGIN_FAIL, LOAD_SUCCESS}   from '../reducer/auth'

export function login ({username, password}, redirect) {
    return dispatch =>
        http
            .post('/api/login', {username, password})
            .then(user => {
                dispatch(loadUser(user.user));
                dispatch(push(redirect || '/account/'+user.user.username));
            }).catch(_ => {
                dispatch(authError({
                    login: 'Mauvais login ou mot de passe',
                    password: 'Mauvais login ou mot de passe'
                }));
            });
}

export function authError(error) {
    return {
        type: LOGIN_FAIL,
        error: error
    };
}

export function loadUser(user) {
    return {
        type: LOAD_SUCCESS,
        result: user
    };
}
