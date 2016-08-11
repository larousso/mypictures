import React, {Component} from 'react'



export default class Draggable extends Component {

    constructor(args) {
        super(args)
    }

    dragStart = (event) => {
        event.dataTransfer.setData('text', JSON.stringify(this.props.data));
    };

    render() {
        return (
            <div draggable="true" onDragStart={this.dragStart}>
                {this.props.children}
            </div>
        )
    }
}