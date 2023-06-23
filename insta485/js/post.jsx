import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Comments from "./comments";
import Likes from "./likes";
import Timestamp from "./timestamp";

// The parameter of this function is an object with a string called url inside it.
// url is a prop for the Post component.
export default function Post({ url }) {
  /* Display image and post owner of a single post */

  // state for comment form
  const [answer, setAnswer] = useState("");

  function handleCommentChange(e) {
    setAnswer(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("comment form submission");
    console.log(answer);
    //need to figure out how to pass text
    let url = "/api/v1/comments/?postid=" + postid;

    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        text: answer,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        // If ignoreStaleRequest was set to true, we want to ignore the results of the
        // the request. Otherwise, update the state to trigger a new render.
        setAnswer("");
        comments.push(data);
        setComments(comments);
      })
      .catch((error) => console.log(error));
  }

  const [imgUrl, setImgUrl] = useState("");
  const [ownerImgUrl, setOwnerImgUrl] = useState("");
  const [owner, setOwner] = useState("");
  const [ownerShowUrl, setOwnerShowUrl] = useState("");
  const [comments, setComments] = useState("");
  const [timestamp, setCreated] = useState("");
  const [postPath, setPostShowUrl] = useState("");
  const [postid, setPostId] = useState("");

  //Likes
  const [numLikes, setNumLikes] = useState("");
  const [lognameLikesThis, setLognameLikesThis] = useState("");
  const [likeUrl, setLikeUrl] = useState("");

  useEffect(() => {
    // Declare a boolean flag that we can use to cancel the API request.
    let ignoreStaleRequest = false;

    // Call REST API to get the post's information
    fetch(url, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        // If ignoreStaleRequest was set to true, we want to ignore the results of the
        // the request. Otherwise, update the state to trigger a new render.
        if (!ignoreStaleRequest) {
          setImgUrl(data.imgUrl);
          setOwner(data.owner);
          setComments(data.comments);

          setCreated(data.created);
          setOwnerImgUrl(data.ownerImgUrl);
          setPostShowUrl(data.postShowUrl);
          setOwnerShowUrl(data.ownerShowUrl);
          setPostId(data.postid);

          //likes
          setNumLikes(data.likes.numLikes);
          setLognameLikesThis(data.likes.lognameLikesThis);
          setLikeUrl(data.likes.url);
        }
      })
      .catch((error) => console.log(error));

    return () => {
      // This is a cleanup function that runs whenever the Post component
      // unmounts or re-renders. If a Post is about to unmount or re-render, we
      // should avoid updating state.
      ignoreStaleRequest = true;
    };
  }, [url]);

  // create comments element
  var comment_list = [];
  for (var i in comments) {
    // KEY: set the key here?
    var temp = (
      <div key={i}>
        <div>
          <Comments
            comment={comments[i]}
            comments={comments}
            setComments={setComments}
            index={i}
          />
        </div>
      </div>
    );
    comment_list.push(temp);
  }
  if (postid === "") {
    var new_comm = <div>Loading...</div>;
  } else {
    var new_comm = (
      <div>
        <form className="comment-form" onSubmit={handleSubmit}>
          <input type="text" value={answer} onChange={handleCommentChange} />
        </form>
      </div>
    );
  }

  return (
    <div>
      <a href={ownerShowUrl}>
        <img
          src={ownerImgUrl}
          alt="profile picture"
          style={{ width: "30px", height: "30px" }}
        ></img>
      </a>
      <a href={ownerImgUrl}>{owner}</a>
      <a href={postPath}>
        <Timestamp timestamp={timestamp} />
      </a>
      <Likes
        post={postid}
        imgUrl={imgUrl}
        numLikes={numLikes}
        lognameLikesThis={lognameLikesThis}
        likeUrl={likeUrl}
        setNumLikes={setNumLikes}
        setLognameLikesThis={setLognameLikesThis}
        setLikeUrl={setLikeUrl}
      />
      <div>{comment_list}</div>
      <div>{new_comm}</div>
    </div>
  );
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};
