import React                from 'react';
import {IndexRoute, Route}  from 'react-router';
import Roles                from '../authentication/roles'
import App                  from '../component/App'
import Home                 from '../component/Home'
import Account              from '../component/Account'
import EditAlbum            from '../component/Account/EditAlbum'
import Album                from '../component/Album'
import Picture              from '../component/Picture'
import Login                from '../component/Login'
import NotFound             from '../component/NotFound'
import Unauthorized         from '../component/Unauthorized'
import Forbidden            from '../component/Forbidden'

export default  (store) => {
    const isAuthenticated = () => (nextState, replaceState) => {
        const { auth: { user }} = store.getState();
        if(!user) {
            replaceState(null, '/forbidden');
        }
    };

    return (
        <Route path="/" component={App}>
            { /* Home (main) route */ }
            <IndexRoute component={Home}/>
            { /* Catch all route */ }
            <Route onEnter={isAuthenticated()} path="account/:username" component={Account}/>
            <Route onEnter={isAuthenticated()} path="account/:username/createAlbum" component={EditAlbum}/>
            <Route onEnter={isAuthenticated()} path="account/:username/editAlbum/:albumId" component={EditAlbum}/>
            <Route onEnter={isAuthenticated()} path="account/:username/:albumId" component={Album}/>
            <Route onEnter={isAuthenticated()} path="account/:username/:albumId/:pictureId" component={Picture}/>
            <Route path="login" component={Login}/>
            <Route path="unauthorized" component={Unauthorized}/>
            <Route path="forbidden" component={Forbidden}/>
            <Route path="*" component={NotFound} status={404} />

        </Route>
    )
};

