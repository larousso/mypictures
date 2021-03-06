import Http                                 from './http'
import {RAW_PICTURE, UPDATE_RAW_PICTURE, PICTURE_CREATED, PICTURE_CREATION_ERROR, ADD_PICTURE, LOADING, LOAD_FAIL, LOAD_SUCCESS, DELETE_PICTURE} from '../reducer/pictures'
import {discardAlbums, addPictureToAlbums, saveAlbum}   from './albums';
import {removePictureFromAlbum, fetchAlbum}                  from './album';
import rx                                   from 'rx'
import uuid                                 from 'node-uuid'

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

export function reorder(prevImage, newImage, username) {
    return (dispatch, store) => {
        const existingPictureIds = getCurrentPictureIds(store().album.album, store().pictures.pictures).filter(id => id != newImage.picture.id);
        const index = existingPictureIds.indexOf(prevImage.id);
        const pictureIds = [...existingPictureIds];
        pictureIds.splice(index, 0, newImage.picture.id);
        const album = {...store().album.album, pictureIds};
        return dispatch(saveAlbum(album, username, album.id));
    };
}

export function getCurrentPictures(album, pictures) {
    if(pictures) {
        return getCurrentPictureIds(album, pictures).map(id => pictures[id]).filter(e => e);
    } else {
        return [];
    }
}

function getCurrentPictureIds(album, pictures) {
    const picturesIds = (album || {}).pictureIds;
    if (picturesIds && picturesIds.length > 0) {
        return picturesIds;
    } else {
        return Object
            .keys(pictures)
            .filter(key => pictures.hasOwnProperty(key))
            .map(key => pictures[key])
            .sort(sortImageById)
            .map(p => p.id);
    }
}

function sortImageById(i1, i2) {
    if(i1.raw && i2.raw) {
        return i1.id > i2.id ? 1 : -1;
    }
    if(i1.raw) {
        return -1;
    }
    if(i2.raw) {
        return 1;
    }
    if(i1 && i2 && i1.id < i2.id) {
        return 1;
    } if(i1 && i2 && i1.id > i2.id) {
        return -1;
    } else {
        return 0;
    }
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

export function serverUpdatePicture(username, albumId, picture) {
    return (dispatch) => {
        let url = `/api/accounts/${username}/albums/${albumId}/pictures/${picture.id}`;
        return Http.put(url, picture)
            .then(
                rep => {
                    dispatch(addPicture(rep));
                    dispatch(discardAlbums());
                },
                err => {}
            );
    }
}

export function serverDeletePicture(username, albumId, id) {
    return (dispatch) => {
        return Http.rawDelete(`/api/accounts/${username}/albums/${albumId}/pictures/${id}`)
            .then(
                _ => Promise.all([
                    dispatch(removePictureFromAlbum(id)),
                    dispatch(deletePicture(id))
                ]),
                err => console.log('Err', err)
            );
    }
}

export function rotatePicture(username, albumId, id, rotation) {
    return (dispatch) => {
        let url = `/api/accounts/${username}/albums/${albumId}/pictures/${id}/_rotation`;
        return Http
            .post(url, {rotation})
            .then(
                picture => {
                    let timestamp = new Date().getTime();
                    dispatch(addPicture({timestamp, ...picture}));
                },
                err => {}
            );
    }
}

export function postAllImages(username, albumId, files) {
    return (dispatch) => {
        if (files) {
            filesToObservable(files)
                .map(file => ({id: uuid.v1(), file}))
                .do(pair => {
                    dispatch(addRawPicture(pair));
                })
                .flatMap(pair => resize(pair.file).map(url => ({...pair, src: url})))
                .map(triplet => ({...triplet, blob: dataURLToBlob(triplet.src, triplet.file)}))
                .flatMap(args => {
                    let {blob, file, id} = args;
                    var data = new FormData();
                    data.append('file', blob, file.name);
                    data.append('type', file.type);
                    data.append('filename', file.name);
                    return rx.Observable.fromPromise(Http
                        .postData(`/api/accounts/${username}/albums/${albumId}/pictures/${id}`, data));
                })
                .map(picture => {
                    console.log("DONE", picture);
                    if (picture && picture.id) {
                        return rx.Observable.fromPromise(Promise.all([
                            dispatch(pictureCreated(picture)),
                            dispatch(addPictureToAlbums(picture))
                        ]));
                    } else {
                        return rx.Observable.empty();
                    }
                })
                .toArray()
                .toPromise()
                .then(
                    any => {
                        return Promise.all([
                            dispatch(fetchAlbum(username, albumId))
                            //dispatch(fetchPictures(username, albumId))
                        ]);
                    },
                    err => {
                        return dispatch(pictureCreationError(err));
                    }
                );
        } else {
            return Promise.reject("No files")
        }
    }
}


function filesToObservable(files) {
    return rx.Observable.create(observer => {
        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            observer.onNext(file);
        }
        observer.onCompleted();
    })
}


function resize(current_file, maxWidth = 1024, maxHeight = 1024) {
    return rx.Observable.create(observer => {
        var reader = new FileReader();
        if (current_file.type.indexOf('image') == 0) {
            reader.onload = (event) => {
                var image = new Image();
                image.src = event.target.result;

                image.onload = function () {
                    var imageWidth = image.width,
                        imageHeight = image.height;

                    if (imageWidth > imageHeight) {
                        if (imageWidth > maxWidth) {
                            imageHeight *= maxWidth / imageWidth;
                            imageWidth = maxWidth;
                        }
                    }
                    else {
                        if (imageHeight > maxHeight) {
                            imageWidth *= maxHeight / imageHeight;
                            imageHeight = maxHeight;
                        }
                    }

                    var canvas = document.createElement('canvas');
                    canvas.width = imageWidth;
                    canvas.height = imageHeight;
                    image.width = imageWidth;
                    image.height = imageHeight;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

                    observer.onNext(canvas.toDataURL(current_file.type));
                    observer.onCompleted();
                }
            };
            reader.readAsDataURL(current_file);
        } else {
            observer.onError('No image found');
        }
    });

}


function dataURLToBlob(dataURL, file) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        const parts = dataURL.split(',');
        const contentType = parts[0].split(':')[1];
        const raw = parts[1];
        return new Blob([raw], {type: contentType});
    } else {
        const parts = dataURL.split(BASE64_MARKER);
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        let uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: contentType});
    }
}