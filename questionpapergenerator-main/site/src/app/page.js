'use client';

import { useState, useMemo, useRef } from 'react';

// --- Helper: jsPDF & html2canvas for PDF generation ---
// We'll load these from a CDN in the main component.

// --- UI Icons (Heroicons) ---
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


// --- Core UI Components ---

const Header = () => (
    <header className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight text-center">
                <span className="bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">
                    AutoPaperAI
                </span>
            </h1>
            <p className="mt-2 text-center text-gray-400">
                Intelligently generate and customize question papers in minutes.
            </p>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-gray-900 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AutoPaperAI. All rights reserved.</p>
        </div>
    </footer>
);

const Stepper = ({ currentStep }) => {
    const steps = ['Basic Info', 'Syllabus', 'Sections', 'Select Questions', 'Finalize & Export'];
    return (
        <div className="mb-12">
            <ol className="flex items-center w-full">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;
                    return (
                        <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${isCompleted || isCurrent ? 'after:border-blue-500' : 'after:border-gray-700'}`}>
                            <div className="flex flex-col items-center">
                                <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${isCurrent ? 'bg-blue-600' : isCompleted ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                    {isCompleted ? (
                                        <svg className="w-4 h-4 text-white lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                                    ) : (
                                        <span className="font-bold text-white">{stepNumber}</span>
                                    )}
                                </span>
                                <span className={`mt-2 text-xs text-center ${isCurrent || isCompleted ? 'text-white' : 'text-gray-400'}`}>{step}</span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};


// --- Form Step Components ---

const Step1_BasicInfo = ({ data, setData }) => (
    <div className="card-step">
        <h2 className="card-title">Step 1: Basic Information</h2>
        <div className="space-y-6">
            <div>
                <label htmlFor="schoolName" className="form-label">School / University Name</label>
                <input type="text" id="schoolName" value={data.schoolName} onChange={(e) => setData({ ...data, schoolName: e.target.value })} className="form-input" placeholder="e.g., Harsahib's High School" />
            </div>
            <div>
                <label htmlFor="maxMarks" className="form-label">Maximum Marks</label>
                <input type="number" id="maxMarks" value={data.maxMarks} onChange={(e) => setData({ ...data, maxMarks: e.target.value })} className="form-input" placeholder="e.g., 100" />
            </div>
            <div>
                <label className="form-label">Overall Difficulty</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Easy', 'Medium', 'Hard'].map(level => (
                        <button key={level} type="button" onClick={() => setData({ ...data, overallDifficulty: level })} className={`form-button ${data.overallDifficulty === level ? 'form-button-active' : 'form-button-inactive'}`}>{level}</button>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const Step2_Syllabus = ({ data, setData }) => {
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setData({ ...data, syllabusFile: e.target.files[0] });
        }
    };

    return (
        <div className="card-step">
            <h2 className="card-title">Step 2: Provide Syllabus</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="syllabusText" className="form-label">Paste Syllabus</label>
                    <textarea id="syllabusText" value={data.syllabusText} onChange={(e) => setData({ ...data, syllabusText: e.target.value })} className="form-input h-48" placeholder="Paste your detailed syllabus here..."></textarea>
                </div>
                <div className="text-center text-gray-400 font-bold">OR</div>
                <div>
                    <label htmlFor="syllabusFile" className="form-label">Upload Syllabus (PDF)</label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-600 px-6 py-10">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            <div className="mt-4 flex text-sm leading-6 text-gray-400">
                                <label htmlFor="syllabusFile" className="relative cursor-pointer rounded-md font-semibold text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-blue-500">
                                    <span>Upload a file</span>
                                    <input id="syllabusFile" name="syllabusFile" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            {data.syllabusFile ? (
                                <p className="text-sm text-green-400 mt-2">Selected: {data.syllabusFile.name}</p>
                            ) : (
                                <p className="text-xs leading-5 text-gray-500">PDF up to 10MB</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({ section, index, updateSection, removeSection }) => {
    const handleMarksChange = (markType, count) => {
        const newMarks = { ...section.marksDistribution, [markType]: Math.max(0, parseInt(count) || 0) };
        updateSection(index, { ...section, marksDistribution: newMarks });
    };

    const addMarkType = () => {
        const newMark = prompt("Enter new mark value (e.g., 1, 3, 4):");
        if (newMark && !isNaN(newMark) && !section.marksDistribution.hasOwnProperty(newMark)) {
            handleMarksChange(newMark, 1);
        }
    };

    const removeMarkType = (markType) => {
        const newMarks = { ...section.marksDistribution };
        delete newMarks[markType];
        updateSection(index, { ...section, marksDistribution: newMarks });
    };

    return (
        <div className="bg-gray-800/70 p-5 rounded-lg border border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
                <input type="text" value={section.name} onChange={(e) => updateSection(index, { ...section, name: e.target.value })} className="form-input bg-transparent text-lg font-bold !p-1 !border-0 focus:!ring-0 focus:!border-b-2 focus:!border-blue-500" />
                <button type="button" onClick={() => removeSection(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded-full"><TrashIcon /></button>
            </div>
            <div>
                <label className="form-label text-sm">Section Difficulty</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {['Easy', 'Medium', 'Hard'].map(level => (
                        <button type="button" key={level} onClick={() => updateSection(index, { ...section, difficulty: level })} className={`form-button-sm ${section.difficulty === level ? 'form-button-active' : 'form-button-inactive'}`}>{level}</button>
                    ))}
                </div>
            </div>
            <div>
                <label className="form-label text-sm">Marks Distribution</label>
                <div className="space-y-2 mt-1">
                    {Object.entries(section.marksDistribution).map(([mark, count]) => (
                        <div key={mark} className="flex items-center gap-2">
                            <span className="text-gray-300 w-32">{mark}-Mark Questions:</span>
                            <input type="number" value={count} onChange={(e) => handleMarksChange(mark, e.target.value)} className="form-input !w-20 text-center" />
                            <button type="button" onClick={() => removeMarkType(mark)} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon /></button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addMarkType} className="mt-3 flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"><PlusIcon /> Add Mark Type</button>
            </div>
        </div>
    );
};

const Step3_SectionConfig = ({ data, setData }) => {
    const addSection = () => {
        const newSectionName = `Section ${String.fromCharCode(65 + data.sections.length)}`;
        setData({
            ...data,
            sections: [...data.sections, { name: newSectionName, difficulty: 'Medium', marksDistribution: { '5': 2 } }]
        });
    };

    const removeSection = (index) => {
        setData({ ...data, sections: data.sections.filter((_, i) => i !== index) });
    };

    const updateSection = (index, updatedSection) => {
        const newSections = [...data.sections];
        newSections[index] = updatedSection;
        setData({ ...data, sections: newSections });
    };

    return (
        <div className="card-step">
            <h2 className="card-title">Step 3: Configure Sections</h2>
            <div className="space-y-6">
                {data.sections.map((section, index) => (
                    <SectionCard key={index} section={section} index={index} updateSection={updateSection} removeSection={removeSection} />
                ))}
            </div>
            <button type="button" onClick={addSection} className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-600 text-gray-400 hover:bg-gray-800 hover:border-gray-500 rounded-lg transition-colors">
                <PlusIcon /> Add Another Section
            </button>
        </div>
    );
};

const Step4_QuestionSelection = ({ paper, selectedQuestions, onQuestionSelect }) => {
    if (!paper) return null;

    return (
        <div className="card-step">
            <div className="flex justify-between items-center mb-6">
                <h2 className="card-title !mb-0">Step 4: Select Questions</h2>
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-center text-white">{paper.school_name}</h3>
                <h4 className="text-xl font-semibold text-center text-gray-300">{paper.paper_title}</h4>
                <p className="text-lg font-bold text-right text-gray-300">Max Marks: {paper.max_marks}</p>
            </div>
            <div className="mt-6 space-y-8">
                {paper.sections.map((section, s_idx) => (
                    <div key={s_idx}>
                        <h5 className="text-xl font-bold text-teal-400 border-b-2 border-teal-500 pb-2 mb-4">{section.name}</h5>
                        <div className="space-y-6">
                            {section.questions.map((q, q_idx) => {
                                const isSelected = selectedQuestions.some(sq => sq.question === q.question);
                                return (
                                <div key={q_idx} className={`bg-gray-900/50 p-4 rounded-lg border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onQuestionSelect(q)}
                                                className="h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-600 mt-1 mr-4"
                                            />
                                            <p className="text-gray-200 leading-relaxed"><strong className="text-blue-300">Q{q_idx + 1}:</strong> {q.question}</p>
                                        </div>
                                        <span className="ml-4 flex-shrink-0 bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full">{q.marks} Marks</span>
                                    </div>
                                    <details className="group mt-3 ml-9">
                                        <summary className="text-md font-semibold text-green-400 cursor-pointer hover:text-green-300 transition-colors">View Answer</summary>
                                        <p className="mt-2 pt-2 border-t border-gray-700 text-gray-300 leading-loose">{q.answer}</p>
                                    </details>
                                </div>
                            )})}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Step5_Editor = ({ schoolName, maxMarks, selectedQuestions, setError }) => {
    const editorRef = useRef(null);
    const [isConverting, setIsConverting] = useState(false);

    const handleConvertToPdf = () => {
        const { jsPDF } = window.jspdf || {};
        const html2canvas = window.html2canvas;

        if (!jsPDF || !html2canvas) {
            setError("PDF generation library not loaded yet. Please wait a moment and try again.");
            return;
        }

        const editorContent = editorRef.current;
        if (!editorContent) return;
        
        setIsConverting(true);
        setError('');

        html2canvas(editorContent, {
            scale: 2, // Increase scale for better resolution
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            
            const imgWidth = pdfWidth - 20; // pdf width with margin
            const imgHeight = imgWidth / ratio;
            
            let heightLeft = imgHeight;
            let position = 10; // top margin

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);

            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10; // top margin for new page
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }
            
            pdf.save('question-paper.pdf');
            setIsConverting(false);
        }).catch(err => {
            setError("An error occurred during PDF conversion. Please try again.");
            console.error(err);
            setIsConverting(false);
        });
    };

    return (
        <div className="card-step">
            <div className="flex justify-between items-center mb-6">
                <h2 className="card-title !mb-0">Step 5: Finalize & Export</h2>
                <button
                    type="button"
                    onClick={handleConvertToPdf}
                    disabled={isConverting}
                    className="py-2 px-4 rounded-lg font-semibold bg-green-600 hover:bg-green-500 flex items-center transition disabled:opacity-50 disabled:cursor-wait"
                >
                    <DownloadIcon />
                    {isConverting ? 'Converting...' : 'Convert to PDF'}
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable={true}
                suppressContentEditableWarning={true}
                className="bg-white text-black p-8 rounded-lg min-h-[70vh] focus:outline-none focus:ring-4 focus:ring-blue-500"
                style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.5' }}
            >
                <h1 style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold' }}>{schoolName}</h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0' }}>
                    <p><strong>Subject: __________________</strong></p>
                    <p><strong>Max. Marks: {maxMarks}</strong></p>
                </div>
                <hr style={{ borderTop: '1px solid black', margin: '20px 0' }} />
                
                {selectedQuestions.map((q, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                        <p><strong>Q{index + 1}.</strong> {q.question} <span style={{ float: 'right' }}>({q.marks})</span></p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main Page Component ---

export default function Home() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        schoolName: '',
        maxMarks: 100,
        overallDifficulty: 'Medium',
        syllabusText: '',
        syllabusFile: null,
        sections: [{ name: 'Section A', difficulty: 'Medium', marksDistribution: { '2': 5, '5': 5 } }]
    });
    const [questionPaper, setQuestionPaper] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const isStep1Valid = useMemo(() => formData.schoolName.trim() !== '' && formData.maxMarks > 0, [formData.schoolName, formData.maxMarks]);
    const isStep2Valid = useMemo(() => formData.syllabusText.trim() !== '' || formData.syllabusFile !== null, [formData.syllabusText, formData.syllabusFile]);
    const isStep3Valid = useMemo(() => {
        if (formData.sections.length === 0) return false;
        const totalMarks = formData.sections.reduce((total, section) => {
            return total + Object.entries(section.marksDistribution).reduce((subTotal, [mark, count]) => {
                return subTotal + (parseInt(mark) * count);
            }, 0);
        }, 0);
        return totalMarks > 0; // Removed check against maxMarks to allow flexibility
    }, [formData.sections]);
    const isStep4Valid = useMemo(() => selectedQuestions.length > 0, [selectedQuestions]);

    const handleQuestionSelect = (question) => {
        setSelectedQuestions(prevSelected => {
            const isSelected = prevSelected.some(sq => sq.question === question.question);
            if (isSelected) {
                return prevSelected.filter(sq => sq.question !== question.question);
            } else {
                return [...prevSelected, question];
            }
        });
    };

    const handleGenerate = async () => {
        if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
            setError('Please ensure all previous steps are filled correctly.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setQuestionPaper(null);
        setSelectedQuestions([]);

        const data = new FormData();
        data.append('schoolName', formData.schoolName);
        data.append('maxMarks', formData.maxMarks);
        data.append('overallDifficulty', formData.overallDifficulty);
        data.append('syllabusText', formData.syllabusText);
        data.append('sections', JSON.stringify(formData.sections));
        
        if (formData.syllabusFile) {
            data.append('syllabusFile', formData.syllabusFile);
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/generate-paper-v2', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setQuestionPaper(result);
            setStep(4);

        } catch (err) {
            console.error("Generation failed:", err);
            setError(err.message || 'Failed to connect to the backend. Please ensure it is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <style jsx global>{`
                .card-step { @apply bg-gray-800/50 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-700 backdrop-blur-sm; }
                .card-title { @apply text-2xl font-bold mb-6 text-teal-300; }
                .form-label { @apply block mb-2 text-sm font-medium text-gray-300; }
                .form-input { @apply block w-full bg-gray-900/70 border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition; }
                .form-button { @apply w-full p-4 rounded-lg font-semibold text-center transition-all duration-300 transform hover:scale-105; }
                .form-button-sm { @apply w-full p-2 rounded-md font-semibold text-center transition-all duration-200; }
                .form-button-active { @apply bg-blue-600 text-white shadow-lg ring-2 ring-blue-400; }
                .form-button-inactive { @apply bg-gray-800 text-gray-300 hover:bg-gray-700; }
            `}</style>
            
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" async></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" async></script>

            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Stepper currentStep={step} />

                    {step === 1 && <Step1_BasicInfo data={formData} setData={setFormData} />}
                    {step === 2 && <Step2_Syllabus data={formData} setData={setFormData} />}
                    {step === 3 && <Step3_SectionConfig data={formData} setData={setFormData} />}
                    
                    {step === 4 && questionPaper && <Step4_QuestionSelection paper={questionPaper} selectedQuestions={selectedQuestions} onQuestionSelect={handleQuestionSelect} />}
                    
                    {step === 5 && <Step5_Editor schoolName={formData.schoolName} maxMarks={formData.maxMarks} selectedQuestions={selectedQuestions} setError={setError} />}

                    {isLoading && <div className="text-center mt-8 text-lg">Generating your paper... Please wait.</div>}
                    {error && <div className="text-center text-red-400 mt-8 p-4 bg-red-900/50 rounded-lg">{error}</div>}

                    <div className="mt-8 flex justify-between">
                        <button type="button" onClick={prevStep} disabled={step === 1 || isLoading} className="py-2 px-6 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition">Back</button>
                        
                        {step < 3 && <button type="button" onClick={nextStep} disabled={ (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) } className="py-2 px-6 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">Next</button>}
                        
                        {step === 3 && <button type="button" onClick={handleGenerate} disabled={!isStep3Valid || isLoading} className="py-3 px-8 rounded-lg font-bold text-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            {isLoading ? 'Generating...' : '✨ Generate Paper'}
                        </button>}

                        {step === 4 && <button type="button" onClick={nextStep} disabled={!isStep4Valid} className="py-2 px-6 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">Proceed to Editor</button>}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
