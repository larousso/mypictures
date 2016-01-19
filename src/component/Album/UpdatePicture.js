import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {addPicture}                       from '../../reducer/pictures'
import FlatButton                       from 'material-ui/lib/flat-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';
import Http                             from '../http'

class UpdatePicture extends Component {

    static propTypes = {
        username: PropTypes.string.isRequired,
        handleClose: PropTypes.func,
        picture: PropTypes.object
    };

    constructor(args) {
        super(args);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.picture) {
            let { picture: { title, description } } = nextProps;
            this.setState({title, description});
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

    savePicture = () => {
        let { title, description } = this.state;
        let { picture: { id, album} } = this.props;
        let url = `/api/accounts/${this.props.username}/albums/${album}/pictures/${id}`;
        let oldPicture = Object.assign({}, this.props.picture);
        console.log('Old', oldPicture, this.props.picture);
        delete oldPicture['file'];
        let newPicture = Object.assign({}, oldPicture, {title, description});
        console.log('Updating picture', newPicture);
        Http.put(url, newPicture)
            .then(
                rep => {
                    console.log("Json", rep);
                    this.props.addPicture(rep);
                    this.props.handleClose();
                },
                err => console.log("Err", err)
            );
    };

    render() {
        console.log('Open', this.props.open);
        return (
            <div>
                <Dialog
                    title="Mise à jour de l'image"
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
                    <FlatButton label="Enregistrer" primary={true} onClick={this.savePicture} />
                    <FlatButton label="Annuler" onClick={this.props.handleClose} />
                </Dialog>

            </div>
        )
    }
}

export default connect(
    state => ({
        routing: state.routing,
    }),
    dispatch => ({
        addPicture: (picture) => {
            dispatch(addPicture(picture))
        }
    })
)(UpdatePicture);