import { useState, useMemo } from "react";
import styles from "./CustomerFormApp.module.css";
import { createTicket } from '../../services/employeeTickets';

const CATEGORIES = ["Laptop", "Smartphone", "TV", "Home Appliance", "Accessory", "Other"];
const STORES = ["Thessaloniki", "Athens", "Larisa", "Patra", "Heraklion"];
const DEFAULT_PRIORITY = 'Low';

function twoYearsAgo() {
  let today = new Date();
  let month = today.getMonth();
  let day = today.getDate();
  let year = today.getFullYear();

  today.setFullYear(year - 2);

  // 29/02 
  if (month === 1 && day === 29 && today.getMonth() !== 1) {
    today.setMonth(1, 28);
  }

  return today;
}

function Warranty(purchaseDateStr) {
  /* Δεν υπάρχει ημερομηνία */
    if (!purchaseDateStr) {
    return { ok: false, reason: "missing_date", message: "Please provide the purchase date." };
  }

  let purchaseDate = new Date(purchaseDateStr);
  let today = new Date();
  //Μελοντική ημερομηνία 
  if (purchaseDate > today) {
    return { ok: false, reason: "future", message: "The purchase date cannot be in the future." };
  }

  let limitDate = twoYearsAgo();

  if (purchaseDate >= limitDate) {
    return { ok: true, reason: "in_warranty", message: "Product in warranty (within 2 years)." };
  } else {
    return {
      ok: false,
      reason: "out_of_warranty",
      message: "This product may be out of warranty (over 2 years). Your request will be reviewed.",
    };
  }
}

function RmaCode() {
  let year = new Date().getFullYear();
  let id = crypto.randomUUID();
  let shortId = id.slice(0, 8).toUpperCase();
  return "RMA-" + year + "-" + shortId;
}

async function fakeUpload(file) {
  if (file == null) return null;

  await new Promise((resolve) => setTimeout(resolve, 1500));

  let fileName = file.name;
  let smallName = fileName.toLowerCase();

  if (smallName.includes("fail")) {
    throw new Error("Something went wrong during uploading");
  }

  let fakeUrl = "https://myserver.local/uploads/" + encodeURIComponent(fileName);
  return { name: fileName, url: fakeUrl };
}

