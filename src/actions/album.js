import Http                                 from './http'
import {LOADING, LOAD_FAIL, LOAD_SUCCESS, ADD_TO_ALBUM, REMOVE_FROM_ALBUM}   from '../reducer/album'


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

export function addPictureToAlbum(picture) {
    return {
        type: ADD_TO_ALBUM,
        result: picture
    };
}

export function removePictureFromAlbum(picture) {
    return {
        type: REMOVE_FROM_ALBUM,
        result: picture
    };
}

export function fetchAlbum(username, albumId) {
    return (dispatch, store) => {
        if(username && albumId && (!store().album.loaded || store().album.album.id != albumId)) {
            dispatch(loadingAlbum());
            return Http
                .get(`/api/accounts/${username}/albums/${albumId}`, store().authToken)
                .then(
                    albums => dispatch(loadAlbum(albums)),
                    err => dispatch(loadAlbumFail(err))
                );
        }
    };
}

