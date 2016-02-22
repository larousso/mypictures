import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import { replacePath }                 from 'redux-simple-router'
import {addAlbum}                       from '../../../reducer/albums'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../../reducer/account'
import { Link }                         from 'react-router'
import FlatButton                       from 'material-ui/lib/flat-button';
import IconButton                       from 'material-ui/lib/icon-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';
import NavigationClose                  from 'material-ui/lib/svg-icons/navigation/close';
import ArrowBack                        from 'material-ui/lib/svg-icons/navigation/chevron-left';
import Check                            from 'material-ui/lib/svg-icons/navigation/check';
import Cancel                           from 'material-ui/lib/svg-icons/navigation/close';
import AppBar                           from 'material-ui/lib/app-bar';
import Http                             from '../../http';
import Theme                            from '../../theme';
import ThemeManager                     from 'material-ui/lib/styles/theme-manager';


class EditAlbum extends Component {

    static propTypes = {
        addAlbum: PropTypes.func,
        album: PropTypes.object
    };
    getChildContext = () => {
        return {
            muiTheme: ThemeManager.getMuiTheme(Theme)
        };
    };
    static preRender = (store, renderProps) => {
        if (__SERVER__) {
            import User     from '../../../repository/user';
            import Album    from '../../../repository/album';

            let { params: { username, albumId } } = renderProps;
            if (username) {
                if (albumId) {
                    return store.dispatch(dispatch =>
                        User.findByName(username).map(rep => rep.data).toPromise()
                            .then(
                                user => dispatch(loadAccount(user)),
                                err => dispatch(loadAccountFail(err)))
                            .then(_ =>
                                Album.get(albumId).toPromise())
                            .then(
                                album => dispatch(loadAlbum(album)),
                                err => dispatch(loadAlbumFail(err))
                            )
                    );
                } else {
                    return Promise.resolve();
                }
            } else {
                return Promise.resolve(loadAccountFail({message: 'no user'}));
            }
        }
    };

    constructor(args) {
        super(args);
        this.state = {};
    }


    componentDidMount() {
        let { params: { albumId, username }, account} = this.props;
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
        Promise.all(promises);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.album) {
            let { album: { id, title, description } } = nextProps;
            this.setState({id, title, description});
        }
    }

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

    saveAlbum = () => {
        if (!this.state.title) {
            this.setState({
                titreError: 'Le titre est obligatoire'
            })
        } else {
            let url, response;
            let {title, description} = this.state;
            let {params:{albumId, username}} = this.props;
            if (albumId) {
                url = `/api/accounts/${username}/albums/${albumId}`;
                response = Http.put(url, {albumId, title, description})
            } else {
                url = `/api/accounts/${username}/albums`;
                response = Http.post(url, {title, description})
            }
            response
                .then(
                    rep => {
                        this.props.addAlbum(rep);
                        this.props.changeRoute(`/account/${username}`);
                    },
                    err => {
                    }
                );
        }
    };

    render() {
        return (

            <div className="row">
                <div className="col-xs-12">
                    <div className="box">

                        <div className="row">
                            <div className="col-xs">
                                <div className="box">
                                    <AppBar
                                        title={<span>Edition</span>}
                                        iconElementLeft={<IconButton onClick={() => this.props.changeRoute(`/account/${this.props.params.username}`)}><ArrowBack /></IconButton>}
                                        iconElementRight={<IconButton></IconButton>}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12  col-lg-6 col-lg-offset-3">
                                <div className="box">
                                    <TextField hintText="Titre"
                                               value={this.state.title}
                                               floatingLabelText="Titre"
                                               fullWidth={true}
                                               onChange={this.setTitle}
                                               errorText={this.state.titreError}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-lg-6 col-lg-offset-3">
                                <div className="box">
                                    <br/>
                                    <TextField hintText="Description"
                                               floatingLabelText="Description"
                                               value={this.state.description}
                                               fullWidth={true}
                                               multiLine={true}
                                               rows={2}
                                               onChange={this.setDescription}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row center-xs">
                            <div className="col-xs">
                                <div className="box">
                                    <FlatButton icon={<Check />} label="Enregistrer" primary={true} onClick={this.saveAlbum} />
                                    <FlatButton icon={<Cancel />} label="Annuler" onClick={() => this.props.changeRoute(`/account/${this.props.params.username}`)}
                                                onTouchStart={() => this.props.changeRoute(`/account/${this.props.params.username}`)}/>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        )
    }
}

EditAlbum.childContextTypes = {
    muiTheme: React.PropTypes.object
};


export default connect(
    state => ({
        routing: state.routing,
        account: state.account,
        album: state.album.album,
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
        addAlbum: (album) => {
            dispatch(addAlbum(album))
        }
    })
)(EditAlbum);