import axios from "axios";
import { useRef, useContext, useState } from "react";
import "./register.css";
import { useHistory } from "react-router";
import { CircularProgress } from "@material-ui/core";
import { AuthContext } from "../../context/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function Register() {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const [selectedSex, setSelectedSex] = useState("");
  const history = useHistory();
  const { isFetching } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [timeoutFinished, setTimeoutFinished] = useState(false);
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    if (passwordAgain.current.value !== password.current.value) {
      passwordAgain.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        username: username.current.value,
        email: email.current.value,
        password: password.current.value,
        sex: selectedSex,
      };
      try {
        setIsLoading(true);
        setIsFormDisabled(true);
        await axios.post("/auth/register", user);
        setIsTimeoutActive(true); // Timeout has started
        setTimeout(() => {
          setShowSuccessAlert(true);
        }, 13000);
        setTimeout(() => {
          setIsLoading(false);
          setIsFormDisabled(false);
          setIsTimeoutActive(false); // Timeout has ended
          history.push("/");
        }, 15000);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
        setIsFormDisabled(false);
        setIsTimeoutActive(false);
      }
    }
  };

  const handlePasswordInput = () => {
    passwordAgain.current.setCustomValidity("");
  };

  return (
    <div className={`login ${isTimeoutActive ? "timeoutActive" : ""}`}>
      <div className="loginWrapper">
        <div className="loginLeft1">
          <img className="worldpeoples" src="assets/gift.png" alt="" />
          <h3 className="loginLogo1">PostMedia</h3>
          <span className="loginDesc1">
            Connect with friends and the world
            around you on PostMedia
          </span>
        </div>
        <div className="loginRight">
          <Snackbar
            open={showSuccessAlert}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MuiAlert elevation={6} variant="filled" severity="success">
              Registration successful! You can now log in
            </MuiAlert>
          </Snackbar>
          <form
            className={`loginBox1 ${
              isTimeoutActive ? "timeoutActiveForm" : ""
            }`}
            onSubmit={handleClick}
          >
            <input
              placeholder="Name"
              required
              ref={username}
              className="loginInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="loginInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="loginInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Confirm Password"
              required
              ref={passwordAgain}
              className="loginInput"
              type="password"
              onInput={handlePasswordInput}
            />
            <select
              className="loginInput"
              value={selectedSex}
              onChange={(e) => setSelectedSex(e.target.value)}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value={1}>Male</option>
              <option value={2}>Female</option>
            </select>
            <button
              className="loginButton"
              type="submit"
              disabled={isFetching || isLoading || isFormDisabled}
            >
              {isLoading ? (
                <CircularProgress color="white" size="20px" />
              ) : (
                "Sign up"
              )}
            </button>
            <button
              className="loginRegisterButton"
              onClick={() => history.push("/")}
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
