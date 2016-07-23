import Http                                 from './http'
import {LOADING, LOAD_FAIL, LOAD_SUCCESS} from '../reducer/picture'

export function loadPicture(picture) {
    return {
        type: LOAD_SUCCESS,
        result: picture
    };
}

export function loadingPicture() {
    return {
        type: LOADING
    };
}

export function loadPictureFail(error) {
    return {
        type: LOAD_FAIL,
        error: error
    };
}


export function fetchPicture(username, albumId, pictureId) {
    return (dispatch, store) => {
        if (username && albumId && pictureId && (!store().picture.loading)) {
            dispatch(loadingPicture());
            return Http.get(`/api/accounts/${username}/albums/${albumId}/pictures/${pictureId}`, store().authToken)
                .then(
                    picture => dispatch(loadPicture(picture)),
                    err => dispatch(loadPictureFail(err))
                )
        }
    };
}