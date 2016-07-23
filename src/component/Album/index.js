import React, { Component, PropTypes }  from 'react';
import {findDOMNode}                    from 'react-dom';
import { connect }                      from 'react-redux'
import { replacePath }                 from 'redux-simple-router'
import IconButton                       from 'material-ui/lib/icon-button';
import CircularProgress                 from 'material-ui/lib/circular-progress';
import {grey50}                         from 'material-ui/lib/styles/colors'
import ArrowBack                        from 'material-ui/lib/svg-icons/navigation/chevron-left';
import AppBar                           from 'material-ui/lib/app-bar';
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {fetchPictures, postAllImages}                  from '../../actions/pictures'
import {fetchAlbum}                     from '../../actions/album'
import {fetchAccount}                   from '../../actions/account'
import Theme                            from '../theme';
import getMuiTheme                      from 'material-ui/lib/styles/getMuiTheme';
import Viewer                           from 'viewerjs'
import ImagePreview                     from './image'

class Album extends Component {

    static propTypes = {
        routing: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        album: PropTypes.object.isRequired,
        fetchPictures: PropTypes.func,
        fetchAlbum: PropTypes.func,
        fetchAccount: PropTypes.func
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

    static preRender = (store, props) => {
        let {params:{ albumId, username}} = props;
        console.log(albumId, username);
        return Promise.all([
            store.dispatch(fetchAccount(username)),
            store.dispatch(fetchAlbum(username, albumId)),
            store.dispatch(fetchPictures(username, albumId))
        ]);
    };

    componentDidMount() {
        Album.preRender(this.context.store, this.props);
        this.applyViewer();
        if(this.props.user.role == Roles.GUEST) {
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
        let {params: {username, albumId}} = this.props;
        this.props.postAllImages(username, albumId, files);
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
Album.contextTypes = {
    store: React.PropTypes.object.isRequired
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
        postAllImages: (username, albumId, files) => {
            dispatch(postAllImages(username, albumId, files))
        }
    })
)(Album);
