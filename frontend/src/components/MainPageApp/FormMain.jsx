import style from "./FormMain.module.css";

export default function FormMain() {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Thank you! Our passionate team will contact you soon.");
    };

    return (
        <div className={style.formsWrapper}>
            {/* 1. Search RMA Section  */}
            <div className={style.card}>
                <h3 className={style.contactTitle}>Search RMA</h3>
                <p className={style.contactText}>Enter your ticket number to track your repair/return status.</p>
                <div className={style.formGroup}>
                    <label className={style.label}>Ticket Number</label>
                    <input type="text" placeholder="RMA-12345" className={style.input} />
                </div>
                <button className={style.searchBtn}>Track Status</button>
            </div>

            {/* 2. Quick Support Section */}
            <div className={style.card}>
                <h3 className={style.contactTitle}>Quick Support</h3>
                <p className={style.contactText}>Please fill in your details so we can contact you immediately.</p>
                <form className={style.form} onSubmit={handleSubmit}>
                    <div className={style.formGroup}>
                        <label className={style.label}>Email Address</label>
                        <input type="email" placeholder="example@mail.com" className={style.input} required />
                    </div>
                    <div className={style.formGroup}>
                        <label className={style.label}>Your Message</label>
                        <textarea placeholder="Describe your issue here..." className={style.textarea} required></textarea>
                    </div>
                    <button type="submit" className={style.submitBtn}>Send Message</button>
                </form>
            </div>
        </div>
    );
}