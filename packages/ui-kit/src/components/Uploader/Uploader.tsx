import type { DragEvent } from 'react';

import type { Body, Meta, UppyFile } from '@uppy/core';
import { Thumbnail, UppyContextProvider } from '@uppy/react';

import { FolderOpen, Info, Pencil, PhotoScan, Trash } from '@ergo-raffle/icons';

import { Button } from '../Button';
import { Spinner } from '../Spinner';
import { Tooltip } from '../Tooltip';
import { Typography } from '../Typography';
import { ImageEditorDialog } from './ImageEditorDialog';
import { UploaderBrowse } from './UploaderBrowse';
import type { useUploader } from './useUploader';

export type UploaderProps = ReturnType<typeof useUploader>;

export const Uploader = ({
  edit,
  editing,
  error,
  files,
  instance,
  ready,
  uploading,
  moveFileToFirst,
  maxNumberOfFiles,
  addFiles
}: UploaderProps) => {
  void ready;

  const onDragAndDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  return (
    <UppyContextProvider uppy={instance}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-8 lg:gap-9 xl:gap-11">
        {files.map((file) => {
          const isFileLoading = !file.error && file.data?.size === 0;
          const isFileUploading = !!file.progress.uploadStarted && !file.progress.uploadComplete;
          const isFileActionsDisabled = isFileUploading || isFileLoading;
          const isFirst = files.findIndex((f) => f.id === file.id) === 0;

          return (
            <div key={file.id} className="item image-uploader-item">
              <div className=" rounded-xlg overflow-hidden relative bg-gray-4 text-gray-4-foreground w-full h-full">
                <Thumbnail file={file as UppyFile<Meta, Body>} images={!!file.data?.size} />
                <div
                  className={`absolute left-0 right-0 bottom-0 space-x-2 bg-black-3 p-2 gap-1 flex ${isFirst ? 'justify-end' : 'justify-between'} items-center`}
                >
                  {!isFirst && (
                    <Tooltip content="Mark as cover">
                      <Button
                        variant="white"
                        size="icon-sm"
                        type="button"
                        onClick={() => moveFileToFirst(file.id)}
                      >
                        <PhotoScan />
                      </Button>
                    </Tooltip>
                  )}
                  <div>
                    <Tooltip content="Edit">
                      <Button
                        disabled={isFileActionsDisabled || uploading}
                        variant="white"
                        size="icon-sm"
                        type="button"
                        onClick={() => edit(file.id)}
                      >
                        <Pencil />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Remove">
                      <Button
                        disabled={isFileActionsDisabled || uploading}
                        variant="white"
                        size="icon-sm"
                        type="button"
                        onClick={() => instance.removeFile(file.id)}
                      >
                        <Trash />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {!!isFileLoading && (
                  <div className="bg-white-3 text-white-1 flex items-center justify-center absolute w-full h-full left-0 top-0">
                    <Spinner className="size-12" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 px-2 gap-1 w-full">
                <Typography variant="body-md" className="flex items-center w-2/3">
                  <span className="inline-block text-ellipsis overflow-hidden text-nowrap">
                    {file.name.split('.').slice(0, 1).join('.')}
                  </span>
                  <span className="inline-block">
                    .{file.name.split('.').slice(1, 2).join('.')}
                  </span>
                </Typography>
                <Typography
                  variant="subtitle-sm"
                  className="text-nowrap flex items-center justify-end"
                >
                  {file.size ? `${Math.floor(file.size / 1000)} KB` : ''}{' '}
                  {!!file.error && (
                    <Tooltip content={file.error}>
                      <Info className="text-error size-6 ml-2" />
                    </Tooltip>
                  )}
                </Typography>
              </div>
            </div>
          );
        })}
        {(!maxNumberOfFiles || files.length < maxNumberOfFiles) && (
          // biome-ignore lint/a11y/noStaticElementInteractions: Drag and drop container
          <div
            className="item image-uploader-item flex"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={onDragAndDrop}
          >
            <UploaderBrowse>
              <Typography variant="body-lg" className="max-w-38 text-gray-2">
                Drag and drop or choose from files
              </Typography>
              <FolderOpen className="size-12 text-gray-3" />
            </UploaderBrowse>
          </div>
        )}
      </div>
      {!!editing && <ImageEditorDialog file={editing} onClose={() => edit(undefined)} />}
      {!!uploading && (
        <Typography variant="subtitle-md" className="text-gray-2 flex items-center gap-2 mt-2">
          <Spinner className="size-6" /> Uploading...
        </Typography>
      )}
      {!!error && (
        <Typography variant="subtitle-md" className="text-error mt-2">
          {error}
        </Typography>
      )}
    </UppyContextProvider>
  );
};
