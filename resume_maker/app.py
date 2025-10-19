from flask import Flask, render_template, request, send_file, send_from_directory
from fpdf import FPDF
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import os

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))  # DubHacks folder

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

# Builder page
@app.route('/')
def builder():
    return render_template('buildResume.html')

@app.route('/generate', methods=['POST'])
def generate_resume():
    src_lang = request.form['src_lang'].lower()
    name_raw = request.form['name']
    email = request.form['email']
    school_raw = request.form['school']
    summary_raw = request.form['summary']
    experiences_raw = request.form['experiences'].split(",")

    name = translate(name_raw, src_lang)
    school = translate(school_raw, src_lang)
    summary = translate(summary_raw, src_lang)
    experiences = [translate(exp.strip(), src_lang) for exp in experiences_raw]

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Resume", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Name: {name}", ln=True)
    pdf.cell(200, 10, txt=f"Email: {email}", ln=True)
    pdf.cell(200, 10, txt=f"School: {school}", ln=True)
    pdf.multi_cell(0, 10, txt=f"Summary: {summary}")
    pdf.ln(5)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="Experiences:", ln=True)
    pdf.set_font("Arial", size=12)
    for exp in experiences:
        pdf.multi_cell(0, 8, txt=f"- {exp}")

    filename = f"{name.replace(' ', '_')}_resume.pdf"
    pdf.output(filename)
    return send_file(filename, as_attachment=True)

# Serve other HTML files outside resume_maker
@app.route('/home')
def home_page():
    return send_from_directory(BASE_DIR, 'home.html')

@app.route('/jobFinder')
def job_finder_page():
    return send_from_directory(BASE_DIR, 'jobFinder.html')

@app.route('/signUp')
def sign_up_page():
    return send_from_directory(BASE_DIR, 'signUp.html')

@app.route('/<path:filename>')
def serve_files(filename):
    return send_from_directory(BASE_DIR, filename)


if __name__ == '__main__':
    app.run(debug=True)
