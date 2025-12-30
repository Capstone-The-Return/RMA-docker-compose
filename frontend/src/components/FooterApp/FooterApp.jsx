import style from "./FooterApp.module.css";

export default function FooterApp() {
  return (
    <footer className={style.footer}>
      <div className={style.content}>
        <div className={style.column}>
          <h3>About ELECTRONICS</h3>
          <p>
            Leading provider of quality electronic products with exceptional
            customer service and support.
          </p>
        </div>

        <div className={style.column}>
          <h3>Contact Us</h3>
          <p>Email: support@electronics.com</p>
          <p>Phone: 1-800-ELECTRONICS</p>
          <p>Hours: Mon–Fri 9AM–6PM</p>
        </div>

        <div className={style.column}>
          <h3>RMA Support</h3>
          <p>Need help with your return?</p>
          <p>
            Our team is here to assist you with any questions about your RMA
            request.
          </p>
        </div>
      </div>

      <div className={style.bottom}>
        © {new Date().getFullYear()} ELECTRONICS. All rights reserved. RMA System v1.0
      </div>
    </footer>
  );
}
