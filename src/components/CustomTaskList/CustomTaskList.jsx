import React from 'react';
import { Notifications } from '@twilio/flex-ui';
import { CustomNotifications } from '../../notifications';
import { localStorageGet } from '../../helpers/manager'
import { useEffect, useState } from "react";
import { Actions } from "@twilio/flex-ui";
import { Actions as StateActions} from '../../states/CustomTaskListState';
import { TaskHelper } from "@twilio/flex-ui";


const CustomTaskList = (props) => {
  const { REACT_APP_TIMER_SEC } = process.env;
  const timerSec = parseInt(REACT_APP_TIMER_SEC);

  useEffect(() => {
    reset();
 }, [props.lastMessage])

// Executed when the component is loaded
 useEffect(() => {

  let lastMessage = localStorageGet("last_message");
  if(lastMessage){
    let lastMessageDate = new Date(lastMessage.slice(1,-1));
    let remainingTime = getRemainingTimeSeconds(lastMessageDate);
    if(remainingTime && remainingTime > 0){
      updateRemainingTime(Math.round(remainingTime));
    }
  }
}, []);

  const [seconds, setSeconds] = useState(timerSec);
  const [isActive, setIsActive] = useState(true);

  function toggle() {
    setIsActive(!isActive);
  }

  function getRemainingTimeSeconds(lastMessageDate) {
    let milliPassSinceLastMessage = +new Date() - new Date((lastMessageDate));
    let secondsPassSinceLastMessage = Math.floor(milliPassSinceLastMessage/1000);
    return (timerSec - secondsPassSinceLastMessage) <= 0 ? 0 : timerSec - secondsPassSinceLastMessage;
  }

  function reset() {
    setSeconds(timerSec);
  }

  function wrapUp(){
    // Check if the task is alrady in Wrap UP mode. If alrady in wrap up mode, do not trigger the notifcation
    triggerNotification();
    // Chec completion
    Actions.invokeAction("WrapupTask", { sid: props.WRsid });
    // removeChatFromLocalStorageAndRedux(channelSID);
  }

  // function removeChatFromLocalStorageAndRedux(channelSID){
  //   let activeChats = localStorageGet("last_message");
  //   if(activeChats){
  //     var foundIndex = activeChats.findIndex(x => x.id == channelSID);
  //     if(foundIndex != -1){
  //       activeChats.splice(indexOfObject, foundIndex);
  //       localStorageSave("last_message",activeChats);
  //       this.dispatch(StateActions.updateLastMessage(activeChats));
  //     }
  //   }
  // }

  function updateRemainingTime(remainingTimeSeconds) {
    setSeconds(remainingTimeSeconds);
  }

  function triggerNotification(){
    Notifications.showNotification(CustomNotifications.InactiveNotification,null);
  }

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0 ) {
    

      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      wrapUp();
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds]);


  return (
    <div>
    
      <div className="time">
        {seconds}s
      </div>
      <div className="row">
        <button className={`button button-primary button-primary-${isActive ? 'active' : 'inactive'}`} onClick={toggle}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button className="button" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
};



export default CustomTaskList;