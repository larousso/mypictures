import React, { Component, PropTypes }  from 'react';
import {findDOMNode}                    from 'react-dom';
import { connect }                      from 'react-redux'
import { replacePath }                 from 'redux-simple-router'
import rx                               from 'rx'
import Http                             from '../http'
import IconButton                       from 'material-ui/lib/icon-button';
import CircularProgress                 from 'material-ui/lib/circular-progress';
import {grey50}                           from 'material-ui/lib/styles/colors'
import ArrowBack                        from 'material-ui/lib/svg-icons/navigation/chevron-left';
import AppBar                           from 'material-ui/lib/app-bar';
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {addAlbum}                       from '../../reducer/albums'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {addRawPicture, pictureCreated, pictureCreationError, loadingPictures, loadPictures, loadPicturesFail}   from '../../reducer/pictures'
import uuid from 'node-uuid'
import Theme                            from '../theme';
import getMuiTheme                      from 'material-ui/lib/styles/getMuiTheme';
import Viewer                           from 'viewerjs'
import ImagePreview                     from './image'

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

    getChildContext = () => {
        return {
            muiTheme: getMuiTheme(Theme)
        };
    };

    constructor(args) {
        super(args);
        this.state = {
            open: false,
            openPicture: false,
            lightboxIsOpen: false,
            currentImage: 0,
            edit: {}
        }
    }

    static preRender = (store, renderProps) => {
        if (__SERVER__) {
            import User     from '../../repository/user';
            import Album    from '../../repository/album';
            import Picture  from '../../repository/picture';

            let { params: { username, albumId } } = renderProps;
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

                        }));
            } else {
                return Promise.resolve(loadAccountFail({message: 'no user'}));
            }
        }
    };

    componentDidMount() {
        let { params: { albumId, username }, account, pictures, album} = this.props;
        if (username && !account.loaded) {
            this.props.loadingAccount();
            Http.get(`/api/accounts/${username}`).then(
                user => this.props.loadAccount(user),
                err => this.props.loadAccountFail(err))

        }
        if (username && albumId && (!album.album || album.album.id != albumId)) {
            this.props.loadingAlbum();
            Http.get(`/api/accounts/${username}/albums/${albumId}`).then(
                albums => this.props.loadAlbum(albums),
                err => this.props.loadAlbumFail(err))
        }
        if (username && albumId && (!pictures.pictures || album.album.id != albumId)) {
            this.props.loadingPictures();
            Http.get(`/api/accounts/${username}/albums/${albumId}/pictures`).then(
                pictures => this.props.loadPictures(pictures),
                err => this.props.loadPicturesFail(err))

        }
        this.applyViewer();
        if(this.props.user.role !== Roles.ADMIN) {
            document.addEventListener("contextmenu", function(e){
                if (e.target.nodeName === "IMG") {
                    e.preventDefault();
                }
            }, false);
        }
    }

    applyViewer = () => {
        let pictures = document.querySelectorAll('.picture');
        if (pictures.length > 0) {
            if (this.viewer) {
                this.viewer.destroy();
            }
            this.viewer = new Viewer(document.getElementById("pictures"), {
                rotatable: false,
                scalable: false,
                zoomable: false,
                tooltip: false,
                transition: false,
                navbar: 3,
                toolbar: 2
            });
            Viewer.noConflict();
        }
    };

    componentDidUpdate() {
        this.applyViewer();
    }

    componentWillUnmount() {
        if (this.viewer) {
            this.viewer.destroy();
        }
        if(this.clipboard) {
            this.clipboard.destroy();
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
        console.log(files);
        if (files) {
            let { params: { albumId, username }} = this.props;
            filesToObservable(files)
                .map(file => ({id: uuid.v1(), file}))
                .do(pair => {
                    this.props.addRawPicture(pair);
                })
                .flatMap(pair => resize(pair.file).map(url => ({...pair, src: url})))
                .map(triplet => ({...triplet, blob: dataURLToBlob(triplet.src)}))
                .flatMap(args => {
                    let {blob, file, id} = args;
                    console.log('Ready to upload !!!');
                    var data = new FormData();
                    data.append('file', blob);
                    data.append('type', file.type);
                    data.append('filename', file.name);
                    return rx.Observable.fromPromise(Http.postData(`/api/accounts/${username}/albums/${albumId}/pictures/${id}`, data));
                })
                .subscribe(
                    picture => {
                        if (picture && picture.id) {
                            this.props.pictureCreated(picture)
                        }
                    },
                    err => {
                        this.props.pictureCreationError(err);
                        console.log('Error', err)
                    },
                    () => Http.get(`/api/accounts/${username}/albums/${albumId}`)
                            .then(album => this.props.addAlbum(album))

                );
        }
    };

    getPictures = () => {
        let { pictures: {pictures = {} } } = this.props;
        return Object.keys(pictures).filter(key => pictures.hasOwnProperty(key)).map(key => pictures[key]);
    };

    previewLink = () => {
        if(!__SERVER__) {
            let { params: { albumId}} = this.props;
            if(albumId) {
                return `http://${window.location.host}/album/preview/${albumId}`;
            }
        } else {
            let { params: { albumId }, currentLocation: {location}} = this.props;
            if(albumId) {
                return `http://${location}/album/preview/${albumId}`;
            }
        }
    };

    mdpLink = () => {
        if(!__SERVER__) {
            let { params: { albumId, username}} = this.props;
            if(albumId) {
                return `http://${window.location.host}/login?redirect=/account/${username}/${albumId}`;
            }
        } else {
            let { params: { albumId, username }, currentLocation: {location}} = this.props;
            if(albumId) {
                return `http://${location}/login?redirect=/account/${username}/${albumId}`;
            }
        }
    };

    displayIf = (test) => (fn) => {
        if(test) {
            return fn();
        }
    };

    render() {
        let { params:{username, albumId}, album: { album: { title } }, account:{user} } = this.props;
        return (
            <div className="row" style={{background:grey50}}>
                <div className="col-xs">
                    <div className="box">
                        <div className="row center-xs">
                            <div className="col-xs-12">
                                <div className="box">
                                    <AppBar
                                        title={<span>{title}</span>}
                                        iconElementLeft={<IconButton onClick={() => this.props.changeRoute(`/account/${this.props.params.username}`)}><ArrowBack /></IconButton>}
                                        iconElementRight={<IconButton></IconButton>}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row xs-center">
                            <Habilitations account={user} role={Roles.ADMIN}>
                                <div className="box">
                                    <div className="col-xs-12">
                                        <input type="file" multiple="true" onChange={this.onFilesChange}/>
                                    </div>
                                </div>
                            </Habilitations>
                        </div>
                        <div className="row xs-center">
                            <Habilitations account={user} role={Roles.ADMIN}>
                                <div className="box">
                                    <div className="col-lg-12">
                                        <span>Lien facebook : </span><input name="fbLink" style={{width:'600'}} defaultValue={this.previewLink()} />
                                    </div>
                                </div>
                            </Habilitations>
                        </div>
                        <div className="row xs-center">
                            <Habilitations account={user} role={Roles.ADMIN}>
                                <div className="box">
                                    <div className="col-lg-12">
                                        <span>Lien autre : </span><input name="shareLink" style={{width:'600'}} defaultValue={this.mdpLink()} />
                                    </div>
                                </div>
                            </Habilitations>
                        </div>
                        {this.displayIf(this.props.pictures.loading)(_ =>
                            <CircularProgress mode="indeterminate"/>
                        )}
                        <div className="row top-xs" id="pictures">
                            {this.getPictures().sort(sortImage).map((picture, index) =>
                                (<div key={picture.id} className="col-xs-6 col-md-6 col-lg-4">
                                    <div className="box">
                                        <ImagePreview picture={picture} albumId={albumId} username={username}/>
                                    </div>
                                </div>)
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function sortImage(i1, i2) {
    if(i1.id < i2.id) {
        return 1;
    } else {
        return -1;
    }
}

Album.childContextTypes = {
    muiTheme: React.PropTypes.object
};


export default connect(
    state => ({
        user: state.auth.user,
        routing: state.routing,
        account: state.account,
        album: state.album,
        pictures: state.pictures,
        currentLocation: state.currentLocation
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
        addAlbum: (album) => {
            dispatch(addAlbum(album))
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

function filesToObservable(files) {
    return rx.Observable.create(observer => {
        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            observer.onNext(file);
        }
        observer.onCompleted();
    })
}