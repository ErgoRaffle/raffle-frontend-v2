import type { ComponentProps } from 'react';

import { Dialog as DialogPrimitive } from 'radix-ui';

import { Close } from '@ergo-raffle/icons';

import { cn } from '@/lib/utils';

import { Button } from './Button';

export type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;

export const Dialog = ({ ...props }: DialogProps) => (
  <DialogPrimitive.Root data-slot="dialog" {...props} />
);

export type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>;

export const DialogTrigger = ({ ...props }: DialogTriggerProps) => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
);

export type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>;

export const DialogPortal = ({ ...props }: DialogPortalProps) => (
  <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
);

export type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>;

export const DialogClose = ({ ...props }: DialogCloseProps) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
);

export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay>;

export const DialogOverlay = ({ className, ...props }: DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    data-slot="dialog-overlay"
    className={cn(
      'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black-5 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-110',
      className
    )}
    {...props}
  />
);

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
};

export const DialogContent = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        'bg-white-1 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 grid max-w-[calc(100%-2rem)] gap-4 rounded-md p-4 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-110 w-full -translate-x-1/2 -translate-y-1/2 not-has-data-[slot=dialog-header]:has-data-[slot=dialog-top-close]:pt-14 [&_[data-slot=dialog-header]]:pr-11 has-[&_[data-slot=dialog-top-close]]',
        className
      )}
      onPointerDownOutside={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-sonner-toaster]')) {
          e.preventDefault();
        }
      }}
      {...props}
    >
      {showCloseButton ? (
        <DialogPrimitive.Close data-slot="dialog-top-close" asChild>
          <Button variant="ghost" size="icon-sm" className="absolute top-2 right-2 z-110">
            <Close />
            <span className="sr-only">Close</span>
          </Button>
        </DialogPrimitive.Close>
      ) : null}
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
);

export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title>;

export const DialogTitle = ({ className, ...props }: DialogTitleProps) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn('typo-heading-4 text-black-1', className)}
    {...props}
  />
);

export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description>;

export const DialogDescription = ({ className, ...props }: DialogDescriptionProps) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn('typo-subtitle-md text-gray-1', className)}
    {...props}
  />
);

export type DialogHeaderProps = ComponentProps<'div'>;

export const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
  <div data-slot="dialog-header" className={cn('gap-0.5', className)} {...props} />
);

export type DialogFooterProps = ComponentProps<'div'>;

export const DialogFooter = ({ className, children, ...props }: DialogFooterProps) => (
  <div
    data-slot="dialog-footer"
    className={cn('gap-2 mt-auto flex flex-col', className)}
    {...props}
  >
    {children}
  </div>
);
