import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {loadingAlbums, loadAlbumsFail, loadAlbums}      from '../../reducer/albums'
import FlatButton                       from 'material-ui/lib/flat-button';
import GridList                         from 'material-ui/lib/grid-list/grid-list';
import GridTile                         from 'material-ui/lib/grid-list/grid-tile';
import CreateAlbum                      from './createAlbum';
import FontIcon                         from 'material-ui/lib/font-icon';
import {Link }                          from 'react-router'

function getJson(url) {
    return fetch(url, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(rep => rep.json());
}


class Account extends Component {
    static propTypes = {
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
                            err => dispatch(loadAccountFail(err))
                        ).then(_ =>
                            Album.listByUsername(username).toPromise().then(
                                albums => dispatch(loadAlbums(albums)),
                                err => dispatch(loadAlbumsFail(err))
                            )
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
            getJson(`/api/accounts/${username}`)
            .then(
                user => this.props.loadAccount(user),
                err => this.props.loadAccountFail(err)
            )
            .then(_ => {
                this.props.loadingAlbums();
                return getJson(`/api/accounts/${username}/albums`)
            })
            .then(
                albums => this.props.loadAlbums(albums),
                err => this.props.loadAlbumsFail(err)
            );
        } else {
            this.props.loadAccountFail({message: 'no user'});
        }
    }

    createAlbum = () => {
        this.setState({
            open: true
        })
    };

    getImage = (album) => {
        return <img src="/image-not-found.png" />;
    };

    render() {
        let {params:{username}, albums:{albums}} = this.props;
        return (
            <div>
                <CreateAlbum
                    username={username}
                    open={this.state.open} />
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <h1>Mes albums</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-3"></div>
                    <div className="col-xs-6">
                        <FlatButton label="Créer un album" onClick={this.createAlbum} />
                    </div>
                    <div className="col-xs-3"></div>
                </div>
                <div className="row center-xs">
                    <div className="col-xs-2"></div>
                    <div className="col-xs-8">
                        <GridList cellHeight={200} cols={4} >
                            {albums.map(album => (
                                <GridTile key={album.id} title={album.title}>
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
        }
    })
)(Account);