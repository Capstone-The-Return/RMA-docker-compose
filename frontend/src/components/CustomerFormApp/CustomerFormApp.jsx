import { useState, useMemo } from "react";
import Snowfall from "react-snowfall";
import styles from "./CustomerFormApp.module.css";
import flakeA from "../../assets/snowflake.png";
import flakeB from "../../assets/snowflake (1).png";
import flakeC from "../../assets/snowflake (2).png";
import flakeD from "../../assets/snowflake (3).png";
import winter from "../../assets/winter.png";
import { createTicket } from '../../services/employeeTickets';

const CATEGORIES = ["Laptop", "Smartphone", "TV", "Home Appliance", "Accessory", "Other"];
const STORES = ["Thessaloniki", "Athens", "Larisa", "Patra", "Heraklion", "Online Store"];

/* labels για να βγαίνει name is required */
const FIELD_LABELS = {
  name: "Name",
  surname: "Surname",
  email: "Email",
  phoneNumber: "Phone Number",
  purchaseDate: "Purchase Date",
  productCode: "Product Code",
  category: "Category",
  store: "Store",
  requestType: "Request Type",
  issueDescription: "Issue Description",
};

/* Απαιτουμενα πεδια */
const REQUIRED_FIELDS = [
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
];

/* Βοηθητικές συναρτησεις */


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
  if (!purchaseDateStr) {
    return { ok: false, reason: "missing_date", message: "Please provide the purchase date." };
  }

  let purchaseDate = new Date(purchaseDateStr);
  let today = new Date();
  // μελλοντική ημερομηνία στην επισκευή
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

function checkReturn(purchaseDateStr) {
  if (!purchaseDateStr) {
    return { ok: false, message: "Please select the purchase date to check return eligibility." };
  }

  let purchaseDate = new Date(purchaseDateStr);
  let today = new Date();

  purchaseDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  if (purchaseDate > today) {
    //μελλοντική ημερομηνία στην επιστροφή
    return { ok: false, message: "The purchase date cannot be in the future." };
  }

  let diffTime = today - purchaseDate;
  let daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (daysPassed <= 14) {
    return { ok: true, message: "Eligible for return (within 14 days)." };
  } else {
    return { ok: false, message: "Not eligible for return (more than 14 days)." };
  }
}

