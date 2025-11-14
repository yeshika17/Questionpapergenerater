import { useFieldArray } from 'react-hook-form'

export default function SectionConfigurator({ control, register, errors, watch, onBack, onNext }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections"
  })

  const maxMarks = watch("maxMarks")
  const sections = watch("sections")
  
  const calculateUsedMarks = () => {
    return sections.reduce((total, section) => {
      return total + section.questions.reduce((sectionTotal, q) => {
        return sectionTotal + (q.marks * q.count)
      }, 0)
    }, 0)
  }

  const remainingMarks = maxMarks - calculateUsedMarks()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Section Configuration</h2>
      
      <div className="space-y-4">
        {fields.map((section, sectionIndex) => (
          <div key={section.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700">Section Name</label>
                <input
                  {...register(`sections.${sectionIndex}.name`)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(sectionIndex)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {section.questions.map((question, qIndex) => (
                <div key={qIndex} className="flex items-end space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marks per question</label>
                    <input
                      type="number"
                      {...register(`sections.${sectionIndex}.questions.${qIndex}.marks`, { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of questions</label>
                    <input
                      type="number"
                      {...register(`sections.${sectionIndex}.questions.${qIndex}.count`, { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentQuestions = [...sections[sectionIndex].questions]
                      currentQuestions.splice(qIndex, 1)
                      if (currentQuestions.length === 0) {
                        remove(sectionIndex)
                      } else {
                        // Update the section's questions
                      }
                    }}
                    className="text-red-600 hover:text-red-800 mb-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  const currentQuestions = [...sections[sectionIndex].questions]
                  const lastQuestion = currentQuestions[currentQuestions.length - 1]
                  append({
                    marks: lastQuestion?.marks || 2,
                    count: lastQuestion?.count || 1
                  }, { focusName: `sections.${sectionIndex}.questions.${currentQuestions.length}.marks` })
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add another question type
              </button>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => append({ name: `Section ${String.fromCharCode(65 + fields.length)}`, questions: [{ marks: 2, count: 1 }] })}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add another section
        </button>
      </div>
      
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="font-medium">
          Marks Used: {calculateUsedMarks()} / {maxMarks} 
          {remainingMarks > 0 ? (
            <span className="text-green-600"> (Remaining: {remainingMarks})</span>
          ) : remainingMarks < 0 ? (
            <span className="text-red-600"> (Over by {-remainingMarks})</span>
          ) : (
            <span className="text-blue-600"> (Perfect!)</span>
          )}
        </p>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={remainingMarks !== 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}