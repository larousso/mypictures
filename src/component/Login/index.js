import React, { Component, PropTypes }      from 'react';
import { connect }                          from 'react-redux'
import { pushPath }                         from 'redux-simple-router'
import {loadUser}                           from '../../reducer/auth'

class Login extends Component {
    static propTypes = {
        routing: PropTypes.object
    };

    login = () => {
        fetch('/api/login', {
            method: 'post',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.refs.username.value,
                password: this.refs.password.value
            })
        })
        .then(rep => rep.json())
        .then(user => {
            this.props.login(user);
            let { query: { redirect } } = this.props.location;
            this.props.goTo(redirect || '/');
        });
    };

    render() {
        return (
            <div>
                <label>Username</label>
                <input type="text" placeholder="username" ref="username"/>
                <label>Password</label>
                <input type="password" ref="password" />
                <button onClick={this.login} >Login</button>
            </div>
        )
    }
}

export default connect(
    state => ({
        routing: state.routing
    }),
    dispatch => ({
        login: (user) => {
            dispatch(loadUser(user))
        },
        goTo: (path) => {
            dispatch(pushPath(path))
        }
    })
)(Login);