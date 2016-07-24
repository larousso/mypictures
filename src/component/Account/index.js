import React, {Component, PropTypes}    from 'react';
import {connect}                        from 'react-redux';
import {Link}                           from 'react-router';
import {push}                           from 'react-router-redux'
import RaisedButton                     from 'material-ui/RaisedButton';
import {GridList, GridTile}             from 'material-ui/GridList';
import IconButton                       from 'material-ui/IconButton';
import {grey50, white}                  from 'material-ui/styles/colors'
import AddIcon                          from 'material-ui/svg-icons/content/add'
import EditIcon                         from 'material-ui/svg-icons/image/edit';
import DeleteIcon                       from 'material-ui/svg-icons/action/delete';
import rx                               from 'rx';
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {fetchAccount}                   from '../../actions/account';
import {fetchAlbums, fetchDeleteAlbum}  from '../../actions/albums';
import config                           from '../../clientConfig'

class Account extends Component {

    static propTypes = {
        user: PropTypes.object.isRequired,
        routing: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        albums: PropTypes.object.isRequired,
        changeRoute: PropTypes.func.isRequired,
        fetchAccount: PropTypes.func.isRequired,
        fetchAlbums: PropTypes.func.isRequired,
        deleteAlbum: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            open: false
        }
    }

    static preRender = (store, props) => {
        let {params:{username}} = props;
        return Promise.all([
            store.dispatch(fetchAccount(username)),
            store.dispatch(fetchAlbums(username))
        ]);
    };

    componentDidMount() {
        Account.preRender(this.context.store, this.props);
    }

    componentWillUnmount() {
        this.stopDisplayingAlbumResume();
    }

    handleClose = () => {
        this.setState({open: false, album: null});
    };

    displayAlbumResume = album => () => {
        let observable =
            rx.Observable.zip(
                rx.Observable.fromArray(album.pictures)
                    .map(p => `${config.api.baseUrl}/static/thumbnails/${p.id}`),
                rx.Observable.timer(0, 700),
                (t, i) => t
            )
                .doWhile(_ => true)
                .subscribe(
                    thumbnail => {
                        this.setState({thumbnail})
                    },
                    err => {
                    },
                    () => {
                        this.setState({thumbnail: null});
                    }
                );

        this.setState({observable, currentAlbumId: album.id, thumbnail: null});
    };

    stopDisplayingAlbumResume = () => () => {
        if (this.state.observable) {
            this.state.observable.dispose();
            this.setState({thumbnail: null});
        }
    };

    getThumbnail = album => {
        if (album && album.pictures) {
            let [first] = album.pictures;
            let preview = album.pictures.find(t => t.preview) || first;

            if (preview) {
                return `${config.api.baseUrl}/static/thumbnails/${preview.id}`;
            } else {
                return '/image-not-found.png';
            }
        }
        return '/image-not-found.png';
    };

    displayImage = (album) => {
        if (album) {
            let thumbnail;
            if (this.state.currentAlbumId && album.id == this.state.currentAlbumId) {
                thumbnail = this.state.thumbnail || this.getThumbnail(album);
            } else {
                thumbnail = this.getThumbnail(album);
            }
            return (
                <img src={thumbnail} onClick={this.stopDisplayingAlbumResume(album)}
                     onMouseOver={this.displayAlbumResume(album)} onMouseOut={this.stopDisplayingAlbumResume(album)}
                     height="100%"/>
            );
        }
        return <img src="/image-not-found.png" height="100%"
                    style={{
                        position: 'absolute',
                        display: 'block',
                        margin: '0 auto',
                        marginRight: 'auto',
                        marginLeft: 'auto'
                    }}/>;
    };

    deleteAlbum = id => () => {
        let {params:{username}} = this.props;
        this.props.deleteAlbum(username, id);
    };

    createAlbum = () => {
        this.props.changeRoute(`/account/${this.props.params.username}/createAlbum`);
    };

    render() {
        let {params:{username}, albums:{albums}, account:{user}} = this.props;
        return (
            <div className="row center-xs" style={{background: grey50}}>
                <div className="col-xs-12 col-lg-8">
                    <div className="box">
                        <div className="row">
                            <div className="col-xs">
                                <div className="box">
                                    <h1>Mes albums</h1>
                                </div>
                            </div>
                        </div>
                        <Habilitations account={user} role={Roles.ADMIN}>
                            <div className="row">
                                <div className="col-xs">
                                    <div className="box">
                                        <RaisedButton label="Créer un album" onClick={this.createAlbum}
                                                      icon={<AddIcon />}/>
                                    </div>
                                </div>
                            </div>
                        </Habilitations>
                        <div className="row" style={{marginTop: '10px'}}>
                            <div className="col-xs">
                                <div className="box">
                                    <GridList cellHeight={200} cols={4}>
                                        {albums.sort(sortAlbum).map((album, i) => (
                                            <GridTile key={i}
                                                      title={album.title}
                                                      actionIcon={<Habilitations account={user} role={Roles.ADMIN}>
                                                          <Link to={`/account/${username}/EditAlbum/${album.id}`}>
                                                              <EditIcon color={white}/>
                                                          </Link>
                                                          <IconButton tooltip="Delete"
                                                                      onClick={this.deleteAlbum(album.id)}>
                                                              <DeleteIcon color={white}/>
                                                          </IconButton>
                                                      </Habilitations>}
                                            >
                                                <Link
                                                    to={`/account/${username}/${album.id}`}>{this.displayImage(album)}</Link>
                                            </GridTile>
                                        ))}
                                    </GridList>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function sortAlbum(a1, a2) {
    if (!a1.date && !a2.date) {
        return 0;
    }
    if (!a1.date) {
        return 1;
    }
    if (!a2.date) {
        return -1;
    }
    if (a1.date > a2.date) {
        return -2;
    } else {
        return 2;
    }
}

Account.contextTypes = {
    store: React.PropTypes.object.isRequired
};

export default connect(
    state => ({
        store: state,
        authToken: state.authToken,
        user: state.auth.user,
        routing: state.routing,
        account: state.account,
        albums: state.albums,
    }),
    dispatch => ({
        changeRoute: (route) => {
            dispatch(push(route))
        },
        fetchAccount: (user) => {
            dispatch(fetchAccount(user))
        },
        fetchAlbums: (user) => {
            dispatch(fetchAlbums(user))
        },
        deleteAlbum: (username, id) => {
            dispatch(fetchDeleteAlbum(username, id))
        }
    })
)(Account);