export default function CreateForm() {
  const [data, setData] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    purchaseDate: "",
    productCode: "",
    category: "",
    store: "",
    receiptNumber: "",
    requestType: "repair", //  προκαθορισμενο
    issueDescription: "",
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [result, setResult] = useState(null);

  const warrantyPreview = useMemo(() => {
    if (data.purchaseDate === "") return null;

    const w = Warranty(data.purchaseDate);
    if (w.ok === true) return "In Warranty";
    return "Not in Warranty. Needs review";
  }, [data.purchaseDate]);

  function onChange(e) {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;

    let newData = { ...data };
    newData[fieldName] = fieldValue;
    setData(newData);
  }

  function onFileChange(event) {
    let selectedFile = event.target.files[0];

    if (selectedFile == undefined) {
      setFile(null);
      return;
    }

    let maxLimit = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxLimit) {
      setMessage({ type: "error", text: "File is too big (max 5MB)." });
      event.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  function basicValid() {
    const required = [
      "name",
      "surname",
      "email",
      "phoneNumber",
      "purchaseDate",
      "productCode",
      "category",
      "store",
      "requestType",
      "issueDescription",
      //  receiptNumber είναι προαιρετικο αρα δεν μπαίνει εδώ
    ];

    for (const k of required) {
      let text = String(data[k] || "");
      let cleanText = text.trim();
      if (cleanText === "") return false;
    }

    let emailText = data.email.trim().toLowerCase();

    let hasAtSymbol = emailText.split("@").length === 2;
    let endsWithCom = emailText.endsWith(".com");
    let endsWithComGR = emailText.endsWith(".com.gr");
    let endsWithEduGr = emailText.endsWith(".edu.gr");

    return hasAtSymbol && (endsWithCom || endsWithComGR || endsWithEduGr);
  }

  async function submit({ continueWithoutFile }) {
    setSubmitting(true);
    setMessage(null);

    if (!basicValid()) {
      setSubmitting(false);
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    let uploaded = null;

    if (file && !continueWithoutFile) {
      try {
        uploaded = await fakeUpload(file);
      } catch (err) {
        setSubmitting(false);
        setUploadFailed(true);
        return;
      }
    }

    let w = Warranty(data.purchaseDate);

    // Δεν πρεπει να συνεχιζει με μελλοντικη ημερομηνια
    if (w.reason === "future") {
      setSubmitting(false);
      setMessage({ type: "error", text: w.message });
      return;
    }

    let warrantyStatus = "NeedsReview";
    if (w.ok === true) warrantyStatus = "InWarranty";

    let rmaCode = RmaCode();
    let trackingUrl = window.location.origin + "/track/" + rmaCode;

    let uploadUrl = null;
    if (uploaded) uploadUrl = uploaded.url; // 

    const ticketData = {
      rma: rmaCode,
      customer: { name: `${data.name} ${data.surname}` },
      product: { name: data.productCode },
      status: 'pending',
      record_type: data.requestType.toLowerCase(),
      issue: data.issueDescription,
      warranty: warrantyStatus,
      phone: data.phoneNumber,
      email: data.email,
      priority: DEFAULT_PRIORITY
    };

    await handleSubmit(ticketData, trackingUrl, uploadUrl);
  }

  const handleSubmit = async (ticketData, trackingUrl, uploadUrl) => {
      try {
        const response = await createTicket(ticketData);
        setMessage({ type: "success", text: "Your RMA request has been submitted successfully." });
        setResult({
          rmaCode: ticketData.rma,
          trackingUrl: trackingUrl,
          warrantyStatus: ticketData.warranty,
          uploadUrl: uploadUrl,
          customerName: ticketData.customer.name,
        });
      } catch (error) {
        setMessage({ type: "error", text: error.message || "Failed to submit RMA request." });
      }
      finally{
        setSubmitting(false);
        setUploadFailed(false);
      }
    };

  function reset() {
    setData({
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      purchaseDate: "",
      productCode: "",
      category: "",
      store: "",
      receiptNumber: "",
      requestType: "repair",
      issueDescription: "",
    });

    setFile(null);
    setMessage(null);
    setSubmitting(false);
    setUploadFailed(false);
    setResult(null);
  }

  // return μέσα στο component
  if (result) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h2>Confirmation</h2>

          {message && <div className={styles.alert}>{message.text}</div>}

          <p><b>Customer:</b> {result.customerName}</p>
          <p><b>RMA Code:</b> {result.rmaCode}</p>
          <p>
            <b>Tracking:</b> <a href={result.trackingUrl}>{result.trackingUrl}</a>
          </p>
          <p><b>Warranty Status:</b> {result.warrantyStatus}</p>
          <p><b>Attachment:</b> {result.uploadUrl ? "Uploaded" : "No file"}</p>

          <div className={styles.actions}>
            <button onClick={reset}>New Request</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2>Submit RMA Request</h2>

        {message && <div className={styles.alert}>{message.text}</div>}

        {uploadFailed && (
          <div className={styles.warnBox}>
            <p><b>Upload failed.</b> Retry or continue without file?</p>
            <div className={styles.actions}>
              <button disabled={submitting} onClick={() => submit({ continueWithoutFile: false })}>Retry</button>
              <button disabled={submitting} onClick={() => submit({ continueWithoutFile: true })}>Continue without file</button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submit({ continueWithoutFile: false }); }}>
          
          <div className={styles.grid}>

            {/*Ονομσ*/}
            <div className={styles.field}>
              <label className={styles.label}>Name <span className={styles.required}>*</span></label>
              <input className={styles.input} name="name" value={data.name} onChange={onChange} />
            </div>

            {/*επιθετο*/}
            <div className={styles.field}>
              <label className={styles.label}>Surname <span className={styles.required}>*</span></label>
              <input className={styles.input} name="surname" value={data.surname} onChange={onChange} />
            </div>

            {/*email*/}
            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input className={styles.input} name="email" type="email" value={data.email} onChange={onChange} />
            </div>

            {/*τηλεφωνο*/}
            <div className={styles.field}>
              <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
              <input className={styles.input} name="phoneNumber" value={data.phoneNumber} onChange={onChange} />
            </div>

            {/*Ημερομηνια*/}
            <div className={styles.field}>
              <label className={styles.label}>Purchase Date <span className={styles.required}>*</span></label>
              <input className={styles.input} type="date" name="purchaseDate" value={data.purchaseDate} onChange={onChange} />
            </div>

            {/*κωδικος προϊόντος*/}
            <div className={styles.field}>
              <label className={styles.label}>Product Code <span className={styles.required}>*</span></label>
              <input className={styles.input} name="productCode" value={data.productCode} onChange={onChange} />
            </div>

            {/*κατηγορία*/}
            <div className={styles.field}>
              <label className={styles.label}>Category <span className={styles.required}>*</span></label>
              <select className={styles.select} name="category" value={data.category} onChange={onChange}>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/*καταστημα*/}
            <div className={styles.field}>
              <label className={styles.label}>Store <span className={styles.required}>*</span></label>
              <select className={styles.select} name="store" value={data.store} onChange={onChange}>
                <option value="">Select store...</option>
                {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/*τυπος αιτηματος*/}
            <div className={styles.field}>
              <label className={styles.label}>Request Type <span className={styles.required}>*</span></label>
              <select className={styles.select} name="requestType" value={data.requestType} onChange={onChange}>
                <option value="repair">Repair</option>
                <option value="return">Return</option>
              </select>
            </div>

            {/*αριθμός απόδειξης*/}
            <div className={styles.field}>
              <label className={styles.label}>Receipt Number</label>
              <input className={styles.input} name="receiptNumber" value={data.receiptNumber} onChange={onChange} />
            </div>

            {/*περιγραφή προβληματος*/}
            {/* Πρόσεξε εδώ: Βάζω το class 'full' στο wrapper div, όχι στο textarea */}
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label}>Issue Description <span className={styles.required}>*</span></label>
              <textarea
                className={styles.textarea}
                name="issueDescription"
                value={data.issueDescription}
                onChange={onChange}
                rows={2}
              />
            </div>

          </div>

          {/*Προεπισκόπηση εγγύησης*/}
          {warrantyPreview && (
            <div className={styles.preview} style={{ marginTop: '14px' }}>
              Warranty Check: <b>{warrantyPreview}</b>
            </div>
          )}

          {/*ανέβασμα αρχείου*/}
          <div className={styles.field} style={{ marginTop: '14px' }}>
            <label className={styles.label}>Attachment (optional)</label>
            <input type="file" onChange={onFileChange} />
          </div>

          {/*κουμπιά*/}
          <div className={styles.actions}>
            <button type="submit" disabled={submitting} className={styles.btnPrimary}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" className={styles.btnSecondary} disabled={submitting} onClick={() => window.location.reload()}>
              Reset
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
