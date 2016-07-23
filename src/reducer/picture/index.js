export const LOADING = 'picture/LOADING';
export const LOAD_SUCCESS = 'picture/LOAD_SUCCESS';
export const LOAD_FAIL = 'picture/LOAD_FAIL';
export const ADD_PICTURE = 'picture/ADD_PICTURE';

const initialState = {
    loaded: false,
    loading: false,
    picture: {}
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                picture: action.result
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
                picture: {}
            };
        default:
            return state;
    }
}