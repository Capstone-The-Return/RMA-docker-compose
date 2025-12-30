import FooterApp from "../../components/FooterApp/FooterApp";
import TechnicalApp from "../../components/TechnicalApp/TechnicalApp";
import AppBar from "../../components/AppBar/AppBar";

import "./TechnicalPage.css";

export default function TechnicalPage() {
    return (
        <div className="page">
            <AppBar />

            <main className="content">
                <TechnicalApp />
            </main>

            <FooterApp />
        </div>
    );
}