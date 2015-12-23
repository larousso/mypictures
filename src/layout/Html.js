import React, { Component, PropTypes } from 'react'
import serialize from 'serialize-javascript';
import {renderToString} from 'react-dom/server'

export default class Html extends Component {

    static propTypes = {
        assets: PropTypes.object,
        component: PropTypes.node,
        store: PropTypes.object
    };

    render(){
        const {component, store} = this.props;
        const content = component ? renderToString(component) : '';
        return (
            <html lang="fr">
                <head>
                </head>
                <body>
                    <div id="app" dangerouslySetInnerHTML={{__html: content}}/>
                    <script dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${serialize(store.getState())};`}} charSet="UTF-8"/>
                    <script src="/client.js" />
                </body>
            </html>
        )
    }
}