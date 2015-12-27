import React                from 'react';
import {IndexRoute, Route}  from 'react-router';
import Roles                from '../authentication/roles'

import {
    App,
    Account,
    Home,
    NotFound,
    Login,
    Unauthorized,
    Forbidden
} from '../component'

export default  store => {
    const hasRole = role => (nextState, replaceState) => {
        const { auth: { user }} = store.getState();
        if (!user) {
            replaceState(null, '/unauthorized');
        } else if (user.role !== role) {
            replaceState(null, '/forbidden');
        }
    };
    return (
        <Route path="/" component={App}>
            { /* Home (main) route */ }
            <IndexRoute component={Home}/>
            { /* Catch all route */ }
            <Route onEnter={hasRole(Roles.ADMIN)} path="account" component={Account}/>
            <Route path="login" component={Login}/>
            <Route path="unauthorized" component={Unauthorized}/>
            <Route path="forbidden" component={Forbidden}/>
            <Route path="*" component={NotFound} status={404} />

        </Route>
    )
};

