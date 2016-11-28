/**
 * Created by trzmiel007 on 16/11/16.
 */

import React from 'react';

function composeStores(stores) {
    let ret = {};
    Object.keys(stores).forEach(k => {
        const store = stores[k];
        ret = Object.assign({}, ret, store.getState());
    });

    return ret;
}
function connect(state = ()=>{}, actions = {}, target){
    class Connect extends React.Component {
        // componentDidMount() {
        //     const {flux} = this.context;
        //     flux.FinalStore.listen(this.handleChange);
        // }
        // componentWillUnmount() {
        //     const {flux} = this.context;
        //     flux.FinalStore.unlisten(this.handleChange);
        // }

        render() {
            // const {flux} = this.context;
            // const stores = flux.stores;
            // const composedStores = composeStores(stores);
            // var props = Object.assign({}, this.props, state(composedStores), actions);
            // delete props.flux;
            return React.createElement(target, this.props);
        }
        handleChange = () => {
            this.forceUpdate();
        }
    }
    Connect.contextTypes = {
        // flux: React.PropTypes.object.isRequired
    };

    return Connect;
}

export default (state, actions) => {
    if(typeof state === 'function' || (typeof state === 'object' && Object.keys(state).length)){
        return target => connect(state, actions, target);
    }

    return target => props => (<target { ...Object.assign({}, props, actions) } />);
};
