import style from "./MainPageApp.module.css";

export default function MainPageApp() {
  return (
    <div className={style.container}>
      
      {/* 1. WELCOME SECTION */}
      <div className={style.introSection}>
          <div className={style.headerRow}>
            <h2 className={style.title}>Welcome to Electronics Service & Returns Portal</h2>
          </div>
          
          <p className={style.description}>
            Welcome to our new digital platform! We designed this site to improve your experience with returns and repairs, making every request faster, more direct, and fully transparent.
          </p>
      </div>

      {/* 2. FEATURES GRID */}
      <div className={style.featuresContainer}>
        <h3 className={style.featuresMainTitle}>Why use our portal?</h3>
        
        <div className={style.featuresGrid}>
          
          {/* Speed Card */}
          <div className={style.featureCard + " " + style.speedBorder}>
            <h4>Speed</h4>
            <p>Direct communication with our technical centers for faster processing.</p>
          </div>

          {/* Transparency Card */}
          <div className={style.featureCard + " " + style.transparencyBorder}>
            <h4>Transparency</h4>
            <p>Know exactly where your device is at any moment in real-time.</p>
          </div>

          {/* Efficiency Card */}
          <div className={style.featureCard + " " + style.efficiencyBorder}>
            <h4>Efficiency</h4>
            <p>No more manual forms, endless phone calls, or lost paperwork.</p>
          </div>

        </div>
      </div>

      {/* 3. TRUST INDICATORS SECTION */}
      <div className={style.trustSection}>
        <h3 className={style.trustMainTitle}>Why choose Electronics for repairs?</h3>
        
        <div className={style.trustGrid}>
          
          {/* Icon 1 */}
          <div className={style.trustItem}>
            <div className={style.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <p>Expert<br/>Technicians</p>
          </div>

          {/* Icon 2 */}
          <div className={style.trustItem}>
            <div className={style.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <p>Fast<br/>Turnaround</p>
          </div>

          {/* Icon 3 */}
          <div className={style.trustItem}>
            <div className={style.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <p>Genuine<br/>Parts</p>
          </div>

          {/* Icon 4 */}
          <div className={style.trustItem}>
            <div className={style.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <p>Service<br/>Warranty</p>
          </div>

          {/* Icon 5 */}
          <div className={style.trustItem}>
            <div className={style.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <p>Data<br/>Security</p>
          </div>

        </div>
      </div>

    </div>
  );
}