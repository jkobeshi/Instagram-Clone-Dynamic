"""REST API for comments."""
import flask
from insta485.api.posts import check_auth
import insta485


@insta485.app.route('/api/v1/comments/', methods=["POST"])
def add_comment():
    """Create a comment on the post."""
    logname = check_auth()
    post_id = flask.request.args["postid"]
    connection = insta485.model.get_db()

    connection.execute(
        "INSERT INTO comments(owner, postid, text, created) "
        "VALUES (?, ?, ?, datetime('now'))",
        (logname, post_id, flask.request.json.get("text"))
    )

    cur = connection.execute(
        "SELECT last_insert_rowid()"
    )

    comment_id = cur.fetchone()

    context = {
        "commentid": str(comment_id["last_insert_rowid()"]),
        "lognameOwnsThis": True,  # can this be hardcoded?
        "owner": logname,
        "ownerShowUrl": "/users/" + logname,
        "text": flask.request.json.get("text"),
        "url": "/api/v1/comments/" +
        str(comment_id["last_insert_rowid()"]) + "/"
    }

    return flask.jsonify(**context), 201


@insta485.app.route('/api/v1/comments/<comment_id>/', methods=["DELETE"])
def delete_comment(comment_id):
    """Delete a comment with its id."""
    logname = check_auth()
    connection = insta485.model.get_db()

    # Check if comment exists
    cur = connection.execute(
        "SELECT comments.commentid, comments.owner "
        "FROM comments "
        "WHERE comments.commentid = ?",
        (comment_id, )
    )
    comment_info = cur.fetchone()

    # print("count: " + str(len(comment_info)))
    # print("owner: " + comment_info[0]["owner"])
    # comment does not exist
    if not comment_info:
        return flask.jsonify(''), 404
    if not comment_info["owner"] == logname:
        return flask.jsonify(''), 403

    connection.execute(
        "DELETE FROM comments WHERE commentid == ?",
        (comment_id,)
    )

    return flask.jsonify(''), 204
