import React from 'react';
import { Notifications } from '@twilio/flex-ui';
import { CustomNotifications } from '../../notifications';
import { localStorageGet,localStorageSave } from '../../helpers/manager'
import { useEffect,useRef, useState } from "react";
import { Actions } from "@twilio/flex-ui";

const CustomerInactivity = (props) => {
  const { REACT_APP_TIMER_SEC,WARNING_SEC,WARNING_MESSAGE } = process.env;
  const timerSec = parseInt(REACT_APP_TIMER_SEC);
  const [seconds, setSeconds] = useState(timerSec);
  const [isActive, setIsActive] = useState(false);


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
    }
    else if (isActive && seconds === parseInt(WARNING_SEC)) {
      console.log("Warning")
    }
    else if (isActive && seconds === 0) {
      moveToWrapUp();
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

function showProps(){
  console.log("props", props);
}
  return (
    <div>
      <div className="time">
        {seconds}s
      </div>
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
  );
};



export default CustomerInactivity;