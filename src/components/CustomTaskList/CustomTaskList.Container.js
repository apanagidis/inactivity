import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Actions } from '../../states/CustomTaskListState';
import CustomTaskList from './CustomTaskList';

const mapStateToProps = (state) => ({
  lastMessage: state['inactivity'].customTaskList.lastMessage,
});

const mapDispatchToProps = (dispatch) => ({
  updateLastMessage: bindActionCreators(Actions.updateLastMessage, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomTaskList);
