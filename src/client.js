import React                                    from 'react'
import {render}                                 from 'react-dom'
import configureStore                           from './store/configureStore'
import { Router, browserHistory}                from 'react-router'
import getRoutes                                from './routes'
import debug                                    from 'debug';
import { syncHistoryWithStore }                 from 'react-router-redux'
import {Provider}                               from 'react-redux';
import injectTapEventPlugin                     from 'react-tap-event-plugin';
import getMuiTheme                              from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider                         from 'material-ui/styles/MuiThemeProvider';

injectTapEventPlugin();

const store = configureStore(window.__INITIAL_STATE__);
//const history = createHistory();
window.React = React; // For chrome dev tool support
window.reduxDebug = debug;
window.reduxDebug.enable('*'); // this should be activated only on development env

console.log('Env', process.env.NODE_ENV);

const history = syncHistoryWithStore(browserHistory, store);

render(
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <Provider store={store}>
            <Router history={history} >
                {getRoutes(store)}
            </Router>
        </Provider>
    </MuiThemeProvider>,
    document.getElementById('app')
);