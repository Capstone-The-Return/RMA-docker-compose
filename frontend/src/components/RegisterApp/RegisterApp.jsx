import React, { useState } from "react";
import { UserPlus } from "lucide-react"; // Removed User and Briefcase icons
import styles from "./RegisterApp.module.css";
import { handleRegister } from "./HandleRegister";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setSuccess] = useState(false);
  // Set the default role permanently to 'customer'
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    setMessage(""); // Clear previous error message
    const result = await handleRegister(name, email, password, confirmPassword);
    setMessage(result.message);
    setSuccess(result.isSuccess);
    // Clear form
    if (result.isSuccess) {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    };
  };

  // --- Removed getRoleButtonClass function ---

  // Helper function for input focus/blur (retains style logic)
  const handleInputFocus = (e) => {
    e.currentTarget.style.borderBottomColor = "#2c5364";
  };
  const handleInputBlur = (e) => {
    e.currentTarget.style.borderBottomColor = "#d1d5db";
  };

  // Helper function for button hover (retains style logic)
  const handleButtonHover = (e) => {
    e.currentTarget.style.background =
      "linear-gradient(90deg, #203a43, #2c5364, #0f2027)";
    e.currentTarget.style.boxShadow =
      "0 8px 25px rgba(44, 83, 100, 0.9), 0 0 15px rgba(32, 58, 67, 0.8)";
  };
  const handleButtonLeave = (e) => {
    e.currentTarget.style.background =
      "linear-gradient(90deg, #0f2027, #203a43, #2c5364)";
    e.currentTarget.style.boxShadow = "0 4px 15px rgba(44, 83, 100, 0.6)";
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.formContainerWrapper}>
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div className={styles.header}>
              <div className={styles.logoWrapper}>
                <UserPlus className={styles.logoIcon} />
              </div>
              <h2 className={styles.title}>Customer Registration</h2>
              <p className={styles.subtitle}>
                Create your RMA Portal account (Customer role).
              </p>
            </div>

            {/* Role Selection is REMOVED */}

            {/* Name Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.inputLabel}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your full name"
                required
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {/* Email Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your email"
                required
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.textInput}
                placeholder="Create a password"
                required
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {/* Confirm Password Input */}
            <div className={styles.inputGroupPassword}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.textInput}
                placeholder="Confirm your password"
                required
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <button
              type="submit"
              className={styles.registerButton}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              <div className={styles.registerButtonContent}>
                <UserPlus className="w-5 h-5" />
                Register as Customer
              </div>
            </button>
            <div className={ 
              message 
      ? (isSuccess ? styles.successMessage : styles.errorMessage) 
      : ''}>
              {message}
              </div>
            <div className={styles.backToLoginWrapper}>
              <a href="/login" className={styles.backToLoginLink}>
                Already have an account? Sign In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
