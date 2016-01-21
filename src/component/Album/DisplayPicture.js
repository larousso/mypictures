import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {addPicture}                       from '../../reducer/pictures'
import FlatButton                       from 'material-ui/lib/flat-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';
import FontIcon                         from 'material-ui/lib/font-icon';
import IconButton                       from 'material-ui/lib/icon-button';
import Colors                           from 'material-ui/lib/styles/colors';
import Http                             from '../http'
import { Link }                         from 'react-router'

class PictureIterable {
    constructor(object, id) {
        this.object = object;
        this.keys = Object.keys(object);
        this.length = this.keys.length;
        if(id) {
            this.index = this.keys.indexOf(id);
        } else {
            this.index = 0;
        }
    }

    currentPicture() {
        if(this.index < this.length) {
            const key = this.keys[this.index];
            console.log('Key', key, this.object[key]);
            return this.object[key];
        }
    }

    next() {
        if(this.index < (this.length - 1)) {
            this.index++
        } else {
            this.index = 0;
        }
        return this.currentPicture();
    }


    prevId() {
        let prevIndex = this.index - 1;
        if (prevIndex < 0) {
            return this.keys[this.length - 1];
        } else {
            return this.keys[prevIndex];
        }
    }

    nextId() {
        let nextIndex = this.index + 1;
        if (nextIndex < this.length) {
            return this.keys[nextIndex];
        } else {
            return this.keys[0];
        }
    }

}

function initialState(props) {
    if(props.pictures) {
        const iterable = new PictureIterable(props.pictures, props.id);
        const currentPicture = iterable.currentPicture() || {};
        const picture = currentPicture.picture || {};
        console.log('Current picture', picture);
        return {iterable, picture};
    }
}

class DisplayPicture extends Component {

    static propTypes = {
        handleClose: PropTypes.func,
    };

    constructor(args) {
        super(args);
        console.log(args);
        this.state = initialState(args);
    }

    componentWillReceiveProps(nextProps) {
        const state = initialState(nextProps);
        if(state) {
            this.setState(state);
        }
    }

    componentDidMount() {
        if (!this.state.picture) {
            const currentPicture = this.state.iterable.currentPicture() || {};
            const picture = currentPicture.picture || {};
            console.log('Current picture', picture);
            this.setState({picture})
        }
    }

    render() {
        console.log('Open', this.props.open);
        let {username, albumId} = this.props;
        //{/* autoDetectWindowHeight={true} autoScrollBodyContent={false} , contentStyle={{width: "100%", maxWidth: "none"}}*/}
        return (
                <Dialog
                    modal={false}
                    open={this.props.open}
                    contentStyle={{width: "100%", height:"100%"}}
                    onRequestClose={this.props.handleClose}>

                    <div className="row center-xs">
                        <div className="col-xs-12">
                            <IconButton tooltip="Fermer" style={{position: 'absolute', top: '0px',right: '0px'}} onClick={this.props.handleClose} >
                                <FontIcon className="icon icon-cancel-circle" color={Colors.grey} />
                            </IconButton>
                            <div className="row center-xs">
                                <div className="row middle-xs">
                                    <h5>{this.state.picture.title}</h5>
                                </div>
                            </div>
                            <div className="row center-xs">
                                <div className="col-xs-12">
                                    <div className="row middle-xs">
                                        <div className="col-xs-1">
                                            <Link to={`/account/${username}/${albumId}/picture/${this.state.iterable.prevId()}`}>
                                                <FontIcon className="icon icon-previous2" />
                                            </Link>
                                        </div>
                                        <div className="col-xs-10">
                                            <Link to={`/account/${username}/${albumId}/picture/${this.state.iterable.nextId()}`}>
                                                <img src={this.state.picture.file || "/image-not-found.png"} width="100%" height="100%" />
                                            </Link>
                                        </div>
                                        <div className="col-xs-1">
                                            <Link to={`/account/${username}/${albumId}/picture/${this.state.iterable.nextId()}`}>
                                                <FontIcon className="icon icon-next2" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row center-xs" height="100%">
                                <div className="col-xs-12">
                                    {this.state.picture.description}
                                </div>
                            </div>
                        </div>
                    </div>
                </Dialog>
        )
    }
}

export default connect(
    state => ({
        routing: state.routing,
        pictures: state.pictures.pictures
    }),
    dispatch => ({
        addPicture: (picture) => {
            dispatch(addPicture(picture))
        }
    })
)(DisplayPicture);