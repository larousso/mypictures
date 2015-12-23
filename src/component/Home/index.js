import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'


function makeASandwich(forPerson, secretSauce) {
    return {
        type: 'MAKE_SANDWICH',
        forPerson,
        secretSauce
    };
}

class Home extends Component {
    static propTypes = {
    };

    static preRender = (store) => {

        return store.dispatch(dispatch => {
            return Promise.resolve()
            .then(
                any => dispatch(makeASandwich('ME', 'ketchup')),
                err => dispatch(makeASandwich('OUPS', 'mayo'))
            ).then(any => {
                return any;
            });
        });
    };

    render() {
        return (
            <div>
                Home {this.props.sandwiches.who
            }
            </div>
        )
    }
}

export default connect(
    state => {
        return {
            sandwiches: state.sandwiches
        };
    }
)(Home);