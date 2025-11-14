# To run this FastAPI backend:
# 1. Ensure you have Python 3.7+ installed.
# 2. Install the necessary libraries from your `requirements.txt` file:
#    pip install "fastapi[all]" uvicorn python-dotenv requests pypdf python-multipart
# 3. Save this code as `main.py` in your `/api` directory.
# 4. Get a free API key from Google AI Studio (aistudio.google.com).
# 5. In your project's root folder, create a `.env` file and add your key:
#    GOOGLE_API_KEY="your_google_api_key_here"
# 6. Run the server from your project root:
#    uvicorn api.main:app --reload

import os
import json
import io
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import requests
import pypdf

# Load environment variables from .env file (for local development)
load_dotenv()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="AutoPaperAI API",
    description="An API to generate complex, section-based question papers using the Google Gemini API.",
    version="3.0.0",
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Data Validation ---
class Question(BaseModel):
    question: str
    answer: str
    marks: int

class Section(BaseModel):
    name: str
    questions: List[Question]

class PaperResponse(BaseModel):
    school_name: str
    max_marks: int
    paper_title: str
    sections: List[Section]

# --- Helper Functions ---

def extract_text_from_pdf(file: io.BytesIO) -> str:
    """Extracts text content from an in-memory PDF file."""
    try:
        pdf_reader = pypdf.PdfReader(file)
        text = "".join(page.extract_text() or "" for page in pdf_reader.pages)
        if not text:
            raise ValueError("Could not extract any text from the PDF. It might be an image-based PDF.")
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process PDF file: {e}")

def generate_gemini_prompt(
    school_name: str,
    max_marks: int,
    overall_difficulty: str,
    syllabus: str,
    sections_data: List[Dict]
) -> str:
    """Creates a detailed, structured prompt optimized for the Google Gemini model."""
    
    sections_prompt = []
    for i, sec in enumerate(sections_data):
        marks_dist = sec.get('marksDistribution', {})
        if not isinstance(marks_dist, dict): continue

        marks_dist_str = ", ".join(
            f"{count} questions of {mark} marks"
            for mark, count in marks_dist.items() if int(count) > 0
        )
        section_detail = (
            f"  - Section {i+1}:\n"
            f"    - Name: \"{sec.get('name', 'Unnamed Section')}\"\n"
            f"    - Difficulty: {sec.get('difficulty', 'Medium')}\n"
            f"    - Question Quota: {marks_dist_str}"
        )
        sections_prompt.append(section_detail)

    prompt = f"""
You are an expert educator creating a question paper. Your task is to generate a complete exam based on the following detailed instructions. You must output your response in a valid JSON format only.

**Exam Details:**
- **Institution:** {school_name}
- **Maximum Marks:** {max_marks}
- **Overall Difficulty:** {overall_difficulty}

**Syllabus (Strictly adhere to this content):**
---
{syllabus}
---

**Paper Structure (Follow this structure exactly):**
{chr(10).join(sections_prompt)}

**Key Directives:**
1.  **Content Relevance:** All questions must be derived solely from the provided syllabus.
2.  **Difficulty Levels:** The complexity of each question must match the difficulty specified for its section, with an overarching adherence to the paper's overall difficulty.
3.  **Answer Length:** The length and detail of each answer must be appropriate for the allocated marks. 10-mark questions require comprehensive answers, while 2-mark questions need concise ones.
4.  **JSON Output:** The final output must be a single, perfectly formed JSON object. Do not include any text, notes, or markdown formatting outside of the JSON structure.

**Required JSON Schema:**
```json
{{
  "school_name": "string",
  "max_marks": "integer",
  "paper_title": "string (e.g., 'Final Term Examination: Physics')",
  "sections": [
    {{
      "name": "string",
      "questions": [
        {{
          "question": "string",
          "answer": "string",
          "marks": "integer"
        }}
      ]
    }}
  ]
}}
```

Now, generate the question paper.
"""
    return prompt

# --- API Endpoint ---

@app.post("/generate-paper-v2", response_model=PaperResponse)
async def create_question_paper_v2(
    schoolName: str = Form(...),
    maxMarks: int = Form(...),
    overallDifficulty: str = Form(...),
    sections: str = Form(...),
    syllabusText: str = Form(""),
    syllabusFile: Optional[UploadFile] = File(None)
):
    """
    Generates a question paper using the Google Gemini API.
    It processes form data, including a syllabus from text or PDF,
    and returns a structured JSON response.
    """
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY is not configured on the server.")

    # --- 1. Process Syllabus Input ---
    syllabus_content = ""
    if syllabusFile and syllabusFile.filename:
        if syllabusFile.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is supported.")
        
        try:
            pdf_bytes = await syllabusFile.read()
            syllabus_content = extract_text_from_pdf(io.BytesIO(pdf_bytes))
        finally:
            await syllabusFile.close()
    elif syllabusText:
        syllabus_content = syllabusText
    
    if not syllabus_content.strip():
        raise HTTPException(status_code=400, detail="Syllabus is required. Provide it as text or upload a PDF.")

    # --- 2. Process Sections Input ---
    try:
        sections_data = json.loads(sections)
        if not isinstance(sections_data, list) or not sections_data:
            raise ValueError("Sections data must be a non-empty list.")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid format for sections data: {e}")

    # --- 3. Generate Prompt and Call Gemini API ---
    prompt = generate_gemini_prompt(schoolName, maxMarks, overallDifficulty, syllabus_content, sections_data)
    
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={GOOGLE_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    # Payload optimized for Gemini, requesting JSON output directly
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.5, # A bit of creativity but still grounded
        }
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=300)
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        
        api_response = response.json()
        
        # --- 4. Parse and Validate the Response ---
        # Extract the JSON string from the Gemini response
        if 'candidates' not in api_response or not api_response['candidates']:
            raise ValueError("The API response from Google did not contain any candidates.")
        
        content_part = api_response['candidates'][0]['content']['parts'][0]
        if 'text' not in content_part:
            raise ValueError("The API response content is missing the 'text' field.")
            
        paper_data = json.loads(content_part['text'])
        
        # Use Pydantic to validate the structure of the AI's response
        validated_paper = PaperResponse(**paper_data)
        return validated_paper

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to Google Gemini API: {e}")
    except (KeyError, IndexError, json.JSONDecodeError, ValueError) as e:
        # This catches errors from parsing a malformed or unexpected API response
        print(f"API Response Error: {api_response if 'api_response' in locals() else 'Not available'}")
        raise HTTPException(status_code=500, detail=f"Failed to parse or understand the AI's response. Error: {e}")
    except Exception as e:
        # This catches Pydantic validation errors and other unexpected issues
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AutoPaperAI API. Use the /generate-paper-v2 endpoint to create a paper."}
