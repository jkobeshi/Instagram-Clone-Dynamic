"""REST API for likes."""
import flask
import insta485
from insta485.api.posts import check_auth


@insta485.app.route('/api/v1/likes/', methods=["POST"])
def add_like():
    """Create a like on the post."""
    logname = check_auth()
    curr_postid = flask.request.args["postid"]

    # Query to check if the like exists already
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT likes.likeid AS id "
        "FROM likes "
        "WHERE likes.owner = ? AND likes.postid = ?",
        (logname, curr_postid)
    )
    curr_like = cur.fetchone()

    # If the like_id exists in the database
    if curr_like:
        context = {
            "likeid": curr_like["id"],
            "url": "/api/v1/likes/" + str(curr_like["id"]) + "/"
        }
        return flask.jsonify(**context), 200

    # If the like doesn't exist, add the like to the database
    connection.execute(
        "INSERT INTO likes(owner, postid, created) "
        "VALUES (?, ?, datetime('now'))",
        (logname, curr_postid)
    )

    cur2 = connection.execute(
        "SELECT likes.likeid as id "
        "FROM likes "
        "WHERE likes.owner == ? AND likes.postid = ?",
        (logname, curr_postid)
    )
    curr_like = cur2.fetchone()

    context = {
        "likeid": curr_like["id"],
        "url": "/api/v1/likes/" + str(curr_like["id"]) + "/"
    }
    return flask.jsonify(**context), 201


@insta485.app.route('/api/v1/likes/<like_id>/', methods=['DELETE'])
def delete_like(like_id):
    """Delete a like."""
    logname = check_auth()
    # Query to see if the like exists
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT likes.likeid, likes.owner "
        "FROM likes "
        "WHERE likes.likeid = ?",
        (like_id, )
    )
    curr_like = cur.fetchone()

    # If the like exists
    if curr_like:
        # If the like isn't owned by the current user
        if logname != curr_like["owner"]:
            return flask.jsonify(''), 403
        # If the like exists and is owned by the current user
        cur = connection.execute(
            "DELETE FROM likes "
            "WHERE likes.likeid = ? AND likes.owner = ?",
            (like_id, logname)
        )
        return flask.jsonify(''), 204

    # If the like doesn't exit, throw error
    return flask.jsonify(''), 404
