import React, { Component, PropTypes }      from 'react';
import { connect }                          from 'react-redux'
import { pushPath }                         from 'redux-simple-router'
import Paper                                from 'material-ui/lib/paper';
import Divider                              from 'material-ui/lib/divider';
import TextField                            from 'material-ui/lib/text-field';
import FlatButton                           from 'material-ui/lib/flat-button';
import {loadUser}                           from '../../reducer/auth'
import ReactGridLayout                      from 'react-grid-layout';

class Login extends Component {
    static propTypes = {
        routing: PropTypes.object,
        login: PropTypes.func,
        goTo: PropTypes.func
    };

    login = () => {
        let {username, password} = this.state;
        fetch('/api/login', {
            method: 'post',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        })
        .then(rep => rep.json())
        .then(user => {
            this.props.login(user);
            let { query: { redirect } } = this.props.location;
            this.props.goTo(redirect || '/account/'+user.username);
        });
    };

    setUsername = (value) => {
        this.setState({
            username: value.target.value
        })
    };
    setPassword = (value) => {
        this.setState({
            password: value.target.value
        })
    };

    render() {
        return (
            <div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <h1>Login</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-3"></div>
                    <div className="col-xs-6">
                        <div className="box">
                            <TextField hintText="Login" floatingLabelText="Login" ref="username" fullWidth={true} onChange={this.setUsername}/>
                            <br />
                            <TextField hintText="Mot de passe" floatingLabelText="Mot de passe" ref="password" type="password" fullWidth={true} onChange={this.setPassword}/>
                        </div>
                    </div>
                    <div className="col-xs-3"></div>
                </div>
                <div className="row center-xs">
                    <div className="col-xs-12">
                        <FlatButton label="Se connecter" primary={true} onClick={this.login} />
                    </div>
                </div>
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