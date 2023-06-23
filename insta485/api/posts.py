"""REST API for posts."""
import flask
from flask import request
import insta485
from insta485.views.index import cookie_protocol
from insta485.model import db_to_passwd


def get_logname():
    """Get Logname."""
    auth = request.authorization
    # auth == None means using cookies
    if auth is None:
        return flask.request.cookies.get("username")
    return auth.username


def check_auth():
    """Check authorization."""
    # Error checks for logged in
    cookie_method = cookie_protocol()
    logname = flask.request.cookies.get("username")
    http_method = False
    if cookie_method is False:
        http_method = http_protocol()
    if (cookie_method is False) and (http_method is False):
        flask.abort(403)
    if http_method:
        logname = request.authorization.username
    return logname


def http_protocol():
    """Check to see if the person is logged in with http."""
    connection = insta485.model.get_db()
    auth = request.authorization
    if auth is None:
        return False
    username = auth.username
    password = auth.password
    cur = connection.execute(
        "SELECT password FROM users "
        "WHERE username == ?",
        (username,),
    )
    user = cur.fetchall()
    if len(user) == 0:
        return False

    str_after_sha = user[0]["password"].partition("$")[2]

    password_db_string = db_to_passwd(str_after_sha, password)

    if password_db_string != user[0]["password"]:
        return False
    return True


@insta485.app.route("/api/v1/posts/")
def get_ten_posts():
    """Return ten newest posts."""
    # Error checks for logged in
    logname = check_auth()

    # Fetching insta feed :)
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT postid "
        "FROM posts, users, following "
        "WHERE posts.owner == users.username AND ((following.username1 == ? "
        "AND posts.owner == following.username2) OR (posts.owner == ?))"
        "GROUP BY posts.postid "
        "ORDER BY posts.postid DESC",
        (logname, logname),
    )
    posts = cur.fetchall()
    next_page = ""
    base_full = flask.request.url[
        len(flask.request.url_root):len(flask.request.url)]

    if len(posts) == 0:
        context = {
            "next": next_page,
            "results": [],
            "url": "/" + base_full,
        }
        return flask.jsonify(**context)

    size = flask.request.args.get("size", default=10, type=int)
    page = flask.request.args.get("page", default=0, type=int)
    postid_lte = flask.request.args.get(
        "postid_lte", default=posts[0]["postid"], type=int
    )

    if size < 0 or page < 0:
        context = {
            "message": "Bad Request",
            "status_code": 400,
        }
        return flask.jsonify(**context), 400

    context_list = []

    count = 0
    item_count = 0

    for post in posts:
        if count >= size:
            break  # Once count == size, break

        # If we haven't reached the requested postid
        if int(post["postid"]) <= postid_lte:
            if item_count >= page * size:  # Adding the post to the page
                new_dict = {
                    "postid": post["postid"],
                    "url": f"/api/v1/posts/{post['postid']}/",
                }
                context_list.append(new_dict)
                count += 1
            item_count += 1

    if count == size:
        page += 1
        next_page = (
            "/api/v1/posts/?size="
            + str(size)
            + "&page="
            + str(page)
            + "&postid_lte="
            + str(postid_lte)
        )

    context = {
        "next": next_page,
        "results": context_list,
        "url": "/" + base_full,
    }

    return flask.jsonify(**context)


@insta485.app.route("/api/v1/posts/<int:post_id>/")
def get_post(post_id):
    """Return post on postid."""
    # Error checks for logged in
    logname = check_auth()

    connection = insta485.model.get_db()

    # likes section
    cur = connection.execute(
        "SELECT count(*) AS cnt "
        "FROM likes "
        "WHERE postid == ?",
        (post_id,)
    )
    all_likes = cur.fetchall()[0]["cnt"]
    logname_has_liked = True
    # query for likes where owner is == logname and postid == post_id
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE postid == ? AND owner == ?",
        (post_id, logname),
    )
    logname_likeid = cur.fetchall()

    if len(logname_likeid) == 0:
        logname_has_liked = False

    likes = {"lognameLikesThis": logname_has_liked,
             "numLikes": all_likes, "url": None}

    if logname_has_liked is True:
        likes = {"lognameLikesThis": logname_has_liked, "numLikes": all_likes,
                 "url": "/api/v1/likes/" +
                 str(logname_likeid[0]["likeid"]) + "/"}

    # comments
    cur = connection.execute(
        "SELECT * "
        "FROM comments "
        "WHERE postid == ?",
        (post_id,)
    )
    all_comments = cur.fetchall()

    comments = []
    for comment in all_comments:
        comment_context = {
            "commentid": comment["commentid"],
            "lognameOwnsThis": (comment["owner"] == logname),
            "owner": comment["owner"],
            "ownerShowUrl": "/users/" + comment["owner"] + "/",
            "text": comment["text"],
            "url": "/api/v1/comments/" + str(comment["commentid"]) + "/",
        }
        comments.append(comment_context)

    # posts
    cur = connection.execute(
        "SELECT * "
        "FROM posts "
        "WHERE postid == ?",
        (post_id,)
    )

    post_details = cur.fetchone()
    if not post_details:
        return flask.jsonify(""), 404

    # owner info
    cur = connection.execute(
        "SELECT * "
        "FROM users "
        "WHERE users.username == ?",
        (post_details["owner"],)
    )
    owner_details = cur.fetchone()

    context = {
        "comments": comments,
        "comments_url": "/api/v1/comments/?postid=" + str(post_id),
        "created": post_details["created"],
        "imgUrl": "/uploads/" + post_details["filename"],
        "likes": likes,
        "owner": post_details["owner"],
        "ownerImgUrl": "/uploads/" + owner_details["filename"],
        "ownerShowUrl": "/users/" + post_details["owner"] + "/",
        "postShowUrl": f"/posts/{post_id}/",
        "postid": post_id,
        "url": flask.request.path,
    }
    return flask.jsonify(**context), 200
