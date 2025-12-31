import { Download, ExternalLink, Minus, Plus, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"

import type { SearchResult } from "./index"

interface MobileSearchProps {
  scale: number
  searchText: string
  searchResults: SearchResult[]
  currentSearchIndex: number
  zoomIn: () => void
  zoomOut: () => void
  setSearchText: (text: string) => void
  searchInPDF: (query: string) => void
  clearSearch: () => void
  goToSearchResult: (index: number) => void
  highlightSearchText: (text: string, matchStart: number, matchEnd: number) => React.ReactNode
}

const RESUME_FILE = "/resume.pdf"

export default function MobileSearch({
  scale,
  searchText,
  searchResults,
  currentSearchIndex,
  zoomIn,
  zoomOut,
  setSearchText,
  searchInPDF,
  clearSearch,
  goToSearchResult,
  highlightSearchText,
}: MobileSearchProps) {
  return (
    <Drawer>
      {/* mobile toolbar */}
      <div className="bg-background/95 absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border p-2 shadow-lg backdrop-blur md:hidden">
        {/* zoom controls */}
        <Button onClick={zoomOut} variant="ghost" size="icon" className="h-10 w-10 rounded-full" title="Zoom out">
          <Minus className="h-4 w-4" />
        </Button>
        <div className="bg-muted flex min-w-[50px] items-center justify-center rounded-full px-3 py-2 text-xs font-medium">
          {Math.round(scale * 100)}%
        </div>
        <Button onClick={zoomIn} variant="ghost" size="icon" className="h-10 w-10 rounded-full" title="Zoom in">
          <Plus className="h-4 w-4" />
        </Button>
        <div className="bg-border mx-1 h-6 w-px" /> {/* divider */}
        {/* download */}
        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full" title="Download PDF">
          <a href={RESUME_FILE} download="Daniel Mamuza Resume.pdf">
            <Download className="h-4 w-4" />
          </a>
        </Button>
        {/* search button */}
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" title="Search">
            <Search className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
      </div>

      {/* mobile search drawer */}
      <DrawerContent className="h-[70vh] md:hidden">
        <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex flex-col items-start">
            <DrawerTitle className="text-lg font-semibold">Search Resume</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* search box */}
        <div className="border-b p-4">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search in document..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                searchInPDF(e.target.value)
              }}
              className="bg-background/80 pr-10 pl-10 backdrop-blur"
            />
            {searchText && (
              <Button
                onClick={clearSearch}
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
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
                <p className="text-muted-foreground text-sm">
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""} for "{searchText}"
                </p>
              </div>
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <DrawerClose key={index} asChild>
                    <div
                      className={`hover:bg-accent/50 cursor-pointer rounded-lg border p-3 transition-all ${
                        index === currentSearchIndex
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background/50 hover:border-accent backdrop-blur"
                      }`}
                      onClick={() => goToSearchResult(index)}
                    >
                      <div className="text-primary mb-2 text-xs font-semibold">
                        Result {index + 1} of {searchResults.length}
                      </div>
                      <div className="text-sm leading-relaxed">
                        {highlightSearchText(result.context, result.matchStart, result.matchEnd)}
                      </div>
                    </div>
                  </DrawerClose>
                ))}
              </div>
            </div>
          ) : searchText.trim() ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground text-sm">No results found</p>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-muted-foreground/60 text-sm">Start typing to search...</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
