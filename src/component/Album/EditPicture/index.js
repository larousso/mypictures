import React, { Component, PropTypes }  from 'react';
import {findDOMNode}                    from 'react-dom';
import { connect }                      from 'react-redux'
import { Link }                         from 'react-router'
import { replacePath }                 from 'redux-simple-router'
import rx                               from 'rx'
import Http                             from '../http'
import GridList                         from 'material-ui/lib/grid-list/grid-list';
import GridTile                         from 'material-ui/lib/grid-list/grid-tile';
import CircularProgress                 from 'material-ui/lib/circular-progress';
import IconButton                       from 'material-ui/lib/icon-button';
import Colors                           from 'material-ui/lib/styles/colors'
import FontIcon                         from 'material-ui/lib/font-icon';
import UpdatePicture                    from './UpdatePicture'
import Habilitations                    from '../Habiliations'
import Roles                            from '../../authentication/roles';
import {loadingAlbum, loadAlbumFail, loadAlbum}      from '../../reducer/album'
import {loadingAccount, loadAccountFail, loadAccount}   from '../../reducer/account'
import {addRawPicture, updateRawPicture, pictureCreated, pictureCreationError, loadingPictures, loadPictures, loadPicturesFail, deletePicture}   from '../../reducer/pictures'
import uuid from 'node-uuid'
