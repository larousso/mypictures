const LOADING = 'albums/LOADING';
const ADD_ALBUM = 'albums/ADD_ALBUM';
const DELETE_ALBUM = 'albums/DELETE_ALBUM';
const LOAD_SUCCESS = 'albums/LOAD_SUCCESS';
const LOAD_FAIL = 'albums/LOAD_FAIL';
const DISCARD_ALBUMS = 'albums/DISCARD_ALBUMS';

const initialState = {
    loaded: false,
    loading: false,
    albums: []
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
        case ADD_ALBUM:
            let {id} = action.result;
            if(id) {
                return {
                    ...state,
                    loading: false,
                    loaded: true,
                    albums: [action.result, ...state.albums.filter(a => a.id !== id)]
                };
            } else {
                return {
                    ...state,
                    loading: false,
                    loaded: true,
                    albums: [action.result, ...state.albums]
                };
            }
        case DELETE_ALBUM:
            return {
                ...state,
                loading: false,
                loaded: true,
                albums: [...state.albums.filter(a => a.id !== action.result)]
            }
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
                albums: []
            };
        case DISCARD_ALBUMS:
            return {
                ...state,
                loading: false,
                loaded: false,
                albums: []
            };

        default:
            return state;
    }
}


export function addAlbum(album) {
    return {
        type: ADD_ALBUM,
        result: album
    };
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

export function deleteAlbum(id) {
    return {
        type: DELETE_ALBUM,
        result: id
    };
}

export function discardAlbums() {
    return {
        type: DISCARD_ALBUMS
    };
}