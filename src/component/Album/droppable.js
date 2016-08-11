import React, {Component} from 'react'



export default class Droppable extends Component {
    constructor(args) {
        super(args)
    }

    preventDefault= (event) => {
        event.preventDefault();
    };

    drop = (event) => {
        event.preventDefault();
        try {
            const data = JSON.parse(event.dataTransfer.getData('text'));
            this.props.onDrop(data);
        } catch (e) {
            return;
        }
    };


    render() {
        return (
            <div onDragOver={this.preventDefault} onDrop={this.drop}>
                {this.props.children}
            </div>
        )
    }
}