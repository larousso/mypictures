import React, { Component, PropTypes }  from 'react';
import { connect }                      from 'react-redux';
import config                           from '../../clientConfig'
import AppBar                           from 'material-ui/AppBar';
import IconButton                       from 'material-ui/IconButton';
import ArrowBack                        from 'material-ui/svg-icons/navigation/chevron-left';
import {grey50}                         from 'material-ui/styles/colors'
import { push }                         from 'react-router-redux'
import {fetchAccount}                   from '../../actions/account';
import {fetchPicture}                   from '../../actions/picture';


class Picture extends Component {


    constructor(props, context) {
        super(props, context);
    }

    static preRender = (store, props) => {
        let {params:{username, albumId, pictureId}} = props;
        return Promise.all([
            store.dispatch(fetchAccount(username)),
            store.dispatch(fetchPicture(username, albumId, pictureId))
        ]);
    };

    componentDidMount() {
        Picture.preRender(this.context.store, this.props);
    }

    render() {
        let { params:{username, albumId}, picture} = this.props;
        return (
            <div className="row" style={{background:grey50}}>
                <div className="col-xs">
                    <div className="box">
                        <div className="row center-xs">
                            <div className="col-xs-12">
                                <div className="box">
                                    <AppBar
                                        title={<span>{picture.picture.filename}</span>}
                                        iconElementLeft={<IconButton onClick={() => this.props.changeRoute(`/account/${username}/${albumId}`)}><ArrowBack /></IconButton>}
                                        iconElementRight={<IconButton></IconButton>}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row center-xs">
                            <div className="box">
                                <div className="col-xs-12">
                                    <span style={{'text-align':'center'}}>
                                        <img src={`${config.api.baseUrl}/static/images/${picture.picture.id}`} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

}


Picture.contextTypes = {
    store: React.PropTypes.object.isRequired
};


export default connect(
    state => ({
        store: state,
        user: state.auth.user,
        routing: state.routing,
        picture: state.picture,
    }),
    dispatch => ({
        changeRoute: (route) => {
            dispatch(push(route))
        }
    })
)(Picture);