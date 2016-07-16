import React                                    from 'react'
import {renderToString}                         from 'react-dom/server'
import { match, RoutingContext }                from 'react-router'
import {Provider}                               from 'react-redux';
import getRoutes                                from './routes'
import Html                                     from './layout/Html'
import configureStore                           from './store/configureStore'

export default (req, res) => {
    const authToken = req.getAuthToken();
    if(authToken) {
        const user = req.userSession;
        const store = configureStore({auth:{ loading: false, loaded: true, user}, authToken, currentLocation: {location: req.get('host')}});
        handleRequest(req, res, store);
    } else {
        const store = configureStore({authToken, currentLocation: {location: req.get('host')}});
        handleRequest(req, res, store);
    }
}

const handleRequest = (req, res, store) => {
    const routes = getRoutes(store);
    match(
        { routes, location: req.originalUrl },
        (error, redirectLocation, renderProps) => {
            if (redirectLocation) {
                res.redirect(redirectLocation.pathname + redirectLocation.search);
            } else if (error) {
                res.send(error.message).code(500);
            } else if (!renderProps) {
                res.send('Not found').code(404);
            } else {
                // Workaround redux-router query string issue:
                // https://github.com/rackt/redux-router/issues/106
                if (renderProps.location.search && !renderProps.location.query) {
                    renderProps.location.query = qs.parse(renderProps.location.search);
                }
                // Promise.all in fetchData waits until all Promises from the Components are resolved and only then starts to render the  result.
                fetchData(store, renderProps).then(() => {
                    let component = (
                        <Provider store={store}>
                            <RoutingContext {...renderProps} />
                        </Provider>
                    );
                    const html = renderToString(<Html component={component} store={store}/>);
                    const response = `<!doctype html>\n${html}`;
                    res
                        .send(response)
                        .catch((err) => {
                            console.error('DATA FETCHING ERROR:', pretty.render(err));
                            res.status(500);
                            res.send('Not found');
                        });
                }).catch((error) => reply(error).code(500));
            }
        });

};

function fetchData(store, routerState) {
    const promises = routerState.components
        .filter(component => (component && component.preRender))
        .map(component => component.preRender(store, routerState))
        .filter(elt => !!elt);
    return Promise.all(promises);
}