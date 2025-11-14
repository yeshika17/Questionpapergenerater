export default function DifficultySelector({ register, control, watch }) {
  const sections = watch("sections")
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Difficulty Configuration</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Paper Difficulty</label>
        <select
          {...register('overallDifficulty')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="border p-4 rounded-lg">
          <h3 className="font-medium mb-2">{section.name}</h3>
          <select
            {...register(`sections.${sectionIndex}.difficulty`)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            <option value="">Use overall difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <div className="mt-4 space-y-4">
            {section.questions.map((question, qIndex) => (
              <div key={qIndex} className="flex items-center space-x-4">
                <span className="w-24">{question.marks} mark question(s)</span>
                <select
                  {...register(`sections.${sectionIndex}.questions.${qIndex}.difficulty`)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="">Use section difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}