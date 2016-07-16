import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'

let Habiliation = (props) => {
    let {role, account, user} = props;
    if(user && account && user.role === role && user.username === account.username) {
        return <div>{props.children}</div>;
    } else {
        return <div></div>;
    }
};

export default connect(
    state => ({
        user: state.auth.user
    }),
    dispatch => ({})
)(Habiliation);

