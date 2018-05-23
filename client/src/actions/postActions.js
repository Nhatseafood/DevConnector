import axios from "axios";

import { ADD_POST, GET_ERRORS } from "./types";

// Add Post
export const addPost = postData => dispatch => {
  dispatch(clearErrors());
  axios
    .post("/api/posts", postData)
    .then(response =>
      dispatch({
        type: ADD_POST,
        payload: response.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};
