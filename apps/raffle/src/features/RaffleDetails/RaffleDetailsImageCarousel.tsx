'use client';

import { useState } from 'react';
import Image from 'next/image';

import { ZoomScan } from '@ergo-raffle/icons';
import {
  AspectRatio,
  Button,
  CardImageWrapper,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ergo-raffle/ui-kit';

export type RaffleDetailsImageCarouselProps = {
  placeholder?: string;
  pictures: string[];
};

export const RaffleDetailsImageCarousel = ({
  pictures,
  placeholder
}: RaffleDetailsImageCarouselProps) => {
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <Carousel onChangeSlide={setActiveIndex}>
        <CarouselContent>
          {pictures.map((picture) => (
            <CarouselItem key={picture}>
              <CardImageWrapper>
                <Image
                  src={picture}
                  priority
                  alt={placeholder ?? ''}
                  className="w-full object-cover rounded-tl-md rounded-tr-md"
                  fill
                  sizes="(max-width: 1024px) 100vw,33vw"
                  onError={(e) => {
                    e.currentTarget.src = '/illustrations/imagePlaceholderIllustration.svg';
                  }}
                />
              </CardImageWrapper>
            </CarouselItem>
          ))}
        </CarouselContent>
        {pictures.length > 1 ? (
          <>
            <CarouselNext />
            <CarouselPrevious />
            <CarouselDots />
          </>
        ) : null}
        <Button
          size="icon-sm"
          variant="white"
          className="absolute bottom-4 left-4"
          onClick={() => setPreviewDialogOpen(true)}
        >
          <ZoomScan className="size-6" />
        </Button>
      </Carousel>
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="min-w-[90vw] lg:min-w-4xl bg-transparent p-0">
          <DialogHeader className="my-1">
            <DialogTitle className="text-white-1 dark:text-black-1">Pictures preview</DialogTitle>
          </DialogHeader>
          <Carousel initialIndex={activeIndex}>
            <CarouselContent>
              {pictures.map((picture) => (
                <CarouselItem key={picture}>
                  <AspectRatio ratio={1.75 / 1}>
                    <Image
                      src={picture}
                      priority
                      alt={placeholder ?? ''}
                      className="w-full object-cover rounded-md"
                      fill
                      sizes="(max-width: 1024px) 1024px,90vw"
                      onError={(e) => {
                        e.currentTarget.src = '/illustrations/imagePlaceholderIllustration.svg';
                      }}
                    />
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            {pictures.length > 1 && (
              <>
                <CarouselNext />
                <CarouselPrevious />
                <CarouselDots />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};
