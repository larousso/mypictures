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
import Lightbox                         from '../LightBox/Lightbox';


class PictureIterable {
    constructor(object, id) {
        this.object = object;
        this.keys = Object.keys(object);
        this.length = this.keys.length;
        if (id) {
            this.index = this.keys.indexOf(id);
        } else {
            this.index = 0;
        }
    }

    currentPicture() {
        if (this.index < this.length) {
            const key = this.keys[this.index];
            console.log('Key', key, this.object[key]);
            return this.object[key];
        }
    }

    next() {
        if (this.index < (this.length - 1)) {
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
    if (props.pictures) {
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
        if (state) {
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

    prevLink =() => {
        let {username, albumId} = this.props;
        return `/account/${username}/${albumId}/picture/${this.state.iterable.prevId()}`;
    };

    nextLink =() => {
        let {username, albumId} = this.props;
        return `/account/${username}/${albumId}/picture/${this.state.iterable.prevId()}`;
    };

    getBody = () => {
        if(this.state.picture.description) {
            return (
                <div className="row" style={{width: '100%', height: '100%'}}>
                    <div className="col-xs-9">
                        <div className="box">
                            <img src={this.state.picture.file || "/image-not-found.png"}
                                 style={{marginLeft:'10px', marginRight:'10px', width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto'}}
                            />
                        </div>
                    </div>
                    <div className="col-xs-3">
                        <div className="box">
                            <h5 style={{color:Colors.darkWhite}}>{this.state.picture.title}</h5>
                            <p style={{color:Colors.darkWhite}}>
                                {this.state.picture.description}
                            </p>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="row" style={{width: '100%', height: '100%'}}>
                    <div className="col-xs">
                        <div className="box">
                            <img src={this.state.picture.file || "/image-not-found.png"}
                                 style={{marginLeft:'10px', marginRight:'10px', width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0, margin: 'auto'}}
                            />
                        </div>
                    </div>
                </div>
            );
        }
    }

    render() {

        return (
            <Modal
                isOpen={this.props.open}
                onRequestClose={this.props.handleClose}
                style={customStyles}>

                <IconButton tooltip="Fermer" style={{position: 'absolute', top: '0px',right: '0px', marginTop:'10px', marginLeft:'10px'}} onClick={this.props.handleClose}>
                    <FontIcon className="icon icon-cancel-circle" color={Colors.grey50}/>
                </IconButton>
                <Link style={{position: 'absolute', top: '50%',left: '10px'}} to={this.prevLink()}>
                    <FontIcon className="icon icon-previous2" color={Colors.darkWhite}/>
                </Link>
                <Link style={{position: 'absolute', top: '50%',right: '10px'}} to={this.nextLink()}>
                    <FontIcon className="icon icon-next2" color={Colors.darkWhite}/>
                </Link>
                {this.getBody()}
            </Modal>
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