import style from "./MainPageApp.module.css";

export default function MainPageApp() {


  return (
    <div className={style.container}>
      {/* Header Row: Τίτλος και Login Button */}
      <div className={style.headerRow}>
        <h2 className={style.title}>Welcome to Electronics Service & Returns Portal</h2>
        
      </div>
      
      <p className={style.description}>
        Welcome to our new digital platform! We designed this site to improve your experience with returns and repairs, making every request faster, more direct, and fully transparent.
      </p>

      {/* Features Grid: Γιατί να μας προτιμήσετε */}
      <div className={style.featuresContainer}>
        <h3 className={style.featuresMainTitle}>Why use our portal?</h3>
        
        <div className={style.featuresGrid}>
          
          {/* Κάρτα Ταχύτητας */}
          <div className={style.featureCard + " " + style.speedBorder}>
            <h4>Speed</h4>
            <p>Direct communication with our technical centers for faster processing.</p>
          </div>

          {/* Κάρτα Διαφάνειας */}
          <div className={style.featureCard + " " + style.transparencyBorder}>
            <h4>Transparency</h4>
            <p>Know exactly where your device is at any moment in real-time.</p>
          </div>

          {/* Κάρτα Αποδοτικότητας */}
          <div className={style.featureCard + " " + style.efficiencyBorder}>
            <h4>Efficiency</h4>
            <p>No more manual forms, endless phone calls, or lost paperwork.</p>
          </div>

        </div>
      </div>
    </div>
  );
}