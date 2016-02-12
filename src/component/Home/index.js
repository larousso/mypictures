import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'


export default (props) => {
    return (
        <div>
            <div className="row center-xs">
                <div className="col-xs-12">
                    <h1>Welcome</h1>
                </div>
            </div>
            <div className="row center-xs">
                <div className="col-xs-2">
                </div>
                <div className="col-xs-8">
                    <img src="/loutre.jpg" width="100%"/>
                </div>
                <div className="col-xs-2">
                </div>
            </div>

        </div>
    )
}