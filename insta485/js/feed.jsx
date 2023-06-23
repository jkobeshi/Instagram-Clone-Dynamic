import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Post from "./post";
import InfiniteScroll from "react-infinite-scroll-component";

// The parameter of this function is an object with a string called url inside it.
// url is a prop for the Post component.
export default function Feed({ url }) {
  /* Display image and post owner of a single post */
  const [results, setResults] = useState("");
  const [nextUrl, setNextUrl] = useState("");
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
          //for(var i in data.results){
          //    console.log(data.results[i].url)
          //    var temp = (<div><Post url={data.results[i].url}/></div>)
          //    console.log(temp)
          //    url_list.push(temp)
          //}
          //console.log(url_list)
          setResults(data.results);
          setNextUrl(data.next);
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
  //console.log(results)

  // post rendering code
  var post_list = [];
  for (var i in results) {
    // console.log("BEGINNING URL: ")
    // console.log(results[i].url)
    // KEY: set the key here?
    var temp = (
      <div
        key={i}
        style={{ border: "1px solid black", padding: "5px", margin: "5px" }}
      >
        <Post url={results[i].url} />
      </div>
    );
    post_list.push(temp);
  }

  // infinite scroll processing
  let hasMore;
  if (nextUrl == "") {
    hasMore = false;
  } else {
    hasMore = true;
  }

  // function to pass to next(uses next state)
  function get_next_posts() {
    console.log("GET NEXT POST");
    // Call REST API to get the post's information
    console.log(results);
    fetch(nextUrl, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        // If ignoreStaleRequest was set to true, we want to ignore the results of the
        // the request. Otherwise, update the state to trigger a new render.
        //if (!ignoreStaleRequest) {}

        // correctly fetches next 10 posts
        for (var i in data.results) {
          // correctly fetching urls
          results.push(data.results[i]);
        }
        setResults(results);
        setNextUrl(data.next);
      });
  }
  return (
    <div>
      <InfiniteScroll
        dataLength={results.length} //This is important field to render the next data
        next={get_next_posts}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <div>{post_list}</div>
      </InfiniteScroll>
    </div>
  );
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};
