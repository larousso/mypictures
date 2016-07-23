import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import config                           from '../../clientConfig'
import CircularProgress                 from 'material-ui/lib/circular-progress';
import IconButton                       from 'material-ui/lib/icon-button';
import Check                            from 'material-ui/lib/svg-icons/navigation/check';
import Cancel                           from 'material-ui/lib/svg-icons/navigation/close';
import RotateRight                      from 'material-ui/lib/svg-icons/image/rotate-right';
import RotateLeft                       from 'material-ui/lib/svg-icons/image/rotate-left';
import EditIcon                         from 'material-ui/lib/svg-icons/image/edit';
import DeleteIcon                       from 'material-ui/lib/svg-icons/action/delete';
import Paper                            from 'material-ui/lib/paper';
import TextField                        from 'material-ui/lib/text-field';
import FlatButton                       from 'material-ui/lib/flat-button';
import Checkbox                         from 'material-ui/lib/checkbox';
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {serverDeletePicture, serverUpdatePicture, rotatePicture}      from '../../actions/pictures'
import Theme                            from '../theme';
import getMuiTheme                      from 'material-ui/lib/styles/getMuiTheme';
import Comments                         from './comments'

class Image extends Component {
    static propTypes = {
        account: PropTypes.object.isRequired,
        pictures: PropTypes.object.isRequired,
        discardAlbums: PropTypes.func,
        addPicture: PropTypes.func,
        albumId: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        picture: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            edit: {}
        }
    }

    getChildContext = () => {
        return {
            muiTheme: getMuiTheme(Theme)
        };
    };

    closeEditMode = id => () => {
        this.setState({edit:null,title:null,description:null});
    };

    editMode = id => event => {
        this.setState({edit:id});
    };

    getTitle = picture => {
        if (picture.raw && picture.raw.file && picture.raw.file.name) {
            return picture.raw.file.name;
        } else if (picture.picture && picture.picture.title) {
            return picture.picture.title;
        } else if (picture.picture && picture.picture.filename) {
            return picture.picture.filename;
        }
        return 'Image';
    };

    truncate = (text) => {
        if (text.length > 15) {
            return `${text.substring(0, 15)} ...`
        } else {
            return text;
        }
    };

    savePicture = picture => () => {
        let { title = picture.picture.title, description = picture.picture.description} = this.state;
        let newPicture = {...picture.picture, title, description};
        this.updatePicture(newPicture)
            .then(
                rep => {
                    this.closeEditMode(picture.id)();
                },
                err => {}
            );
    };

    updatePicture = (picture) => {
        let { albumId, username } = this.props;
        this.props.updatePicture(username, albumId, picture);
    };

    deletePicture = id => () => {
        let { albumId, username } = this.props;
        this.props.deletePicture(username, albumId, id);
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

    rotatePicture = (id, rotation) => () => {
        let { albumId, username } = this.props;
        this.props.rotatePicture(username, albumId, id, rotation);
    };

    setPreview = (picture) => () => {
        if(picture.picture.preview) {
            picture.picture.preview = false;
            this.updatePicture(picture.picture)
        } else {
            const currentPreview = this.getPictures().map(p => p.picture).find(p => p.preview);
            if(currentPreview) {
                currentPreview.preview = false;
                this.updatePicture(currentPreview)

            }
            if(picture.picture) {
                picture.picture.preview = true;
                this.updatePicture(picture.picture)
            }
        }
    };

    getPictures = () => {
        let { pictures: {pictures = {} } } = this.props;
        return Object.keys(pictures).filter(key => pictures.hasOwnProperty(key)).map(key => pictures[key]);
    };

    getPictureSrc = (picture) => {
        return `${config.api.baseUrl}/static/images/${picture.picture.id}?ts=${picture.picture.timestamp}`;
    };


    render() {
        let { account:{user}, picture , albumId, username} = this.props;
        
        if (picture.creating && !picture.created) {
            return (
                <div>
                    <CircularProgress mode="indeterminate"/>
                </div>
            );
        } else if (this.state.edit == picture.id) {
            return (
                <div className="row center-xs" key={picture.id} style={{marginTop:'10px'}}>
                    <div className="col-xs">
                        <div className="box">
                            <Paper style={{padding:'5px'}}>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box">
                                            <a>
                                                <img style={{cursor:'pointer'}} src={this.getPictureSrc(picture)}
                                                     className="picture" width="100%" alt={this.getTitle(picture)}/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="row middle-xs">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <TextField name="Titre" hintText="Titre"
                                                       defaultValue={picture.picture.title}
                                                       floatingLabelText="Titre"
                                                       fullWidth={true} onChange={this.setTitle}
                                                       errorText={this.state.titreError}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <TextField name="Description" hintText="Description"
                                                       floatingLabelText="Description"
                                                       defaultValue={picture.picture.description}
                                                       fullWidth={true}
                                                       multiLine={true}
                                                       rows={2}
                                                       onChange={this.setDescription}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <FlatButton icon={<Check />} label="Enregistrer" primary={true} onClick={this.savePicture(picture)} />
                                            <FlatButton icon={<Cancel />} label="Annuler" onClick={this.closeEditMode(picture.id)} />
                                        </div>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
            );
        } else if (picture.picture) {
            return (
                <div className="row center-xs" key={picture.id} style={{marginTop:'10px'}}>
                    <div className="col-xs">
                        <div className="box">
                            <Paper style={{padding:'5px'}}>
                                <div className="row">
                                    <div className="col-xs">
                                        <div className="box">
                                            <a>
                                                <img style={{cursor:'pointer'}} src={this.getPictureSrc(picture)}
                                                     className="picture" width="100%" alt={this.getTitle(picture)}/>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="row middle-xs">
                                    <div className="col-xs">
                                        <div style={{textAlign:'right'}}>
                                            <Habilitations account={user} role={Roles.ADMIN}>
                                                <Checkbox label="Preview" labelPosition="left" defaultChecked={picture.picture.preview} style={{display: 'inline-table', maxWidth:80}} onCheck={this.setPreview(picture)}/>
                                                <IconButton tooltip="Rotate right" onClick={this.rotatePicture(picture.id, 'right')}>
                                                    <RotateRight />
                                                </IconButton>
                                                <IconButton tooltip="Rotate left" onClick={this.rotatePicture(picture.id, 'left')}>
                                                    <RotateLeft />
                                                </IconButton>
                                                <IconButton tooltip="Edit" onClick={this.editMode(picture.id)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton tooltip="Delete" onClick={this.deletePicture(picture.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Habilitations>
                                        </div>
                                        <div style={{textAlign: 'left'}}>
                                            <span className="strong">{this.truncate(this.getTitle(picture))}</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="row top-xs">
                                    <div className="col-xs">
                                        <div className="box" style={{textAlign: 'left'}}>
                                            <span style={{fontSize:'100%'}} className="thin">{picture.picture.description}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row middle-xs">
                                    <div className="col-xs">
                                        <div style={{textAlign:'right'}}>
                                            <Comments pictureId={picture.id} albumId={albumId} username={username}/>
                                        </div>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

Image.childContextTypes = {
    muiTheme: React.PropTypes.object
};

export default connect(
    state => ({
        account: state.account,
        pictures: state.pictures
    }),
    dispatch => ({
        updatePicture: (username, albumId, picture) => {
            dispatch(serverUpdatePicture(username, albumId, picture))
        },
        deletePicture: (username, albumId, id) => {
            dispatch(serverDeletePicture(username, albumId, id))
        },
        rotatePicture: (username, albumId, id, rotation) => {
            dispatch(rotatePicture(username, albumId, id, rotation))
        }
    })
)(Image);
