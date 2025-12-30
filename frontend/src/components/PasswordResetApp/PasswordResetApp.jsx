import React, { useState } from "react";
import { Mail, RefreshCw } from "lucide-react";
import styles from "./PasswordResetApp.module.css"; // Import the CSS Module
import { passwordResetHandle } from "./PasswordResetHandle";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    setTimeout(() => {
      passwordResetHandle({ email });
      setMessage("If the email exists, a reset link has been sent.");

      setIsSubmitting(false);
    }, 1000); // Simulate network delay
  };

  // Helper function for input focus/blur (retains style logic from original component)
  const handleInputFocus = (e) => {
    e.currentTarget.style.borderBottomColor = "#2c5364";
  };
  const handleInputBlur = (e) => {
    e.currentTarget.style.borderBottomColor = "#d1d5db";
  };

  // Helper function for button hover (retains style logic from original component)
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
          <form onSubmit={handleSubmit} className={styles.resetForm}>
            <div className={styles.header}>
              <div className={styles.logoWrapper}>
                <RefreshCw className={styles.logoIcon} />
              </div>
              <h2 className={styles.title}>Reset Password</h2>
              <p className={styles.subtitle}>
                Enter your email to receive a password reset link.
              </p>
            </div>

            {/* Display status message */}
            {message && <div className={styles.successMessage}>{message}</div>}

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
                disabled={isSubmitting}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <button
              type="submit"
              className={styles.resetButton}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              disabled={isSubmitting}
            >
              <div className={styles.resetButtonContent}>
                <Mail className="w-5 h-5" />
                {isSubmitting ? "Sending Request..." : "Send Reset Link"}
              </div>
            </button>

            <div className={styles.backToLoginWrapper}>
              <a href="/login" className={styles.backToLoginLink}>
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
