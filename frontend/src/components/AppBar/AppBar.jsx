import styles from "./AppBar.module.css";
import electronicsIcon from "../../assets/electronics_icon.png";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";
// import { Link } from "lucide-react";
import { Link } from "react-router-dom";

export default function AppBar() {
  const [open, setOpen] = useState(false);

  const handleLogoutClick = () => {
    window.location.href = "/login";
  };

  return (
    <header className={styles.container}>
      <div className={styles["logo-wrapper"]}>
        <Link to="/">
        <img src={electronicsIcon} className={styles.icon} alt="Electronics Icon" />
        </Link>
        <h1 className={styles.headertext}>Electronics Company</h1>
      </div>

      <div
        className={styles.logoutButton}
        onClick={handleLogoutClick}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <FiLogOut size={28} />
        {open && <span>Login/Logout</span>}
      </div>
    </header>
  );
}
