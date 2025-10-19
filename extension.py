"""
AI Job Finder — Resume to Smart Job Matches
------------------------------------------
1. Detects language of resume.
2. Translates to English (if needed).
3. Embeds resume & job descriptions using OpenAI.
4. Ranks jobs by semantic similarity.
"""

import os
import numpy as np
import requests
from openai import OpenAI
from langdetect import detect
from googletrans import Translator

# === CONFIGURATION ===
OPENAI_API_KEY = "your_openai_api_key_here"
ADZUNA_APP_ID = "your_adzuna_app_id_here"
ADZUNA_APP_KEY = "your_adzuna_app_key_here"
LOCATION = "Seattle"  # you can change this to your city
COUNTRY = "us"  # Adzuna country code (us, gb, ca, etc.)

client = OpenAI(api_key=OPENAI_API_KEY)
translator = Translator()

# === STEP 1. INPUT ===
resume_text = """
经验丰富的软件工程师，擅长Python、机器学习和数据分析。
有五年以上开发经验，熟悉深度学习和AI应用开发。
"""

# === STEP 2. LANGUAGE DETECTION & TRANSLATION ===
lang = detect(resume_text)
if lang != "en":
    print(f"Detected language: {lang}. Translating to English...")
    resume_text = translator.translate(resume_text, src=lang, dest="en").text

# === STEP 3. EMBEDDING FUNCTION ===
def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return np.array(response.data[0].embedding)

resume_vec = get_embedding(resume_text)

# === STEP 4. SEARCH JOBS VIA ADZUNA API ===
def search_jobs(keywords, location=LOCATION, results=10):
    url = f"https://api.adzuna.com/v1/api/jobs/{COUNTRY}/search/1"
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": keywords,
        "where": location,
        "results_per_page": results,
        "content-type": "application/json"
    }
    res = requests.get(url, params=params)
    return res.json().get("results", [])

# Use a few keywords for the search query
keywords = "python machine learning engineer"
job_results = search_jobs(keywords, LOCATION, 10)

# === STEP 5. EMBED & SCORE JOBS ===
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

ranked_jobs = []
for job in job_results:
    title = job["title"]
    description = job.get("description", "")
    link = job.get("redirect_url", "")

    job_vec = get_embedding(title + " " + description)
    score = cosine_similarity(resume_vec, job_vec)

    ranked_jobs.append({
        "title": title,
        "company": job.get("company", {}).get("display_name", "Unknown"),
        "location": job.get("location", {}).get("display_name", "N/A"),
        "score": score,
        "link": link
    })

# === STEP 6. SORT & DISPLAY ===
ranked_jobs.sort(key=lambda x: x["score"], reverse=True)

print("\nTop Matches:\n")
for j in ranked_jobs[:5]:
    print(f"{j['title']} ({j['company']}) - {j['location']}")
    print(f"Match Score: {j['score']:.3f}")
    print(f"Link: {j['link']}\n")
