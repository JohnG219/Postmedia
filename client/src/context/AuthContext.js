// auth/AuthContext.js
import { createContext, useEffect, useReducer, useContext } from "react";
import AuthReducer from "./AuthReducer";
import axios from "axios";
import { FetchNotifications } from "./AuthActions";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isFetching: false,
  error: false,
  notifications: [], 
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    if (state.user) {
      // Fetch notifications when the user is available
      const fetchUserNotifications = async () => {
        try {
          const response = await axios.get(
            `/users/${state.user._id}/notifications`
          );
          dispatch(FetchNotifications(response.data));
        } catch (error) {
          console.error("Error fetching user notifications:", error);
        }
      };
      fetchUserNotifications();
    }
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
        notifications: state.notifications, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
