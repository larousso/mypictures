const LOADING = 'pictures/LOADING';
const CREATE_PICTURE = 'pictures/CREATE_PICTURE';
const RAW_PICTURE = 'pictures/RAW_PICTURE';
const UPDATE_RAW_PICTURE = 'pictures/UPDATE_RAW_PICTURE';
const PICTURE_CREATED = 'pictures/PICTURE_CREATED';
const PICTURE_CREATION_ERROR = 'pictures/PICTURE_CREATION_ERROR';
const ADD_PICTURE = 'pictures/ADD_PICTURE';
const DELETE_PICTURE = 'pictures/DELETE_PICTURE';
const LOAD_SUCCESS = 'pictures/LOAD_SUCCESS';
const LOAD_FAIL = 'pictures/LOAD_FAIL';

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
                pictures: {[id]:{id, raw:action.result, name: action.result.file.name, creating: true, created:false}, ...state.pictures}
            };
        case UPDATE_RAW_PICTURE:
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]:{id, raw:action.result, name: action.result.file.filename, creating: true, created:false}, ...state.pictures}
            };
        case PICTURE_CREATED:
            delete state.pictures[id];
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]: {id, raw:{}, picture:action.result, name: action.result.filename, creating: false, created:true}, ...state.pictures}
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
            if(id) {
                delete state.pictures[id];
            }
            return {
                ...state,
                loading: false,
                loaded: true,
                pictures: {[id]: {id, raw:{}, picture:action.result, creating: false, created:false}, ...state.pictures}
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

export function addRawPicture(picture) {
    return {
        type: RAW_PICTURE,
        result: picture
    };
}
export function updateRawPicture(picture) {
    return {
        type: UPDATE_RAW_PICTURE,
        result: picture
    };
}
export function pictureCreated(picture) {
    return {
        type: PICTURE_CREATED,
        result: picture
    };
}

export function pictureCreationError(error) {
    return {
        type: PICTURE_CREATION_ERROR,
        result: {error, creating: false, created:false}
    };
}

export function addPicture(picture) {
    return {
        type: ADD_PICTURE,
        result: {picture, creating: false, created:false}
    };
}

export function loadingPictures() {
    return {
        type: LOADING
    };
}

export function loadPicturesFail(error) {
    return {
        type: LOAD_FAIL,
        error: error
    };
}

export function loadPictures(pictures) {
    return {
        type: LOAD_SUCCESS,
        result: pictures
            .map(picture => ({picture, id: picture.id, name: picture.filename, creating: false, created:true}))
            .reduce((acc, elt) => {
                acc[elt.id] = elt;
                return acc;
            }, {})
    };
}

export function deletePicture(id) {
    return {
        type: DELETE_PICTURE,
        result: id
    };
}