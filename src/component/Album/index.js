import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import rx                               from 'rx'
import Http                             from '../http'
import GridList                         from 'material-ui/lib/grid-list/grid-list';
import GridTile                         from 'material-ui/lib/grid-list/grid-tile';
import CircularProgress                 from 'material-ui/lib/circular-progress';
import IconButton                       from 'material-ui/lib/icon-button';
import Colors                           from 'material-ui/lib/styles/colors'
import FontIcon                         from 'material-ui/lib/font-icon';
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {addRawPicture, updateRawPicture, pictureCreated, pictureCreationError, loadingPictures, loadPictures, loadPicturesFail, deletePicture}   from '../../reducer/pictures'
import uuid from 'node-uuid'




class Album extends Component {

    static propTypes = {
        routing: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        album: PropTypes.object.isRequired,
        loadAccount: PropTypes.func,
        loadingAccount: PropTypes.func,
        loadAccountFail: PropTypes.func,
        loadAlbum: PropTypes.func,
        loadingAlbum: PropTypes.func,
        loadAlbumFail: PropTypes.func
    };

    static preRender = (store, renderProps) => {
        if(__SERVER__) {
            import User     from '../../repository/user';
            import Album    from '../../repository/album';
            import Picture  from '../../repository/picture';

            let { params: { username, albumId } } = renderProps;
            console.log("Loading album", username, albumId);
            if (username) {
                return store.dispatch(dispatch =>
                    User.findByName(username).map(rep => rep.data).toPromise()
                    .then(
                        user => dispatch(loadAccount(user)),
                        err => dispatch(loadAccountFail(err)))
                    .then(_ =>
                        Album.get(albumId).toPromise())
                    .then(
                        album => dispatch(loadAlbum(album)),
                        err => dispatch(loadAlbumFail(err)))
                    .then(_ => {
                        dispatch(loadingPictures());
                        return Picture.listByAlbum(albumId).toPromise();
                    })
                    .then(
                        pictures => dispatch(loadPictures(pictures)),
                        err => dispatch(loadPicturesFail(err)))
                    .then(_ => {
                        console.log("Loading album finished");
                    }));
            } else {
                console.log("No user !!!");
                return Promise.resolve(loadAccountFail({message: 'no user'}));
            }
        }
    };

    componentDidMount() {
        let { params: { albumId, username }, account: { loaded } } = this.props;
        if(username && !loaded) {
            this.props.loadingAccount();
            Http.get(`/api/accounts/${username}`)
                .then(
                    user => this.props.loadAccount(user),
                    err => this.props.loadAccountFail(err))
                .then(_ => {
                    this.props.loadingAlbum();
                    return Http.get(`/api/accounts/${username}/albums/${albumId}`)
                })
                .then(
                    albums => this.props.loadAlbum(albums),
                    err => this.props.loadAlbumFail(err))
                .then(_ => {
                    this.props.loadingPictures();
                    return Http.get(`/api/accounts/${username}/albums/${albumId}/pictures`)})
                .then(
                    pictures => this.props.loadPictures(pictures),
                    err => this.props.loadPicturesFail(err));
        } else {
            //this.props.loadAccountFail({message: 'no user'});
        }
    }

    onFilesChange = e => {
        e.preventDefault();

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        if(files) {
            let { params: { albumId, username }} = this.props;
            filesToObservable(files)
                .map(file => ({id:uuid.v1(), file}))
                .do(pair => {
                    this.props.addRawPicture(pair);
                })
                .flatMap(pair => resize(pair.file).map(url => ({...pair, src:url})))
                //.do(triplet => {
                //    this.props.updateRawPicture(triplet);
                //})
                .map(triplet => ({...triplet, blob: dataURLToBlob(triplet.src)}))
                .flatMap(args => {
                    let {blob, file, id} = args;
                    var data = new FormData();
                    data.append('file', blob);
                    data.append('type', file.type);
                    console.log('Type', file.type);
                    data.append('filename', file.name);
                    return rx.Observable.fromPromise(Http.postData(`/api/accounts/${username}/albums/${albumId}/pictures/${id}`, data));
                })
                .subscribe(
                    picture => {
                        if(picture && picture.id) {
                            this.props.pictureCreated(picture)
                        }
                    },
                    err => {
                        this.props.pictureCreationError(err);
                        console.log('Error', err)
                    }
                );
        }
    };

