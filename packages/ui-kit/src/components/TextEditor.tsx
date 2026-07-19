import { type ComponentProps, useEffect, useRef, useState } from 'react';

import type Quill from 'quill';

import {
  AlignCenter,
  AlignJustified,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  List,
  ListNumbers,
  Strikethrough,
  Underline
} from '@ergo-raffle/icons';

import { cn } from '@/lib';

import { Button } from './Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './Select';

export type TextEditorProps = Omit<ComponentProps<'div'>, 'value' | 'onChange'> & {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
};

export const TextEditor = ({
  value = '',
  onChange,
  placeholder = '',
  className,
  ...props
}: TextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (!editorRef.current) return;

    let isMounted = true;

    import('quill').then((QuillModule) => {
      if (!isMounted) return;
      if (!editorRef.current) return;
      if (!document.getElementById('toolbar')) return;

      const Quill = QuillModule.default;

      const quill = new Quill(editorRef.current, {
        placeholder,
        modules: {
          toolbar: '#toolbar'
        }
      });

      quill.root.innerHTML = value;

      quill.on('text-change', () => {
        const textLength = quill.getLength() - 1;
        setCharCount(textLength);
        onChange?.(quill.root.innerHTML);
      });

      quillRef.current = quill;
    });

    return () => {
      isMounted = false;
      quillRef.current = null;
    };
  }, [onChange, value, placeholder]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    if (value !== quill.root.innerHTML) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  const handleAlign = (value: string) => {
    const quill = quillRef.current;
    if (!quill) return;

    quill.format('align', value === 'left' ? false : value);
  };

  const alignIcons = {
    left: () => <AlignLeft />,
    right: () => <AlignRight />,
    center: () => <AlignCenter />,
    justify: () => <AlignJustified />
  };

  return (
    <div
      {...props}
      className={cn(
        'ql-wrapper border-gray-4 border rounded-3xlg aria-invalid:border-error',
        className
      )}
    >
      <div id="toolbar" className="px-4 py-3 flex items-center flex-wrap gap-x-3">
        <Button variant="plain" size="icon-xs" className="ql-bold" type="button">
          <Bold />
        </Button>
        <Button variant="plain" size="icon-xs" className="ql-italic" type="button">
          <Italic />
        </Button>
        <Button variant="plain" size="icon-xs" className="ql-underline" type="button">
          <Underline />
        </Button>
        <Button variant="plain" size="icon-xs" className="ql-strike" type="button">
          <Strikethrough />
        </Button>
        <Select onValueChange={handleAlign} defaultValue="left">
          <SelectTrigger
            variant="plain"
            size="sm"
            showIcon={false}
            className="focus-visible:border-0 px-0 sm:px-0 hover:bg-black-4 hover:text-black-4-foreground size-7 sm:size-8 justify-center"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(alignIcons).map(([key, Icon]) => (
                <SelectItem value={key} key={key}>
                  <Icon />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="plain" size="icon-xs" className="ql-link" type="button">
          <Link />
        </Button>
        <Button variant="plain" size="icon-xs" className="ql-list" value="ordered" type="button">
          <ListNumbers />
        </Button>
        <Button variant="plain" size="icon-xs" className="ql-list" value="bullet" type="button">
          <List />
        </Button>
      </div>
      <div ref={editorRef} className="min-h-50 border-0 typo-body-md px-4 py-3" />
      <div className="text-xs text-gray-500 px-6 py-2 text-right border-t border-t-gray-4">
        {charCount} characters
      </div>
    </div>
  );
};
