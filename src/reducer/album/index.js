export const LOADING = 'album/LOADING';
export const LOAD_SUCCESS = 'album/LOAD_SUCCESS';
export const LOAD_FAIL = 'album/LOAD_FAIL';

const initialState = {
    loaded: false,
    loading: false,
    album: {}
};

export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
        case LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                album: action.result
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
                album: {}
            };
        default:
            return state;
    }
}

export function loadingAlbum() {
    return {
        type: LOADING
    };
}

export function loadAlbumFail(error) {
    return {
        type: LOAD_FAIL,
        error: error
    };
}

export function loadAlbum(album) {
    return {
        type: LOAD_SUCCESS,
        result: album
    };
}