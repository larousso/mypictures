import Http                                 from './http'
import {LOADING, LOAD_FAIL, LOAD_SUCCESS}   from '../reducer/account'
//import logger                               from '../logger'

export function loadingAccount() {
    return {
        type: LOADING
    };
}

export function loadAccountFail(error) {
    return {
        type: LOAD_FAIL,
        error: error
    };
}

export function loadAccount(user) {
    return {
        type: LOAD_SUCCESS,
        result: user
    };
}

export function fetchAccount(username) {
    return (dispatch, store) => {
        if (username && !store().account.loaded) {
            dispatch(loadingAccount());
            console.log('Loading account for', username);
            return Http.get(`/api/accounts/${username}`, store().authToken)
                .then(
                    user => dispatch(loadAccount(user)),
                    err => dispatch(loadAccountFail(err))
                );
                // .catch(err => {
                //     console.log('Error', err);
                //     return dispatch(loadAccountFail(err))
                // });
        } else {
            return Promise.resolve();
        }
    };
}