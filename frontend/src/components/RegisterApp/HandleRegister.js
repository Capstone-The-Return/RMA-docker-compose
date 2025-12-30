import { getAllUsers } from "../../services/getUsers";

function addUser(name, email, password) {
  // const newUser = {
  //   id: users.users.length + 1,
  //   name: name,
  //   email: email,
  //   password: password,
  //   role: "customer",
  // };
   // Note: It does not persist to the JSON file as this is a mock database.
   console.log("TESTING User added:", { name, email, password, role: "customer" });
   
}
async function isEmailRegistered(email) {
  const allUsers = await getAllUsers();
  const foundUser = allUsers.find((user) => user.email === email);
  console.log(foundUser);
  if (typeof foundUser !== "undefined") {
    
    return true;
  }
  
  return false;
}

export async function handleRegister(name, email, password, confirmPassword) {
  if (password !== confirmPassword) {
    return { isSuccess: false, message: "Passwords do not match." };
  }
  console.log(await isEmailRegistered(email));
  if (await isEmailRegistered(email)) {
    return { isSuccess: false, message: "Email is already registered." };
  } else {
    addUser(name, email, password);
    return { isSuccess: true, message: "Registration successful." };
  }
}
