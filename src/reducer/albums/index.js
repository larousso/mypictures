export const LOADING = 'albums/LOADING';
export const ADD_ALBUM = 'albums/ADD_ALBUM';
export const DELETE_ALBUM = 'albums/DELETE_ALBUM';
export const LOAD_SUCCESS = 'albums/LOAD_SUCCESS';
export const LOAD_FAIL = 'albums/LOAD_FAIL';
export const DISCARD_ALBUMS = 'albums/DISCARD_ALBUMS';
export const ADD_PICTURE_TO_ALBUM = 'albums/ADD_TO_ALBUM';

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
            };
        case ADD_PICTURE_TO_ALBUM:
            let picture = action.result;
            let alb = state.albums.find(a => a.id == picture.album);
            if(alb) {
                let newAlbum = {...alb};
                if (newAlbum.pictures) {
                    newAlbum.pictures.push(picture)
                } else {
                    newAlbum.pictures = [picture]
                }
                let albums = [newAlbum, ...state.albums.filter(a => a.id !== picture.album)];
                return {
                    ...state,
                    albums
                };
            } else {
                return state;
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
