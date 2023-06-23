import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Comments({ comment, comments, setComments, index }) {
  const delete_comm = () => {
    fetch(comment.url, { method: "DELETE" })
      .then((response) => {
        if (comment.lognameOwnsThis == true) {
          var list = [];
          for (var i in comments) {
            if (i != index) {
              list.push(comments[i]);
            }
          }
          setComments(list);
        }
      })
      .catch((error) => console.log(error));
  };

  let delete_button;
  if (comment.lognameOwnsThis == true) {
    delete_button = (
      <div>
        <button className="delete-comment-button" onClick={() => delete_comm()}>
          Delete
        </button>
      </div>
    );
  } else {
    delete_button = <div></div>;
  }

  var comment_component = (
    <div>
      <a
        href={comment.ownerShowUrl}
        style={{ display: "inline-block", margin: "5px" }}
      >
        {comment.owner}
      </a>
      <p className="comment-text" style={{ display: "inline-block" }}>
        {comment.text}
      </p>
      <div style={{ display: "inline-block", margin: "10px" }}>
        {delete_button}
      </div>
    </div>
  );
  return <div>{comment_component}</div>;
}
