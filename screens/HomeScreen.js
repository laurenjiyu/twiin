import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Button,
} from "react-native";

// Array of difficulties; you can fetch this and more details from Supabase
const difficulties = ["Easy", "Medium", "Hard"];

const HomeScreen = () => {
  // Timer state: days, hours, minutes, seconds, or expired flag
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    // === SET UP CHALLENGE WEEK TIMER ===
    // Define the challenge start and end dates
    // TODO: replace with your actual challenge start datetime
    const startTime = new Date();
    // For demonstration, startTime is now; adjust as needed:
    // const startTime = new Date('2025-04-28T00:00:00Z');

    // End time is one week after start
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + 7);

    const updateTimer = () => {
      const now = new Date();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft({ expired: true });
        clearInterval(timerInterval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Placeholder match data; fetch real match from Supabase API
  const match = {
    name: "John Doe",
    avatarUrl: "https://via.placeholder.com/100",
  };

  // Challenge picker state; start at index 1 (Medium)
  const [currentIndex, setCurrentIndex] = useState(1);

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < difficulties.length - 1)
      setCurrentIndex(currentIndex + 1);
  };

  const handleSelect = () => {
    // TODO: handle selection action, e.g. navigate to challenge screen
    console.log("Selected difficulty:", difficulties[currentIndex]);
  };

  return (
    <View style={styles.container}>
      {/* Live countdown timer */}
      <View style={styles.timerContainer}>
        {timeLeft.expired ? (
          <Text style={styles.timerText}>Challenge period has ended</Text>
        ) : (
          <Text style={styles.timerText}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
            {timeLeft.seconds}s
          </Text>
        )}
      </View>

      {/* YOUR MATCH card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>YOUR MATCH</Text>
        <View style={styles.matchContainer}>
          <Image source={{ uri: match.avatarUrl }} style={styles.avatar} />
          <Text style={styles.matchName}>{match.name}</Text>
        </View>
      </View>

      {/* Spacer between cards */}
      <View style={styles.spacer} />

      {/* PICK A CHALLENGE section */}
      <Text style={styles.sectionHeader}>PICK A CHALLENGE</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
          <Text
            style={[styles.arrow, currentIndex === 0 && styles.disabledArrow]}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.challengeCard}>
          <Text style={styles.difficultyText}>
            {difficulties[currentIndex]}
          </Text>
          <Text style={styles.taskText}>TASK</Text>
          <Button title="Select" onPress={handleSelect} />
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === difficulties.length - 1}
        >
          <Text
            style={[
              styles.arrow,
              currentIndex === difficulties.length - 1 && styles.disabledArrow,
            ]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/*
        TODO: Populate 'difficulties' and 'match' from Supabase API.
        Example:
        useEffect(() => {
          const fetchData = async () => {
            const { data } = await supabase.from('challenges').select('*');
            // setDifficulties(data.map(item => item.level));
          };
          fetchData();
        }, []);
      */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchName: {
    marginLeft: 15,
    fontSize: 16,
  },
  spacer: {
    height: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 30,
    paddingHorizontal: 10,
  },
  disabledArrow: {
    color: "#ccc",
  },
  challengeCard: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  difficultyText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  taskText: {
    marginVertical: 15,
    fontSize: 16,
    color: "#666",
  },
});

export default HomeScreen;
