import type { ComponentProps } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { ExternalLink } from '@ergo-raffle/icons';

import { cn } from '@/lib/utils';

import { Skeleton } from './Skeleton';
import { Tooltip } from './Tooltip';

export const identifierSkeletonVariants = cva('w-full', {
  variants: {
    size: {
      md: 'h-3.75',
      lg: 'h-4.5'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export const identifierVariants = cva(
  'inline-flex items-center transition-all ease-in delay-100 text-black-2 hover:text-gray-2 [&_span]:border-b-1 [&_span]:border-b-transparent hover:[&_span]:border-b-gray-2 max-w-full',
  {
    variants: {
      size: {
        md: 'h-3.75 [&_svg]:size-3 typo-subtitle-md',
        lg: 'h-4.5 [&_svg]:size-5 typo-subtitle-lg'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export type IdentifierProps = ComponentProps<'div'> &
  VariantProps<typeof identifierVariants> & {
    href?: string;
    value?: string;
    loading?: boolean;
    trailingLength?: number;
  };

export const Identifier = (props: IdentifierProps) => {
  const { className, value = '', size, href, trailingLength = 5, loading, ...divProps } = props;
  return loading ? (
    <Skeleton className={cn(identifierSkeletonVariants({ size }))} />
  ) : (
    <Tooltip content={value}>
      <div
        data-slot="identifier"
        className={cn(identifierVariants({ size, className }))}
        {...divProps}
      >
        <div className="overflow-hidden inline-flex grow">
          <span className="shrink min-w-0 text-nowrap overflow-hidden text-ellipsis">
            {(value ?? '').slice(0, -trailingLength)}
          </span>
          <span className="shrink-0">{(value ?? '').slice(-trailingLength)}</span>
        </div>
        {href ? (
          <a href={href} target="_blank" rel="noopener">
            <ExternalLink />
          </a>
        ) : null}
      </div>
    </Tooltip>
  );
};
