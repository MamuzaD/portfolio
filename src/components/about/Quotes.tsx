import Autoplay from "embla-carousel-autoplay"

import { quotes } from "@/content/quotes"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { LinkPreview } from "@/components/ui/link-preview"

const Quotes = () => {
  return (
    <Carousel
      className="col-span-2 h-[176px] w-full rounded-lg"
      opts={{
        align: "center",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 4500,
          stopOnInteraction: false,
        }),
      ]}
    >
      <CarouselContent className="h-full justify-between px-4">
        {quotes.map((q, index) => (
          <CarouselItem key={index}>
            <div className="flex h-full flex-col gap-1 rounded-md p-4 font-light">
              <span className="mt-0.5 flex-grow text-lg font-normal">{`"${q.quote}"`}</span>
              <LinkPreview
                noUrl
                imageSrc={q.src}
                width={175}
                isStatic
                className="ml-1 cursor-default font-light"
                side="top"
                sideOffset={10}
                align="center"
                alignOffset={0}
              >
                <span>
                  {`- ${q.author}, `}
                  <i>{q.media}</i>
                </span>
              </LinkPreview>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default Quotes
