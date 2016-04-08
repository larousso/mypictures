import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import Chat                             from 'material-ui/lib/svg-icons/communication/chat-bubble';
import Edit                             from 'material-ui/lib/svg-icons/editor/mode-edit';
import Delete                           from 'material-ui/lib/svg-icons/action/delete';
import Cancel                           from 'material-ui/lib/svg-icons/navigation/cancel';
import Badge                            from 'material-ui/lib/badge';
import IconButton                       from 'material-ui/lib/icon-button';
import Popover                          from 'material-ui/lib/popover/popover';
import Done                             from 'material-ui/lib/svg-icons/action/done';
import TextField                        from 'material-ui/lib/text-field';
import Divider                          from 'material-ui/lib/divider';
import Http                             from '../http'

class Comments extends Component {

    static propTypes = {
        albumId: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        pictureId: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        this.state = {
            comments: [],
            edit:{},
            nameError:''
        }
    }

    componentDidMount() {
        const {username, albumId, pictureId} = this.props;
        this.isUnmounted = false;
        Http.get(`/api/accounts/${username}/albums/${albumId}/pictures/${pictureId}/comments`)
            .then(comments => {
                if(!this.isUnmounted) {
                    const name = this.props.user.username !== 'invite' ? this.props.user.username : undefined;
                    this.setState({comments, name});
                }
            }, err => console.log(err));
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    openComments = (event) => {
        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    setCurrentName = (event) => {
        this.setState({
            name: event.target.value,
        });
    };

    setCurrentComment = (event) => {
        this.setState({
            comment: event.target.value,
        });
    };

    send = () => {
        const {name, comment, comments} = this.state;
        if(!name) {
            this.setState({
                nameError: 'Le nom est obligatoire'
            });
        } else if(comment) {
            const date = new Date();
            const {username, albumId, pictureId} = this.props;
            const newComment = {comment, name, date, pictureId};
            Http.post(`/api/accounts/${username}/albums/${albumId}/pictures/${pictureId}/comments`, newComment)
                .then(rep => {
                    this.setState({
                        comments: [rep, ...comments],
                        comment: null
                    });
                }, err => console.log(err));
        }
    };

    nbComments = () => {
        return this.state.comments.length;
    };

    displayIf = (toTest) => (value) => {
        if(toTest) {
            return value();
        }
    };

    edit = (id) => () => {
        const toEdit = this.state.comments.find(c => c.id == id);
        this.setState({edit: {[id]: {...toEdit}, ...this.state.edit}})
    };

    cancel = (id) => () => {
        delete this.state.edit[id];
        this.setState({edit: {...this.state.edit}})
    };

    editComment = (id) => (event) => {
        const comment = event.target.value;
        const newComment = {...this.state.edit[id], comment};
        this.setState({edit: {...this.state.edit, [id]: newComment} });
    };

    update = (id) => () => {
        const comment = this.state.edit[id];
        const {username, albumId, pictureId} = this.props;
        Http.put(`/api/accounts/${username}/albums/${albumId}/pictures/${pictureId}/comments/${id}`, comment)
            .then(rep => {
                this.setState({
                    comments: [comment, ...this.state.comments.filter(c => c.id != id)],
                });
                this.cancel(id)();
            }, err => console.log(err));
    };

    delete = (id) => () => {
        const {username, albumId, pictureId} = this.props;
        Http.delete(`/api/accounts/${username}/albums/${albumId}/pictures/${pictureId}/comments/${id}`)
            .then(rep => {
                this.setState({
                    comments: [...this.state.comments.filter(c => c.id != id)],
                });
                this.cancel(id)();
            }, err => console.log(err));
    };

    render() {
        return (
            <div>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose}
                    style={{maxWidth:'400px', overflowY: 'scroll'}}
                >
                    <div style={{padding: 20}}>
                        {this.displayIf(this.props.user.username !== 'invite')(_ =>
                            <div><strong>{this.state.name} :</strong><br/></div>
                        )}
                        {this.displayIf(this.props.user.username === 'invite')(_ =>
                            <TextField hintText="Nom"
                                       defaultValue={this.state.name}
                                       onChange={this.setCurrentName}
                                       errorText={this.state.nameError}
                            />
                        )}
                        <TextField hintText="Commenter"
                                   multiLine={true}
                                   value={this.state.comment}
                                   onChange={this.setCurrentComment}
                        />
                        <IconButton tooltip="Envoyer" onClick={this.send}>
                            <Done />
                        </IconButton>
                        {
                            this.state.comments
                                .sort((c1, c2) => {
                                    if (new Date(c1.date) > new Date(c2.date)) {
                                        return -1;
                                    } else {
                                        return 1;
                                    }
                                })
                                .map( (c, i) => (
                                    <div key={i} >
                                        <span className="strong">{c.name}</span>
                                        {this.displayIf( (c.name == this.props.user.username) && !this.state.edit[c.id])(_ =>
                                            <div style={{display: 'inline-table'}} >
                                                <IconButton tooltip="Editer" onClick={this.edit(c.id)}>
                                                    <Edit />
                                                </IconButton>
                                                <IconButton tooltip="Supprimer" onClick={this.delete(c.id)}>
                                                    <Delete />
                                                </IconButton>
                                            </div>
                                        )}
                                        {this.displayIf(!this.state.edit[c.id])(_ =>
                                            <p className="thin">{c.comment}</p>
                                        )}
                                        {this.displayIf(this.state.edit[c.id])(_ =>
                                            <div style={{display: 'inline-table'}} >

                                                <br/>
                                                <TextField hintText="Commenter"
                                                           multiLine={true}
                                                           defaultValue={this.state.edit[c.id].comment}
                                                           rows={1}
                                                           onChange={this.editComment(c.id)}
                                                />
                                                <IconButton tooltip="Annuler" onClick={this.cancel(c.id)}>
                                                    <Cancel />
                                                </IconButton>
                                                <IconButton tooltip="Envoyer" onClick={this.update(c.id)}>
                                                    <Done />
                                                </IconButton>
                                            </div>
                                        )}
                                        <Divider />
                                    </div>
                                ))
                        }
                    </div>
                </Popover>
                <IconButton tooltip="Comments" onClick={this.openComments}>
                    <Chat />
                </IconButton>
                <Badge badgeContent={this.nbComments()} primary={true} badgeStyle={{top: 2, right: 4}}>
                </Badge>
            </div>
        );
    }
}
export default connect(
    state => ({
        user: state.auth.user,
    }),
    dispatch => ({

    })
)(Comments);