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
import ArrowBack                        from 'material-ui/lib/svg-icons/navigation/chevron-left';
import AppBar                           from 'material-ui/lib/app-bar';
import Paper                            from 'material-ui/lib/paper';
import TextField                        from 'material-ui/lib/text-field';
import FlatButton                       from 'material-ui/lib/flat-button';
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {addRawPicture, addPicture, updateRawPicture, pictureCreated, pictureCreationError, loadingPictures, loadPictures, loadPicturesFail, deletePicture}   from '../../reducer/pictures'
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
        let { params: { albumId, username }, account, album, pictures} = this.props;
        let promises = [];
        if (username && !account.loaded) {
            this.props.loadingAccount();
            promises.push(
                Http.get(`/api/accounts/${username}`).then(
                    user => this.props.loadAccount(user),
                    err => this.props.loadAccountFail(err))
            );
        }
        if (username && albumId) {
            this.props.loadingAlbum();
            promises.push(
                Http.get(`/api/accounts/${username}/albums/${albumId}`).then(
                    albums => this.props.loadAlbum(albums),
                    err => this.props.loadAlbumFail(err))
            );
        }
        if (username && albumId) {
            this.props.loadingPictures();
            promises.push(
                Http.get(`/api/accounts/${username}/albums/${albumId}/pictures`).then(
                    pictures => this.props.loadPictures(pictures),
                    err => this.props.loadPicturesFail(err))
            );
        }
        Promise.all(promises).then(() => {
        });
    }

    componentDidUpdate() {
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
                transition: false
            });
        }
    }

    componentWillUnmount() {
        if (this.viewer) {
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
        if (files) {
            let { params: { albumId, username }} = this.props;
            filesToObservable(files)
                .map(file => ({id: uuid.v1(), file}))
                .do(pair => {
                    this.props.addRawPicture(pair);
                })
                .flatMap(pair => resize(pair.file).map(url => ({...pair, src: url})))
                //.do(triplet => {
                //    this.props.updateRawPicture(triplet);
                //})
                .map(triplet => ({...triplet, blob: dataURLToBlob(triplet.src)}))
                .flatMap(args => {
                    let {blob, file, id} = args;
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
                    }
                );
        }
    };

    closeEditMode = id => () => {
        this.setState({edit:null,title:null,description:null});
    };

    editMode = id => event => {
        this.setState({edit:id});
    };
    savePicture = picture => () => {
        let { title, description } = this.state;
        let { params: { albumId, username} } = this.props;
        let url = `/api/accounts/${username}/albums/${albumId}/pictures/${picture.id}`;
        let oldPicture = Object.assign({}, picture.picture);
        delete oldPicture['file'];
        let newPicture = Object.assign({}, oldPicture, {title, description});
        Http.put(url, newPicture)
            .then(
                rep => {
                    this.props.addPicture(rep);
                    this.closeEditMode(picture.id)();
                },
                err => {}
            );
    };
    setTitle = (value) => {
        this.setState({
            title: value.target.value
        })
    };
    setDescription = (value) => {
        this.setState({
            description: value.target.value
        })
    };


    getImage = (picture, index) => {
        let { account:{user} } = this.props;
        if (picture.creating && !picture.created) {
            if (picture.raw.src) {
                return (
                    <div key={picture.id}>
                        <img src={picture.raw.src} height="200px"/>
                        <CircularProgress mode="indeterminate"/>
                    </div>
                );
            } else {
                return (
                    <div>
                        <CircularProgress mode="indeterminate"/>
                    </div>
                );
            }
        } else if (this.state.edit == picture.id) {
            return (
                <div className="row center-xs" key={picture.id}>
                    <div className="col-xs">
                        <div className="box">
                            <Paper>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box">
                                            <a>
                                                <img style={{cursor:'pointer'}} src={picture.picture.file}
                                                     className="picture" width="100%" alt={this.getTitle(picture)}/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="row middle-xs">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <TextField hintText="Titre"
                                                       defaultValue={picture.picture.title}
                                                       floatingLabelText="Titre"
                                                       fullWidth={true} onChange={this.setTitle}
                                                       errorText={this.state.titreError}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <TextField hintText="Description"
                                                       floatingLabelText="Description"
                                                       defaultValue={picture.picture.description}
                                                       fullWidth={true}
                                                       multiLine={true}
                                                       rows={2}
                                                       onChange={this.setDescription}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <FlatButton label="Enregistrer" primary={true} onClick={this.savePicture(picture)} />
                                            <FlatButton label="Annuler" onClick={this.closeEditMode(picture.id)} />
                                        </div>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
            );
        } else if (picture.picture && picture.picture.file) {
            return (
                <div className="row center-xs" key={picture.id}>
                    <div className="col-xs">
                        <div className="box">
                            <Paper>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box">
                                            <a>
                                                <img style={{cursor:'pointer'}} src={picture.picture.file}
                                                     className="picture" width="100%" alt={this.getTitle(picture)}/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="row middle-xs">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <b>{this.truncate(this.getTitle(picture))}</b>
                                        </div>
                                    </div>
                                    <div className="col-xs">
                                        <div className="box">
                                            <Habilitations account={user} role={Roles.ADMIN}>
                                                <IconButton tooltip="Edit" onClick={this.editMode(picture.id)}>
                                                    <FontIcon className="icon icon-pencil" color={Colors.black}/>
                                                </IconButton>
                                                <IconButton tooltip="Delete" onClick={this.deletePicture(picture.id)}>
                                                    <FontIcon className="icon icon-bin" color={Colors.black}/>
                                                </IconButton>
                                            </Habilitations>
                                        </div>
                                    </div>

                                </div>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <p>{picture.picture.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                    </div>
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
                err => {
                });
    };

    editPicture = id => () => {
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

    truncate = (text) => {
        if (text.length > 20) {
            return `${text.substring(0, 20)} ...`
        } else {
            return text;
        }
    };

    render() {
        let { params:{username}, album: { album: { title } }, account:{user} } = this.props;
        return (
            <div className="row">
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
                        <div className="row center-xs">
                            <Habilitations account={user} role={Roles.ADMIN}>
                                <div className="box">
                                    <div className="col-xs-12">
                                        <input type="file" multiple="true" onChange={this.onFilesChange}/>
                                    </div>
                                </div>
                            </Habilitations>
                        </div>
                        <div className="row top-xs" id="pictures">
                            {this.getPictures().map((picture, index) =>
                                (<div key={picture.id} className="col-xs-12 col-md-6 col-lg-4">
                                    <div className="box">
                                        {this.getImage(picture, index)}
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

export default connect(
    state => ({
        user: state.auth.user,
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
        addPicture: (picture) => {
            dispatch(addPicture(picture))
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

function resize(current_file, maxWidth = 1024, maxHeight = 1024) {
    return rx.Observable.create(observer => {
        var reader = new FileReader();
        if (current_file.type.indexOf('image') == 0) {
            reader.onload = function (event) {
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