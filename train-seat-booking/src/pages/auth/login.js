import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error messages

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login", // Update with your backend endpoint
        { username, password },
        { withCredentials: true } // Ensures cookies are sent
      );

      if (response.status === 200) {
        alert("Login successful!");
        router.push("/dashboard"); // Redirect to dashboard
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error); // Show error message from server
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h1 style={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your username"
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        <p style={styles.footerText}>
          Don't have an account? <a href="/auth/register" style={styles.link}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "'Inter', sans-serif",
  },
  formWrapper: {
    width: "400px",
    padding: "30px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#1f2937",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: "15px",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "5px",
    color: "#4b5563",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  },
  inputFocus: {
    borderColor: "#2563eb",
  },
  button: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: "5px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  buttonHover: {
    backgroundColor: "#1d4ed8",
  },
  error: {
    color: "#dc2626",
    fontSize: "0.85rem",
    marginBottom: "15px",
  },
  footerText: {
    marginTop: "15px",
    fontSize: "0.9rem",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
