import emailjs from "@emailjs/browser";


const serviceID = import.meta.env.VITE_SERVICE_ID;
const publicKey = import.meta.env.VITE_PUBLIC_KEY;

export async function sendAnEmail(recipient, name, subject, message) {
  
// env variables

  const templateID = import.meta.env.VITE_TEMPLATE_ID_GENERIC;


  const templateParams = {
    to_email: recipient,
    subject: subject,
    message: message,
    name: name,
    
  };

  try {
    // We use await here, so the function must be marked 'async'
    const response = await emailjs.send(
      serviceID,
      templateID,
      templateParams,
      publicKey
    );
    console.log("Email sent successfully", response);
    return response;
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
}

export async function resetPasswordEmail(recipient, subject, link) {
  // env variables

  const templateID = import.meta.env.VITE_TEMPLATE_ID_PASSWORD_RESET;


  const templateParams = {
    to_email: recipient,
    subject: subject,
    link: link,
  };

  try {
    // We use await here, so the function must be marked 'async'
    const response = await emailjs.send(
      serviceID,
      templateID,
      templateParams,
      publicKey
    );
    console.log("Email sent successfully", response);
    return response;
  } catch (error) {
    console.error("Error sending email", error);
    throw error;
  }
}

