import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import "../../stylesheets/DetailedMatchStats.css";
import goalIcon from "../../assets/icons/goal.png";
import redCardIcon from "../../assets/icons/red_card.png";
import yellowCardIcon from "../../assets/icons/yellow_card.svg";
import goldenBootIcon from "../../assets/icons/golden-boot.png";

import axios from 'axios'

const DetailedMatchStats = () => {
  // Helper to format yyyy-mm-dd to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}-${m}-${y}`;
  };

  const { tournamentId, matchId } = useParams();
  const username = "john.doe"; // Replace with actual dynamic source later
  const [first, last] = username.split(".");
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  const formattedName = `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;

  const [matches, setMatches] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [goalCounts, setGoalCounts] = useState({});
  const [motmPlayerId, setMotmPlayerId] = useState(null);
  const [match, setMatch] = useState({})
  const [teams, setTeams] = useState([])
  const [team1Players, setTeam1Players] = useState([])
  const [team2Players, setTeam2Players] = useState([])
  const [captains, setCaptains] = useState([])
  const [cards, setCards] = useState([])
  const [redCards, setRedCards] = useState({})
  const [yellowCards, setYellowCards] = useState({})

  // Track match completion
  const [isCompleted, setIsCompleted] = useState(false);

  const [goals, setGoals] = useState([])

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const [matchesRes, teamsRes, captainsRes, redCardsRes, yellowCardsRes] = await Promise.all([
          axios.get(`http://localhost:5000/tournaments/${tournamentId}/matches`),
          axios.get(`http://localhost:5000/teams/matches/${matchId}`),
          axios.get(`http://localhost:5000/matches/${matchId}/captains`),
          axios.get(`http://localhost:5000/admin/red-cards/${matchId}`),
          axios.get(`http://localhost:5000/admin/yellow-cards/${matchId}`),
        ]);
  
        // Set basic match data
        const matchData = matchesRes.data.data.find(m => m.match_id == matchId);
        setMatch(matchData);
        setIsCompleted(matchData.match_completed);
  
        // Set teams data
        const teamsData = teamsRes.data.data[0];
        setTeams(teamsData);

        //Set cards data
        
        const formattedRedCards = {};
        redCardsRes.data.data.forEach(item => {
        formattedRedCards[item.player_id] = item.event_time;
        });
        setRedCards(formattedRedCards);
  
        const formattedYellowCards = {};
        yellowCardsRes.data.data.forEach(item => {
          if (!formattedYellowCards[item.player_id]) {
            formattedYellowCards[item.player_id] = {
              event_time: [],
              count: 0
            };
          }
          formattedYellowCards[item.player_id].event_time.push(item.event_time);
          formattedYellowCards[item.player_id].count++;
        });
        setYellowCards(formattedYellowCards);

        // Fetch players for both teams in parallel
        const [team1PlayersRes, team2PlayersRes] = await Promise.all([
          axios.get(`http://localhost:5000/teams/${teamsData.teama_id}/players`),
          axios.get(`http://localhost:5000/teams/${teamsData.teamb_id}/players`)
        ]);
  
        setTeam1Players(team1PlayersRes.data.data);
        setTeam2Players(team2PlayersRes.data.data);
  
        // Set captains data
        setCaptains(captainsRes.data.data.captains[0]);
  
      } catch (err) {
        console.error("Error fetching match data:", err);
        // Add error state handling here if needed
      }
    };
  
    fetchMatchData();
  }, [tournamentId, matchId]);  // Add dependencies

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTime, setGoalTime] = useState("");
  const [goalError, setGoalError] = useState("");
  const [goalPlayer, setGoalPlayer] = useState(null);
  // Red card modal state
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardTime, setCardTime] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardPlayer, setCardPlayer] = useState(null);
  // Delete goal modal state
  const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);
  const [deleteGoalPlayer, setDeleteGoalPlayer] = useState(null);
  const [deleteGoalTime, setDeleteGoalTime] = useState("");
  const [deleteGoalError, setDeleteGoalError] = useState("");
  // Yellow card modal state
  const [showYellowModal, setShowYellowModal] = useState(false);
  const [yellowCardPlayer, setYellowCardPlayer] = useState(null);
  // Yellow card time modal state
  const [showYellowTimeModal, setShowYellowTimeModal] = useState(false);
  const [yellowTime, setYellowTime] = useState("");
  const [yellowError, setYellowError] = useState("");
  // State for remove yellow card modal
  const [showRemoveYellowModal, setShowRemoveYellowModal] = useState(false);
  const [removeYellowTime, setRemoveYellowTime] = useState("");
  const [removeYellowError, setRemoveYellowError] = useState("");

  
  // Modal state for match completion confirmation
  const [showCompleteModal, setShowCompleteModal] = useState(false);



  // Show alert after rendering the error banner (deferred to allow banner to paint first)
  useEffect(() => {
    if (yellowError) {
      setTimeout(() => {
        window.alert(yellowError);
      }, 0);
    }
  }, [yellowError]);

  // Compute match time limits in minutes
  

  const startMinutes = match?.start_time
  ? parseInt(match.start_time.split(":")[0], 10) * 60 +
    parseInt(match.start_time.split(":")[1], 10)
  : 0;
