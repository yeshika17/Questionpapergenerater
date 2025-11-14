'use client'
import { useState } from 'react'
import { extractTextFromPdf } from '@/utils/pdfExtractor'
import { useFormContext } from 'react-hook-form'

export default function SyllabusUpload() {
  const { register, setValue, watch, formState: { errors } } = useFormContext()
  const [uploadOption, setUploadOption] = useState<'text' | 'file'>('text')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<string | null>(null)
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsExtracting(true)
    setExtractionError(null)
    
    try {
      const extractedText = await extractTextFromPdf(file)
      setValue('syllabusText', extractedText)
      setValue('syllabusFile', file)
    } catch (error) {
      console.error('PDF extraction failed:', error)
      setExtractionError('Failed to extract text from PDF. Please try another file or enter text manually.')
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Syllabus Input</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          type="button"
          onClick={() => setUploadOption('text')}
          className={`px-4 py-2 rounded-md ${uploadOption === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Enter Text
        </button>
        <button
          type="button"
          onClick={() => setUploadOption('file')}
          className={`px-4 py-2 rounded-md ${uploadOption === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Upload PDF
        </button>
      </div>
      
      {uploadOption === 'text' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Syllabus Content</label>
          <textarea
            {...register('syllabusText')}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            placeholder="Paste the syllabus content here..."
          />
          {errors.syllabusText && (
            <p className="mt-1 text-sm text-red-600">{errors.syllabusText.message}</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Syllabus PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isExtracting}
          />
          <p className="mt-1 text-sm text-gray-500">We'll extract text from your PDF</p>
          
          {isExtracting && (
            <div className="mt-2 text-sm text-blue-600">Extracting text from PDF...</div>
          )}
          
          {extractionError && (
            <div className="mt-2 text-sm text-red-600">{extractionError}</div>
          )}
          
          {/* Hidden input to store the file in form state */}
          <input type="hidden" {...register('syllabusFile')} />
          
          {/* Display extracted text preview */}
          {watch('syllabusText') && !isExtracting && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Extracted Text Preview</label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-700 max-h-40 overflow-y-auto">
                {watch('syllabusText').substring(0, 500)}...
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {Math.ceil(watch('syllabusText').length / 1000)}k characters extracted
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}