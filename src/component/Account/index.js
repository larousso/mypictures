import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'


class Account extends Component {
    static propTypes = {
    };

    static preRender = (store) => {
    };

    greeting = () => {
        if(this.props.user) return `Hi ${this.props.user.username}`
    };

    render() {
        return (
            <div>
                {this.greeting()}
                <br/>
            </div>
        )
    }
}

export default connect(
    state => ({
        user: state.auth.user
    })
)(Account);