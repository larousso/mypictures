import React                                    from 'react'
import ReactDOM                                 from 'react-dom'
import configureStore                           from './store/configureStore'
import reducer                                  from './reducer'
import thunk                                    from 'redux-thunk';
import { Router}                                from 'react-router'
import BrowserHistory                           from 'react-router/lib/History'
import getRoutes                                from './routes'
import debug                                    from 'debug';
import createHistory                            from 'history/lib/createBrowserHistory';
import Html                                     from './layout/Html'
//import { DevTools, DebugPanel, LogMonitor }     from 'redux-devtools/lib/react';
import { syncReduxAndRouter }                   from 'redux-simple-router'
import {Provider}                               from 'react-redux';

console.log("Initializing state", window.__INITIAL_STATE__);

const store = configureStore(window.__INITIAL_STATE__);
const history = createHistory();
window.React = React; // For chrome dev tool support
window.reduxDebug = debug;
window.reduxDebug.enable('*'); // this should be activated only on development env

syncReduxAndRouter(history, store);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history} >
            {getRoutes(store)}
        </Router>
    </Provider>,
    document.getElementById('app')
);