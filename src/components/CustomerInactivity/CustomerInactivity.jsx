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
  // find the latest message sent by the customer
  if(props?.conversation?.messages && props?.conversation?.messages.length > 0){
    let latestMessage = props?.conversation?.messages.reduce(function(previousValue, currentValue) {
      if(currentValue.isFromMe) {
        return previousValue;
      }
      if(previousValue && previousValue.index > currentValue.index)
      {
        return previousValue
      }
      return currentValue
    },null);
  
    if(latestMessage && !latestMessage.isFromMe){
      let remainingTime = getRemainingTimeSeconds(latestMessage.source.timestamp);
      if(remainingTime && remainingTime > 0){
        setSeconds(Math.round(remainingTime));
      }
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