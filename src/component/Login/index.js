import React, { Component, PropTypes }  from 'react';

export default class Login extends Component {
    static propTypes = {
    };

    login = () => {
        fetch('/api/login', {
            method: 'post',
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
        .then(rep => {
            console.log("reponse", rep)
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