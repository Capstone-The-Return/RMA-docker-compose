const BASE = "http://localhost:3000/users";

export const getAllUsers = async () => {
  const res = await fetch(BASE);
  
  return res.json();
};