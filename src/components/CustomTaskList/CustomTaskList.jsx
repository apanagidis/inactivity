import React from 'react';
import { Notifications } from '@twilio/flex-ui';
import { CustomNotifications } from '../../notifications';
import { localStorageGet } from '../../helpers/manager'
import { useEffect, useState } from "react";


const CustomTaskList = (props) => {
  const { REACT_APP_TIMER_SEC } = process.env;
  const timerSec = parseInt(REACT_APP_TIMER_SEC);

  useEffect(() => {
    reset();
 }, [props.lastMessage])

// Executed when the component is loaded
 useEffect(() => {
  let lastMessageDate = new Date(localStorageGet("last_message").slice(1,-1));
  let remainingTime = getRemainingTimeSeconds(lastMessageDate);
  if(remainingTime && remainingTime > 0){
    updateRemainingTime(Math.round(remainingTime));
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
      triggerNotification();
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, seconds]);


  return (
    <div>
      <div> 
        Test {props.lastMessage}
      </div>

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