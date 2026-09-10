import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";


// ============================================================
// EMERGENCY SIREN ENGINE
// ============================================================

class EmergencySiren {

  constructor() {
    this.audioContext = null;
    this.oscillators = [];
    this.gainNodes = [];
    this.interval = null;
    this.running = false;
  }


  async initialize() {

    if (!this.audioContext) {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        throw new Error(
          "Web Audio API is not supported by this browser."
        );
      }

      this.audioContext =
        new AudioContext();
    }


    if (
      this.audioContext.state === "suspended"
    ) {
      await this.audioContext.resume();
    }

  }


  async start() {

    await this.initialize();


    if (this.running) {
      return;
    }


    this.running = true;


    const ctx =
      this.audioContext;


    // --------------------------------------------------------
    // MAIN SIREN OSCILLATOR
    // --------------------------------------------------------

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();


    oscillator.type =
      "sawtooth";


    oscillator.frequency.setValueAtTime(
      520,
      ctx.currentTime
    );


    gain.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );


    oscillator.connect(gain);

    gain.connect(
      ctx.destination
    );


    oscillator.start();


    this.oscillators.push(
      oscillator
    );

    this.gainNodes.push(
      gain
    );


    // --------------------------------------------------------
    // SECOND OSCILLATOR
    // Gives the siren a fuller emergency tone.
    // --------------------------------------------------------

    const oscillator2 =
      ctx.createOscillator();

    const gain2 =
      ctx.createGain();


    oscillator2.type =
      "square";


    oscillator2.frequency.setValueAtTime(
      780,
      ctx.currentTime
    );


    gain2.gain.setValueAtTime(
      0.0001,
      ctx.currentTime
    );


    oscillator2.connect(gain2);

    gain2.connect(
      ctx.destination
    );


    oscillator2.start();


    this.oscillators.push(
      oscillator2
    );

    this.gainNodes.push(
      gain2
    );


    // --------------------------------------------------------
    // SIREN SWEEP
    // --------------------------------------------------------

    let high = false;


    const runSweep = () => {

      if (!this.running) {
        return;
      }


      const now =
        ctx.currentTime;


      if (!high) {

        oscillator.frequency.exponentialRampToValueAtTime(
          1050,
          now + 0.9
        );


        oscillator2.frequency.exponentialRampToValueAtTime(
          1450,
          now + 0.9
        );


        gain.gain.exponentialRampToValueAtTime(
          0.13,
          now + 0.15
        );


        gain2.gain.exponentialRampToValueAtTime(
          0.035,
          now + 0.15
        );

      } else {

        oscillator.frequency.exponentialRampToValueAtTime(
          480,
          now + 0.9
        );


        oscillator2.frequency.exponentialRampToValueAtTime(
          650,
          now + 0.9
        );


        gain.gain.exponentialRampToValueAtTime(
          0.13,
          now + 0.15
        );


        gain2.gain.exponentialRampToValueAtTime(
          0.035,
          now + 0.15
        );

      }


      high = !high;

    };


    runSweep();


    this.interval =
      setInterval(
        runSweep,
        900
      );

  }


  stop() {

    if (!this.audioContext) {
      return;
    }


    this.running = false;


    if (this.interval) {

      clearInterval(
        this.interval
      );

      this.interval = null;

    }


    const ctx =
      this.audioContext;


    const now =
      ctx.currentTime;


    this.gainNodes.forEach(
      (gain) => {

        try {

          gain.gain.cancelScheduledValues(
            now
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.15
          );

        } catch (error) {

          console.error(
            error
          );

        }

      }
    );


    setTimeout(() => {

      this.oscillators.forEach(
        (oscillator) => {

          try {
            oscillator.stop();
          } catch (error) {
            // Already stopped.
          }

        }
      );


      this.oscillators = [];

      this.gainNodes = [];

    }, 200);

  }


  async test() {

    await this.start();


    setTimeout(() => {

      this.stop();

    }, 2500);

  }

}


// ============================================================
// ALERTS COMPONENT
// ============================================================

