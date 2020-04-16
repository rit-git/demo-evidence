import os
from os.path import join, dirname
import re
import requests
import json
import pandas as pd
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), '.env'))
TSV_PATH = os.environ.get("REVIEW_TSV_PATH")
URL = os.environ.get("MODEL_URL")

def load_kuchikomi_df(tsv_path: str) -> pd.DataFrame:
    return pd.read_csv(tsv_path, sep='\t', names=["yado_id", 'review_id', 'title','review', 'reply', 'info'])

df_review = load_kuchikomi_df(TSV_PATH)

def find_reviews_as_evidence(request: str, yado_id: str, limit: int = 10):
    '''
    Find reviews of specified 'yado_id'
    reviews is checked whether review sentence is evidence of 'request'

    :param request: request text
    :param yado_id: target yado ID
    :param limit: max number of reviews
    :return: reviews with evidence scores
        [
            {
                'id': str,
                'sentence': str,
                'is_evidence': boolean,
                'score': float
            },
            ...
        ]
    '''
    reviews = []
    temp_df = df_review[yado_id == df_review.yado_id]
    if len(temp_df) <= 0:
        return reviews
    if len(temp_df) > limit:
        temp_df = temp_df.sample(limit)
    for i, row in temp_df.iterrows():
        sents = re.split("[。！？!?.\u2605\u2606\u266a\n]", row['review'])
        for s in sents:
            if not s:
                continue
            res = call_evidence_api(request, s)
            reviews.append({
                'id': i,
                'sentence': s,
                'is_evidence': True if res['label_max'] == 1 else False,
                'score': res['score']
            })
    return reviews

def call_evidence_api(request: str, evidence: str) -> dict:
    '''
    Call evidence check API

    :param request: request text
    :param evidence: evidence text
    :return: {
        "label_max": int (1 if 'evidence' is evidence of 'request')
        "score": float
    }
    '''
    data = {
        "text_a": evidence,
        "text_b": request
    }
    res = requests.post(URL, json.dumps(data).encode())
    if not res.ok:
        raise Exception("HTTP status is not 200. status==" + str(res.status_code))

    body = json.loads(res.text)
    # Sample response
    # {"response": [{"label_max": 1, "scores": [6.126245716586709e-05, 0.9999387264251709]}]}
    if "response" not in body:
        return {}
    return {
        'label_max': body["response"][0]["label_max"],
        'score': body["response"][0]["scores"][1]
    }
