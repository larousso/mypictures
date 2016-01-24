import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {addPicture}                       from '../../reducer/pictures'
import FlatButton                       from 'material-ui/lib/flat-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';
import FontIcon                         from 'material-ui/lib/font-icon';
import IconButton                       from 'material-ui/lib/icon-button';
import Colors                           from 'material-ui/lib/styles/colors';
import Http                             from '../http'
import { Link }                         from 'react-router'
import Modal                            from 'react-modal'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {addRawPicture, updateRawPicture, pictureCreated, pictureCreationError, loadingPictures, loadPictures, loadPicturesFail, deletePicture}   from '../../reducer/pictures'

class PictureIterable {
    constructor(object, id) {
        this.object = object;
        this.keys = Object.keys(object);
        this.length = this.keys.length;
        if(id) {
            this.index = this.keys.indexOf(id);
        } else {
            this.index = 0;
        }
    }

    currentPicture() {
        if(this.index < this.length) {
            const key = this.keys[this.index];
            console.log('Key', key, this.object[key]);
            return this.object[key];
        }
    }

    next() {
        if(this.index < (this.length - 1)) {
            this.index++
        } else {
            this.index = 0;
        }
        return this.currentPicture();
    }


    prevId() {
        let prevIndex = this.index - 1;
        if (prevIndex < 0) {
            return this.keys[this.length - 1];
        } else {
            return this.keys[prevIndex];
        }
    }

    nextId() {
        let nextIndex = this.index + 1;
        if (nextIndex < this.length) {
            return this.keys[nextIndex];
        } else {
            return this.keys[0];
        }
    }

}

function initialState(props) {
    if(props.pictures) {
        const iterable = new PictureIterable(props.pictures, props.params.pictureId);
        const currentPicture = iterable.currentPicture() || {};
        const picture = currentPicture.picture || {};
        console.log('Current picture', picture);
        return {iterable, picture};
    }
}

class Picture extends Component {

    static propTypes = {
        handleClose: PropTypes.func,
    };

    constructor(args) {
        super(args);
        console.log(args);
        this.state = initialState(args);
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


    componentWillReceiveProps(nextProps) {
        console.log(nextProps);
        const state = initialState(nextProps);
        if(state) {
            this.setState(state);
        }
    }

    componentDidMount() {
        if (!this.state.picture) {
            const currentPicture = this.state.iterable.currentPicture() || {};
            const picture = currentPicture.picture || {};
            console.log('Current picture', picture);
            this.setState({picture})
        }
    }

    render() {
        console.log('Open', this.props.open);
        let { params:{pictureId, username, albumId}} = this.props;

        //{/* autoDetectWindowHeight={true} autoScrollBodyContent={false} , contentStyle={{width: "100%", maxWidth: "none"}}*/}
        let customStyles = {
            overlay : {
                position          : 'fixed',
                top               : 0,
                left              : 0,
                right             : 0,
                bottom            : 0,
                backgroundColor   : Colors.darkBlack
            },
            content : {
                position                   : 'absolute',
                top                        : '40px',
                left                       : '40px',
                right                      : '40px',
                bottom                     : '40px',
                border                     : '1px solid #ccc',
                background                 : Colors.darkBlack,
                overflow                   : 'auto',
                WebkitOverflowScrolling    : 'touch',
                borderRadius               : '4px',
                outline                    : 'none',
                padding                    : '20px'
            }
        };
        return (
                <div className="row center-xs" style={{background: Colors.darkBlack, maxWidth:"100%", maxHeight:"100%"}}>
                    <div className="col-xs-12">
                        <IconButton tooltip="Fermer" style={{position: 'absolute', top: '0px',right: '0px'}} onClick={this.props.handleClose} >
                            <FontIcon className="icon icon-cancel-circle" color={Colors.grey50} />
                        </IconButton>
                        <div className="row center-xs">
                            <div className="row middle-xs">
                                <h5 style={{color:Colors.darkWhite}}>{this.state.picture.title}</h5>
                            </div>
                        </div>
                        <div className="row center-xs" >
                            <div className="col-xs-12" >
                                <div className="row middle-xs">
                                    <div className="col-xs-1">
                                        <Link to={`/account/${username}/${albumId}/picture/${this.state.iterable.prevId()}`}>
                                            <FontIcon className="icon icon-previous2" color={Colors.darkWhite}/>
                                        </Link>
                                    </div>
                                    <div className="col-xs-10">
                                        <Link to={`/account/${username}/${albumId}/picture/${this.state.iterable.nextId()}`}>
                                            <img src={this.state.picture.file || "/image-not-found.png"} style={{width:'auto', height:'100%'}} />
                                        </Link>
                                    </div>
                                    <div className="col-xs-1">
                                        <Link to={`/account/${username}/${albumId}/picture/${this.state.iterable.nextId()}`}>
                                            <FontIcon className="icon icon-next2" color={Colors.darkWhite}/>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row center-xs">
                            <div className="col-xs-12">
                                <p style={{color:Colors.darkWhite}}>
                                    {this.state.picture.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

        )
    }
}

export default connect(
    state => ({
        routing: state.routing,
        pictures: state.pictures.pictures
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
)(Picture);