function Alerts() {

  const [alerts, setAlerts] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState(null);


  const [soundEnabled, setSoundEnabled] =
    useState(false);


  const [sirenActive, setSirenActive] =
    useState(false);


  const [lastUpdated, setLastUpdated] =
    useState(null);


  const sirenRef =
    useRef(null);


  const previousHighAlerts =
    useRef(new Set());


  const isMounted =
    useRef(true);


  // ==========================================================
  // CREATE SIREN ONCE
  // ==========================================================

  useEffect(() => {

    sirenRef.current =
      new EmergencySiren();


    return () => {

      isMounted.current =
        false;


      if (sirenRef.current) {

        sirenRef.current.stop();

      }

    };

  }, []);


  // ==========================================================
  // LOAD ACTIVE ALERTS
  // ==========================================================

  const loadAlerts = async () => {

    try {

      setError(null);


      const data =
        await api.getActiveAlerts();


      if (!isMounted.current) {
        return;
      }


      const activeAlerts =
        Array.isArray(data)
          ? data
          : [];


      setAlerts(
        activeAlerts
      );


      setLastUpdated(
        new Date()
      );

    } catch (err) {

      console.error(
        "Failed to load alerts:",
        err
      );


      if (isMounted.current) {

        setError(
          "Unable to load live alerts from backend."
        );

      }

    } finally {

      if (isMounted.current) {

        setLoading(false);

      }

    }

  };


  // ==========================================================
  // INITIAL LOAD + LIVE REFRESH
  // ==========================================================

  useEffect(() => {

    loadAlerts();


    const refreshInterval =
      setInterval(
        loadAlerts,
        15000
      );


    return () => {

      clearInterval(
        refreshInterval
      );

    };

  }, []);


  // ==========================================================
  // GET SEVERITY
  // ==========================================================

  const getSeverity = (alert) => {

    const severity =
      String(
        alert?.severity ||
        alert?.level ||
        ""
      ).toUpperCase();


    if (
      severity === "CRITICAL"
    ) {
      return "CRITICAL";
    }


    if (
      severity === "SEVERE"
    ) {
      return "SEVERE";
    }


    if (
      severity === "HIGH"
    ) {
      return "HIGH";
    }


    if (
      severity === "MODERATE" ||
      severity === "MEDIUM"
    ) {
      return "MODERATE";
    }


    return "LOW";

  };


  // ==========================================================
  // HIGH PRIORITY CHECK
  // ==========================================================

  const isEmergencyAlert = (
    alert
  ) => {

    const severity =
      getSeverity(alert);


    return (
      severity === "HIGH" ||
      severity === "SEVERE" ||
      severity === "CRITICAL"
    );

  };


  // ==========================================================
  // GET LOCATION
  // ==========================================================

  const getLocationName = (
    alert
  ) => {

    return (
      alert?.location?.name ||
      alert?.location_name ||
      alert?.location ||
      `Location #${alert?.location_id || "Unknown"}`
    );

  };


  // ==========================================================
  // GET MESSAGE
  // ==========================================================

  const getMessage = (
    alert
  ) => {

    if (alert?.message) {
      return alert.message;
    }


    const severity =
      getSeverity(alert);


    if (
      severity === "CRITICAL"
    ) {

      return (
        "Critical landslide risk detected. " +
        "Immediate attention required."
      );

    }


    if (
      severity === "SEVERE"
    ) {

      return (
        "Severe landslide risk detected. " +
        "Immediate precautionary action required."
      );

    }


    if (
      severity === "HIGH"
    ) {

      return (
        "High landslide risk detected. " +
        "Close monitoring and precautionary action recommended."
      );

    }


    if (
      severity === "MODERATE"
    ) {

      return (
        "Moderate landslide risk detected. " +
        "Continue monitoring environmental conditions."
      );

    }


    return (
      "Environmental conditions are currently stable."
    );

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatTime = (
    value
  ) => {

    if (!value) {
      return "Time unavailable";
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(value);

    }


    return date.toLocaleString();

  };


  // ==========================================================
  // ENABLE SOUND
  // ==========================================================

  const enableSound = async () => {

    try {

      if (!sirenRef.current) {
        return;
      }


      await sirenRef.current.initialize();


      setSoundEnabled(
        true
      );


      // Short test
      await sirenRef.current.test();


      setSirenActive(
        true
      );


      setTimeout(() => {

        setSirenActive(
          false
        );

      }, 2500);

    } catch (err) {

      console.error(
        "Unable to enable alert sound:",
        err
      );


      alert(
        "Unable to enable alert sound in this browser."
      );

    }

  };


  // ==========================================================
  // START SIREN
  // ==========================================================

  const startSiren = async () => {

    if (!soundEnabled) {
      return;
    }


    if (!sirenRef.current) {
      return;
    }


    try {

      await sirenRef.current.start();


      setSirenActive(
        true
      );

    } catch (err) {

      console.error(
        "Siren error:",
        err
      );

    }

  };


  // ==========================================================
  // STOP SIREN
  // ==========================================================

  const stopSiren = () => {

    if (sirenRef.current) {

      sirenRef.current.stop();

    }


    setSirenActive(
      false
    );

  };


  // ==========================================================
  // DETECT NEW EMERGENCY ALERT
  // ==========================================================

  useEffect(() => {

    const emergencyAlerts =
      alerts.filter(
        isEmergencyAlert
      );


    const currentIds =
      new Set(
        emergencyAlerts.map(
          (alert) =>
            String(alert.id)
        )
      );


    // --------------------------------------------------------
    // FIRST LOAD
    // --------------------------------------------------------

    if (
      previousHighAlerts.current.size ===
      0
    ) {

      previousHighAlerts.current =
        currentIds;

      return;

    }


    // --------------------------------------------------------
    // FIND NEW HIGH ALERT
    // --------------------------------------------------------

    const newEmergencyAlert =
      emergencyAlerts.find(
        (alert) =>
          !previousHighAlerts.current.has(
            String(alert.id)
          )
      );


    if (
      newEmergencyAlert &&
      soundEnabled
    ) {

      startSiren();

    }


    previousHighAlerts.current =
      currentIds;

  }, [
    alerts,
    soundEnabled,
  ]);


  // ==========================================================
  // KEEP SIREN ACTIVE WHILE EMERGENCY ALERT EXISTS
  // ==========================================================

  useEffect(() => {

    const emergencyExists =
      alerts.some(
        isEmergencyAlert
      );


    if (
      emergencyExists &&
      soundEnabled &&
      !sirenActive
    ) {

      // Do not automatically restart
      // after manual stop.
      return;

    }


    if (
      !emergencyExists &&
      sirenActive
    ) {

      stopSiren();

    }

  }, [
    alerts,
    soundEnabled,
  ]);


  // ==========================================================
  // ACKNOWLEDGE ALERT
  // ==========================================================

  const handleAcknowledge = async (
    alertId
  ) => {

    try {

      await api.acknowledgeAlert(
        alertId
      );


      setAlerts(
        (previous) =>
          previous.filter(
            (alert) =>
              alert.id !== alertId
          )
      );


    } catch (err) {

      console.error(
        "Acknowledge alert error:",
        err
      );


      alert(
        "Unable to acknowledge this alert."
      );

    }

  };


  // ==========================================================
  // COUNTS
  // ==========================================================

  const criticalCount =
    alerts.filter(
      (alert) =>
        getSeverity(alert) ===
        "CRITICAL"
    ).length;


  const severeCount =
    alerts.filter(
      (alert) =>
        getSeverity(alert) ===
        "SEVERE"
    ).length;


  const highCount =
    alerts.filter(
      (alert) =>
        getSeverity(alert) ===
        "HIGH"
    ).length;


  const moderateCount =
    alerts.filter(
      (alert) =>
        getSeverity(alert) ===
        "MODERATE"
    ).length;


  const emergencyCount =
    criticalCount +
    severeCount +
    highCount;


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="page-container">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="page-header">

        <div>

          <p className="page-eyebrow">
            EARLY WARNING SYSTEM
          </p>

          <h1>
            Active Alerts
          </h1>

          <p className="page-subtitle">
            Monitor and manage AI-generated
            landslide warnings.
          </p>

        </div>


        <div className="live-status">

          <span className="live-dot"></span>

          ALERT SYSTEM ACTIVE

        </div>

      </div>


      {/* ======================================================
          EMERGENCY BANNER
      ====================================================== */}

      {emergencyCount > 0 && (

        <div
          style={{
            marginBottom: "16px",
            padding: "18px 20px",
            borderRadius: "12px",
            background:
              sirenActive
                ? "#7f1d1d"
                : "#991b1b",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
            boxShadow:
              sirenActive
                ? "0 0 25px rgba(220,38,38,0.45)"
                : "none",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <span
              style={{
                fontSize: "30px",
              }}
            >
              🚨
            </span>


            <div>

              <strong
                style={{
                  fontSize: "18px",
                }}
              >

                EMERGENCY LANDSLIDE WARNING

              </strong>


              <div
                style={{
                  marginTop: "4px",
                  opacity: 0.9,
                }}
              >

                {emergencyCount} high-priority
                alert
                {emergencyCount !== 1
                  ? "s"
                  : ""}{" "}
                require attention.

              </div>

            </div>

          </div>


          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >

            {sirenActive ? (

              <button
                onClick={
                  stopSiren
                }
                className="action-button"
                style={{
                  background:
                    "#ffffff",
                  color:
                    "#991b1b",
                  fontWeight:
                    "700",
                }}
              >

                🔇 Stop Siren

              </button>

            ) : soundEnabled ? (

              <button
                onClick={
                  startSiren
                }
                className="action-button"
                style={{
                  background:
                    "#ffffff",
                  color:
                    "#991b1b",
                  fontWeight:
                    "700",
                }}
              >

                🔊 Start Siren

              </button>

            ) : null}

          </div>

        </div>

      )}


      {/* ======================================================
          SOUND CONTROL
      ====================================================== */}

      <div
        className="dashboard-card"
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <strong>
            Alert Warning Sound
          </strong>

          <p
            style={{
              margin:
                "5px 0 0",
              opacity: 0.7,
            }}
          >

            {soundEnabled
              ? "Emergency sound is enabled for HIGH, SEVERE and CRITICAL alerts."
              : "Enable sound to receive an audible warning for emergency alerts."}

          </p>

        </div>


        <button
          className="action-button"
          onClick={
            enableSound
          }
          disabled={
            soundEnabled
          }
        >

          {soundEnabled
            ? "🔊 Sound Enabled"
            : "🔔 Enable Alert Sound"}

        </button>

      </div>


      {/* ======================================================
          LAST UPDATED
      ====================================================== */}

      {lastUpdated && (

        <div
          style={{
            marginBottom: "12px",
            fontSize: "13px",
            opacity: 0.65,
          }}
        >

          Live data updated:
          {" "}
          {lastUpdated.toLocaleTimeString()}

        </div>

      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          className="dashboard-card"
          style={{
            marginBottom: "16px",
            borderLeft:
              "5px solid #dc2626",
          }}
        >

          ⚠️ {error}

        </div>

      )}


      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="stats-grid">


        {/* CRITICAL */}

        <div className="stat-card">

          <div className="stat-icon">
            🚨
          </div>

          <p>
            Critical / Severe
          </p>

          <h2>
            {criticalCount +
              severeCount}
          </h2>

          <span>
            Immediate attention required
          </span>

        </div>


        {/* HIGH */}

        <div className="stat-card">

          <div className="stat-icon">
            ⚠️
          </div>

          <p>
            High Priority
          </p>

          <h2>
            {highCount}
          </h2>

          <span>
            Close monitoring required
          </span>

        </div>


        {/* MODERATE */}

        <div className="stat-card">

          <div className="stat-icon">
            🟠
          </div>

          <p>
            Moderate
          </p>

          <h2>
            {moderateCount}
          </h2>

          <span>
            Continue monitoring
          </span>

        </div>


        {/* TOTAL */}

        <div className="stat-card">

          <div className="stat-icon">
            📡
          </div>

          <p>
            Total Active
          </p>

          <h2>
            {alerts.length}
          </h2>

          <span>
            Current monitoring alerts
          </span>

        </div>

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div
          className="dashboard-card"
          style={{
            marginTop: "16px",
            textAlign: "center",
            padding: "35px",
          }}
        >

          📡 Loading live alerts...

        </div>

      )}


      {/* ======================================================
          NO ALERTS
      ====================================================== */}

      {!loading &&
        alerts.length === 0 && (

          <div
            className="dashboard-card"
            style={{
              marginTop: "16px",
              textAlign: "center",
              padding: "45px",
            }}
          >

            <div
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              ✅
            </div>

            <h2>
              No Active Alerts
            </h2>

            <p>
              No active landslide warnings
              are currently reported.
            </p>

          </div>

        )}


      {/* ======================================================
          ALERT LIST
      ====================================================== */}

      {!loading &&
        alerts.length > 0 && (

          <div
            className="alerts-list"
            style={{
              marginTop: "16px",
            }}
          >

            {alerts.map(
              (alert) => {

                const severity =
                  getSeverity(
                    alert
                  );


                const emergency =
                  isEmergencyAlert(
                    alert
                  );


                return (

                  <div
                    className={`dashboard-card alert-item ${severity.toLowerCase()}`}
                    key={alert.id}
                    style={{
                      position:
                        "relative",
                      overflow:
                        "hidden",
                    }}
                  >


                    {/* ALERT INDICATOR */}

                    <div
                      className={`alert-indicator ${severity.toLowerCase()}`}
                    ></div>


                    <div
                      className="alert-content"
                    >


                      {/* TOP ROW */}

                      <div
                        className="alert-top"
                      >

                        <span
                          className="alert-id"
                        >

                          AL-
                          {String(
                            alert.id
                          ).padStart(
                            3,
                            "0"
                          )}

                        </span>


                        <span
                          className={`risk-badge ${severity.toLowerCase()}`}
                        >

                          {severity ===
                            "CRITICAL"
                            ? "🚨 CRITICAL"
                            : severity ===
                              "SEVERE"
                              ? "🚨 SEVERE"
                              : severity ===
                                "HIGH"
                                ? "⚠️ HIGH"
                                : severity ===
                                  "MODERATE"
                                  ? "🟠 MODERATE"
                                  : "🟢 LOW"}

                        </span>

                      </div>


                      {/* EMERGENCY LABEL */}

                      {emergency && (

                        <div
                          style={{
                            marginTop:
                              "10px",
                            fontSize:
                              "12px",
                            fontWeight:
                              "700",
                            letterSpacing:
                              "0.5px",
                          }}
                        >

                          🚨 EMERGENCY
                          WARNING

                        </div>

                      )}


                      {/* LOCATION */}

                      <h2>
                        {getLocationName(
                          alert
                        )}
                      </h2>


                      {/* MESSAGE */}

                      <p>
                        {getMessage(
                          alert
                        )}
                      </p>


                      {/* DETAILS */}

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "15px",
                          flexWrap:
                            "wrap",
                          marginTop:
                            "10px",
                        }}
                      >

                        <span
                          className="alert-time"
                        >

                          🕒
                          {" "}
                          {formatTime(
                            alert.created_at
                          )}

                        </span>


                        <span
                          className="alert-time"
                        >

                          📍 Location ID:
                          {" "}
                          {alert.location_id}

                        </span>


                        <span
                          className="alert-time"
                        >

                          Status:
                          {" "}
                          {alert.status ||
                            "ACTIVE"}

                        </span>

                      </div>


                      {/* ACTIONS */}

                      <div
                        style={{
                          marginTop:
                            "16px",
                          display:
                            "flex",
                          gap:
                            "10px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {emergency &&
                          sirenActive && (

                            <button
                              className="action-button"
                              onClick={
                                stopSiren
                              }
                            >

                              🔇 Stop Siren

                            </button>

                          )}


                        {emergency &&
                          soundEnabled &&
                          !sirenActive && (

                            <button
                              className="action-button"
                              onClick={
                                startSiren
                              }
                            >

                              🔊 Start Siren

                            </button>

                          )}


                        <button
                          className="action-button"
                          onClick={() =>
                            handleAcknowledge(
                              alert.id
                            )
                          }
                        >

                          ✓ Acknowledge Alert

                        </button>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

    </div>

  );

}


export default Alerts;