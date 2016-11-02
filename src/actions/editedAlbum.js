import Http                                 from './http'
import {LOADING, LOAD_FAIL, LOAD_SUCCESS}   from '../reducer/editedAlbum'
import { push }                             from 'react-router-redux'
import {addAlbum}                           from './albums'

export function loadingEditedAlbum() {
    return {
        type: LOADING
    };
}

export function loadEditedAlbumFail(error) {
    return {
        type: LOAD_FAIL,
        error: error
    };
}

export function loadEditedAlbum(album) {
    return {
        type: LOAD_SUCCESS,
        result: album
    };
}

export function fetchAlbum(username, albumId) {
    return (dispatch, store) => {
        if(username && albumId && (!store().album.loaded || store().album.album.id != albumId)) {
            dispatch(loadingEditedAlbum());
            return Http
                .get(`/api/accounts/${username}/albums/${albumId}`, store().authToken)
                .then(
                    albums => dispatch(loadEditedAlbum(albums)),
                    err => dispatch(loadEditedAlbumFail(err))
                );
        } else {
            return dispatch(loadEditedAlbum({}));
        }
    };
}

export function saveAlbum(album, username, id, redirect) {
    return (dispatch, store) => {
        let response;
        if (id) {
            const url = `/api/accounts/${username}/albums/${id}`;
            response = Http.put(url, {id, username, ...album}, store().authToken)
        } else {
            const url = `/api/accounts/${username}/albums`;
            response = Http.post(url, {username, ...album}, store().authToken)
        }
        return response
            .then(
                album => Http
                    .get(`/api/accounts/${username}/albums/${album.id}/pictures`, store().authToken)
                    .then(pictures => ({pictures, ...album}))
                    .then(
                        rep => {
                            if(store().albums.loaded) {
                                dispatch(addAlbum(rep));
                            }
                            if(redirect) {
                                dispatch(push(redirect));
                            }
                        },
                        err => {}
                    ),
                err => {}
            );

    };

}
