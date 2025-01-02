import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Seats.module.css";

const Seats = () => {
  const [seats, setSeats] = useState([]);
  const [recentlyBookedSeats, setRecentlyBookedSeats] = useState([]);
  const [numSeatsToBook, setNumSeatsToBook] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/seats`);
      setSeats(response.data.sort((a, b) => a.id - b.id)); // Ensure seats are sorted by ID
    } catch {
      setError("Failed to load seats.");
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/seats/reserve`,
        { numberOfSeats: numSeatsToBook },
        {
          withCredentials: true,
          headers: { accessToken: token },
        }
      );

      if (response.status === 200) {
        setRecentlyBookedSeats(response.data.seats); // Seats successfully reserved
        setSuccess("Seats booked successfully!");
        fetchSeats(); // Refresh the seat data after booking
      } else {
        
        setError("Error booking seats. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Error booking seats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRecentlyBookedSeats([]);
    setError("");
    setSuccess("");
    setNumSeatsToBook(0);
  };

  return (
    <div className={styles.seatsContainer}>
      <h1 className={styles.title}>Ticket Booking</h1>

      <div className={styles.seatGrid}>
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`${styles.seat} ${
              seat.is_reserved
                ? styles.reserved
                : recentlyBookedSeats.some(
                    (bookedSeat) => bookedSeat.id === seat.id
                  )
                ? styles.booked
                : styles.available
            }`}
          >
            {seat.id}
          </div>
        ))}
      </div>

      {/* Display the recently booked seats with just seat numbers */}
      {recentlyBookedSeats.length > 0 && (
        <div className={styles.recentlyBooked}>
          <h3>Just Booked Seats:</h3>
          <div className={styles.recentlyBookedList}>
            {recentlyBookedSeats.map((seat) => (
              <button key={seat.id} className={styles.recentlyBookedSeat}>
                Seat {seat.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.info}>
        <input
          type="text"
          min="0"
          max="7"
          value={numSeatsToBook}
          onChange={(e) => setNumSeatsToBook(Number(e.target.value))}
          placeholder="Number of Seats"
        />
        <button
          className={styles.button}
          onClick={handleBooking}
          disabled={loading || numSeatsToBook === 0}
        >
           {loading ? <div className={styles.spinner}></div> : "Book"}
        </button>
        <button className={styles.button} onClick={handleReset}>
          Reset Booking
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </div>
  );
};

export default Seats;
