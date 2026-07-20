import type { ComponentProps, KeyboardEvent } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';

import { Left, Right } from '@ergo-raffle/icons';

import { cn } from '@/lib/utils';

import { Button, type ButtonProps } from './Button';

export type CarouselApi = UseEmblaCarouselType[1];

export type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

export const CarouselContext = createContext<CarouselContextProps | null>(null);

export const useCarousel = () => {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
};

export type CarouselProps = ComponentProps<'div'> & {
  onChangeSlide?: (index: number) => void;
  initialIndex?: number;
};

export const Carousel = ({
  className,
  onChangeSlide,
  initialIndex = 0,
  children,
  ...props
}: CarouselProps) => {
  const [carouselRef, api] = useEmblaCarousel({ startIndex: initialIndex });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(
    (api: CarouselApi) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      onChangeSlide?.(api.selectedScrollSnap());
    },
    [onChangeSlide]
  );

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

export const CarouselContent = ({ className, ...props }: ComponentProps<'div'>) => {
  const { carouselRef } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn('flex -ml-4', className)} {...props} />
    </div>
  );
};

export type CarouselItemProps = ComponentProps<'div'>;

export const CarouselItem = ({ className, ...props }: CarouselItemProps) => (
  <div
    data-slot="carousel-item"
    className={cn('min-w-0 shrink-0 grow-0 basis-full pl-4', className)}
    {...props}
  />
);

export type CarouselNavButtonProps = ButtonProps;

export const CarouselPrevious = ({ className, ...props }: CarouselNavButtonProps) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button
      data-slot="carousel-previous"
      variant="ghost"
      size="icon-xs"
      className={cn(
        'rounded-full absolute touch-manipulation top-1/2 left-3.5 -translate-y-1/2',
        !canScrollPrev && 'opacity-50',
        className
      )}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      {...props}
    >
      <Left className="cn-rtl-flip" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
};

export const CarouselNext = ({ className, ...props }: CarouselNavButtonProps) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <Button
      data-slot="carousel-next"
      variant="ghost"
      size="icon-xs"
      className={cn(
        'rounded-full absolute touch-manipulation top-1/2 right-3.5 -translate-y-1/2',
        !canScrollNext && 'opacity-50',
        className
      )}
      onClick={scrollNext}
      disabled={!canScrollNext}
      {...props}
    >
      <Right className="cn-rtl-flip" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
};

export type CarouselDotsProps = ComponentProps<'div'>;

export const CarouselDots = ({ className, ...props }: CarouselDotsProps) => {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapPoints, setSnapPoints] = useState<number[]>([]);

  useEffect(() => {
    if (!api) return;

    setSnapPoints(api.scrollSnapList());

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    onSelect();

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  if (!snapPoints.length) return null;

  return (
    <div
      {...props}
      className={cn('flex justify-center absolute left-0 right-0 bottom-3.25', className)}
    >
      <div className="space-x-2 px-1 py-0.5 bg-white-4 rounded-base w-fit m-auto flex items-center">
        {snapPoints.map((_, index) => (
          <Button
            key={crypto.randomUUID()}
            onClick={() => api?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            variant="plain"
            className={cn(
              `flex size-2 sm:size-2 p-0 sm:p-0 rounded-full transition-all hover:bg-black-1/75 ${index === selectedIndex ? 'bg-black-1/75' : 'bg-black-1/35'}`
            )}
          />
        ))}
      </div>
    </div>
  );
};
