import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");

    const savedUser = JSON.parse(
      localStorage.getItem("slopeShieldUser")
    );

    if (!savedUser) {
      setError("Account not found. Please create an account first.");
      return;
    }

    if (
      email !== savedUser.email ||
      password !== savedUser.password
    ) {
      setError("Invalid email or password.");
      return;
    }

    // Login successful
    localStorage.setItem("slopeShieldLoggedIn", "true");

    navigate("/");
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
          maxWidth: "430px",
          background: "#162033",
          border: "1px solid #334155",
          borderRadius: "18px",
          padding: "35px",
          boxShadow: "0 0 30px rgba(37, 99, 235, 0.18)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              fontSize: "42px",
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
            Login
          </h2>
        </div>

        {error && (
          <div
            style={{
              background: "#7f1d1d",
              color: "#ffffff",
              border: "1px solid #ef4444",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "18px",
              boxShadow: "0 0 15px rgba(239,68,68,0.35)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              marginBottom: "18px",
              borderRadius: "10px",
              border: "1px solid #475569",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none",
            }}
          />

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
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
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
            }}
          >
            🔐 Login
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: "22px",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#60a5fa",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;