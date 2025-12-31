import type { RefObject } from "react"

interface PDFViewerProps {
  Document: any
  Page: any
  loading: boolean
  scale: number
  onDocumentLoadSuccess: (pdf: any) => void
  onDocumentLoadError: (error: Error) => void
  pageRef: RefObject<HTMLDivElement | null>
  pdfContainerRef: RefObject<HTMLDivElement | null>
}

const RESUME_FILE = "/resume.pdf"

const SKELETON_WIDTHS = ["94%", "91%", "97%", "99%", "97%", "96%", "93%", "98%", "95%"]

export default function PDFViewer({
  Document,
  Page,
  loading,
  scale,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  pageRef,
  pdfContainerRef,
}: PDFViewerProps) {
  return (
    <div ref={pdfContainerRef} className="custom-scrollbar bg-muted/50 flex-1 overflow-auto p-4">
      <style>{`
        .react-pdf__Page__textContent span::selection {
          background: rgba(34, 197, 94, 0.3) !important;
          color: transparent !important;
        }
       
        .react-pdf__Page__textContent span::-moz-selection {
          background: rgba(34, 197, 94, 0.3) !important;
          color: transparent !important;
        }
      `}</style>
      {loading && (
        <div className="flex min-w-fit flex-col items-center">
          <div className="min-w-fit overflow-hidden rounded-lg shadow-xl">
            <div className="from-muted/20 to-muted/40 h-[792px] w-[612px] bg-gradient-to-br">
              {/* header */}
              <div className="space-y-3 p-12">
                <div className="mx-auto h-8 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mx-auto h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
              </div>

              {/* bullet points */}
              <div className="space-y-6 px-12">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div
                      className="h-3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                      style={{ width: SKELETON_WIDTHS[i] }}
                    ></div>
                    <div className="h-3 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    {i % 3 === 0 && (
                      <div className="h-3 w-3/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    )}
                    {5 < i && i < 8 && (
                      <>
                        <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        <div className="h-3 w-8/12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {Document && Page && (
        <div className="flex min-h-full min-w-fit justify-center" style={{ width: "max-content", minWidth: "100%" }}>
          <Document
            file={RESUME_FILE}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            className="flex min-w-fit flex-col items-center"
          >
            <div className="flex min-w-fit flex-col gap-6">
              <div ref={pageRef} className="flex min-w-fit justify-center">
                <Page
                  pageNumber={1}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="min-w-fit overflow-hidden rounded-lg bg-white shadow-xl"
                />
              </div>
            </div>
          </Document>
        </div>
      )}
    </div>
  )
}
