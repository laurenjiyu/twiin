// components/Timer.js
import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import theme from "../theme";

// Helper function
const calculateTimeLeft = (endTime) => {
  const now = new Date();
  const difference = endTime - now;

  if (difference <= 0) {
    return { expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
};

const Timer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (!endTime) return;

    const end = new Date(endTime);
    setTimeLeft(calculateTimeLeft(end));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(end));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Text style={styles.timer}>
      ⏳
      {!endTime
        ? "N/A"
        : timeLeft.expired
        ? "Time's up!"
        : `${timeLeft.days ?? 0}d ${timeLeft.hours ?? 0}h ${timeLeft.minutes ?? 0}m ${timeLeft.seconds ?? 0}s`}
    </Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 30,
    fontFamily: theme.text.title_bold,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Timer;
