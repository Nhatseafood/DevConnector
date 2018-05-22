import axios from "axios";
import setAuthToken from "../utils/setAuthToken";

import { GET_ERRORS } from "./types";

// Register User

export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(response => history.push("./login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Login Get user token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(response => {
      // Save to local storage
      const { token } = response.data;
      //Set token to local storae
      localStorage.setItem("jwtToken", token);
      // Set to auth header
      setAuthToken(token);
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
