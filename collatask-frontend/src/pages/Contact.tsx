import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/Contact.css";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      setFeedback("");
      setError("");
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/contact`,
        { name, email, message },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setFeedback("Your message has been sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } catch (error) {
      setError("An error occurred while sending your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <Navbar />
      <div className="contact-content">
        <h1>Contact Us</h1>
        <p>Have questions or feedback? Reach out to us using the form below!</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
        {feedback && (
          <div className="feedback">
            <p className="feedback-message">{feedback}</p>
            <button
              className="back-button"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Contact;
