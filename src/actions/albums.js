import Http                                 from './http'
import { replacePath }                 from 'redux-simple-router'
import {LOADING, LOAD_FAIL, LOAD_SUCCESS, ADD_ALBUM, DELETE_ALBUM, DISCARD_ALBUMS, ADD_PICTURE_TO_ALBUM}   from '../reducer/albums'
//import logger                               from '../logger'

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

export function addPictureToAlbum(picture) {
    return {
        type: ADD_PICTURE_TO_ALBUM,
        result: picture
    };
}

export function fetchAlbums(username) {
    return (dispatch, store) => {
        if (username && (!store().albums || !store().albums.loaded)) {
            console.log('Loading albums for ', username);
            dispatch(loadingAlbums());
            return Http.get(`/api/accounts/${username}/albums`, store().authToken)
                .then(
                    albums =>
                        Promise.all(
                            albums.map(album =>
                                Http.get(`/api/accounts/${username}/albums/${album.id}/pictures`, store().authToken).then(pictures => ({pictures, ...album}))
                            )
                        )
                        .then(albums => dispatch(loadAlbums(albums)))
                    ,
                    err => dispatch(loadAlbumsFail(err))
                )
                .catch(err => dispatch(loadAlbumsFail(err)));
        }
    };
}

export function fetchDeleteAlbum(username, id) {
    return (dispatch, store) => {
        if(username && id) {
            return Http.delete(`/api/accounts/${username}/albums/${id}`, store().authToken)
                .then(
                    _ => dispatch(deleteAlbum(id)),
                    err => console.log("Err", err));
        }
    }

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
                            dispatch(addAlbum(rep));
                            if(redirect) {
                                dispatch(replacePath(redirect));
                            }
                        },
                        err => {}
                    ),
                err => {}
            );

    };

}