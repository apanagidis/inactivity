import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Actions } from '../../states/CustomerInactivityState';
import CustomerInactivity from './CustomerInactivity';

const mapStateToProps = (state) => ({
  activeChats: state['inactivity'].CustomerInactivity.activeChats,
});

const mapDispatchToProps = (dispatch) => ({
  updateLastMessage: bindActionCreators(Actions.updateLastMessage, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomerInactivity);
