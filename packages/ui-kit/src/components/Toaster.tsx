import { type ReactNode, useEffect, useState } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { Toaster as Sonner, toast as sonnerToast, type ToasterProps } from 'sonner';

import { Check, Clipboard, Close, Info } from '@ergo-raffle/icons';

import { cn, getErrorMessage } from '../lib/utils';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { Tooltip } from './Tooltip';
import { Typography } from './Typography';

export const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group pointer-events-none"
    offset={100}
    position="top-right"
    style={{ zIndex: 140 }}
    {...props}
  />
);

export const toastVariants = cva(
  'flex items-start gap-3 w-full rounded-md px-3 py-3.5 shadow-6 [&_svg:not([class*="size-"])]:size-9 z-120 overflow-hidden relative',
  {
    variants: {
      variant: {
        success: 'bg-success-light text-success-light-foreground',
        error: 'bg-error-light text-error-light-foreground',
        info: 'bg-background text-foreground',
        warning: 'bg-alert text-alert-foreground',
        loading: 'bg-background text-foreground'
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  }
);

const defaultIcons = {
  success: <Check />,
  info: <Info />,
  warning: <Info />,
  error: <Info />,
  loading: <Spinner />
};

export type CustomToastOptions = VariantProps<typeof toastVariants> & {
  icon?: ReactNode;
  errorDetails?: unknown;
  description?: string | ReactNode;
};

type CustomToastProps = {
  id: string | number;
  message: string;
} & CustomToastOptions;

export const CustomToast = ({
  id,
  message,
  variant = 'info',
  icon,
  description,
  errorDetails
}: CustomToastProps) => {
  const isError = variant === 'error';

  const duration = isError ? Infinity : 8000;

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Infinity) return;

    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, duration - elapsed);

      setProgress((remaining / duration) * 100);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const detailsStrings = [
    ...(typeof message === 'string' ? [message] : []),
    ...(typeof description === 'string' ? [description] : []),
    ...(errorDetails ? [getErrorMessage(errorDetails)] : [])
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(detailsStrings.join(' - '));
  };

  return (
    <div className={cn(toastVariants({ variant }), 'pointer-events-auto')}>
      <div className="flex items-center gap-3 grow">
        {icon ?? defaultIcons[variant || 'info']}
        <div className="grow">
          <Typography variant="body-lg" asChild>
            <div>{message}</div>
          </Typography>
          {!!description && (
            <Typography variant="subtitle-md" asChild className="text-gray-1">
              <div>{description}</div>
            </Typography>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {isError && detailsStrings.length > 0 && (
          <Tooltip content="Copy with details">
            <Button onClick={handleCopy} size="icon-xs" variant="plain" type="button">
              <Clipboard className="size-5" />
            </Button>
          </Tooltip>
        )}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sonnerToast.dismiss(id);
          }}
          size="icon-xs"
          variant="plain"
          type="button"
        >
          <Close className="size-5" />
        </Button>
      </div>
      {!isError && (
        <div className="absolute bottom-0 left-0 h-1 w-full">
          <div
            className={cn(
              'h-full transition-[width]',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-alert',
              variant === 'info' && 'bg-foreground'
            )}
            style={{
              width: `${100 - progress}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export const customToast = (message: string | ReactNode, options?: CustomToastOptions) =>
  sonnerToast.custom((id) => <CustomToast id={id} message={String(message)} {...options} />, {
    duration: options?.variant === 'error' ? Infinity : 8000
  });
