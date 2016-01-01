const LOADING = 'albums/LOADING';
const LOAD_SUCCESS = 'albums/LOAD_SUCCESS';
const LOAD_FAIL = 'albums/LOAD_FAIL';

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
                albums: action.result
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
                albums: {}
            };
        default:
            return state;
    }
}

export function loadingAlbums() {
    return {
        type: LOADING
    };
}

export function loadAlbumsFail(error) {
    return {
        type: LOAD_FAIL,
        error: error
    };
}

export function loadAlbums(albums) {
    return {
        type: LOAD_SUCCESS,
        result: albums
    };
}