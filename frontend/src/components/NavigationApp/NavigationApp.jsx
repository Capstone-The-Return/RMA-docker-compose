import { useState } from "react";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiSearch,
  FiList,
  FiTool,
  FiMenu,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import style from "./NavigationApp.module.css";

export default function NavigationApp() {
  const [open, setOpen] = useState(true);

  return (
    <nav className={`${style.container} ${open ? style.open : style.closed}`}>
      {/* Toggle Button */}
      <button className={style.toggleBtn} onClick={() => setOpen(!open)}>
        <FiMenu size={22} />
      </button>

      <ul className={style.menuList}>
        <li className={style.menuItem}>
          <FiHome className={style.icon} />
          {open && <span>Home Page</span>}
        </li>

        <li className={style.menuItem}>
          <FiUser className={style.icon} />
          {open && <span>Profile</span>}
        </li>
        <li className={style.menuItemLogout}>
          <FiFileText className={style.icon} />
          <Link
            to="/customer-view-request"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {open && <span>Submit Requests</span>}
          </Link>
        </li>
        <li className={style.menuItemLogout}>
          <FiSearch className={style.icon} />
          {open && <span>View Request</span>}
        </li>
        <li className={style.menuItemLogout}>
          <FiList className={style.icon} />
          {open && <span>Request List</span>}
        </li>
        <li className={style.menuItemLogout}>
          <FiTool className={style.icon} />
          {open && <span>Tech Center</span>}
        </li>
        <li className={style.menuItem}>
          <FiSettings className={style.icon} />
          {open && <span>Setup</span>}
        </li>
        <li
          className={style.menuItemLogout}
          onClick={() => (window.location.href = "/login")}
        >
          <FiLogOut className={style.icon} />
          {open && <span>Login/Logout</span>}
        </li>
      </ul>
    </nav>
  );
}
