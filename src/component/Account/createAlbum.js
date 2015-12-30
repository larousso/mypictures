import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {loadingAccount, loadAccountFail, loadAccount} from '../../reducer/account'
import FlatButton                       from 'material-ui/lib/flat-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';

class CreateAlbum extends Component {

    static propTypes = {
        //username: PropTypes.string.required
    };

    constructor(args) {
        super(args);
        this.state = {
            open: false
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

    componentWillReceiveProps(nextProps) {
        this.setState({open: nextProps.open});
    }

    handleClose = () => {
        this.setState({open:false});
    };

    createAlbum = () => {
        if(!this.state.title) {
            this.setState({
                titreError: 'Le titre est obligatoire'
            })
        } else {
            let {title, description} = this.state;
            fetch(`/api/accounts/${this.props.username}/albums`, {
                method: 'post',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title, description})
            })
            .then(rep => rep.json())
            .then(rep => console.log("Json", rep), err => console.log("Err", err))

        }
    };

    render() {
        let actions = [

        ];

        return (
            <div>
                <Dialog
                    title="Créer un album"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}>

                    <TextField hintText="Titre"
                               floatingLabelText="Titre"
                               fullWidth={true} onChange={this.setTitle}
                               errorText={this.state.titreError}
                    />
                    <br/>
                    <TextField hintText="Description"
                               floatingLabelText="Description"
                               fullWidth={true}
                               multiLine={true}
                               rows={2}
                               onChange={this.setDescription}
                    />
                    <br/>
                    <FlatButton label="Enregistrer" primary={true} onClick={this.createAlbum} />
                    <FlatButton label="Annuler" onClick={this.handleClose} />
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
        loadAccount: (user) => {
            dispatch(loadAccount(user))
        },
        loadingAccount: () => {
            dispatch(loadingAccount())
        },
        loadAccountFail: (err) => {
            dispatch(loadAccountFail(err))
        }
    })
)(CreateAlbum);