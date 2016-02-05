import React, { Component, PropTypes }  from 'react';
import {findDOMNode}                    from 'react-dom';
import { connect }                      from 'react-redux'
import { Link }                         from 'react-router'
import { replacePath }                 from 'redux-simple-router'
import rx                               from 'rx'
import Http                             from '../http'
import GridList                         from 'material-ui/lib/grid-list/grid-list';
import GridTile                         from 'material-ui/lib/grid-list/grid-tile';
import CircularProgress                 from 'material-ui/lib/circular-progress';
import IconButton                       from 'material-ui/lib/icon-button';
import Colors                           from 'material-ui/lib/styles/colors'
import FontIcon                         from 'material-ui/lib/font-icon';
import UpdatePicture                    from './UpdatePicture'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {addRawPicture, updateRawPicture, pictureCreated, pictureCreationError, loadingPictures, loadPictures, loadPicturesFail, deletePicture}   from '../../reducer/pictures'
import uuid from 'node-uuid'
import Viewer                           from 'viewerjs'


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


    constructor(args) {
        super(args);
        this.state = {
            open: false,
            openPicture: false,
            lightboxIsOpen: false,
            currentImage: 0
        }
    }

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
                            return Picture.listByAlbum(albumId).toArray().toPromise();
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
        let { params: { albumId, username }, account, album, pictures} = this.props;
        let promises = [];
        if(username && !account.loaded) {
            this.props.loadingAccount();
            promises.push(
                Http.get(`/api/accounts/${username}`).then(
                    user => this.props.loadAccount(user),
                    err => this.props.loadAccountFail(err))
            );
        }
        if(username && albumId) {
            this.props.loadingAlbum();
            promises.push(
                Http.get(`/api/accounts/${username}/albums/${albumId}`).then(
                    albums => this.props.loadAlbum(albums),
                    err => this.props.loadAlbumFail(err))
            );
        }
        if(username && albumId) {
            this.props.loadingPictures();
            promises.push(
                Http.get(`/api/accounts/${username}/albums/${albumId}/pictures`).then(
                        pictures => this.props.loadPictures(pictures),
                        err => this.props.loadPicturesFail(err))
            );
        }
        Promise.all(promises).then(() => {
            console.log('Loaded');
        });
    }

    componentDidUpdate() {
        let pictures = document. querySelectorAll('.picture');
        if(!this.viewer && pictures.length > 0){
            this.viewer = new Viewer(document.getElementById("pictures"), {rotatable: false, scalable:false, zoomable:false, tooltip:false});
        }
    }

    componentWillUnmount() {
        if(this.viewer) {
            this.viewer.destroy();
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

    getImage = (picture, index) => {
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
                    <a>
                        <img src={picture.picture.file} className="picture" height="200px" alt={this.getTitle(picture)}/>
                    </a>
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
        console.log('Edit picture', id);
        if (id && this.props.pictures.pictures && this.props.pictures.pictures[id]) {
            let picture = this.props.pictures.pictures[id].picture;
            this.setState({picture, open: true});
        }
    };

    handleClose = () => {
        this.setState({open: false});
    };

    getTitle = picture => {
        if (picture.raw && picture.raw.file && picture.raw.file.name) {
            return picture.raw.file.name;
        } else if (picture.picture && picture.picture.title) {
            return picture.picture.title;
        } else if (picture.picture && picture.picture.filename) {
            return picture.picture.filename;
        }
        return 'Image';
    };


    render() {
        let { params:{username}, album: { album: { title } }} = this.props;
        return (
            <div>
                <UpdatePicture
                    username={username}
                    open={this.state.open}
                    picture={this.state.picture}
                    handleClose={this.handleClose}
                />
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
                        <GridList id="pictures" cellHeight={200} cols={4} >
                            {this.getPictures().map( (picture, index) =>
                                <GridTile key={picture.id || index}
                                          title={this.getTitle(picture)}
                                          actionIcon={<div>
                                            <IconButton tooltip="Edit" onClick={this.editPicture(picture.id)}>
                                                <FontIcon className="icon icon-pencil" color={Colors.white} />
                                            </IconButton>
                                            <IconButton tooltip="Delete" onClick={this.deletePicture(picture.id)}>
                                                <FontIcon className="icon icon-bin" color={Colors.white} />
                                            </IconButton>
                                          </div>}
                                >
                                    {this.getImage(picture, index)}
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
        changeRoute: (route) => {
            dispatch(replacePath(route))
        },
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