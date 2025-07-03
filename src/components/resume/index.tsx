import { useCallback, useEffect, useRef, useState } from "react"

import MobileSearch from "./MobileSearch"
import PDFViewer from "./PDFViewer"
import SearchPanel from "./SearchPanel"

let Document: any, Page: any, pdfjs: any

export type SearchResult = {
  text: string
  context: string
  matchStart: number
  matchEnd: number
  beforeMatch: string
  afterMatch: string
  matchCountOnPage: number
}

export default function ResumeViewer() {
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const pageRef = useRef<HTMLDivElement | null>(null)
  const pdfContainerRef = useRef<HTMLDivElement>(null)

  // text cache for search
  const pdfTextCache = useRef<string | null>(null)

  useEffect(() => {
    const initializePdf = async () => {
      try {
        const reactPdf = await import("react-pdf")
        Document = reactPdf.Document
        Page = reactPdf.Page
        pdfjs = reactPdf.pdfjs

        await import("react-pdf/dist/Page/AnnotationLayer.css")
        await import("react-pdf/dist/Page/TextLayer.css")

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
    setPdfDocument(pdf)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error)
    setIsLoading(false)
  }

  const zoomIn = (): void => {
    setScale((prev) => Math.min(prev + 0.25, 2.0))
  }

  const zoomOut = (): void => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = (): void => {
    setScale(1.0)
  }

  const searchInPDF = async (searchQuery: string) => {
    if (!pdfDocument || !searchQuery.trim()) {
      setSearchResults([])
      setCurrentSearchIndex(-1)
      return
    }

    const results: any[] = []

    try {
      // cache text content for search
      if (!pdfTextCache.current) {
        const page = await pdfDocument.getPage(1)
        const textContent = await page.getTextContent()
        const textItems = textContent.items

        let pageText = ""
        textItems.forEach((item: any) => {
          pageText += item.str + " "
        })
        pdfTextCache.current = pageText
      }

      const pageText = pdfTextCache.current
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
      let match
      let matchCount = 0
      while ((match = regex.exec(pageText)) !== null) {
        const contextStart = Math.max(0, match.index - 25)
        const contextEnd = Math.min(pageText.length, match.index + match[0].length + 25)
        const fullContext = pageText.substring(contextStart, contextEnd)

        const beforeMatch = pageText.substring(Math.max(0, match.index - 50), match.index)
        const afterMatch = pageText.substring(
          match.index + match[0].length,
          Math.min(pageText.length, match.index + match[0].length + 50)
        )

        results.push({
          text: match[0],
          context: fullContext,
          matchStart: match.index - contextStart,
          matchEnd: match.index - contextStart + match[0].length,
          beforeMatch: beforeMatch.trim(),
          afterMatch: afterMatch.trim(),
          matchCountOnPage: matchCount,
        })
        matchCount++
      }

      setSearchResults(results)
      setCurrentSearchIndex(results.length > 0 ? 0 : -1)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const scrollToElement = useCallback((targetElement: HTMLElement, containerElement: HTMLElement) => {
    const containerRect = containerElement.getBoundingClientRect()
    const targetRect = targetElement.getBoundingClientRect()
    const scrollTop = containerElement.scrollTop

    const targetElementTop = scrollTop + (targetRect.top - containerRect.top)
    const containerHeight = containerElement.clientHeight
    const targetScrollTop = targetElementTop - containerHeight / 2

    containerElement.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    })

    targetElement.style.backgroundColor = "rgba(34, 197, 94, 0.3)"
    targetElement.style.transition = "background-color 0.3s ease"
    setTimeout(() => {
      targetElement.style.backgroundColor = ""
    }, 5000)
  }, [])

  const fallbackScroll = useCallback((pageElement: HTMLElement, containerElement: HTMLElement) => {
    const containerRect = containerElement.getBoundingClientRect()
    const pageRect = pageElement.getBoundingClientRect()
    const scrollTop = containerElement.scrollTop
    const targetScrollTop = scrollTop + (pageRect.top - containerRect.top) - 100

    containerElement.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    })
  }, [])

  const getSurroundingContext = useCallback((spans: NodeListOf<Element>, targetIndex: number, range = 5) => {
    let beforeContext = ""
    let afterContext = ""

    for (let i = Math.max(0, targetIndex - range); i < targetIndex; i++) {
      beforeContext += (spans[i].textContent || "") + " "
    }

    for (let i = targetIndex + 1; i < Math.min(spans.length, targetIndex + range + 1); i++) {
      afterContext += (spans[i].textContent || "") + " "
    }

    return { beforeContext: beforeContext.trim(), afterContext: afterContext.trim() }
  }, [])

  const goToSearchResult = useCallback(
    (index: number) => {
      if (index < 0 || index >= searchResults.length) return

      setCurrentSearchIndex(index)
      const result = searchResults[index]
      const pageElement = pageRef.current
      const containerElement = pdfContainerRef.current

      if (!pageElement || !containerElement) return

      try {
        const textLayer = pageElement.querySelector(".react-pdf__Page__textContent")
        if (!textLayer) {
          fallbackScroll(pageElement, containerElement)
          return
        }

        const textSpans = textLayer.querySelectorAll('[role="presentation"]')
        if (textSpans.length === 0) {
          fallbackScroll(pageElement, containerElement)
          return
        }

        const searchText = result.text.toLowerCase()
        const beforeText = result.beforeMatch.toLowerCase()
        const afterText = result.afterMatch.toLowerCase()
        let bestMatch: { element: HTMLElement; score: number } | null = null
        let currentOccurrence = 0

        const spanArray = Array.from(textSpans)

        for (let i = 0; i < spanArray.length; i++) {
          const span = spanArray[i]
          const spanText = (span.textContent || "").toLowerCase()

          if (!spanText.includes(searchText)) continue

          let score = 0

          if (spanText === searchText) {
            score = 100
          } else if (spanText.trim() === searchText) {
            score = 90
          } else {
            score = 50
          }

          if (beforeText.length > 3 || afterText.length > 3) {
            const context = getSurroundingContext(textSpans, i)

            if (beforeText.length > 3) {
              const beforeWords = beforeText.split(/\s+/).filter((w: string) => w.length > 2)
              const contextMatchCount = beforeWords.filter((word: string) =>
                context.beforeContext.toLowerCase().includes(word)
              ).length
              score += contextMatchCount * 15
            }

            if (afterText.length > 3) {
              const afterWords = afterText.split(/\s+/).filter((w: string) => w.length > 2)
              const contextMatchCount = afterWords.filter((word: string) =>
                context.afterContext.toLowerCase().includes(word)
              ).length
              score += contextMatchCount * 15
            }
          }

          if (currentOccurrence === result.matchCountOnPage) {
            score += 25
          }

          const spanRect = span.getBoundingClientRect()
          if (spanRect.width > 0 && spanRect.height > 0) {
            score += 5
          }

          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { element: span as HTMLElement, score }
          }

          currentOccurrence++
        }

        if (bestMatch) {
          scrollToElement(bestMatch.element, containerElement)
        } else {
          fallbackScroll(pageElement, containerElement)
        }
      } catch (error) {
        console.error("Error scrolling to search result:", error)
        fallbackScroll(pageElement, containerElement)
      }
    },
    [searchResults, scrollToElement, fallbackScroll, getSurroundingContext]
  )

  const highlightSearchText = (text: string, matchStart: number, matchEnd: number) => {
    const before = text.substring(0, matchStart)
    const match = text.substring(matchStart, matchEnd)
    const after = text.substring(matchEnd)

    return (
      <>
        {before}
        <mark className="rounded bg-primary/50 px-1 py-0.5 font-semibold text-primary">{match}</mark>
        {after}
      </>
    )
  }

  const clearSearch = (): void => {
    setSearchText("")
    setSearchResults([])
    setCurrentSearchIndex(-1)
  }

  return (
    <div className="relative h-[max(80vh,830px)] overflow-hidden rounded-3xl border shadow-aboutcard backdrop-blur">
      <div className="flex h-full">
        <PDFViewer
          Document={Document}
          Page={Page}
          loading={!isClient || !pdfLoaded || isLoading}
          scale={scale}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onDocumentLoadError={onDocumentLoadError}
          pageRef={pageRef}
          pdfContainerRef={pdfContainerRef}
        />

        {/* Desktop Search Panel */}
        <div className="hidden md:flex">
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

        {/* Mobile Search (Toolbar + Drawer) */}
        <div className="md:hidden">
          <MobileSearch
            scale={scale}
            searchText={searchText}
            searchResults={searchResults}
            currentSearchIndex={currentSearchIndex}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            setSearchText={setSearchText}
            searchInPDF={searchInPDF}
            clearSearch={clearSearch}
            goToSearchResult={goToSearchResult}
            highlightSearchText={highlightSearchText}
          />
        </div>
      </div>
    </div>
  )
}
