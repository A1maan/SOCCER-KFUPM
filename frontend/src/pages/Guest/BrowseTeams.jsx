import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GuestSidebar from "../../components/GuestSidebar";
// import sealImage from '../../assets/icons/KFUPM Seal White.png';
import bgImage from "../../assets/images/Illustration 1@4x.png";
import "../../stylesheets/BrowseTeams.css";

const BrowseTeams = () => {
  const navigate = useNavigate();
  const username = "john.doe"; // Replace with actual dynamic source later
  const [first, last] = username.split(".");
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  const formattedName = `${first.charAt(0).toUpperCase() + first.slice(1)} ${last.charAt(0).toUpperCase() + last.slice(1)}`;

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await axios.get("http://localhost:5000/guest/teams");
        const json = response.data;
        if (json.success) {
          setTeams(json.data);
        } else {
          console.error("Failed to load teams:", json.error);
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
      }
    };
    loadTeams();
  }, []);

  return (
    <div className="guest-home">
      <GuestSidebar initials={initials} formattedName={formattedName} />

      <main className="main-content">
        <div className="bg-overlay"></div>
        <header className="topbar">
          <h1>Teams</h1>
        </header>
        <section className="team-list">
          <h2>All Registered Teams</h2>
          <div className="team-grid scrollable">
            {teams.length > 0 ? (
              teams.map((team) => (
                <div key={team.team_id} className="team-card">
                  <div
                    className="team-card-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>
                      Team Name:{" "}
                      <span className="team-name-gradient">
                        {team.team_name}
                      </span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="view-team-button"
                    // style={{ display: "block", margin: "0.5rem auto 1rem" }}
                    onClick={() =>
                      navigate(`/guest/browse-teams/${team.team_id}`)
                    }
                  >
                    View
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: "black" }}>
                No teams have been registered yet.
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

export default BrowseTeams;
