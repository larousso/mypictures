export const LOADING = 'album/LOADING';
export const LOAD_SUCCESS = 'album/LOAD_SUCCESS';
export const LOAD_FAIL = 'album/LOAD_FAIL';
export const ADD_TO_ALBUM = 'album/ADD_TO_ALBUM';
export const REMOVE_FROM_ALBUM = 'album/REMOVE_FROM_ALBUM';

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
        case ADD_TO_ALBUM:
            const pictureIds = state.album.pictureIds || [];
            return {
                ...state,
                album: {...state.album, pictureIds: [...pictureIds, action.result.id] }
            };
        case REMOVE_FROM_ALBUM:
            return {
                ...state,
                album: {...state.album, pictureIds: state.album.pictureIds.filter(p => p.id != action.result) }
            };
        default:
            return state;
    }
}