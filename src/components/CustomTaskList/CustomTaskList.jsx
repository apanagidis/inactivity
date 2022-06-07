import React from 'react';
import { useEffect, useState } from "react";
import { Manager } from '@twilio/flex-ui';
const manager = Manager.getInstance();

import { CustomTaskListComponentStyles } from './CustomTaskList.Styles';


const CustomTaskList = (props) => {

  manager.chatClient.on("messageAdded", (chatMessage) => {
    console.log("Inactivity plugin: messageAdded", chatMessage); 
  });

  const calculateTimeLeft = () => {
    let year = new Date().getFullYear();
    let difference = +new Date(`10/01/${year}`) - +new Date();
  
    let timeLeft = {};
  
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  }
  console.log("Inactivity plugin: timeleft", calculateTimeLeft());

  // The useState method accepts a parameter to set the initial state and returns an array containing the current state and a function to set the state.
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
  
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return;
    }

    timerComponents.push(
      <span>
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });


  return (
    <div>
      {timerComponents.length ? timerComponents : <span>Time's up!</span>}
    </div>
  );
};



export default CustomTaskList;
