export const getLocalUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing localStorage:", error);
    return null;
  }
};

export const removeLocalUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // sessionStorage.clear();
};
