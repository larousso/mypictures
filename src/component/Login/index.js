import React, { Component, PropTypes }      from 'react';
import { connect }                          from 'react-redux'
import { pushPath }                         from 'redux-simple-router'
import Paper                                from 'material-ui/lib/paper';
import Divider                              from 'material-ui/lib/divider';
import TextField                            from 'material-ui/lib/text-field';
import FlatButton                           from 'material-ui/lib/flat-button';
import {loadUser}                           from '../../reducer/auth'
import Http                                 from '../http'

class Login extends Component {
    static propTypes = {
        routing: PropTypes.object,
        login: PropTypes.func,
        goTo: PropTypes.func
    };
    constructor() {
        super();
        this.state = { errors: {}};
    }

    login = () => {
        let {username, password} = this.state;
        Http.post('/api/login', {username, password})
            .then(user => {
                this.props.login(user);
                let { query: { redirect } } = this.props.location;
                this.props.goTo(redirect || '/account/'+user.username);
            }).catch(err => {
                this.setState({errors: {
                    login: 'Mauvais login ou mot de passe',
                    password: 'Mauvais login ou mot de passe'
                }});
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
                    <div className="col-xs-12 col-lg-6 col-lg-offset-3">
                        <div className="box">
                            <TextField hintText="Login" floatingLabelText="Login" ref="username"
                                       fullWidth={true} onChange={this.setUsername}
                                       errorText={this.state.errors.login}
                            />
                            <br />
                            <TextField hintText="Mot de passe" floatingLabelText="Mot de passe" ref="password"
                                       type="password" fullWidth={true} onChange={this.setPassword}
                                       errorText={this.state.errors.password}
                            />
                        </div>
                    </div>
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