const endMinutes = match?.end_time
  ? parseInt(match.end_time.split(":")[0], 10) * 60 +
    parseInt(match.end_time.split(":")[1], 10)
  : 0;
  // Helper to pad numbers and compute duration in HH:mm
  const pad = (n) => String(n).padStart(2, "0");
  const durationMinutes = endMinutes - startMinutes;
  const durationHHMM = `${pad(Math.floor(durationMinutes / 60))}:${pad(durationMinutes % 60)}`;
  
  

  // Goal handler using native prompt

  useEffect(() => {
    //get goal details from match
    axios.get(`http://localhost:5000/matches/${matchId}/goals`)
    .then((res) => {
      setGoals(res.data.data)
    })
    .catch(err => console.error(err))

    // // initialize goalTimes and yellowCards on each match
    // const initialized = matches.map((m) => ({
    //   ...m,
    //   goalTimes: m.goalTimes || {},
    //   yellowCards: Array.isArray(m.yellowCards)
    //     ? m.yellowCards
    //     : m.yellowCards || {},
    // }));
    // setMatches(initialized);
    // const currentMatch =
    //   initialized.find((m) => String(m.match_id) === matchId) || {};

    axios.get(`http://localhost:5000/admin/match-goals`)
      .then((res) => {
        const counts = {};
        res.data.data.forEach(item => {
          if (item.match_id === matchId) {
            counts[item.player_id] = item.goal_count;
          }
      });
      setGoalCounts(counts);
      // setGoalCounts(res.data.data || {});
    })
    .catch(err => console.error(err))
    // Load persisted MOTM if any
    const savedMotm = match.motm_player_id;
    if (savedMotm != null) {
      setMotmPlayerId(savedMotm);
    }
  }, [tournamentId]);

  // Prompt for goal time when clicking goal button
  const handleGoalClick = (player) => {
    setGoalError("");
    setGoalTime("");
    setShowGoalModal(true);
    setGoalPlayer(player);
  };

  // Prompt for red card time when clicking red card button
  const handleCardClick = (player) => {
    setCardError("");
    setCardTime("");
    setShowCardModal(true);
    setCardPlayer(player);
  };

  // Open delete-goal modal
  const openDeleteGoalModal = (player) => {
    setDeleteGoalPlayer(player);
    setDeleteGoalTime("");
    setDeleteGoalError("");
    setShowDeleteGoalModal(true);
  };

  // Persist MOTM selection to matches and localStorage
  useEffect(() => {
    if (!match.match_id) return;
    // rest of persistence code...
    // Find the current match in matches and update its motmPlayerId
    
    if (motmPlayerId !== undefined) {
      match.motm_player_id = motmPlayerId
      // const updatedMatches = matches.map((m) =>
      //   m.player_id === match.match_id ? { ...m, motmPlayerId } : m,
      // );
      // setMatches(updatedMatches);
      // // Persist back to tournaments in localStorage
      // const updatedTours = JSON.parse(
      //   localStorage.getItem("tournaments") || "[]",
      // ).map((t) =>
      //   String(t.player_id) === tournamentId ? { ...t, matches: updatedMatches } : t,
      // );
      // localStorage.setItem("tournaments", JSON.stringify(updatedTours));
    }
  }, [motmPlayerId, match.match_id, tournamentId]);

  // Compute scores based on goalCounts
  const teamAPlayersList = team1Players
    
  const teamBPlayersList = team2Players
    
  const scoreA = teamAPlayersList.reduce(
    (sum, p) => sum + (goalCounts[p.player_id] || 0),
    0,
  );
  const scoreB = teamBPlayersList.reduce(
    (sum, p) => sum + (goalCounts[p.player_id] || 0),
    0,
  );

  return (
    <div className="admin-home">
      <AdminSidebar initials={initials} formattedName={formattedName} />

      <main className="main-content">
        <div className="bg-overlay"></div>
        <header className="topbar">
          <h1>Match Details</h1>
        </header>
        {/* Disable interactive section if completed */}
        <div
          style={{
            pointerEvents: isCompleted ? "none" : "auto",
            opacity: isCompleted ? 0.6 : 1,
          }}
        >
          <section className="detailed-matches">
            <div
              className="detailed-match-stats-header"
              style={{ textAlign: "left", width: "100%" }}
            >
              <h2>Edit Match Stats</h2>
            </div>
            <div
              className="team-stats"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2rem",
                margin: "1rem 0",
              }}
            >
              <h1 className="teamA-name">
                {teams.teama_name}
              </h1>
              <h2>
                {match.scorea || 0} - {match.scoreb || 0}
              </h2>
              <h1 className="teamB-name">
                {teams.teamb_name}
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "2rem",
                marginTop: "0rem",
              }}
            >
              {/* Left team players */}
              <div
                className="players-list"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "40vh",
                }}
              >
                <label>Players</label>
                <ul style={{ flexGrow: 1, overflowY: "auto" }}>
                  {
                    
                    team1Players.map((p, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {goalCounts[p.player_id] != null && (
                          <strong>[{goalCounts[p.player_id]}] </strong>
                        )}
                        {p.player_name.split(" ").slice(-1)[0]} ({p.position})
                        {p.is_substitute && (
                          <span
                            style={{
                              color: "red",
                              fontWeight: "bold",
                              marginLeft: "0.5rem",
                            }}
                          >
                            Sub
                          </span>
                        )}
                        {captains.captaina_id === p.player_id && (
                          <span
                            className="captain-status"
                            style={{ marginLeft: "0.5rem" }}
                          >
                            (Captain)
                          </span>
                        )}
                      </span>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                          type="button"
                          className="btn-motm"
                          disabled={
                            motmPlayerId !== null && motmPlayerId !== p.player_id
                          }
                          onClick={() => {
                            if (motmPlayerId === p.player_id) {
                              setMotmPlayerId(null);
                            } else {
                              setMotmPlayerId(p.player_id);
                            }
                          }}
                          style={{
                            backgroundImage:
                              motmPlayerId === p.player_id
                                ? "linear-gradient(135deg, #00713d, #00934f)"
                                : motmPlayerId !== null
                                  ? "#ccc"
                                  : undefined,
                            opacity:
                              motmPlayerId !== null && motmPlayerId !== p.player_id
                                ? 0.6
                                : 1,
                          }}
                        >
                          <img
                            src={goldenBootIcon}
                            alt="MOTM"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-goal"
                          onClick={() => handleGoalClick(p)}
                        >
                          <img
                            src={goalIcon}
                            alt="Goal"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-no-goal"
                          onClick={() => openDeleteGoalModal(p)}
                        >
                          <img
                            src={goalIcon}
                            alt="No Goal"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-red-card"
                          onClick={() => {
                            const hasCard = p.player_id in redCards;
                            if (hasCard) {
                              if (window.confirm("Remove red card record?")) {
                                
                                // Remove red card
                                axios.delete(`http://localhost:5000/admin/red-cards`, {
                                  data:
                                  {player_id: p.player_id,
                                  match_id: matchId},
                                })
                                .then((res) => {
                                  redCards[p.player_id] = 0
                                  setMatch(match)
                                })
                                .catch(err => console.error(err))

                              }
                            } else {
                              handleCardClick(p);
                            }
                          }}
                          style={{
                            backgroundColor:
                                p.player_id in redCards
                                ? "lightcoral"
                                : undefined,
                          }}
                        >
                          <img
                            src={redCardIcon}
                            alt="Red Card"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-yellow-card"
                          onClick={() => {
                            setYellowCardPlayer(p);
                            setShowYellowModal(true);
                          }}
                        >
                          <img
                            src={yellowCardIcon}
                            alt="Yellow Card"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right team players */}
              <div
                className="players-list"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "40vh",
                }}
              >
                <label>Players</label>
                <ul style={{ flexGrow: 1, overflowY: "auto" }}>
                  {
                    
                  team2Players.map((p, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {goalCounts[p.player_id] != null && (
                          <strong>[{goalCounts[p.player_id]}] </strong>
                        )}
                        {p.player_name.split(" ").slice(-1)[0]} ({p.position})
                        {p.is_substitute && (
                          <span
                            style={{
                              color: "red",
                              fontWeight: "bold",
                              marginLeft: "0.5rem",
                            }}
                          >
                            Sub
                          </span>
                        )}
                        {captains.captainb_id === p.player_id && (
                          <span
                            className="captain-status"
                            style={{ marginLeft: "0.5rem" }}
                          >
                            (Captain)
                          </span>
                        )}
                      </span>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                          type="button"
                          className="btn-motm"
                          disabled={
                            motmPlayerId !== null && motmPlayerId !== p.player_id
                          }
                          onClick={() => {
                            if (motmPlayerId === p.player_id) {
                              setMotmPlayerId(null);
                            } else {
                              setMotmPlayerId(p.player_id);
                            }
                          }}
                          style={{
                            backgroundImage:
                              motmPlayerId === p.player_id
                                ? "linear-gradient(135deg, #00713d, #00934f)"
                                : motmPlayerId !== null
                                  ? "#ccc"
                                  : undefined,
                            opacity:
                              motmPlayerId !== null && motmPlayerId !== p.player_id
                                ? 0.6
                                : 1,
                          }}
                        >
                          <img
                            src={goldenBootIcon}
                            alt="MOTM"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-goal"
                          onClick={() => handleGoalClick(p)}
                        >
                          <img
                            src={goalIcon}
                            alt="Goal"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-no-goal"
                          onClick={() => openDeleteGoalModal(p)}
                        >
                          <img
                            src={goalIcon}
                            alt="No Goal"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn-red-card"
                          onClick={() => {
                            const hasCard = p.player_id in redCards;
                            if (hasCard) {
                              if (window.confirm("Remove red card record?")) {
                                // Remove red card
                                axios.delete(`http://localhost:5000/admin/red-cards`, {
                                  data:
                                  {player_id: p.player_id,
                                  match_id: matchId}
                                })
                                .then((res) => {
                                  delete redCards[p.player_id]
                                  setMatch(match)
                                })
                                .catch(err => console.error(err))
                                const updatedMatches = matches.map((m) =>
                                  m.match_id === match.match_id
                                    ? {
                                        ...m,
                                        redCards: Object.fromEntries(
                                          Object.entries(
                                            m.redCards || {},
                                          ).filter(
                                            ([pid]) => pid !== String(p.player_id),
                                          ),
                                        ),
                                      }
                                    : m,
                                );
                                setMatches(updatedMatches);
                                const updatedTours = JSON.parse(
                                  localStorage.getItem("tournaments") || "[]",
                                ).map((t) =>
                                  String(t.player_id) === tournamentId
                                    ? { ...t, matches: updatedMatches }
                                    : t,
                                );
                                localStorage.setItem(
                                  "tournaments",
                                  JSON.stringify(updatedTours),
                                );
                              }
                            } else {
                              handleCardClick(p);
                            }
                          }}
                          style={{
                            backgroundColor:
                              p.player_id in redCards
                                ? "lightcoral"
                                : undefined,
                          }}
                        >
                          <img
                            src={redCardIcon}
                            alt="Red Card"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        {showCardModal && (
                          <div className="modal-overlay">
                            <div className="modal">
                              <button
                                className="close-button"
                                type="button"
                                onClick={() => {
                                  setCardError("");
                                  setShowCardModal(false);
                                }}
                                aria-label="Close"
                              >
                                &times;
                              </button>
                              <h2>Record Red Card Time</h2>
                              <p>
                                Enter red card time (minutes or HH:MM) between{" "}
                                {match.start_time} (0) and {match.end_time} (
                                {durationMinutes})
                              </p>
                              <input
                                type="text"
                                value={cardTime}
                                onChange={(e) => setCardTime(e.target.value)}
                                className="score-input"
                                placeholder="e.g. 45 or 01:15"
                              />
                              {cardError && (
                                <p
                                  style={{
                                    color: "red",
                                    marginTop: "0.5rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {cardError}
                                </p>
                              )}
                              <div className="modal-buttons">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCardError("");
                                    const input = cardTime.trim();
                                    let minutesValue;

                                    if (/^\d+$/.test(input)) {
                                      minutesValue = parseInt(input, 10);
                                    } else if (
                                      /^[0-2]?\d:[0-5]\d$/.test(input)
                                    ) {
                                      const [hh, mm] = input
                                        .split(":")
                                        .map((n) => parseInt(n, 10));
                                      const absMinutes = hh * 60 + mm;
                                      minutesValue = absMinutes - startMinutes;
                                    } else {
                                      setCardError(
                                        "Enter minutes as integer or HH:MM",
                                      );
                                      setTimeout(
                                        () =>
                                          window.alert(
                                            "Enter minutes as integer or HH:MM",
                                          ),
                                        0,
                                      );
                                      return;
                                    }

                                    if (
                                      minutesValue < 0 ||
                                      minutesValue > durationMinutes
                                    ) {
                                      let errMsg;
                                      if (input.includes(":")) {
                                        errMsg = `Time must be between ${match.startTime} and ${match.endTime}`;
                                      } else {
                                        errMsg = `Time must be between 0 and ${durationMinutes} minutes`;
                                      }
                                      setCardError(errMsg);
                                      setTimeout(() => window.alert(errMsg), 0);
                                      return;
                                    }

                                    if (cardPlayer) {
                                      //add red card with request
                                      axios.post(`http://localhost:5000/admin/red-cards`, {
                                        match_id: matchId,
                                        player_id: cardPlayer.player_id,
                                        event_time: minutesValue
                                      })
                                      .then((res) => {
                                        redCards[cardPlayer.player_id] = minutesValue
                                        setShowCardModal(false);
                                        setCardError("");
                                      })
                                      .catch(err => console.error(err))


                                      
                                      // Update matches array with redCards
                                      const updatedMatchesWithCards =
                                        matches.map((m) =>
                                          m.player_id === match.match_id
                                            ? {
                                                ...m,
                                                redCards: {
                                                  ...(m.redCards || {}),
                                                  [cardPlayer.player_id]: minutesValue,
                                                },
                                              }
                                            : m,
                                        );
                                      setMatches(updatedMatchesWithCards);
                                      // Persist back to tournaments
                                      const updatedToursWithCards = JSON.parse(
                                        localStorage.getItem("tournaments") ||
                                          "[]",
                                      ).map((t) =>
                                        String(t.player_id) === tournamentId
                                          ? {
                                              ...t,
                                              matches: updatedMatchesWithCards,
                                            }
                                          : t,
                                      );
                                      localStorage.setItem(
                                        "tournaments",
                                        JSON.stringify(updatedToursWithCards),
                                      );
                                    }
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn-yellow-card"
                          onClick={() => {
                            setYellowCardPlayer(p);
                            setShowYellowModal(true);
                          }}
                        >
                          <img
                            src={yellowCardIcon}
                            alt="Yellow Card"
                            style={{ width: "1.5rem", height: "1.5rem" }}
                          />
                        </button>
                        {showYellowTimeModal && (
                          <div className="modal-overlay">
                            <div className="modal">
                              <button
                                className="close-button"
                                type="button"
                                onClick={() => setShowYellowTimeModal(false)}
                                aria-label="Close"
                              >
                                &times;
                              </button>
                              <h2>Record Yellow Card Time</h2>
                              <p>
                                Enter yellow card time (minutes or HH:MM)
                                between {match.start_time} (0) and{" "}
                                {match.end_time} ({durationMinutes})
                              </p>
                              {yellowCardPlayer && 
                                
                                //   yellowCards?.[yellowCardPlayer.player_id]
                                 
                                //  && 
                                 (
                                  <div
                                    style={{
                                      marginTop: "0.5rem",
                                      fontWeight: "bold",
                                      textAlign: "left",
                                    }}
                                  >
                                    <p>
                                      <strong>Previous yellow cards:</strong>{" "}
                                      {
                                        yellowCards[yellowCardPlayer.player_id]?.count || 0
                                      }
                                    </p>
                                    <p>
                                    <strong>Timings:</strong>{" "}
                                    {Array.isArray(yellowCards[yellowCardPlayer?.player_id]?.event_time)
                                      ? yellowCards[yellowCardPlayer.player_id].event_time
                                          .slice() // Create a copy to avoid mutating original array
                                          .sort((a, b) => a - b) // Numeric sort ascending
                                          .map(t => `${t}'`) // Add minute marker
                                          .join(", ") // Combine with commas
                                      : "N/A"}
                                  </p>
                                  </div>
                                )}
                              <input
                                type="text"
                                value={yellowTime}
                                onChange={(e) => setYellowTime(e.target.value)}
                                className="score-input"
                                placeholder="e.g. 23 or 01:15"
                              />
                              {yellowError && (
                                <p
                                  style={{
                                    color: "red",
                                    marginTop: "0.5rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {yellowError}
                                </p>
                              )}
                              <div className="modal-buttons">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Validate and save yellow card time
                                    setYellowError("");
                                    const input = yellowTime.trim();
                                    let minutesValue;
                                    if (/^\d+$/.test(input)) {
                                      minutesValue = parseInt(input, 10);
                                    } else if (
                                      /^[0-2]?\d:[0-5]\d$/.test(input)
                                    ) {
                                      const [hh, mm] = input
                                        .split(":")
                                        .map((n) => parseInt(n, 10));
                                      minutesValue =
                                        hh * 60 + mm - startMinutes;
                                    } else {
                                      const msg =
                                        "Enter minutes as a whole number (e.g. 23) or in HH:MM format (e.g. 01:15)";
                                      setYellowError(msg);
                                      return;
                                    }
                                    if (
                                      minutesValue < 0 ||
                                      minutesValue > durationMinutes
                                    ) {
                                      const msg = `Time must be between 0 and ${durationMinutes} minutes`;
                                      setYellowError(msg);
                                      return;
                                    }
                                    // Update yellowCards in matches and localStorage

                                    //send request to add yellow card
                                    axios.post(`http://localhost:5000/admin/yellow-cards`, {
                                      match_id: matchId,
                                      player_id: yellowCardPlayer.player_id,
                                      event_time: minutesValue
                                    })
                                    .then((res) => {
                                      if (!yellowCards[yellowCardPlayer.player_id]) {
                                        yellowCards[yellowCardPlayer.player_id] = {
                                          count: 1,
                                          event_time: minutesValue
                                        }
                                      }
                                      else{
                                        yellowCards[yellowCardPlayer.player_id].event_time.push(minutesValue)
                                        yellowCards[yellowCardPlayer.player_id].count ++
                                      }

                                      setMatch(match)
                                      setShowYellowTimeModal(false);                           
                                    })
                                    .catch(err => console.error(err))
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {showYellowModal && (
                          <div className="modal-overlay">
                            <div className="modal">
                              <button
                                className="close-button"
                                type="button"
                                onClick={() => setShowYellowModal(false)}
                              >
                                &times;
                              </button>
                              <h2>Yellow Card</h2>
                              {/* <p>
                              Player:{" "}
                              {yellowCardPlayer?.name.split(" ").slice(-1)[0]}
                            </p> */}
                              {yellowCardPlayer &&
                                  // yellowCards[yellowCardPlayer.player_id]
                                  // && 
                                  (
                                  <div
                                    style={{
                                      margin: "0.5rem 0",
                                      textAlign: "left",
                                    }}
                                  >
                                    <p>
                                      <strong>Player ID:</strong>{" "}
                                      {yellowCardPlayer.player_id}
                                    </p>
                                    <p>
                                      <strong>Player:</strong>{" "}
                                      {
                                        yellowCardPlayer.player_name
                                          .split(" ")
                                          .slice(-1)[0]
                                      }
                                    </p>
                                    <p>
                                      <strong>Yellow cards:</strong>{" "}
                                      {
                                        yellowCards[yellowCardPlayer.player_id]?.count || '0'
                                          
                                      }
                                    </p>
                                    <p>
                                    <strong>Timings:</strong>{" "}
                                    {Array.isArray(yellowCards[yellowCardPlayer?.player_id]?.event_time)
                                      ? yellowCards[yellowCardPlayer.player_id].event_time
                                          .slice() // Create a copy to avoid mutating original array
                                          .sort((a, b) => a - b) // Numeric sort ascending
                                          .map(t => `${t}'`) // Add minute marker
                                          .join(", ") // Combine with commas
                                      : "N/A"}
                                  </p>
                                  </div>
                                )}
                              <div className="yellow-modal-buttons">
                                <button
                                  type="button"
                                  disable = {yellowCards[yellowCardPlayer.player_id] && yellowCards[yellowCardPlayer.player_id].count >= 2}
                                  onClick={() => {
                                    setShowYellowModal(false);
                                    setYellowTime("");
                                    setYellowError("");
                                    setShowYellowTimeModal(true);
                                  }}
                                >
                                  Add Card
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowYellowModal(false);
                                    setRemoveYellowTime("");
                                    setRemoveYellowError("");
                                    setShowRemoveYellowModal(true);
                                  }}
                                >
                                  Remove Card
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {showRemoveYellowModal && (
                          <div className="modal-overlay">
                            <div className="modal">
                              <button
                                className="close-button"
                                type="button"
                                onClick={() => setShowRemoveYellowModal(false)}
                                aria-label="Close"
                              >
                                &times;
                              </button>
                              <h2>Remove Yellow Card Time</h2>
                              <p>
                                Select a yellow card time to remove for{" "}
                                {yellowCardPlayer?.player_name.split(" ").slice(-1)[0]}
                                :
                              </p>
                              <select
                                value={removeYellowTime}
                                onChange={(e) =>
                                  setRemoveYellowTime(e.target.value)
                                }
                                className="score-input"
                              >
                                <option value="" disabled>
                                  Select time
                                </option>
                                {
                                  yellowCards?.[yellowCardPlayer?.player_id]
                                
                                  ? yellowCards[yellowCardPlayer.player_id].event_time
                                      .slice()
                                      .sort((a, b) => a - b)
                                      .map((t) => (
                                        <option key={t} value={t}>
                                          {t}'
                                        </option>
                                      ))
                                  : null}
                              </select>
                              {removeYellowError && (
                                <p
                                  style={{
                                    color: "red",
                                    marginTop: "0.5rem",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {removeYellowError}
                                </p>
                              )}
                              <div className="modal-buttons">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!removeYellowTime) {
                                      setRemoveYellowError(
                                        "Please select a time to remove",
                                      );
                                      return;
                                    }

                                    //delete yellow card request
                                    axios.delete(`http://localhost:5000/admin/yellow-cards`, {
                                      data: 
                                        {
                                          match_id : matchId,
                                          player_id: yellowCardPlayer.player_id,
                                          event_time: removeYellowTime
                                        }
                                    })
                                    .then((res) => {
                                      yellowCards[yellowCardPlayer.player_id].count --
                                      
                                      setMatch(match)
                                      setShowYellowTimeModal(false);                           
                                    })
                                    .catch(err => console.error(err))

                                    setShowRemoveYellowModal(false);

                                    // const tval = parseInt(removeYellowTime, 10);
                                    // const updatedMatches = matches.map((m) => {
                                    //   if (m.player_id !== match.match_id) return m;
                                    //   const cards = Array.isArray(
                                    //     m.yellowCards?.[yellowCardPlayer.player_id],
                                    //   )
                                    //     ? [
                                    //         ...m.yellowCards[
                                    //           yellowCardPlayer.player_id
                                    //         ],
                                    //       ]
                                    //     : [];
                                    //   const newCards = cards.filter(
                                    //     (x) => x !== tval,
                                    //   );
                                    //   return {
                                    //     ...m,
                                    //     yellowCards: {
                                    //       ...(m.yellowCards || {}),
                                    //       [yellowCardPlayer.player_id]: newCards,
                                    //     },
                                    //   };
                                    // });
                                    // setMatches(updatedMatches);
                                    // const allTours = JSON.parse(
                                    //   localStorage.getItem("tournaments") ||
                                    //     "[]",
                                    // ).map((t) =>
                                    //   String(t.player_id) === tournamentId
                                    //     ? { ...t, matches: updatedMatches }
                                    //     : t,
                                    // );
                                    // localStorage.setItem(
                                    //   "tournaments",
                                    //   JSON.stringify(allTours),
                                    // );
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {showDeleteGoalModal && (
                <div className="modal-overlay">
                  <div className="modal">
                    <button
                      className="close-button"
                      type="button"
                      onClick={() => setShowDeleteGoalModal(false)}
                    >
                      &times;
                    </button>
                    <h2>Delete Goal</h2>
                    {deleteGoalPlayer && (
                      <>
                        <p>
                        Select a goal time to remove for{" "}
                        {deleteGoalPlayer?.player_name?.split(" ").slice(-1)[0]}
                      </p>
                      <select
                        value={deleteGoalTime}
                        onChange={(e) => setDeleteGoalTime(e.target.value)}
                        className="score-input"
                        disabled={!deleteGoalPlayer}
                      >
                        <option value="" disabled = {(goals || []).filter(
                          goal => goal.player_id === deleteGoalPlayer.player_id
                        )}>
                          {deleteGoalPlayer ? "Select time" : "Select a player first"}
                        </option>
                        {(() => {
                          if (!deleteGoalPlayer) return null;
                          
                          const playerGoals = (goals || []).filter(
                            goal => goal.player_id === deleteGoalPlayer.player_id
                          );
                          return playerGoals
                            .map(goal => goal.event_time)
                            .sort((a, b) => b - a) // Newest first
                            .map((time, index) => (
                              <option key={`${deleteGoalPlayer.player_id}-${time}-${index}`} value={time}>
                                {time}'
                              </option>
                            ));
                        })()}
                      </select>

                        {/* Debug info to understand the data structure */}
                        {/* <div style={{ fontSize: '12px', background: '#f0f0f0', padding: '8px', margin: '8px 0', borderRadius: '4px', maxHeight: '100px', overflow: 'auto' }}>
                        <strong>Debug:</strong> Player ID: {deleteGoalPlayer?.player_id}<br/>
                        {(() => {
                          const currentMatch = matches.find(m => String(m.player_id) === matchId);
                          console.log("Current match:", currentMatch);
                          console.log("Goal times structure:", currentMatch?.goalTimes);
                          console.log("Player ID:", deleteGoalPlayer?.player_id);
                          console.log("Goal times for player:", currentMatch?.goalTimes?.[deleteGoalPlayer?.player_id]);
                          
                          // Check all possible ways the ID might be stored
                          const possibilities = [
                            deleteGoalPlayer?.player_id,
                            String(deleteGoalPlayer?.player_id),
                            Number(deleteGoalPlayer?.player_id)
                          ];
                          
                          // Return debug info about goal times
                          return `Match ID: ${matchId}, 
                                Goals structure: ${JSON.stringify(currentMatch?.goals || {})}, 
                                Goal times keys: ${Object.keys(currentMatch?.goalTimes || {}).join(', ')}`;
                        })()}
                      </div> */}

                        {/* <select
                          value={deleteGoalTime}
                          onChange={(e) => setDeleteGoalTime(e.target.value)}
                          className="score-input"
                        >
                          <option value="" disabled>
                            Select time
                          </option>
                          {(() => {
                            const currentMatch = matches.find(
                              (m) => String(m.player_id) === matchId,
                            );
                            if (!currentMatch || !deleteGoalPlayer) return null;

                            // Try different formats of the player ID to find goal times
                            const playerIdStr = String(deleteGoalPlayer.player_id);
                            const playerIdNum = Number(deleteGoalPlayer.player_id);

                            // Look for goal times in all possible formats
                            let timesArray = [];
                            const goalTimes = currentMatch.goalTimes || {};

                            if (Array.isArray(goalTimes[deleteGoalPlayer.player_id])) {
                              timesArray = goalTimes[deleteGoalPlayer.player_id];
                            } else if (Array.isArray(goalTimes[playerIdStr])) {
                              timesArray = goalTimes[playerIdStr];
                            } else if (Array.isArray(goalTimes[playerIdNum])) {
                              timesArray = goalTimes[playerIdNum];
                            }

                            // If player has goals recorded but no times, create placeholder times
                            // based on goals count
                            if (
                              timesArray.length === 0 &&
                              currentMatch.goals &&
                              (currentMatch.goals[playerIdStr] ||
                                currentMatch.goals[playerIdNum] ||
                                currentMatch.goals[deleteGoalPlayer.player_id])
                            ) {
                              const goalCount =
                                currentMatch.goals[playerIdStr] ||
                                currentMatch.goals[playerIdNum] ||
                                currentMatch.goals[deleteGoalPlayer.player_id] ||
                                0;

                              // Create placeholder times at 10-minute intervals
                              timesArray = Array.from(
                                { length: goalCount },
                                (_, i) => (i + 1) * 10,
                              );
                            }

                            // Check if we found any goals
                            if (timesArray.length === 0) {
                              return [
                                <option key="none" value="">
                                  No goals recorded
                                </option>,
                              ];
                            }

                            // Sort and return goal times
                            return [...timesArray]
                              .sort((a, b) => a - b)
                              .map((t, i) => (
                                <option key={i} value={t}>
                                  {t}'
                                </option>
                              ));
                          })()}
                        </select> */}
                        {deleteGoalError && (
                          <p style={{ color: "red", fontWeight: "bold" }}>
                            {deleteGoalError}
                          </p>
                        )}
                        <div className="modal-buttons">
                          <button
                            type="button"
                            onClick={() => {
                              if (!deleteGoalTime) {
                                setDeleteGoalError("Please select a time");
                                return;
                              }
                              console.log(match)
                              //send request to delete
                              axios.delete(`http://localhost:5000/admin/goal-events`, {
                                data: {
                                  match_id: match.match_id,
                                  player_id: deleteGoalPlayer.player_id,
                                  goal_time: deleteGoalTime
                              }})
                              .then((res) => {
                                setMatch(res.data.data.match)
                                setGoals(prevGoals => prevGoals.filter(goal => 
                                  !(goal.match_id === match.match_id && 
                                    goal.player_id === deleteGoalPlayer.player_id && 
                                    goal.event_time === parseInt(deleteGoalTime))
                                ))
  
                                setGoalCounts((prev) => {
                                  const newCount = (prev[deleteGoalPlayer.player_id] || 0) - 1;
                                  
                                  // Create a new object without spreading the previous state first
                                  const newGoalCounts = { ...prev };
                                  
                                  if (newCount <= 0) {
                                    // Remove the player entirely if count is 0 or less
                                    delete newGoalCounts[deleteGoalPlayer.player_id];
                                  } else {
                                    // Update with the new count
                                    newGoalCounts[deleteGoalPlayer.player_id] = newCount;
                                  }
                                  
                                  return newGoalCounts;
                                });


                                setShowDeleteGoalModal(false);

                              })
                              .catch(err => console.error(err))

                              // const tval = parseInt(deleteGoalTime, 10);
                              // const playerIdStr = String(deleteGoalPlayer.player_id);

                              // const updatedMatches = matches.map((m) => {
                              //   if (m.player_id !== match.match_id) return m;

                              //   // Get current goals and times
                              //   const goals = m.goals || {};
                              //   const goalTimes = m.goalTimes || {};

                              //   // Get current goal times for this player (handling different ID formats)
                              //   let playerGoalTimes = [];
                              //   if (
                              //     Array.isArray(goalTimes[deleteGoalPlayer.player_id])
                              //   ) {
                              //     playerGoalTimes =
                              //       goalTimes[deleteGoalPlayer.player_id];
                              //   } else if (
                              //     Array.isArray(goalTimes[playerIdStr])
                              //   ) {
                              //     playerGoalTimes = goalTimes[playerIdStr];
                              //   }

                              //   // Filter out the deleted goal time
                              //   const times = playerGoalTimes.filter(
                              //     (x) => x !== tval,
                              //   );

                              //   // Update goals count
                              //   const newGoalsCount = times.length;
                              //   const newGoalsObj = { ...goals };

                              //   if (newGoalsCount > 0) {
                              //     newGoalsObj[playerIdStr] = newGoalsCount;
                              //   } else {
                              //     delete newGoalsObj[playerIdStr];
                              //   }

                              //   // Check which team the player belongs to
                              //   const teamAPlayers =
                              //     availableTeams.find(
                              //       (t) =>
                              //         String(t.team_id) === String(match.teama_id),
                              //     )?.players || [];
                              //   const isTeamA = teamAPlayers.some(
                              //     (pl) => String(pl.player_id) === playerIdStr,
                              //   );

                              //   const newGoalTimes = { ...goalTimes };
                              //   newGoalTimes[playerIdStr] = times;

                              //   return {
                              //     ...m,
                              //     goals: newGoalsObj,
                              //     goalTimes: newGoalTimes,
                              //     scoreA: isTeamA
                              //       ? (m.scoreA || 0) - 1
                              //       : m.scoreA,
                              //     scoreB: !isTeamA
                              //       ? (m.scoreB || 0) - 1
                              //       : m.scoreB,
                              //   };
                              // });

                              // setMatches(updatedMatches);
                              // setGoalCounts((prev) => {
                              //   const newCounts = { ...prev };
                              //   if (newCounts[playerIdStr] > 1) {
                              //     newCounts[playerIdStr] -= 1;
                              //   } else {
                              //     delete newCounts[playerIdStr];
                              //   }
                              //   return newCounts;
                              // });

                              // // Update localStorage
                              // const allTours = JSON.parse(
                              //   localStorage.getItem("tournaments") || "[]",
                              // ).map((t) =>
                              //   String(t.player_id) === tournamentId
                              //     ? { ...t, matches: updatedMatches }
                              //     : t,
                              // );
                              // localStorage.setItem(
                              //   "tournaments",
                              //   JSON.stringify(allTours),
                              // );

                            }}
                          >
                            Delete Goal
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              {showGoalModal && (
                <div className="modal-overlay">
                  <div className="modal">
                    <button
                      className="close-button"
                      type="button"
                      onClick={() => {
                        setGoalError("");
                        setShowGoalModal(false);
                      }}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    <h2>Record Goal Time</h2>
                    <p>
                      Enter goal time (minutes or HH:MM) between{" "}
                      {match.start_time} (0) and {match.end_time} (
                      {durationMinutes})
                    </p>
                    <input
                      type="text"
                      value={goalTime}
                      onChange={(e) => setGoalTime(e.target.value)}
                      className="score-input"
                      placeholder="e.g. 45 or 01:15"
                    />
                    {goalError && (
                      <p
                        style={{
                          color: "red",
                          marginTop: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        {goalError}
                      </p>
                    )}
                    <div className="modal-buttons">
                      <button
                        type="button"
                        onClick={() => {
                          setGoalError("");
                          const input = goalTime.trim();
                          let minutesValue;

                          if (/^\d+$/.test(input)) {
                            minutesValue = parseInt(input, 10);
                          } else if (/^[0-2]?\d:[0-5]\d$/.test(input)) {
                            const [hh, mm] = input
                              .split(":")
                              .map((n) => parseInt(n, 10));
                            // Convert absolute time to minutes since match start
                            const absMinutes = hh * 60 + mm;
                            minutesValue = absMinutes - startMinutes;
                          } else {
                            setGoalError("Enter minutes as integer or HH:MM");
                            setTimeout(
                              () =>
                                window.alert(
                                  "Enter minutes as integer or HH:MM",
                                ),
                              0,
                            );
                            return;
                          }

                          if (
                            minutesValue < 0 ||
                            minutesValue > durationMinutes
                          ) {
                            let errMsg;
                            if (input.includes(":")) {
                              errMsg = `Time must be between ${match.startTime} and ${match.endTime}`;
                            } else {
                              errMsg = `Time must be between 0 and ${durationMinutes} minutes`;
                            }
                            setGoalError(errMsg);
                            setTimeout(() => window.alert(errMsg), 0);
                            return;
                          }

                          if (goalPlayer) {

                            //add goal to match
                            axios.post(`http://localhost:5000/admin/goal-events`, {
                              match_id: match.match_id,
                              player_id: goalPlayer.player_id,
                              goal_time: minutesValue
                            })
                            .then((res) => {

                              setMatch(res.data.data.match)
                              setGoals(prevGoals => [...prevGoals, {
                                match_id: match.match_id,
                                player_id: goalPlayer.player_id,
                                goal_time: minutesValue
                              }])

                              setGoalCounts((prev) => ({
                                ...prev,
                                [goalPlayer.player_id]: (prev[goalPlayer.player_id] || 0) + 1,
                              }));
                            })

                            // Update matches array and goalTimes
                            const teamAPlayers =
                              availableTeams.find(
                                (t) =>
                                  String(t.team_id) === String(match.teama_id),
                              )?.players || [];
                            const isTeamA = teamAPlayers.some(
                              (pl) => String(pl.player_id) === String(goalPlayer.player_id),
                            );
                            const updatedMatchesWithScore = matches.map((m) =>
                              m.player_id === match.match_id
                                ? (() => {
                                    const prevTimes =
                                      m.goalTimes[goalPlayer.player_id] || [];
                                    const newTimes = [
                                      ...prevTimes,
                                      minutesValue,
                                    ];
                                    return {
                                      ...m,
                                      goals: {
                                        ...(m.goals || {}),
                                        [goalPlayer.player_id]: newTimes.length,
                                      },
                                      goalTimes: {
                                        ...(m.goalTimes || {}),
                                        [goalPlayer.player_id]: newTimes,
                                      },
                                      scoreA: isTeamA
                                        ? (m.scoreA || 0) + 1
                                        : m.scoreA,
                                      scoreB: !isTeamA
                                        ? (m.scoreB || 0) + 1
                                        : m.scoreB,
                                    };
                                  })()
                                : m,
                            );
                            setMatches(updatedMatchesWithScore);
                            
                          }

                          console.log(`Goal at ${minutesValue} minutes`);
                          setShowGoalModal(false);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        {/* Match Complete Button, only show if not completed */}
        {!isCompleted && (
          <div className="match-complete-container">
            <button
              className="match-complete-button"
              onClick={() => {
                if (motmPlayerId === null) {
                  window.alert("Select a Man of the Match before completing the match");
                } else {
                  setShowCompleteModal(true);
                }
              }}
            >
              Match Complete
            </button>
          </div>
        )}
        {showCompleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button
                className="close-button"
                type="button"
                onClick={() => setShowCompleteModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2>Confirm Match Completion</h2>
              <p>Are you sure you want to complete this match?</p>
              <p>
                <span style={{ color: "red", fontWeight: "bold" }}>
                  This will lock the page and make it view only.
                </span>
              </p>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => {
                    // Determine match winner
                    // const teamAName =
                    //   availableTeams.find(
                    //     (t) => String(t.team_id) === String(match.teama_id),
                    //   )?.team_name || match.teama_id;
                    // const teamBName =
                    //   availableTeams.find(
                    //     (t) => String(t.team_id) === String(match.teamb_id),
                    //   )?.team_name || match.teamb_id;
                    const winner =
                      scoreA > scoreB
                        ? match.teama_id
                        : scoreB > scoreA
                          ? match.teamb_id
                          : null;

                    setMatch(prev => ({
                      ...prev,
                      scoreA,
                      scoreB,
                      winner_team_id: winner,
                      match_completed: true
                    }));

                    const updatedMatch = {
                      ...match,
                      scoreA,
                      scoreB,
                      winner_team_id: winner,
                      match_completed: true,
                      motm_player_id: motmPlayerId
                    };
                    
                    //update match details
                    axios.post(`http://localhost:5000/admin/matches/${matchId}/details`, updatedMatch)
                    .then((res) => {
                      setIsCompleted(true);
                      setShowCompleteModal(false);
                    })
                    .catch(err => console.error(err))                    
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DetailedMatchStats;
