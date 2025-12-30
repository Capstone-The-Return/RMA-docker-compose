import style from "./AsideApp.module.css";
import { Link } from "react-router-dom";

export default function AsideApp() {
  return (
    <aside className={style.container}>
      <p>aside content</p>
      {/* Προαιρετικά μπορείς να βάλεις links */}
      {/* <Link to="/somepath">Link example</Link> */}
    </aside>
  );
}
