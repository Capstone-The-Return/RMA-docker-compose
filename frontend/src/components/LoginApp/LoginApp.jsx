import { useState } from "react";
import { Package, LogIn } from "lucide-react";
import styles from "./LoginApp.module.css"; 
import { handleLogin } from "./HandleLogin.js";
import { useNavigate } from "react-router-dom";

export default function LoginApp() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState(null); // null, 'success', 'failure'
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginSuccess = await handleLogin({ email, password });


    if (loginSuccess.authentication) {
    
      
      setLoginStatus("success");
      navigate(`/${loginSuccess.role}Dashboard`);
      
    } else {
      
      setLoginStatus("failure");
    }
  };

 
  // Helper function for input focus/blur (retains logic from original component)
  const handleInputFocus = (e) => {
    e.currentTarget.style.borderBottomColor = "#2c5364";
  };
  const handleInputBlur = (e) => {
    e.currentTarget.style.borderBottomColor = "#d1d5db";
  };

  // Helper function for button hover (retains logic from original component)
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
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.header}>
              <div className={styles.logoWrapper}>
                <Package className={styles.logoIcon} />
              </div>
              <h2 className={styles.title}>Login</h2>
              <p className={styles.subtitle}>
                Return Merchandise Authorization Portal
              </p>
            </div>

        
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your email (employee@example.com)"
                required
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div className={styles.inputGroupPassword}>
              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.textInput}
                placeholder="Enter your password"
                required
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            <p>
              {loginStatus === "failure" ? "Wrong email or password." : ""}{" "}
            </p>
            <button
              type="submit"
              className={styles.loginButton}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              <div className={styles.loginButtonContent}>
                <LogIn className="w-5 h-5" />
                Login
              </div>
            </button>

            <button
              onClick={() => navigate(`/register`)}
              className={styles.loginButton}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              <div className={styles.loginButtonContent}>
                <LogIn className="w-5 h-5" />
                Register
              </div>
            </button>

            <div className={styles.forgotPasswordWrapper}>
              <button
                type="button"
                onClick={() => navigate(`/resetPasswordPage`)}
                className={styles.forgotPasswordButton}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
