import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'



export default (props) => {
    let {role, account, auth} = props;
    if(auth && account && auth.role === role && auth.username === account.username) {
        return <div>{props.children}</div>;
    } else {
        return <div></div>;
    }
};
