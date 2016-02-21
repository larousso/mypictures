import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux';
import {Link }                          from 'react-router';
import { replacePath }                 from 'redux-simple-router'
import FlatButton                       from 'material-ui/lib/flat-button';
import GridList                         from 'material-ui/lib/grid-list/grid-list';
import GridTile                         from 'material-ui/lib/grid-list/grid-tile';
import FontIcon                         from 'material-ui/lib/font-icon';
import IconButton                       from 'material-ui/lib/icon-button';
import Colors                           from 'material-ui/lib/styles/colors'
import rx                               from 'rx';
import Http                             from '../http'
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account';
import {loadingAlbums, loadAlbumsFail, loadAlbums, deleteAlbum}      from '../../reducer/albums';

class Account extends Component {

    static propTypes = {
        user: PropTypes.object.isRequired,
        routing: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        albums: PropTypes.object.isRequired,
        loadAccount: PropTypes.func.isRequired,
        loadingAccount: PropTypes.func.isRequired,
        loadAccountFail: PropTypes.func.isRequired,
        loadAlbums: PropTypes.func.isRequired,
        loadingAlbums: PropTypes.func.isRequired,
        loadAlbumsFail: PropTypes.func.isRequired
    };

    constructor(args) {
        super(args);
        this.state = {
            open: false
        }
    }

    static preRender = (store, renderProps) => {
        if (__SERVER__) {
            import User from '../../repository/user';
            import Album from '../../repository/album';
            import Picture from '../../repository/picture';

            let {params:{username}} = renderProps;
            return store.dispatch(dispatch => {
                if (username) {
                    return User
                        .findByName(username).map(rep => rep.data).toPromise().then(
                            user => dispatch(loadAccount(user)),
                            err => dispatch(loadAccountFail(err)))
                        .then(_ => Album.listByUsername(username)
                            .flatMap(album => Picture.listThumbnailsByAlbum(album.id).toArray().map(thumbnails => ({thumbnails, ...album})))
                            .toArray()
                            .toPromise())
                        .then(
                            albums => dispatch(loadAlbums(albums)),
                            err => {
                                console.log('Error', error);
                                return dispatch(loadAlbumsFail(err))
                            }
                        );
                }
                else {
                    return Promise.resolve(loadAccountFail({message: 'no user'}));
                }
            });
        }
    };

    componentDidMount() {
        let {params:{username}, account, albums} = this.props;
        let promises = [];
        console.log('Component did mount');
        if (username && !account.loaded) {
            this.props.loadingAccount();
            promises.push(Http.get(`/api/accounts/${username}`)
                .then(
                    user => this.props.loadAccount(user),
                    err => this.props.loadAccountFail(err)
                ));
        }
        if (username && (!albums || !albums.loaded)) {
            this.props.loadingAlbums();
            promises.push(
                Http.get(`/api/accounts/${username}/albums`)
                    .then(
                        albums => this.props.loadAlbums(albums),
                        err => this.props.loadAlbumsFail(err)
                    )
            );
        }
        Promise.all(promises).then(() => {
        });
    }

    componentWillUnmount() {
        this.stopDisplayingAlbumResume();
    }

    handleClose = () => {
        this.setState({open: false, album: null});
    };

    displayAlbumResume = album => () => {
        let {params:{username}} = this.props;
        let observable =
            rx.Observable.zip(
                rx.Observable
                    .fromPromise(Http.get(`/api/accounts/${username}/albums/${album.id}/thumbnails`))
                    .flatMap(resp => rx.Observable.fromArray(resp))
                    .map(p => p.thumbnail),
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
        if (album) {
            let [first] = album.thumbnails;
            if (first && first.thumbnail) {
                return first.thumbnail;
            } else {
                return '/image-not-found.png';
            }
        }
        return '/image-not-found.png';
    };

    getImage = (album) => {
        if (album && album.thumbnails) {
            let thumbnail;
            if (this.state.currentAlbumId && album.id == this.state.currentAlbumId) {
                thumbnail = this.state.thumbnail || this.getThumbnail(album);
            } else {
                thumbnail = this.getThumbnail(album);
            }
            return (
                    <img src={thumbnail} onClick={this.stopDisplayingAlbumResume(album)}
                            onMouseOver={this.displayAlbumResume(album)} onMouseOut={this.stopDisplayingAlbumResume(album)}
                            height="100%" />
            );
        }
        return <img src="/image-not-found.png" height="100%"
                    style={{position: 'absolute', display: 'block',margin: '0 auto', marginRight: 'auto',marginLeft: 'auto'}}/>;
    };

    deleteAlbum = id => () => {
        let {params:{username}} = this.props;
        Http.delete(`/api/accounts/${username}/albums/${id}`)
            .then(
                _ => this.props.deleteAlbum(id),
                err => console.log("Err", err));
    };

    createAlbum = () => {
        this.props.changeRoute(`/account/${this.props.params.username}/createAlbum`);
    };

    editAlbum = (id) => () => {
        if (id) {
            this.setState({album: this.props.albums.albums.find(album => album.id === id), open: true});
        }
    };

    render() {
        let {params:{username}, albums:{albums}, account:{user}} = this.props;
        return (
            <div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <h1>Mes albums</h1>
                    </div>
                </div>
                <div className="row center-xs">

                    <div className="col-xs-12 col-lg-6">
                        <Habilitations account={user} role={Roles.ADMIN}>
                            <FlatButton label="Créer un album" onClick={this.createAlbum}
                                        onTouchStart={this.createAlbum}/>
                        </Habilitations>
                    </div>

                </div>
                <div className="row center-xs">

                    <div className="col-xs-12 col-lg-8">
                        <GridList cellHeight={200} cols={4}>
                            {albums.map(album => (
                                <GridTile key={album.id}
                                          title={album.title}
                                          actionIcon={<Habilitations account={user} role={Roles.ADMIN}>
                                            <Link to={`/account/${username}/EditAlbum/${album.id}`}>
                                                <FontIcon className="icon icon-pencil" color={Colors.white} />
                                            </Link>
                                            <IconButton tooltip="Delete" onTouchStart={this.deleteAlbum(album.id)}>
                                                <FontIcon className="icon icon-bin" color={Colors.white} />
                                            </IconButton>
                                          </Habilitations>}
                                >
                                    <Link to={`/account/${username}/${album.id}`}>{this.getImage(album)}</Link>
                                </GridTile>
                            ))}
                        </GridList>
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
        albums: state.albums,
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
        loadAlbums: (user) => {
            dispatch(loadAlbums(user))
        },
        loadingAlbums: () => {
            dispatch(loadingAlbums())
        },
        loadAlbumsFail: (err) => {
            dispatch(loadAlbumsFail(err))
        },
        deleteAlbum: (id) => {
            dispatch(deleteAlbum(id))
        }
    })
)(Account);