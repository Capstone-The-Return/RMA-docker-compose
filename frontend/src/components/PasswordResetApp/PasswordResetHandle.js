import { resetPasswordEmail } from "../../services/emailService";
import { getAllUsers } from "../../services/getUsers";
export async function passwordResetHandle({ email }) {
  const allUsers = await getAllUsers();
  const foundUser = allUsers.find((user) => user.email === email);
  if (typeof foundUser === "undefined") {
    console.log("Email not found:", email);
    return;
  } else if (foundUser.email === email) {
    console.log("Email found, Password reset email sent to:", email);
    resetPasswordEmail({ email }, "Password Reset Request", "testlink12345 ");
    return;
  }
}
