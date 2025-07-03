import { useEffect, useRef, useState } from "react"

import PDFViewer from "./PDFViewer"
import SearchPanel from "./SearchPanel"

let Document: any, Page: any, pdfjs: any

export default function ResumeViewer() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const pdfContainerRef = useRef<HTMLDivElement>(null)

  // initialize PDF.js on client side only
  useEffect(() => {
    const initializePdf = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const reactPdf = await import("react-pdf")
        Document = reactPdf.Document
        Page = reactPdf.Page
        pdfjs = reactPdf.pdfjs

        // Import CSS files dynamically for react-pdf 10.x
        await import("react-pdf/dist/Page/AnnotationLayer.css")
        await import("react-pdf/dist/Page/TextLayer.css")

        // Use CDN worker URL for better compatibility with Astro/Vite
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

        setIsClient(true)
        setPdfLoaded(true)
      } catch (err) {
        console.error("Failed to load PDF.js:", err)
        setIsLoading(false)
      }
    }

    initializePdf()
  }, [])

  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages)
    setPdfDocument(pdf)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error)
    setIsLoading(false)
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setScale(1.0)
  }

  // Enhanced search functionality
  const searchInPDF = async (searchQuery: string) => {
    if (!pdfDocument || !searchQuery.trim()) {
      setSearchResults([])
      setCurrentSearchIndex(-1)
      return
    }

    const results: any[] = []

    try {
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum)
        const textContent = await page.getTextContent()
        const textItems = textContent.items

        let pageText = ""
        textItems.forEach((item: any) => {
          pageText += item.str + " "
        })

        // Simple text search (case insensitive)
        const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
        let match
        let matchCount = 0
        while ((match = regex.exec(pageText)) !== null) {
          const contextStart = Math.max(0, match.index - 25)
          const contextEnd = Math.min(pageText.length, match.index + match[0].length + 25)
          const fullContext = pageText.substring(contextStart, contextEnd)

          // Store more context for better identification
          const beforeMatch = pageText.substring(Math.max(0, match.index - 50), match.index)
          const afterMatch = pageText.substring(
            match.index + match[0].length,
            Math.min(pageText.length, match.index + match[0].length + 50)
          )

          results.push({
            pageNumber: pageNum,
            text: match[0],
            index: match.index,
            context: fullContext,
            contextStart: contextStart,
            matchStart: match.index - contextStart,
            matchEnd: match.index - contextStart + match[0].length,
            beforeMatch: beforeMatch.trim(),
            afterMatch: afterMatch.trim(),
            matchCountOnPage: matchCount,
            globalIndex: results.length, // Global index across all pages
          })
          matchCount++
        }
      }

      setSearchResults(results)
      setCurrentSearchIndex(results.length > 0 ? 0 : -1)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const goToSearchResult = (index: number) => {
    if (index >= 0 && index < searchResults.length) {
      setCurrentSearchIndex(index)
      const result = searchResults[index]
      const pageNumber = result.pageNumber
      const pageElement = pageRefs.current[pageNumber]
      const containerElement = pdfContainerRef.current

      if (pageElement && containerElement) {
        // Wait a bit for the page to be fully rendered
        setTimeout(() => {
          try {
            // Find text layer elements in the page
            const textLayer = pageElement.querySelector(".react-pdf__Page__textContent")
            if (textLayer) {
              // Get all text spans in the page
              const textSpans = textLayer.querySelectorAll('[role="presentation"]')
              let targetElement = null
              let targetRect = null

              // Use more specific context to find the exact match
              const searchText = result.text.toLowerCase()
              const beforeText = result.beforeMatch.toLowerCase()
              const afterText = result.afterMatch.toLowerCase()
              const matchingSpans: { element: Element; score: number }[] = []

              // Build a text representation of all spans with their order
              const spansWithText: {
                element: Element
                text: string
                index: number
              }[] = []
              textSpans.forEach((span, index) => {
                spansWithText.push({
                  element: span,
                  text: (span.textContent || "").toLowerCase(),
                  index,
                })
              })

              for (let i = 0; i < spansWithText.length; i++) {
                const span = spansWithText[i]

                if (span.text.includes(searchText)) {
                  let score = 0

                  // Exact match gets highest score
                  if (span.text === searchText) {
                    score += 100
                  } else if (span.text.trim() === searchText) {
                    score += 90
                  } else {
                    score += 50
                  }

                  // Check before/after context by looking at neighboring spans
                  let beforeContext = ""
                  let afterContext = ""

                  // Collect text from previous spans
                  for (let j = Math.max(0, i - 5); j < i; j++) {
                    beforeContext += spansWithText[j].text + " "
                  }

                  // Collect text from next spans
                  for (let j = i + 1; j < Math.min(spansWithText.length, i + 6); j++) {
                    afterContext += spansWithText[j].text + " "
                  }

                  // Score based on before/after context match
                  if (beforeText.length > 10) {
                    const beforeWords = beforeText.split(/\s+/).filter((w: string) => w.length > 2)
                    beforeWords.forEach((word: string) => {
                      if (beforeContext.includes(word)) {
                        score += 20
                      }
                    })
                  }

                  if (afterText.length > 10) {
                    const afterWords = afterText.split(/\s+/).filter((w: string) => w.length > 2)
                    afterWords.forEach((word: string) => {
                      if (afterContext.includes(word)) {
                        score += 20
                      }
                    })
                  }

                  // Bonus for position match if this is the Nth occurrence on page
                  if (result.matchCountOnPage !== undefined) {
                    let currentOccurrence = 0
                    for (let k = 0; k <= i; k++) {
                      if (spansWithText[k].text.includes(searchText)) {
                        if (k === i && currentOccurrence === result.matchCountOnPage) {
                          score += 50
                        }
                        currentOccurrence++
                      }
                    }
                  }

                  matchingSpans.push({ element: span.element, score })
                }
              }

              // Sort by score and take the highest scoring match
              if (matchingSpans.length > 0) {
                matchingSpans.sort((a, b) => b.score - a.score)
                targetElement = matchingSpans[0].element
                targetRect = targetElement.getBoundingClientRect()
              }

              if (targetElement && targetRect) {
                // Calculate position relative to container
                const containerRect = containerElement.getBoundingClientRect()
                const pageRect = pageElement.getBoundingClientRect()
                const scrollTop = containerElement.scrollTop

                // Calculate the target scroll position to center the text
                const targetElementTop = scrollTop + (targetRect.top - containerRect.top)
                const containerHeight = containerElement.clientHeight
                const targetScrollTop = targetElementTop - containerHeight / 2

                containerElement.scrollTo({
                  top: Math.max(0, targetScrollTop),
                  behavior: "smooth",
                })

                // Highlight the found text temporarily
                if (targetElement && targetElement instanceof HTMLElement) {
                  targetElement.style.backgroundColor = "rgba(34, 197, 94, 0.3)"
                  targetElement.style.transition = "background-color 0.3s ease"
                  setTimeout(() => {
                    targetElement.style.backgroundColor = ""
                  }, 5000)
                }
              } else {
                // Fallback to page-level scrolling if text element not found
                const containerRect = containerElement.getBoundingClientRect()
                const pageRect = pageElement.getBoundingClientRect()
                const scrollTop = containerElement.scrollTop
                const targetScrollTop = scrollTop + (pageRect.top - containerRect.top) - 100

                containerElement.scrollTo({
                  top: Math.max(0, targetScrollTop),
                  behavior: "smooth",
                })
              }
            } else {
              // Fallback if no text layer found
              const containerRect = containerElement.getBoundingClientRect()
              const pageRect = pageElement.getBoundingClientRect()
              const scrollTop = containerElement.scrollTop
              const targetScrollTop = scrollTop + (pageRect.top - containerRect.top) - 100

              containerElement.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: "smooth",
              })
            }
          } catch (error) {
            console.error("Error scrolling to search result:", error)
            // Fallback to simple page scrolling
            const containerRect = containerElement.getBoundingClientRect()
            const pageRect = pageElement.getBoundingClientRect()
            const scrollTop = containerElement.scrollTop
            const targetScrollTop = scrollTop + (pageRect.top - containerRect.top) - 100

            containerElement.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: "smooth",
            })
          }
        }, 100) // Small delay to ensure text layer is rendered
      }
    }
  }

  const highlightSearchText = (text: string, matchStart: number, matchEnd: number) => {
    const before = text.substring(0, matchStart)
    const match = text.substring(matchStart, matchEnd)
    const after = text.substring(matchEnd)

    return (
      <>
        {before}
        <mark className="rounded bg-primary/20 px-1 py-0.5 font-semibold text-primary">{match}</mark>
        {after}
      </>
    )
  }

  const clearSearch = () => {
    setSearchText("")
    setSearchResults([])
    setCurrentSearchIndex(-1)
  }

  return (
    <div className="h-[max(80vh,825px)] overflow-hidden rounded-3xl border shadow-aboutcard backdrop-blur">
      {/* green highlight */}
      <style>{`
        .react-pdf__Page__textContent span::selection {
          background: rgba(17, 117, 33, 0.3) !important;
          color: transparent !important;
        }
       
        .react-pdf__Page__textContent span::-moz-selection {
          background: rgba(17, 117, 33, 0.3) !important;
          color: transparent !important;
        }
      `}</style>
      <div className="flex h-full">
        <PDFViewer
          Document={Document}
          Page={Page}
          loading={!isClient || !pdfLoaded || isLoading}
          numPages={numPages}
          scale={scale}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          pageRefs={pageRefs}
          pdfContainerRef={pdfContainerRef}
        />
        <SearchPanel
          scale={scale}
          searchText={searchText}
          searchResults={searchResults}
          currentSearchIndex={currentSearchIndex}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          setSearchText={setSearchText}
          searchInPDF={searchInPDF}
          clearSearch={clearSearch}
          goToSearchResult={goToSearchResult}
          highlightSearchText={highlightSearchText}
        />
      </div>
    </div>
  )
}
