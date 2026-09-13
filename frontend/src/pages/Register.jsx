import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = (event) => {
    event.preventDefault();
    setError("");

    // Check password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Create user
    const user = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
    };

    // Save account
    localStorage.setItem(
      "slopeShieldUser",
      JSON.stringify(user)
    );

    // Make sure user is not already logged in
    localStorage.removeItem("slopeShieldLoggedIn");

    alert("Account created successfully!");

    // Go to login
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1120",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#162033",
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "35px",
          boxShadow:
            "0 0 30px rgba(37, 99, 235, 0.18)",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              color: "#60a5fa",
              marginBottom: "8px",
            }}
          >
            ▲
          </div>

          <h1
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "30px",
            }}
          >
            SlopeShield
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            AI Landslide Early Warning System
          </p>

          <h2
            style={{
              color: "#60a5fa",
              marginTop: "25px",
            }}
          >
            Create Account
          </h2>
        </div>

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#ffffff",
              border: "1px solid #ef4444",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "18px",
              textAlign: "center",
              boxShadow:
                "0 0 18px rgba(239,68,68,0.45)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleRegister}>

          {/* NAME */}

          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "7px",
            }}
          >
            Full Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="Enter your name"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              marginBottom: "17px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {/* EMAIL */}

          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "7px",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              marginBottom: "17px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {/* PASSWORD */}

          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "7px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            placeholder="Create password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              marginBottom: "17px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {/* CONFIRM PASSWORD */}

          <label
            style={{
              display: "block",
              color: "#cbd5e1",
              marginBottom: "7px",
            }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError("");
            }}
            placeholder="Confirm password"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              marginBottom: "22px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none",
            }}
          />

          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #60a5fa",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow:
                "0 0 12px rgba(37,99,235,0.25)",
            }}
          >
            📝 Create Account
          </button>
        </form>

        {/* LOGIN LINK */}

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: "22px",
          }}
        >
          Already have an account?{" "}

          <Link
            to="/login"
            style={{
              color: "#60a5fa",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;