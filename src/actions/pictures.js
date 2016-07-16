import Http                                 from './http'
import {RAW_PICTURE, UPDATE_RAW_PICTURE, PICTURE_CREATED, PICTURE_CREATION_ERROR, ADD_PICTURE, LOADING, LOAD_FAIL, LOAD_SUCCESS, DELETE_PICTURE} from '../reducer/pictures'

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
        result: picture
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

export function fetchPictures(username, albumId) {
    return (dispatch, store) => {
        if (username && albumId && (!store().pictures.pictures || store().album.album.id != albumId)) {
            dispatch(loadingPictures());
            return Http.get(`/api/accounts/${username}/albums/${albumId}/pictures`, store().authToken)
                .then(
                    pictures => dispatch(loadPictures(pictures)),
                    err => dispatch(loadPicturesFail(err))
                )
        }
    };

}