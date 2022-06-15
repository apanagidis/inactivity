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
    const options = { sortOrder: -1 };

    let activeChats = localStorageGet("last_message");
    if(activeChats){
      console.log("active Chat", activeChats)
     this.dispatch(Actions.updateLastMessage(activeChats));
    }

    Flex.Manager.getInstance().workerClient.on("reservationCreated", reservation => {
      console.log("new chat",reservation);

      const options = { sortOrder: -1 };
      flex.AgentDesktopView.Panel1.Content.add(
        <CustomTaskListContainer WRsid={reservation.sid} key="TestPlugin-component"
        />
        , options);

      
    });

    manager.chatClient.on("memberJoined", (chatMessage) => {
      console.log("agent joined the chat", chatMessage);
    });
    
    // Cant add component on after accept task
    flex.Actions.addListener("afterAcceptTask", (payload) => {
      console.log("afterAcceptTask", payload)
      // const options = { sortOrder: -1 };
      // flex.AgentDesktopView.Panel1.Content.add(
      //   <CustomTaskListContainer WRsid={payload.sid} key="TestPlugin-component"
      //   />
      //   , options);

     
      });

   
    manager.chatClient.on("messageAdded", (chatMessage) => {
      console.log("Inactivity plugin: messageAdded", chatMessage); 
      console.log("store", Flex.Manager.getInstance().store.getState());

      // Only refresh the timers if the last message was send by the customer
      if(chatMessage.configuration.userIdentity != chatMessage.state.author){
        let lastMessage = {
          id: chatMessage.conversation.sid,
          dateUpdated:chatMessage.state.dateUpdated
        }
        let activeChats = localStorageGet("last_message");
        if(activeChats){
          var foundIndex = activeChats.findIndex(x => x.id == chatMessage.conversation.sid);
          if(foundIndex != -1){
            activeChats[foundIndex] = lastMessage;
          }
          else{
            activeChats.push(lastMessage);
          }
          console.log("active chats", activeChats)
          localStorageSave("last_message",activeChats);
          this.dispatch(Actions.updateLastMessage(activeChats));
        }
        else{
          localStorageSave("last_message",[lastMessage]);
          this.dispatch(Actions.updateLastMessage([lastMessage]));
        }
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
