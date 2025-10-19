from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from transformers import pipeline
import torch

app = FastAPI()

# Allow Chrome extension requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: Optional[str] = None

@app.get("/")
def root():
    return {"message": "Translation API is running ✅"}

@app.post("/translate")
def translate_text(req: TranslateRequest):
    src = (req.source_language or "en").lower()
    tgt = req.target_language.lower()
    device = "cpu"  # avoid meta tensor errors

    try:
        if src == tgt:
            return {"translatedText": req.text}

        # Direct translations or via English bridge
        if src == "en":
            model_name = f"Helsinki-NLP/opus-mt-en-{tgt}"
        elif tgt == "en":
            model_name = f"Helsinki-NLP/opus-mt-{src}-en"
        else:
            mid_pipe = pipeline("translation", model=f"Helsinki-NLP/opus-mt-{src}-en", device=-1)
            mid_text = mid_pipe(req.text)[0]["translation_text"]
            pipe = pipeline("translation", model=f"Helsinki-NLP/opus-mt-en-{tgt}", device=-1)
            result = pipe(mid_text)
            return {"translatedText": result[0]["translation_text"]}

        pipe = pipeline("translation", model=model_name, device=-1)
        out = pipe(req.text)
        return {"translatedText": out[0]["translation_text"]}
    except Exception as e:
        print("❌ Translation error:", e)
        return {"error": str(e)}
