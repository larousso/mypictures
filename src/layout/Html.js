import React, { Component, PropTypes } from 'react'
import serialize from 'serialize-javascript';
import {renderToString} from 'react-dom/server'

export default (props) => {
    const {component, store} = props;
    const content = component ? renderToString(component) : '';
    return (
        <html lang="fr">
            <head>
            </head>
            <body>
                <div id="app" dangerouslySetInnerHTML={{__html: content}}></div>
                <script dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${serialize(store.getState())};`}} charSet="UTF-8"></script>
                <script src="/client.js" ></script>
                <link href="/styles.css" rel="stylesheet" type="text/css"/>
                <link href="/flexboxgrid.min.css" rel="stylesheet" type="text/css"/>
            </body>
        </html>
    );
}