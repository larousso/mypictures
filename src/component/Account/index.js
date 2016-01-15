import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux';
import {Link }                          from 'react-router';
import FlatButton                       from 'material-ui/lib/flat-button';
import GridList                         from 'material-ui/lib/grid-list/grid-list';
import GridTile                         from 'material-ui/lib/grid-list/grid-tile';
import FontIcon                         from 'material-ui/lib/font-icon';
import IconButton                       from 'material-ui/lib/icon-button';
import CreateAlbum                      from './createAlbum';
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
        if(__SERVER__) {
            import User from '../../repository/user'
            import Album from '../../repository/album'
            let {params:{username}} = renderProps;
            return store.dispatch(dispatch => {
                if (username) {
                    return User
                        .findByName(username).map(rep => rep.data).toPromise().then(
                            user => dispatch(loadAccount(user)),
                            err => dispatch(loadAccountFail(err)))
                        .then(_ =>
                            Album.listByUsername(username).toPromise())
                        .then(
                            albums => dispatch(loadAlbums(albums)),
                            err => dispatch(loadAlbumsFail(err))
                        );
                } else {
                    return Promise.resolve(loadAccountFail({message: 'no user'}));
                }
            });
        }
    };

    componentDidMount() {
        let {params:{username}, account: {loaded}} = this.props;

        if(username && !loaded) {
            this.props.loadingAccount();
            Http.get(`/api/accounts/${username}`)
                .then(
                    user => this.props.loadAccount(user),
                    err => this.props.loadAccountFail(err)
                )
                .then(_ => {
                    this.props.loadingAlbums();
                    return Http.get(`/api/accounts/${username}/albums`)
                })
                .then(
                    albums => this.props.loadAlbums(albums),
                    err => this.props.loadAlbumsFail(err)
                );
        } else {
            this.props.loadAccountFail({message: 'no user'});
        }
    }

    handleClose = () => {
        this.setState({open:false, album: null});
    };

    getImage = (album) => {
        return <img src="/image-not-found.png" height="100%" style={{position: 'absolute', display: 'block',margin: '0 auto', marginRight: 'auto',marginLeft: 'auto'}}/>;
    };

    deleteAlbum = id => () => {
        let {params:{username}} = this.props;
        Http.delete(`/api/accounts/${username}/albums/${id}`)
            .then(
                _ => this.props.deleteAlbum(id),
                err => console.log("Err", err));
    };

    createAlbum = () => {
        this.setState({open: true});
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
                <CreateAlbum
                    username={username}
                    open={this.state.open}
                    album={this.state.album}
                    handleClose={this.handleClose}
                />
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <h1>Mes albums</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-3"></div>
                    <div className="col-xs-6">
                        <Habilitations account={user} auth={this.props.user} role={Roles.ADMIN}>
                            <FlatButton label="Créer un album" onClick={this.createAlbum} />
                        </Habilitations>
                    </div>
                    <div className="col-xs-3"></div>
                </div>
                <div className="row center-xs">
                    <div className="col-xs-2"></div>
                    <div className="col-xs-8">
                        <GridList cellHeight={200} cols={4} >
                            {albums.map(album => (
                                <GridTile key={album.id}
                                          title={album.title}
                                          actionIcon={<div>
                                            <IconButton tooltip="Edit" onClick={this.editAlbum(album.id)}>
                                                <FontIcon className="icon icon-pencil"  />
                                            </IconButton>
                                            <IconButton tooltip="Delete" onClick={this.deleteAlbum(album.id)}>
                                                <FontIcon className="icon icon-bin"  />
                                            </IconButton>
                                          </div>}
                                >
                                    <Link to={`/account/${username}/${album.id}`}>{this.getImage(album)}</Link>
                                </GridTile>
                            ))}
                        </GridList>
                    </div>
                    <div className="col-xs-2"></div>
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