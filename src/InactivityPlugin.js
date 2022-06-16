import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import * as Flex from '@twilio/flex-ui'
import { FlexPlugin } from '@twilio/flex-plugin';
import { localStorageGet,localStorageSave } from './helpers/manager'
import registerCustomNotifications from './notifications'

import CustomTaskListContainer from './components/CustomTaskList/CustomTaskList.Container';
import reducers, { namespace } from './states';
import { Actions } from './states/CustomTaskListState';
import { TaskHelper } from "@twilio/flex-ui";


const PLUGIN_NAME = 'InactivityPlugin';

export default class InactivityPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  onClearArray = () => {
    this.setState({ activeChats: [] });
  }
  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);
    // Register the notification
    registerCustomNotifications(flex, manager); 

      flex.DefaultTaskChannels.Chat.addedComponents = [
        {
            target: "TaskListItem",
            component: <CustomTaskListContainer
            key="CustomTaskListContainer"
            />
        }
      ]

  }
  dispatch = (f) => Flex.Manager.getInstance().store.dispatch(f);

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
