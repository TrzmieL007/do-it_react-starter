/**
 * Created by trzmiel007 on 16/11/16.
 */

import { createStore } from 'redux';
import StoreReducers from './storeReducers';

const store = createStore(StoreReducers);

module.exports = store;