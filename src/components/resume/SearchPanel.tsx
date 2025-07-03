import { Download, ExternalLink, Minus, Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SearchResult } from "./index"

interface SearchPanelProps {
  scale: number
  searchText: string
  searchResults: SearchResult[]
  currentSearchIndex: number
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setSearchText: (text: string) => void
  searchInPDF: (query: string) => void
  clearSearch: () => void
  goToSearchResult: (index: number) => void
  highlightSearchText: (text: string, matchStart: number, matchEnd: number) => React.ReactNode
}

const RESUME_FILE = "/resume.pdf"

export default function SearchPanel({
  scale,
  searchText,
  searchResults,
  currentSearchIndex,
  zoomIn,
  zoomOut,
  resetZoom,
  setSearchText,
  searchInPDF,
  clearSearch,
  goToSearchResult,
  highlightSearchText,
}: SearchPanelProps) {
  return (
    <div className="flex w-80 flex-col border-l bg-muted/80 backdrop-blur">
      <div className="border-b p-4">
        <div className="space-y-2">
          <Button asChild className="w-full bg-primary/90 backdrop-blur hover:bg-primary" title="Download PDF">
            <a href={RESUME_FILE} download="Daniel Mamuza Resume.pdf">
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
          <Button
            asChild
            className="w-full bg-neutral-400/10 text-foreground backdrop-blur hover:bg-neutral-400/20"
            title="Open PDF in browser"
          >
            <a href={RESUME_FILE} target="_blank">
              <ExternalLink className="h-4 w-4" />
              Open in Browser
            </a>
          </Button>
        </div>
      </div>

      {/* zoom */}
      <div className="border-b p-4">
        <h3 className="mb-3 font-semibold">Zoom</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={zoomOut}
            variant="outline"
            size="icon"
            className="bg-background/80 backdrop-blur"
            title="Zoom out (-)"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="min-w-16 rounded-md border bg-background/80 px-3 py-1 text-center backdrop-blur">
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          </div>

          <Button
            onClick={zoomIn}
            variant="outline"
            size="icon"
            className="bg-background/80 backdrop-blur"
            title="Zoom in (+)"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            onClick={resetZoom}
            variant="secondary"
            size="sm"
            className="bg-background/80 backdrop-blur"
            title="Reset zoom"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* search box */}
      <div className="border-b p-4">
        <h3 className="mb-3 font-semibold">Search</h3>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in document..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              searchInPDF(e.target.value)
            }}
            className="bg-background/80 pl-10 pr-10 backdrop-blur"
          />
          {searchText && (
            <Button
              onClick={clearSearch}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* search results */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {searchResults.length > 0 && searchText.trim() ? (
          <div className="p-4">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""} for "{searchText}"
              </p>
            </div>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg border p-3 transition-all hover:bg-accent/50 ${
                    index === currentSearchIndex
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/50 backdrop-blur hover:border-accent"
                  }`}
                  onClick={() => goToSearchResult(index)}
                >
                  <div className="mb-2 text-xs font-semibold text-primary">
                    Result {index + 1} of {searchResults.length}
                  </div>
                  <div className="text-sm leading-relaxed">
                    {highlightSearchText(result.context, result.matchStart, result.matchEnd)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchText.trim() ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground/60">Start typing to search...</p>
          </div>
        )}
      </div>
    </div>
  )
}
