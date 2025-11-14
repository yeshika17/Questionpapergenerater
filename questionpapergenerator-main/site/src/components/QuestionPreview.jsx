export default function QuestionPreview({ questions, onBack, onRegenerate }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Generated Questions</h2>
      
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Questions will appear here after generation</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-4">{section.name}</h3>
              
              <ol className="list-decimal pl-5 space-y-4">
                {section.questions.map((question, qIndex) => (
                  <li key={qIndex} className="pl-2">
                    <div className="flex justify-between">
                      <span>{question.text}</span>
                      <span className="font-medium ml-4">{question.marks} marks</span>
                    </div>
                    {question.difficulty && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full ml-2">
                        {question.difficulty}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
          
          <div className="flex space-x-4">
            <button
              onClick={onRegenerate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Regenerate
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Download as PDF
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back
        </button>
      </div>
    </div>
  )
}