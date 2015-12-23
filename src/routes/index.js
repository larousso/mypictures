import React from 'react';
import {IndexRoute, Route} from 'react-router';

import {
    App,
    Home,
    NotFound,
    Login,
    Unauthorized
} from '../component'

export default  (
    <Route path="/" component={App}>
        { /* Home (main) route */ }
        <IndexRoute component={Home}/>
        { /* Catch all route */ }
        <Route path="login" component={Login}/>
        <Route path="unauthorized" component={Unauthorized}/>
        <Route path="*" component={NotFound} status={404} />
    </Route>
);