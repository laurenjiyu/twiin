import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Timer from "./Timer"; // adjust path if needed

const getFormattedDateTime = (isoString) => {
  const date = new Date(isoString);

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    date
  );
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date
  );
  const day = date.getDate();

  const getOrdinal = (n) => {
    if (n >= 11 && n <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const suffix = getOrdinal(day);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .toLowerCase();

  return `Round ends on ${weekday}, ${month} ${day}${suffix} at ${time}`;
};

const TimeHeader = ({ endTime, roundNumber=1 }) => {
  if (!endTime) return null;

  return (
    <View style={styles.container}>
      <Timer endTime={endTime} />
      <Text style={styles.text}>{getFormattedDateTime(endTime)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});

export default TimeHeader;
