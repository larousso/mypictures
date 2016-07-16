import React, { Component, PropTypes }      from 'react';
import { connect }                          from 'react-redux'
import TextField                            from 'material-ui/lib/text-field'
import FlatButton                           from 'material-ui/lib/flat-button'
import {login}                           from '../../actions/auth'

class Login extends Component {

    static propTypes = {
        routing: PropTypes.object,
        login: PropTypes.func,
        goTo: PropTypes.func
    };

    constructor() {
        super();
        this.state = {}
    }

    login = () => {
        let {username, password} = this.state;
        let { query: { redirect } } = this.props.location;
        let res = this.props.login({username, password}, redirect);
        console.log(res);
    };

    getErrors = () => {
        return this.props.loginError || {};
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
                                       errorText={this.getErrors().login}
                            />
                            <br />
                            <TextField hintText="Mot de passe" floatingLabelText="Mot de passe" ref="password"
                                       type="password" fullWidth={true} onChange={this.setPassword}
                                       errorText={this.getErrors().password}
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
        routing: state.routing,
        user: state.auth.user,
        loginError: state.auth.loginError,
    }),
    dispatch => ({
        login: (user, redirect) => {
            return dispatch(login(user, redirect))
        },
    })
)(Login);