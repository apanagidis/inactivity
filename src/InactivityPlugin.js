import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import * as Flex from '@twilio/flex-ui'
import { FlexPlugin } from '@twilio/flex-plugin';
import { ChatChannelHelper, StateHelper } from "@twilio/flex-ui";
import { localStorageGet,localStorageSave } from './helpers/manager'

const MAX_RUNNING_TIMERS = 3;


import CustomTaskListContainer from './components/CustomTaskList/CustomTaskList.Container';
import reducers, { namespace } from './states';
import { Actions } from './states/CustomTaskListState';

const PLUGIN_NAME = 'InactivityPlugin';

export default class InactivityPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);

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

    const options = { sortOrder: -1 };

    flex.AgentDesktopView.Panel1.Content.add(
    <CustomTaskListContainer key="TestPlugin-component"
    />
    , options);

    this.dispatch(Actions.updateLastMessage(localStorageGet("last_message")));

    manager.chatClient.on("messageAdded", (chatMessage) => {
      console.log("Inactivity plugin: messageAdded", chatMessage); 

      // Only refresh the timers if the last message was send by the customer
      if(chatMessage.configuration.userIdentity != chatMessage.state.author){
        console.log("refreshing timer");
        localStorageSave("last_message",(chatMessage.conversation.channelState.lastMessage.index).toString());
        this.dispatch(Actions.updateLastMessage(localStorageGet("last_message")));
      }
    });

 
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
