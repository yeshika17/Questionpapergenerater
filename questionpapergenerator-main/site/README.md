Frontend (Client-Side)
This is the user interface that you interact with in the browser.

React.js: The fundamental JavaScript library used for building the user interface with a component-based architecture (e.g., Header, Stepper, SectionCard).

Next.js: The application is built using the Next.js framework on top of React. The 'use client'; directive is a key indicator of this.

Tailwind CSS: Used for all the styling. It allows for rapid UI development using utility classes directly in the HTML/JSX (e.g., bg-gray-900, text-white, rounded-lg).

Heroicons: The icons used throughout the application (add, delete, download) are from this popular SVG icon set, which integrates well with Tailwind CSS.

jsPDF: A client-side JavaScript library used in the final step to create the PDF document from your generated paper.

html2canvas: This library works with jsPDF. It takes a "screenshot" of the editable document on the screen to ensure the layout and styling are perfectly preserved in the final PDF file.

Backend (Server-Side)
This is the engine running on a server that does the heavy lifting.

Python: The programming language used to write the backend logic.

FastAPI: A modern, high-performance Python web framework used to build the API that the frontend communicates with.

Uvicorn: An ASGI (Asynchronous Server Gateway Interface) server that runs the FastAPI application, allowing it to handle requests efficiently.

Google Gemini API: This is the core artificial intelligence service. The backend sends the syllabus, section configuration, and other details to Google's Gemini model, which then generates the questions and answers.

pypdf: A Python library used to read and extract text from the syllabus file if you upload it as a PDF.

Development & Tooling
python-dotenv: A utility to manage environment variables. It's used to securely load your Google API key on the backend without hardcoding it.

pip & requirements.txt: The standard Python package manager and requirements file used to manage and install the backend libraries.