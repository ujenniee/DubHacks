import os
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["USE_MPS"] = "0"

import torch
torch.set_default_device("cpu")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
app = FastAPI()


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
    source_language: str = None   # Python 3.9 compatible

@app.get("/")
def root():
    return {"message": "Translation API is running ✅"}

@app.post("/translate")
def translate_text(req: TranslateRequest):
    src = (req.source_language or "en").lower()
    tgt = req.target_language.lower()

    try:
        if src == tgt:
            return {"translatedText": req.text}

        # Choose model
        if src == "en":
            model_name = f"Helsinki-NLP/opus-mt-en-{tgt}"
        elif tgt == "en":
            model_name = f"Helsinki-NLP/opus-mt-{src}-en"
        else:
            # Chain: source → en → target
            mid_pipe = pipeline("translation", model=f"Helsinki-NLP/opus-mt-{src}-en", device=-1)
            mid_text = mid_pipe(req.text, max_length=512)[0]["translation_text"]

            pipe = pipeline(
    "translation",
    model=model_name,
    device=-1,  # force CPU
    framework="pt",  # use PyTorch backend
)

            result = pipe(mid_text, max_length=512)
            return {"translatedText": result[0]["translation_text"]}

        # Direct translation
        pipe = pipeline("translation", model=model_name, device=-1)  # 👈 force CPU
        out = pipe(req.text, max_length=512)
        return {"translatedText": out[0]["translation_text"]}

    except Exception as e:
        print("❌ Translation error:", e)
        return {"error": str(e)}
