import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux'
import {addPicture}                       from '../../reducer/pictures'
import FlatButton                       from 'material-ui/lib/flat-button';
import Dialog                           from 'material-ui/lib/dialog';
import TextField                        from 'material-ui/lib/text-field';
import Http                             from '../http'


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
        if(this.index) {
            this.index++
        } else {
            this.index=0;
        }
        return this.currentPicture();
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
        return (
            <div>
                <Dialog
                    modal={false}
                    open={this.props.open}
                    onRequestClose={this.props.handleClose}>

                    <img src={this.state.picture.file || "/image-not-found.png"} />
                    <FlatButton label="Annuler" onClick={this.props.handleClose} />
                </Dialog>

            </div>
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