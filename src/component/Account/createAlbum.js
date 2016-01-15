import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {addAlbum}                       from '../../reducer/albums'
import FlatButton                       from 'material-ui/lib/flat-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';
import Http                             from '../http'

class CreateAlbum extends Component {

    static propTypes = {
        username: PropTypes.string.isRequired,
        handleClose: PropTypes.func,
        addAlbum: PropTypes.func,
        album: PropTypes.object
    };

    constructor(args) {
        super(args);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.album) {
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
        if(!this.state.title) {
            this.setState({
                titreError: 'Le titre est obligatoire'
            })
        } else {
            let url, response;
            let {id, title, description} = this.state;
            if(id) {
                url = `/api/accounts/${this.props.username}/albums/${id}`;
                response = Http.put(url, {id, title, description})
            } else {
                url = `/api/accounts/${this.props.username}/albums`;
                response = Http.post(url, {id, title, description})
            }
            response
                .then(rep => rep.json())
                .then(
                    rep => {
                        console.log("Json", rep);
                        this.props.addAlbum(rep);
                        this.props.handleClose();
                    },
                    err => console.log("Err", err)
                );
        }
    };

    render() {
        return (
            <div>
                <Dialog
                    title="Créer un album"
                    modal={false}
                    open={this.props.open}
                    onRequestClose={this.props.handleClose}>

                    <TextField hintText="Titre"
                               value={this.state.title}
                               floatingLabelText="Titre"
                               fullWidth={true} onChange={this.setTitle}
                               errorText={this.state.titreError}
                    />
                    <br/>
                    <TextField hintText="Description"
                               floatingLabelText="Description"
                               value={this.state.description}
                               fullWidth={true}
                               multiLine={true}
                               rows={2}
                               onChange={this.setDescription}
                    />
                    <br/>
                    <FlatButton label="Enregistrer" primary={true} onClick={this.saveAlbum} />
                    <FlatButton label="Annuler" onClick={this.props.handleClose} />
                </Dialog>

            </div>
        )
    }
}

export default connect(
    state => ({
        routing: state.routing,
        account: state.account
    }),
    dispatch => ({
        addAlbum: (album) => {
            dispatch(addAlbum(album))
        }
    })
)(CreateAlbum);