    getImage = picture => {
        if(picture.creating && !picture.created) {
            if(picture.raw.src) {
                return (
                    <div key={picture.id}>
                        <img src={picture.raw.src} height="200px"/>
                        <CircularProgress mode="indeterminate" />
                    </div>
                );
            } else {
                return(
                    <div>
                        <CircularProgress mode="indeterminate" />
                    </div>
                );
            }
        } else if(picture.picture && picture.picture.file) {
            return (
                <div key={picture.id}>
                    <img src={picture.picture.file} height="200px"/>
                </div>
            );
        }
    };

    getPictures = () => {
        let { pictures: {pictures = {} } } = this.props;
        return Object.keys(pictures).filter(key => pictures.hasOwnProperty(key)).map(key => pictures[key]);
    };

    deletePicture = id => () => {
        let { params: { albumId, username }} = this.props;
        Http.delete(`/api/accounts/${username}/albums/${albumId}/pictures/${id}`)
            .then(
                _ => this.props.deletePicture(id),
                err => console.log("Err", err));
    };

    editPicture = id => () => {

    };

    render() {
        let { album: { album: { title } }} = this.props;
        return (
            <div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <h1>{title}</h1>
                    </div>
                </div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <input type="file" multiple="true" onChange={this.onFilesChange} />
                    </div>
                </div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <GridList cellHeight={200} cols={4} >
                            {this.getPictures().map( (picture, index) =>
                                <GridTile key={picture.id || index}
                                          title={picture.name || 'Image'}
                                          actionIcon={<div>
                                            <IconButton tooltip="Edit" onClick={this.editPicture(picture.id)}>
                                                <FontIcon className="icon icon-pencil" color={Colors.white} />
                                            </IconButton>
                                            <IconButton tooltip="Delete" onClick={this.deletePicture(picture.id)}>
                                                <FontIcon className="icon icon-bin" color={Colors.white} />
                                            </IconButton>
                                          </div>}
                                >
                                    {this.getImage(picture)}
                                </GridTile>
                            )}
                        </GridList>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(
    state => ({
        routing: state.routing,
        account: state.account,
        album: state.album,
        pictures: state.pictures
    }),
    dispatch => ({
        loadAccount: (user) => {
            dispatch(loadAccount(user))
        },
        loadingAccount: () => {
            dispatch(loadingAccount())
        },
        loadAccountFail: (err) => {
            dispatch(loadAccountFail(err))
        },
        loadAlbum: (user) => {
            dispatch(loadAlbum(user))
        },
        loadingAlbum: () => {
            dispatch(loadingAlbum())
        },
        loadAlbumFail: (err) => {
            dispatch(loadAlbumFail(err))
        },
        addRawPicture: (picture) => {
            dispatch(addRawPicture(picture))
        },
        updateRawPicture: (picture) => {
            dispatch(updateRawPicture(picture))
        },
        loadingPictures: () => {
            dispatch(loadingPictures())
        },
        loadPictures: pictures => {
            dispatch(loadPictures(pictures))
        },
        loadPicturesFail: error => {
            dispatch(loadPicturesFail(error))
        },
        pictureCreated: (picture) => {
            dispatch(pictureCreated(picture))
        },
        pictureCreationError: (err) => {
            dispatch(pictureCreationError(err))
        },
        deletePicture: (id) => {
            dispatch(deletePicture(id))
        }
    })
)(Album);


function dataURLToBlob(dataURL) {
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

function resize(current_file, maxWidth=1024, maxHeight=1024) {
    return rx.Observable.create(observer => {
        var reader = new FileReader();
        if (current_file.type.indexOf('image') == 0) {
            reader.onload = function (event) {
                var image = new Image();
                image.src = event.target.result;

                image.onload = function() {
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
        }
    });

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