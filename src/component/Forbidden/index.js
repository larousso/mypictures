import React, {Component, PropTypes}  from 'react';
import Block                            from 'material-ui/lib/svg-icons/content/block'
import {red500}                           from 'material-ui/lib/styles/colors'

export default () => {
    return (
        <div>
        <div className="row center-xs">
            <div className="box">
                <h1>Oups ...</h1>
            </div>
        </div>
        <div className="row center-lg">
            <div className="box">
                <Block style={{fontSize: '1000', width: '100%', height: 'auto'}} viewBox="0 0 25 25" color={red500}/>
            </div>
        </div>
        </div>
    )
}