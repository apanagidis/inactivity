import React from 'react';
import { useEffect, useState } from "react";

const CustomTaskList = (props) => {
  const { REACT_APP_TIMER_SEC } = process.env;

  useEffect(() => {
    reset();
 }, [props.lastMessage])

  const [seconds, setSeconds] = useState(parseInt(REACT_APP_TIMER_SEC));
  const [isActive, setIsActive] = useState(true);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setSeconds(parseInt(REACT_APP_TIMER_SEC));
  }

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
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