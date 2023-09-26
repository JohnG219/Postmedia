import axios from "axios";

export const loginCall = async (userCredential, dispatch) => {
  console.log("Starting login...");
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("/auth/login", userCredential);
    console.log("Login success:", res);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
    return { success: true, data: res.data };
  } catch (err) {
    console.log("Login failure:", err);
    dispatch({ type: "LOGIN_FAILURE", payload: err });
    return { success: false, error: err.message };
  }
};