function RmaCode() {
  let year = new Date().getFullYear();

  let id;
  if (crypto.randomUUID) {
    id = crypto.randomUUID();
  } else {
    // fallback for HTTP or older browsers
    id = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

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

function EmailCheckZontana(email) {
  let t = (email || "").trim().toLowerCase();

  if (t === "") return "Email is required.";

  if (t.split("@").length !== 2) {
    return "Email must contain exactly one @ symbol.";
  }

  if (!(t.endsWith(".com") || t.endsWith(".com.gr") || t.endsWith(".edu.gr") || t.endsWith(".gr"))) {
    return "Email must end with .com or .com.gr or .edu.gr or .gr.";
  }

  return "";
}

/**  Advanced required message */
function requiredMsg(fieldName) {
  let label = FIELD_LABELS[fieldName] || fieldName;
  return label + " is required.";
}

function checkRequired(fieldName, value) {
  let v = String(value || "").trim();
  if (v === "") return requiredMsg(fieldName);
  return "";
}

/* component */
// ΧΙΟΝΙ
export function SnowEffect() {
  const images = useMemo(() => {
    const makeImg = (src, size) => {
      const img = new Image();
      img.src = src;
      img.width = size;
      img.height = size;
      return img;
    };
    const small = [
      makeImg(flakeA, 16),
      makeImg(flakeB, 16),
      makeImg(flakeC, 16),
    ];

    const big = [
    makeImg(flakeD, 28),   // <- πιο μεγάλη σε σχέση με τις άλλες
    makeImg(winter, 32),   // <- πιο μεγάλη -//- 
  ];


    
  return [...small, ...big] //τις επστρέφω εδώ όλες
    
  }, []);

  return <Snowfall images={images} snowflakeCount={250} />;
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
    requestType: "repair",
    issueDescription: "",
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [result, setResult] = useState(null);

  const [emailError, setEmailError] = useState("");

  /*  field errors για όλα τα required fields */
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    purchaseDate: "",
    productCode: "",
    category: "",
    store: "",
    requestType: "",
    issueDescription: "",
  });

  const warrantyPreview = useMemo(() => {
    if (data.purchaseDate === "" || data.requestType !== "repair") return null;

    const w = Warranty(data.purchaseDate);
    if (w.ok === true) return "In Warranty";
    return "Not in Warranty. Needs review";
  }, [data.purchaseDate, data.requestType]);

  const returnStatus = useMemo(() => {
    if (data.requestType !== "return" || data.purchaseDate === "") return null;
    return checkReturn(data.purchaseDate);
  }, [data.purchaseDate, data.requestType]);

  function onChange(e) {
    let fieldName = e.target.name;
    let fieldValue = e.target.value;

    // phone: μόνο ψηφία, +, κενό
    if (fieldName === "phoneNumber") {
      for (let i = 0; i < fieldValue.length; i++) {
        let ch = fieldValue[i];
        let isDigit = ch >= "0" && ch <= "9";
        let isPlus = ch === "+";
        let isSpace = ch === " ";
        if (!isDigit && !isPlus && !isSpace) return;
      }

      // μόνο 1 +
      let count = 0;
      for (let i = 0; i < fieldValue.length; i++) {
        if (fieldValue[i] === "+") count++;
      }
      if (count > 1) return;
      if (count === 1 && fieldValue[0] !== "+") return;
    }

    // update data
    let newData = { ...data };
    newData[fieldName] = fieldValue;
    setData(newData);

    //  live email error
    if (fieldName === "email") {
      let minima = EmailCheckZontana(fieldValue);
      setEmailError(minima);
      let msg = checkRequired("email", fieldValue);
      setFieldErrors({ ...fieldErrors, email: msg });
      return;
    }

    //  ζωντανα required errors για τα required fields
    if (REQUIRED_FIELDS.includes(fieldName)){
      let msg = checkRequired(fieldName, fieldValue);
      setFieldErrors({ ...fieldErrors, [fieldName]: msg });
    }

  }

  /*  onBlur: όταν φευφω από το field αν είναι κενό  δείχνει required */
  function onBlur(e) {
    let fieldName = e.target.name;

    // χειριζομαι το email ξεχωριστα
    if (fieldName === "email") {
      let msg= checkRequired("email", data.email);
      setFieldErrors({ ...fieldErrors, email: msg });
      setEmailError(EmailCheckZontana(data.email));
      return;
  }
  if (!REQUIRED_FIELDS.includes(fieldName)) return;
  let msg = checkRequired(fieldName, data[fieldName]);
  setFieldErrors({ ...fieldErrors, [fieldName]: msg });

}


  function onFileChange(event) {
    let selectedFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;

    if (!selectedFile) {
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

  /* επικυρώνω όλα τα απαιτούμενα πεδία πριν την υποβολή */
  function validateAllRequired() {
    let newErrors = { ...fieldErrors };
    let ok = true;

    for (let i = 0; i < REQUIRED_FIELDS.length; i++) {
      let key = REQUIRED_FIELDS[i];

      let msg = checkRequired(key, data[key]);
      newErrors[key] = msg;
      if (msg !== "") ok = false;
    }

    setFieldErrors(newErrors);
    return ok;
  }

  async function submit({ continueWithoutFile }) {
    setSubmitting(true);
    setMessage(null);

    // required fields
    if (!validateAllRequired()) {
      setSubmitting(false);
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    // email validation
    let eErr = EmailCheckZontana(data.email);
    setEmailError(eErr);
    if (eErr !== "") {
      setSubmitting(false);
      setMessage({ type: "error", text: "Please fix the email field." });
      return;
    }

    // upload
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

    // status
    let finalStatus = "";
    let in_warranty = false;

    if (data.requestType === "repair") {
      let w = Warranty(data.purchaseDate);

      if (w.reason === "future") {
        setSubmitting(false);
        setMessage({ type: "error", text: w.message });
        return;
      }

      finalStatus = w.ok ? "In warranty" : "Not in warranty. Needs review";
      in_warranty = w.ok;
    }

    if (data.requestType === "return") {
      let r = checkReturn(data.purchaseDate);

      if (r.ok === false) {
        setSubmitting(false);
        setMessage({ type: "error", text: r.message });
        return;
      }

      finalStatus = "Eligible for return (within 14 days)";
      in_warranty = r.ok;
    }

    // create result
    let rmaCode = RmaCode();
    let trackingUrl = window.location.origin + "/track/" + rmaCode;

    let uploadUrl = null;
    if (uploaded) uploadUrl = uploaded.url;

    setResult({
      rmaCode: rmaCode,
      trackingUrl: trackingUrl,
      statusText: finalStatus,
      uploadUrl: uploadUrl,
      customerName: data.name + " " + data.surname,
      requestType: data.requestType,
    });
    const ticketData = {
      rma: rmaCode,
      customer: { name: `${data.name} ${data.surname}` },
      product: { name: data.productCode, category: data.category },
      status: 'pending',
      record_type: data.requestType.toLowerCase(),
      issue: data.issueDescription,
      warranty: in_warranty,
      phone: data.phoneNumber,
      email: data.email,
      priority: DEFAULT_PRIORITY,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      purchase_date : data.purchaseDate,
      store: data.store
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
          warrantyStatus: ticketData.in_warranty,
          uploadUrl: uploadUrl,
          customerName: ticketData.customer.name,
        });
      } catch (error) {
        setMessage({ type: "error", text: error.message || "Failed to submit RMA request." });
      }
      finally{
    setSubmitting(false);
    setUploadFailed(false);
    setMessage({ type: "success", text: "Your RMA request has been submitted successfully." });
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
    setEmailError("");

    setFieldErrors({
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      purchaseDate: "",
      productCode: "",
      category: "",
      store: "",
      requestType: "",
      issueDescription: "",
    });
  }

  /* UI */

  if (result) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h2>Confirmation</h2>

          {message && <div className={styles.alert}>{message.text}</div>}

          <p><b>Customer:</b> {result.customerName}</p>
          <p><b>RMA Code:</b> {result.rmaCode}</p>
          <p><b>Request Type: </b>{result.requestType}</p>

          <p>
            <b>Tracking:</b> <a href={result.trackingUrl}>{result.trackingUrl}</a>
          </p>

          {result.requestType === "repair" && (
            <p><b>Warranty Status: </b>{result.statusText}</p>
          )}

          {result.requestType === "return" && (
            <p><b>Return Status: </b>{result.statusText}</p>
          )}

          <p><b>Attachment:</b> {result.uploadUrl ? "Uploaded" : "No file"}</p>

          <div className={styles.actions}>
            <button onClick={reset} className={styles.btnPrimary}>New Request</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Χιονι */}
      <div className={styles.snowContainer}>
        <SnowEffect />
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Submit RMA Request</h2>

        {message && <div className={styles.alert}>{message.text}</div>}

        {uploadFailed && (
          <div className={styles.warnBox}>
            <p><b>Upload failed.</b> Retry or continue without file?</p>
            <div className={styles.actions}>
              <button disabled={submitting} onClick={() => submit({ continueWithoutFile: false })} className={styles.btnPrimary}>
                Retry
              </button>
              <button disabled={submitting} onClick={() => submit({ continueWithoutFile: true })} className={styles.btnSecondary}>
                Continue without file
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submit({ continueWithoutFile: false }); }}>
          <div className={styles.grid}>

            {/* Name */}
            <div className={styles.field}>
              <label className={styles.label}>Name <span className={styles.required}>*</span></label>
              <input className={styles.input} name="name" value={data.name} onChange={onChange} onBlur={onBlur} />
              {fieldErrors.name !== "" && <div className={styles.error}>{fieldErrors.name}</div>}
            </div>

            {/* Surname */}
            <div className={styles.field}>
              <label className={styles.label}>Surname <span className={styles.required}>*</span></label>
              <input className={styles.input} name="surname" value={data.surname} onChange={onChange} onBlur={onBlur} />
              {fieldErrors.surname !== "" && <div className={styles.error}>{fieldErrors.surname}</div>}
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input className={styles.input} name="email" type="email" value={data.email} onChange={onChange} onBlur={onBlur} />
              {/*Required error */}
              {fieldErrors.email !== "" && (
                <div className={styles.error}>{fieldErrors.email}</div>
              )}
              { /* Format error (μονο αν δεν υπαρχει required error) */}
              {fieldErrors.email === "" && emailError !== "" && (
                <div className={styles.error}>{emailError}</div>
              )

              }
            </div>

            {/* Phone */}
            <div className={styles.field}>
              <label className={styles.label}>Phone Number <span className={styles.required}>*</span></label>
              <input className={styles.input} name="phoneNumber" value={data.phoneNumber} onChange={onChange} onBlur={onBlur} />
              {fieldErrors.phoneNumber !== "" && <div className={styles.error}>{fieldErrors.phoneNumber}</div>}
            </div>

            {/* Purchase Date */}
            <div className={styles.field}>
              <label className={styles.label}>Purchase Date <span className={styles.required}>*</span></label>
              <input className={styles.input} type="date" name="purchaseDate" value={data.purchaseDate} onChange={onChange} onBlur={onBlur} />
              {fieldErrors.purchaseDate !== "" && <div className={styles.error}>{fieldErrors.purchaseDate}</div>}
            </div>

            {/* Product Code */}
            <div className={styles.field}>
              <label className={styles.label}>Product Code <span className={styles.required}>*</span></label>
              <input className={styles.input} name="productCode" value={data.productCode} onChange={onChange} onBlur={onBlur} />
              {fieldErrors.productCode !== "" && <div className={styles.error}>{fieldErrors.productCode}</div>}
            </div>

            {/* Category */}
            <div className={styles.field}>
              <label className={styles.label}>Category <span className={styles.required}>*</span></label>
              <select className={styles.select} name="category" value={data.category} onChange={onChange} onBlur={onBlur}>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {fieldErrors.category !== "" && <div className={styles.error}>{fieldErrors.category}</div>}
            </div>

            {/* Store */}
            <div className={styles.field}>
              <label className={styles.label}>Store <span className={styles.required}>*</span></label>
              <select className={styles.select} name="store" value={data.store} onChange={onChange} onBlur={onBlur}>
                <option value="">Select store...</option>
                {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {fieldErrors.store !== "" && <div className={styles.error}>{fieldErrors.store}</div>}
            </div>

            {/* Request Type */}
            <div className={styles.field}>
              <label className={styles.label}>Request Type <span className={styles.required}>*</span></label>
              <select className={styles.select} name="requestType" value={data.requestType} onChange={onChange} onBlur={onBlur}>
                <option value="repair">Repair</option>
                <option value="return">Return</option>
              </select>
              {fieldErrors.requestType !== "" && <div className={styles.error}>{fieldErrors.requestType}</div>}
            </div>

            {/* Receipt (optional) */}
            <div className={styles.field}>
              <label className={styles.label}>Receipt Number</label>
              <input className={styles.input} name="receiptNumber" value={data.receiptNumber} onChange={onChange} />
            </div>

            {/* Issue Description (full width) */}
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label}>Issue Description <span className={styles.required}>*</span></label>
              <textarea
                className={styles.textarea}
                name="issueDescription"
                value={data.issueDescription}
                onChange={onChange}
                onBlur={onBlur}
                rows={2}
              />
              {fieldErrors.issueDescription !== "" && <div className={styles.error}>{fieldErrors.issueDescription}</div>}
            </div>

          </div>

          {/* Warranty preview */}
          {warrantyPreview && (
            <div className={styles.preview} style={{ marginTop: "14px" }}>
              Warranty Check: <b>{warrantyPreview}</b>
            </div>
          )}

          {/* Return preview */}
          {returnStatus && (
            <div className={styles.preview} style={{ marginTop: "14px" }}>
              Return Check: <b>{returnStatus.message}</b>
            </div>
          )}

          {/* Attachment */}
          <div className={styles.field} style={{ marginTop: "14px" }}>
            <label className={styles.label}>Attachment (optional)</label>
            <input type="file" onChange={onFileChange} />
          </div>

          {/* Buttons */}
          <div className={styles.actions}>
            <button type="submit" disabled={submitting} className={styles.btnPrimary}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
            <button type="button" className={styles.btnSecondary} disabled={submitting} onClick={reset}>
              Reset
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
