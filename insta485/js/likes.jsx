import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const like = (
  postid,
  numLikes,
  setNumLikes,
  setLognameLikesThis,
  setLikeUrl
) => {
  let url = "/api/v1/likes/?postid=" + String(postid);

  fetch(url, { method: "POST" })
    .then((response) => {
      if (!response.ok) throw Error(response.statusText);
      return response.json();
    })
    .then((data) => {
      // If ignoreStaleRequest was set to true, we want to ignore the results of the
      // the request. Otherwise, update the state to trigger a new render.
      setLikeUrl(data.url);
      setNumLikes(numLikes + 1);
      setLognameLikesThis(true);
    })
    .catch((error) => console.log(error));
};

const unlike = (url, numLikes, setLikes, setLognameLikesThis, setLikeUrl) => {
  fetch(url, { method: "DELETE" })
    .then((response) => {
      setLikes(numLikes - 1);
      setLognameLikesThis(false);
      setLikeUrl("");
    })
    .catch((error) => console.log(error));
};

export default function Likes({
  post,
  imgUrl,
  numLikes,
  lognameLikesThis,
  likeUrl,
  setNumLikes,
  setLognameLikesThis,
  setLikeUrl,
}) {
  let likes_component;
  let likes_button;
  let img_button;

  if (lognameLikesThis === true) {
    img_button = <img src={imgUrl} alt="post with link"></img>;
    likes_button = (
      <button
        className="like-unlike-button"
        onClick={() =>
          unlike(
            likeUrl,
            numLikes,
            setNumLikes,
            setLognameLikesThis,
            setLikeUrl
          )
        }
      >
        unlike
      </button>
    );
  } else if (lognameLikesThis === false) {
    img_button = (
      <button
        onDoubleClick={() =>
          like(post, numLikes, setNumLikes, setLognameLikesThis, setLikeUrl)
        }
      >
        <img src={imgUrl} alt="post with link"></img>
      </button>
    );
    likes_button = (
      <button
        className="like-unlike-button"
        onClick={() =>
          like(post, numLikes, setNumLikes, setLognameLikesThis, setLikeUrl)
        }
      >
        like
      </button>
    );
  } else {
    img_button = <img src={imgUrl}></img>;
    likes_button = <div>Loading...</div>;
  }

  if (numLikes == 1) {
    likes_component = <p>1 like</p>;
  } else {
    likes_component = <p>{numLikes} likes</p>;
  }
  return (
    <div>
      {img_button}
      {likes_component}
      {likes_button}
    </div>
  );
}
