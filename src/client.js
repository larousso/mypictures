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


var theme = getMuiTheme({}, { userAgent: navigator.userAgent });
var original = theme.prepareStyles;
theme.prepareStyles = function(style) {
    var out = style.muiPrepared ? style : original(style);
    if (out && out.muiPrepared) {
        delete out.muiPrepared;
    }
    return out;
};

const history = syncHistoryWithStore(browserHistory, store);
render(
    <MuiThemeProvider muiTheme={theme}>
        <Provider store={store}>
            <Router history={history} >
                {getRoutes(store)}
            </Router>
        </Provider>
    </MuiThemeProvider>,
    document.getElementById('app')
);