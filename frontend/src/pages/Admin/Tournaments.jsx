import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
// import sealImage from '../../assets/icons/KFUPM Seal White.png';
import bgImage from "../../assets/images/Illustration 1@4x.png";
import "../../stylesheets/Tournaments.css";

import axios from 'axios'

const Tournaments = () => {
  const navigate = useNavigate();
  const username = "john.doe"; // Replace with actual dynamic source later
  const [first, last] = username.split(".");
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  const formattedName = `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;

  const [tournaments, setTournaments] = useState([]);

  //Token

  useEffect(() => {
    const loadTournaments = () => {
      
      axios.get(`http://localhost:5000/tournaments`)
      .then((res) => {
        setTournaments(res.data.data)
      })
      .catch(err => console.error(err))      
    };

    loadTournaments();

    window.addEventListener("focus", loadTournaments);
    return () => window.removeEventListener("focus", loadTournaments);
  }, []);

  const handleDeleteTournament = (tournamentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tournament?",
    );
    if (!confirmed) return;

    //delete tournament via admin api
    axios.delete(`http://localhost:5000/admin/tournaments/${tournamentId}`)
    .then((res) => {
      if (res.status === 200){ 
        const updated = tournaments.filter(
          (t) => String(t.tournament_id) !== String(tournamentId),
        );
        setTournaments(updated);
      }
    })

  };

  return (
    <div className="admin-home">
      <AdminSidebar initials={initials} formattedName={formattedName} />

      <main className="main-content">
        <div className="bg-overlay"></div>
        <header className="topbar">
          <h1>Tournaments</h1>
        </header>
        <section className="tournament-list">
          <h2>Registered Tournaments</h2>
          <div className="tournament-grid scrollable">
            {tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <div key={tournament.tournament_id} className="tournament-card">
                  <div
                    className="tournament-card-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      Tournament Name:{" "}
                      <span className="tournament-name-gradient">
                        {tournament.name}
                      </span>
                    </h3>
                  </div>
                  <p>
                    <strong>Tournament ID:</strong> {tournament.tournament_id}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(tournament.start_date).toLocaleDateString("en-GB")}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(tournament.end_date).toLocaleDateString("en-GB")}
                  </p>
                  <p>
                    <strong>Number of Teams:</strong> {tournament.num_teams}
                  </p>
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      navigate(`/admin/tournaments/${tournament.tournament_id}/edit`)
                    }
                  >
                    Edit
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: "black" }}>
                No tournaments have been registered yet.
              </p>
            )}
          </div>
        </section>
        {/* <img 
          src={sealImage} 
          alt="KFUPM Seal" 
          className="vertical-seal" 
        /> */}
      </main>
    </div>
  );
};

export default Tournaments;
