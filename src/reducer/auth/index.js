export const LOAD = 'auth/LOAD';
export const LOAD_SUCCESS = 'auth/LOAD_SUCCESS';
export const LOAD_FAIL = 'auth/LOAD_FAIL';
export const LOGIN = 'auth/LOGIN';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAIL = 'auth/LOGIN_FAIL';
export const LOGOUT = 'auth/LOGOUT';
export const LOGOUT_SUCCESS = 'auth/LOGOUT_SUCCESS';
export const LOGOUT_FAIL = 'auth/LOGOUT_FAIL';

const initialState = {
    loaded: false,
    loginError: {}
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                user: action.result
            };
        case LOAD_FAIL:
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.error
            };
        case LOGIN:
            return {
                ...state,
                loggingIn: true
            };
        case LOGIN_SUCCESS:
            return {
                ...state,
                loggingIn: false,
                loginError: {},
                user: action.result
            };
        case LOGIN_FAIL:
            return {
                ...state,
                loggingIn: false,
                user: null,
                loginError: action.error
            };
        case LOGOUT:
            return {
                ...state,
                loggingOut: true
            };
        case LOGOUT_SUCCESS:
            return {
                ...state,
                loggingOut: false,
                user: null
            };
        case LOGOUT_FAIL:
            return {
                ...state,
                loggingOut: false,
                logoutError: action.error
            };
        default:
            return state;
    }
}