export const LOADING = 'account/LOADING';
export const LOAD_SUCCESS = 'account/LOAD_SUCCESS';
export const LOAD_FAIL = 'account/LOAD_FAIL';

const initialState = {
    loaded: false,
    loading: false
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
        case LOADING:
            return {
                ...state,
                loading: true,
                loaded: false,
                user: {}
            };
        default:
            return state;
    }
}