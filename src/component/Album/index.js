import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'

function getJson(url) {
    return fetch(url, {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(rep => rep.json());
}

class Album extends Component {
    static propTypes = {
    };

    static preRender = (store, renderProps) => {
        if(__SERVER__) {
            import User from '../../repository/user';
            import Album from '../../repository/album';

            let {params:{username, albumId}} = renderProps;

            if (username) {
                console.log("Loading album", username, albumId);
                return store.dispatch(dispatch => {
                    User.findByName(username).map(rep => rep.data).toPromise().then(
                        user => dispatch(loadAccount(user)),
                        err => dispatch(loadAccountFail(err))
                    ).then(_ =>
                        Album.get(albumId).toPromise()
                    ).then(
                        album => dispatch(loadAlbum(album)),
                        err => dispatch(loadAlbumFail(err))
                    ).then(_ => {
                        console.log("Loading album finished");
                    })
                });
            } else {
                return Promise.resolve(loadAccountFail({message: 'no user'}));
            }
        }
    };

    componentDidMount() {
        let {params: {albumId, username}, account: {loaded}} = this.props;
        if(username && !loaded) {
            this.props.loadingAccount();
            getJson(`/api/accounts/${username}`)
                .then(
                    user => this.props.loadAccount(user),
                    err => this.props.loadAccountFail(err)
                )
                .then(_ => {
                    this.props.loadingAlbum();
                    return getJson(`/api/accounts/${username}/albums/${albumId}`)
                })
                .then(
                    albums => this.props.loadAlbum(albums),
                    err => this.props.loadAlbumFail(err)
                );
        } else {
            this.props.loadAccountFail({message: 'no user'});
        }
    }

    render() {
        let {album:{album:{title}}} = this.props;
        return (
            <div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <h1>{title}</h1>
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
        loadAlbum: (user) => {
            dispatch(loadAlbum(user))
        },
        loadingAlbum: () => {
            dispatch(loadingAlbum())
        },
        loadAlbumFail: (err) => {
            dispatch(loadAlbumFail(err))
        }
    })
)(Album);