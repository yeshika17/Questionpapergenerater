import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

// Set worker path (important for production builds)
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`

export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = getDocument(arrayBuffer)
      const pdf = await loadingTask.promise
      
      let extractedText = ''
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const strings = textContent.items.map(item => ('str' in item) ? item.str : '')
        extractedText += strings.join(' ') + '\n'
      }
      
      resolve(extractedText)
    } catch (error) {
      reject(error)
    }
  })
}