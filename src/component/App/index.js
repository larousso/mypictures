import React, { Component, PropTypes } from 'react';
import __fetch from "isomorphic-fetch";


export default class App extends Component {
    static propTypes = {
        children: PropTypes.object.isRequired
    };

    render() {
       return (
           <div>
               {this.props.children}
           </div>
       )
    }
}