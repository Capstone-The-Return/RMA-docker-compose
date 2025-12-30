import { getAllUsers } from "../../services/getUsers";

export async function handleLogin({ email, password }) {
  try {
    const users = await getAllUsers();

    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (typeof foundUser !== "undefined") {
      return { authentication: true, role: foundUser.role };
    }

    return { authentication: false, role: null };
  } 
  
  catch (error) {
    console.error("Login failed:", error);
    return {
      authentication: false,
      role: null,
      error: "Server connection failed",
    };
  }
}
