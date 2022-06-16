import { combineReducers } from 'redux';

import { reduce as CustomerInactivityReducer} from './CustomerInactivityState';

// Register your redux store under a unique namespace
export const namespace = 'inactivity';

// Combine the reducers
export default combineReducers({
  CustomerInactivity: CustomerInactivityReducer,
});
