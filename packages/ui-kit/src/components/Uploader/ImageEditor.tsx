import type { Meta, UppyFile } from '@uppy/core';
import { useImageEditor } from '@uppy/react';

import { FlipVertical, Return, ZoomIn, ZoomOut } from '@ergo-raffle/icons';

import { useFramework } from '@/providers';

import { Button } from '../Button';
import { Typography } from '../Typography';

export type ImageEditorProps = {
  file: UppyFile<Meta, Record<string, never>>;
  onCancel: () => void;
};

export const ImageEditor = ({ file, onCancel }: ImageEditorProps) => {
  const Image = useFramework().components.Image;
  const {
    state,
    getImageProps,
    getSaveButtonProps,
    getCancelButtonProps,
    getFlipHorizontalButtonProps,
    getZoomButtonProps,
    getResetButtonProps,
    getRotationSliderProps
  } = useImageEditor({ file });

  const { src, ...imageProps } = getImageProps();

  return (
    <>
      <div className="h-44 w-64 md:w-lg md:h-88 mx-auto">
        {src ? (
          <Image
            src={src}
            {...imageProps}
            fill
            sizes="(max-width: 768px) 256px,(max-width: 1024px) 352px"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        <Typography variant="body-md">Fine Rotation: {state.angle}°</Typography>
        <input {...getRotationSliderProps()} />
      </div>
      <div className="flex items-center gap-2 justify-between">
        <Button variant="outline" size="sm" {...getResetButtonProps()}>
          <Return />
          Reset
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" {...getFlipHorizontalButtonProps()}>
            <FlipVertical />
          </Button>
          <Button variant="outline" size="icon-sm" {...getZoomButtonProps(0.1)}>
            <ZoomIn />
          </Button>
          <Button variant="outline" size="icon-sm" {...getZoomButtonProps(-0.1)}>
            <ZoomOut />
          </Button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row-reverse md:justify-between items-center gap-4 mt-4">
        <Button
          variant="primary"
          className="w-full md:w-32"
          {...getSaveButtonProps({ onClick: onCancel })}
        >
          Save
        </Button>
        <Button
          variant="outline"
          className="w-full md:w-32"
          {...getCancelButtonProps({ onClick: onCancel })}
        >
          Cancel
        </Button>
      </div>
    </>
  );
};
