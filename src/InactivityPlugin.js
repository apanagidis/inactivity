import React from 'react';
import * as Flex from '@twilio/flex-ui'
import { FlexPlugin } from '@twilio/flex-plugin';
import registerCustomNotifications from './notifications'
import CustomerInactivityContainer from './components/CustomerInactivity/CustomerInactivity.Container';
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
    // Register the notification
    registerCustomNotifications(flex, manager); 

      flex.DefaultTaskChannels.Chat.addedComponents = [
        {
            target: "TaskListItem",
            component: <CustomerInactivityContainer
            key="CustomerInactivityContainer"
            />
        }
      ]
  

  }
  dispatch = (f) => Flex.Manager.getInstance().store.dispatch(f);

}
