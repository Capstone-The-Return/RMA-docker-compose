import AppBar from "../../components/AppBar/AppBar";
import FooterApp from "../../components/FooterApp/FooterApp";
import MainPageApp from "../../components/MainPageApp/MainPageApp";
import style from "./MainPage.module.css";
import Slider from "../../components/MainPageApp/Slider";
import FormMain from "../../components/MainPageApp/FormMain";

export default function MainPage() {
  return (
    <>
      <AppBar />
      <div className={style.layout}>
        <div className={style.mainContent}>
          <Slider />
          <MainPageApp />
        </div>

      </div>
      <div className={style.bottomForm}>
        <FormMain />
      </div>

      <FooterApp />
    </>
  );
}