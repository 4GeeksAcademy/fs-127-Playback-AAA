const API_URL = import.meta.env.VITE_BACKEND_URL + "/api";

export const getProfileService = async (token) => {
  const res = await fetch(API_URL + "/user/profile", {
    headers: { Authorization: "Bearer " + token }
  });
  return res.json();
};

export const updateProfileService = async (token, data) => {
  const res = await fetch(API_URL + "/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updatePasswordService = async (token, data) => {
  const res = await fetch(API_URL + "/profile/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  });
  return res.json();
};