import { useContext, useRef, useState } from "react";
import "./login.css";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@material-ui/core";
import { useHistory } from "react-router";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const history = useHistory();
  const [error, setError] = useState("");

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const response = await loginCall(
        {
          email: email.current.value,
          password: password.current.value,
        },
        dispatch
      );
      if (response.success) {
      } else {
        setError("Invalid email or password"); 
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again later.");
    }
  };


  const handleRegisterClick = () => {
    history.push("/register");
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">PostMedia</h3>
          <span className="loginDesc">
            Connect with friends and the world around you on PostMedia.
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            <input
              placeholder="Email"
              type="email"
              required
              className="loginInput1"
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength="6"
              className="loginInput1"
              ref={password}
            />
            {error && <p className="loginError">{error}</p>}
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? (
                <CircularProgress color="white" size="20px" />
              ) : (
                "Log In"
              )}
            </button>
            <span className="loginForgot">Forgot Password?</span>
            <button
              className="loginRegisterButton"
              onClick={handleRegisterClick}
            >
              Create a New Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
