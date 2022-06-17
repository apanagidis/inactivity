import React from 'react';
import { Notifications } from '@twilio/flex-ui';
import { CustomNotifications } from '../../notifications';
import { localStorageGet,localStorageSave } from '../../helpers/manager'
import { useEffect,useRef, useState } from "react";
import { Actions } from "@twilio/flex-ui";
import { CustomerInactivityStyles } from './CustomerInactivity.Styles';
import * as Flex from '@twilio/flex-ui'

const CustomerInactivity = (props) => {
  const { customerInactivity } = Flex.Manager.getInstance().serviceConfiguration.ui_attributes;
  const timerSec = parseInt(customerInactivity.timer_sec);
  const [seconds, setSeconds] = useState(timerSec);
  const [isActive, setIsActive] = useState(false);
  const [minSec, setMinSec] = useState();


useEffect(() => {
  let latestMessage = props?.conversation?.messages.slice(-1).pop();
  if(latestMessage && !latestMessage.isFromMe){
    let activeChats = localStorageGet("activeChats");
    const channelSid = props?.task?.attributes?.conversationSid;
    let lastMessage = {
      channelSid: channelSid,
      lastUpdatedbyCustomer: latestMessage?.source?.timestamp,
      messageIndex : latestMessage?.index
    }
    if(activeChats){
      let foundIndex= activeChats.findIndex((element) => element.channelSid == channelSid);
      if(foundIndex != -1){
        //Only reset the timer when the message in props is newer than the one in localstorage
        if(latestMessage &&  latestMessage?.index > activeChats[foundIndex]?.messageIndex){
          reset();
        }
        activeChats[foundIndex] = lastMessage;
      }
      else{
        activeChats.push(lastMessage);
      }
      if(props?.task?.status !== "wrapping")
        localStorageSave("activeChats",activeChats);
      
    }
    else{
      if(props?.task?.status !== "wrapping")
        localStorageSave("activeChats",[lastMessage]);
    } 
  }
}, [props?.conversation?.messages])

useEffect(() => {
  if(props?.task?.status === "accepted"){
    setIsActive(true);
  }
  else{
    setIsActive(false);
  }
}, [props?.task?.status])

// Executed when the component is loaded
 useEffect(() => {
  let activeChats = localStorageGet("activeChats");
  const channelSid = props?.task?.attributes?.conversationSid;
  if(activeChats){
    let foundIndex= activeChats.findIndex((element) => element.channelSid == channelSid);
    if(foundIndex != -1){
      let activeChat = activeChats[foundIndex];
      let lastMessageDate = new Date(activeChat?.lastUpdatedbyCustomer);
      let remainingTime = getRemainingTimeSeconds(lastMessageDate);
      if(remainingTime && remainingTime > 0){
        setSeconds(Math.round(remainingTime));
      }
    }
  }

}, []);

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

  function moveToWrapUp(){
    if(props?.task?.status === "accepted"){
      triggerNotification();
      Actions.invokeAction("WrapupTask", { sid: props.task.sid });
    }   
    clearChannelFromLocalStorage();
  }

  function clearChannelFromLocalStorage(){
    let channelSid = props?.task?.attributes?.conversationSid
    let activeChats = localStorageGet("activeChats");
    if(activeChats){
      var foundIndex = activeChats.findIndex((element) => element.channelSid == channelSid);
      if(foundIndex != -1){
        activeChats.splice(foundIndex, 1);
        localStorageSave("activeChats",activeChats);
      }
    }
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

      let min = Math.floor(seconds / 60);
      let sec = seconds % 60;
      // If you want strings with leading zeroes:
      min = String(min).padStart(2, "0");
      sec = String(sec).padStart(2, "0");
      setMinSec(min+":"+sec)
    }
   if (isActive && seconds === parseInt(customerInactivity.warning_sec)) {
      Actions.invokeAction('SendMessage', {
        body: customerInactivity.warning_message,
        conversationSid: props?.task?.attributes?.conversationSid
      });
    }
    else if (isActive && seconds === 0) {
      setMinSec(null);
      moveToWrapUp();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

function showProps(){
  console.log("props", props);
}


  return (
    <CustomerInactivityStyles>
    <div>
    {minSec &&  <div className="time">
        chat inactive in {minSec}
      </div>
    }
      {/* <div className="row">
        <button className={`button button-primary button-primary-${isActive ? 'active' : 'inactive'}`} onClick={toggle}>
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button className="button" onClick={reset}>
          Reset
        </button>
        <button className="button" onClick={showProps}>
          Props
        </button>
      </div> */}
    </div>
    </CustomerInactivityStyles>
  );
};



export default CustomerInactivity;