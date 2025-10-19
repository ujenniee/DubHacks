import json
import subprocess
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

# Load translation model
model_name = "facebook/m2m100_418M"
tokenizer = M2M100Tokenizer.from_pretrained(model_name)
model = M2M100ForConditionalGeneration.from_pretrained(model_name)

def translate(text, src_lang, tgt_lang="en"):
    tokenizer.src_lang = src_lang
    encoded = tokenizer(text, return_tensors="pt")
    generated_tokens = model.generate(
        **encoded,
        forced_bos_token_id=tokenizer.get_lang_id(tgt_lang)
    )
    return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

def generate_resume_from_input():
    print("🌍 What language are you inputting your info in? (e.g., 'es' for Spanish, 'fr' for French)")
    src_lang = input("Language code: ").strip()
    tgt_lang = "en"

    print("\n👤 Enter your personal info:")
    name = input("Full name: ")
    email = input("Email: ")

    print("\n🎓 Enter your education info:")
    school_raw = input("School name and degree (in your language): ")
    school = translate(school_raw, src_lang, tgt_lang)

    print("\n📝 Write a short summary about yourself (in your language):")
    summary_raw = input("Summary: ")
    summary = translate(summary_raw, src_lang, tgt_lang)

    print("\n💼 Enter job experiences one by one (in your language). Type 'done' when finished:")
    experiences_raw = []
    while True:
        entry = input("> ")
        if entry.lower() == "done":
            break
        experiences_raw.append(entry)

    translated_experiences = []
    for entry in experiences_raw:
        translated = translate(entry, src_lang, tgt_lang)
        translated_experiences.append({
            "company": "Translated Company",
            "position": "Translated Role",
            "startDate": "2025-01",
            "summary": translated
        })

    resume_data = {
        "basics": {
            "name": name,
            "email": email,
            "summary": summary
        },
        "education": [
            {
                "institution": school,
                "area": "Translated Degree",
                "studyType": "Bachelor",
                "startDate": "2022-09",
                "endDate": "2026-06"
            }
        ],
        "work": translated_experiences
    }

    with open("resume.json", "w") as f:
        json.dump(resume_data, f, indent=2)
    print("✅ resume.json created!")

    resume_cmd_path = r"C:\Users\lnini\AppData\Roaming\npm\resume.cmd"
    try:
        subprocess.run([
            resume_cmd_path,
            "export",
            "resume.pdf",
            "--theme",
            "flat"
        ], check=True)
        print("✅ resume.pdf generated successfully!")
    except FileNotFoundError:
        print("❌ resume.cmd not found. Make sure resume-cli is installed.")
    except subprocess.CalledProcessError as e:
        print("❌ resume export failed:", e)

    return "resume.pdf"

# Run interactively
if __name__ == "__main__":
    generate_resume_from_input()