import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'



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

