import traceback
from flask import Flask, request

import review

app = Flask(__name__)

@app.route('/reviews_by_yado', methods=["GET", "POST"])
def reviews_by_yado():
    req_text = request.form['request']
    yado_id = request.form['yado_id']
    review_num = request.form['review_num']
    if not req_text or \
       not yado_id or not yado_id.isdigit() or \
       not review_num or not review_num.isdigit():
        return {
            "status": "param_error",
            "message": "request and yado_id and review_num are required.",
            "reviews": []
        }
    try:
        reviews = review.find_reviews_as_evidence(req_text, int(yado_id), int(review_num))
        return {
            "status": "ok" if reviews else "not_found",
            "reviews": reviews
        }
    except Exception as e:
        return {
            "status": "system_error",
            "message": traceback.format_exc(),
            "reviews": []
        }

import time
@app.route('/time')
def get_current_time():
    return {'time': time.time()}

if __name__ == '__main__':
    app.run(port=5000)

