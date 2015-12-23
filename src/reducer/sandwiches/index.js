

export default function sandwiches(state = {}, action = {}) {
    //console.log("GETTING ACTION", action);
    switch (action.type) {
        case 'MAKE_SANDWICH': return {
            sandwiches: {
                who: action.forPerson,
                secretSauce: action.secretSauce
            }
        };
        default:
            return state;
    }
}