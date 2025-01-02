import { useState } from 'react';
import axios from 'axios';
import styles from '../../styles/Signup.module.css';  // Import the CSS module
import { useRouter } from 'next/router';  // Import useRouter for redirection

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter(); // Initialize router for redirection

  const handleUsernameChange = (e) => {
    setUsername(e.target.value); // Update the username state
    setError("");  // Clear the error message when the user types
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value); // Update the email state
    setError("");  // Clear the error message when the user types
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value); // Update the password state
    setError("");  // Clear the error message when the user types
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // Reset error message before submitting the form
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`, {
        username,
        email,
        password,
      },{withCredentials: 'include'});
      setSuccessMessage(response.data.message);
      setError('');  // Clear any previous error messages

      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      if (error.response && error.response.data.error.includes("duplicate key value")) {
        setError('Username already exists. Please choose a different one.');
      } else {
        setError('An error occurred during signup. Please try again later.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Sign Up</h2>
      <form className={styles.form} onSubmit={handleSignup}>
        <input 
          type="text" 
          value={username} 
          onChange={handleUsernameChange} 
          placeholder="Enter Username" 
          required
          className={styles.input}
        />
        <input 
          type="email" 
          value={email} 
          onChange={handleEmailChange} 
          placeholder="Email" 
          required
          className={styles.input}
        />
        <input 
          type="password" 
          value={password} 
          onChange={handlePasswordChange} 
          placeholder="Password" 
          required
          className={styles.input}
        />
        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        <button type="submit" className={styles.button}>Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
