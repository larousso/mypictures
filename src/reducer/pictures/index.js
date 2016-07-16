export const LOADING = 'pictures/LOADING';
export const CREATE_PICTURE = 'pictures/CREATE_PICTURE';
export const RAW_PICTURE = 'pictures/RAW_PICTURE';
export const UPDATE_RAW_PICTURE = 'pictures/UPDATE_RAW_PICTURE';
export const PICTURE_CREATED = 'pictures/PICTURE_CREATED';
export const PICTURE_CREATION_ERROR = 'pictures/PICTURE_CREATION_ERROR';
export const ADD_PICTURE = 'pictures/ADD_PICTURE';
export const DELETE_PICTURE = 'pictures/DELETE_PICTURE';
export const LOAD_SUCCESS = 'pictures/LOAD_SUCCESS';
export const LOAD_FAIL = 'pictures/LOAD_FAIL';

const initialState = {
    loaded: false,
    loading: false,
    pictures: {}
};

export default function reducer(state = initialState, action = {}) {
    let id;
    if(action.result && action.result.picture) {
        id = action.result.picture.id;
    } else if(action.result && action.result.raw) {
        id = action.result.raw.id;
    } else if(action.result && action.result.id) {
        id = action.result.id;
    } else if(action.result) {
        id = action.result;
    }

    switch (action.type) {
        case LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: action.result
            };
        case RAW_PICTURE:
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]:{id, raw:action.result, creating: true, created:false}, ...state.pictures}
            };
        case UPDATE_RAW_PICTURE:
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]:{id, raw:action.result, creating: true, created:false}, ...state.pictures}
            };
        case PICTURE_CREATED:
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]: {id, raw:{}, picture:action.result, creating: false, created:true}, ...state.pictures}
            };
        case PICTURE_CREATION_ERROR:
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]: {error: action.error, raw:{}, picture:{}, creating: false, created:false}, ...state.pictures}
            };
        case ADD_PICTURE:
            let newPicture = action.result;
            if(state.pictures[id].picture) {
                newPicture = Object.assign({}, state.pictures[id].picture, action.result);
            }
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]: {id, raw:{}, picture:newPicture, creating: false, created:false}, ...state.pictures}
            };
        case DELETE_PICTURE:
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {...state.pictures}
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
                pictures: {}
            };
        default:
            return state;
    }
}