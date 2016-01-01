import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {loadingAlbums, loadAlbumsFail, loadAlbums}      from '../../reducer/albums'
import FlatButton                       from 'material-ui/lib/flat-button';
import CreateAlbum                      from './createAlbum';

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
                            user => {
                                console.log('preRender OK', user);
                                return dispatch(loadAccount(user))
                            },
                            err => {
                                console.log('preRender fail', err);
                                return dispatch(loadAccountFail(err));
                            }
                        ).then(_ =>
                            Album.listByUsername(username).toPromise().then(
                                albums => {
                                    console.log('preRender OK', albums);
                                    return dispatch(loadAlbums(albums))
                                },
                                err => {
                                    console.log('preRender fail', err);
                                    return dispatch(loadAlbumsFail(err));
                                }
                            )
                        );
                } else {
                    Promise.resolve(loadAccountFail({message: 'no user'}));
                }
            });
        }
    };

    componentDidMount() {
        let {params:{username}, account: {loaded}} = this.props;

        if(username && !loaded) {
            this.props.loadingAccount();
            console.log("Loading account");
            getJson(`/api/accounts/${username}`)
            .then(
                user => this.props.loadAccount(user),
                err => this.props.loadAccountFail(err)
            )
            .then(_ => getJson(`/api/accounts/${username}/albums`))
            .then(
                albums=>{
                    console.log("Albums", albums);
                    this.props.loadAlbums(albums)
                },
                err => this.props.loadAlbumsFail(err)
            );
        } else {
            //this.props.loadAccountFail({message: 'no user'});
        }
    }

    createAlbum = () => {
        this.setState({
            open: true
        })
    };

    render() {
        let {params:{username}} = this.props;
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
                    <div className="col-xs-12">
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