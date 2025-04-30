import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Button, ActivityIndicator } from 'react-native';
import theme from '../theme';
import { supabase, getChallenges, getUserMatch } from '../db';
import defaultProfile from '../assets/default_profile.jpg';
// Array of difficulty levels
const difficulties = ['Easy', 'Medium', 'Hard'];

const HomeScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [match, setMatch] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);

  // 1) Load challenges on mount
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true);
        const { data: chData, error: chErr } = await getChallenges();
        if (chErr || !chData) {
          console.error('Error fetching challenges', chErr || 'No data returned');
          setChallenges([]);
        } else {
          setChallenges(chData);
        }
      } catch (err) {
        console.error('Unexpected error fetching challenges', err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };
    loadChallenges();
  }, []);

  // 2) Load match whenever challenges or index change
  useEffect(() => {
    const loadMatch = async () => {
      if (!challenges.length) return;
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { match: mData, error: mErr } = await getUserMatch("b35d7dbb-f6a6-4356-aa4b-197427e79789", challenges[currentIdx].id);  // USER-ID GOES HERE
      if (mErr) console.error('Error fetching match', mErr);
      else setMatch(mData);
      setLoading(false);
    };
    loadMatch();
  }, [challenges, currentIdx]);

  // 3) Timer update for current challenge
  useEffect(() => {
    if (!challenges.length) return;
    const endTime = new Date(challenges[currentIdx].end_time);
    const updateTimer = () => {
      const now = new Date();
      const distance = endTime - now;
      if (distance <= 0) {
        setTimeLeft({ expired: true });
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [challenges, currentIdx]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.leaderboard} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Countdown Timer */}
      <View style={styles.timerContainer}>
        {timeLeft.expired ? (
          <Text style={styles.timerText}>Expired</Text>
        ) : (
          <Text style={styles.timerText}>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </Text>
        )}
      </View>

      {/* YOUR MATCH Card */}
      <View style={styles.matchCard}>
        <Text style={styles.cardHeader}>YOUR MATCH</Text>
        {match ? (
          <View style={styles.matchContainer}>
            <Image 
              source={match.avatar_url ? { uri: match.avatar_url } : defaultProfile} 
              style={styles.avatar} 
            />
            <Text style={styles.matchName}>{match.name}</Text>
          </View>
        ) : (
          <Text style={styles.noMatchText}>No match found</Text>
        )}
      </View>

      <View style={styles.spacer} />

      {/* PICK A CHALLENGE */}
      <Text style={styles.sectionHeader}>PICK A CHALLENGE</Text>
      <View style={styles.challengeCard}>
        <TouchableOpacity onPress={() => setCurrentIdx(i => Math.max(i - 1, 0))} disabled={currentIdx === 0}>
          <Text style={[styles.arrow, currentIdx === 0 && styles.disabledArrow]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.challengeContent}>
          <Text style={styles.difficultyText}>{difficulties[currentIdx]}</Text>
          <Text style={styles.taskText}>TASK</Text>
          <Button title="Select" onPress={() => console.log('Selected', difficulties[currentIdx])} color={theme.colors.submitButton} />
        </View>

        <TouchableOpacity onPress={() => setCurrentIdx(i => Math.min(i + 1, difficulties.length - 1))} disabled={currentIdx === difficulties.length - 1}>
          <Text style={[styles.arrow, currentIdx === difficulties.length - 1 && styles.disabledArrow]}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  timerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  matchCard: {
    backgroundColor: theme.colors.yourMatchCard,
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 2,
    marginBottom: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
    alignContent: 'center',
    textAlign: 'center',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchName: {
    marginLeft: 15,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.text.body
  },
  noMatchText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  spacer: {
    height: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.text,
  },
  challengeCard: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.colors.challengeCard,
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 2,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    fontSize: 30,
    color: theme.colors.text,
  },
  disabledArrow: {
    color: '#ccc',
  },
  challengeContent: {
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  taskText: {
    marginVertical: 15,
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default HomeScreen;