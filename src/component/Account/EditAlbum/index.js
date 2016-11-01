import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import { push }                  from 'react-router-redux'
import {fetchAlbum}                     from '../../../actions/album'
import {saveAlbum}                      from '../../../actions/albums'
import FlatButton                       from 'material-ui/FlatButton';
import IconButton                       from 'material-ui/IconButton';
import TextField                        from 'material-ui/TextField';
import ArrowBack                        from 'material-ui/svg-icons/navigation/chevron-left';
import Check                            from 'material-ui/svg-icons/navigation/check';
import Cancel                           from 'material-ui/svg-icons/navigation/close';
import AppBar                           from 'material-ui/AppBar';
import Theme                            from '../../theme';
import getMuiTheme                      from 'material-ui/styles/getMuiTheme';


class EditAlbum extends Component {

    static propTypes = {
        saveAlbum: PropTypes.func,
        changeRoute: PropTypes.func,
        album: PropTypes.object
    };

    getChildContext = () => {
        return {
            muiTheme: getMuiTheme(Theme)
        };
    };

    static preRender = (store, props) => {
        let { params: { albumId, username }} = props;
        return store.dispatch(fetchAlbum(username, albumId));
    };

    constructor(args, context) {
        super(args, context);
        this.state = {};
    }


    componentDidMount() {
        EditAlbum.preRender(this.context.store, this.props);
        this.initState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initState(nextProps) ;
    }

    initState = (props) => {
        if (props.album) {
            let { album: { id, title, description, date, pictureIds = [] } } = props;
            this.setState({id, title, description, date, pictureIds});
        }
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

    saveAlbum = () => {
        if (!this.state.title) {
            this.setState({
                titreError: 'Le titre est obligatoire'
            })
        } else {
            let {title, description, date = new Date(), pictureIds} = this.state;
            let {params:{albumId, username}} = this.props;
            this.props.saveAlbum({title, description, date, pictureIds}, username, albumId, `/account/${username}`);
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

EditAlbum.contextTypes = {
    store: React.PropTypes.object.isRequired
};

export default connect(
    state => ({
        routing: state.routing,
        album: state.album.album,
    }),
    dispatch => ({
        changeRoute: (route) => {
            dispatch(push(route))
        },
        saveAlbum: (album, username, albumId, redirect) => {
            dispatch(saveAlbum(album, username, albumId, redirect))
        }
    })
)(EditAlbum);