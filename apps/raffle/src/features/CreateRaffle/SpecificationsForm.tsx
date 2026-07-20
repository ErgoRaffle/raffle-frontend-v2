'use client';

import { useFormContext } from 'react-hook-form';

import { AlertTriangle } from '@ergo-raffle/icons';
import {
  Button,
  Field,
  FieldAlert,
  FieldError,
  FieldLabel,
  Input,
  TagsInput,
  TextEditor,
  Typography,
  Uploader,
  useUploader
} from '@ergo-raffle/ui-kit';

import type { RaffleSpecificationsForm } from '@/features/schemas';
import { formatDuration } from '@/lib';

import { FieldTitle } from './FieldTitle';

export type SpecificationsFormProps = {
  handleNext: () => void;
};

export const SpecificationsForm = ({ handleNext }: SpecificationsFormProps) => {
  const {
    setValue,
    getValues,
    register,
    watch,
    formState: { errors }
  } = useFormContext<RaffleSpecificationsForm>();
  const images = getValues('images');
  const uploader = useUploader({
    files: images || [],
    maxFileSize: 1024 * 512,
    allowedFileTypes: ['.jpg', '.png', '.jpeg'],
    maxNumberOfFiles: 4,
    endpoint: process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL
  });
  const tags = watch('tags');
  const onSubmit = async () => {
    const images = await uploader.upload();
    if (!uploader.uploading) {
      setValue('images', images, {
        shouldDirty: true,
        shouldValidate: true
      });
      handleNext();
    }
  };

  const deadline = watch('deadline');

  const hasMoreThanAMonthDeadline = deadline > 21600;

  return (
    <div className="space-y-8">
      <Field>
        <FieldTitle title="Set Raffle’s Title/What is the mission of this Raffle?" />
        <Input
          variant="bordered"
          className="max-w-205"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {!!errors.name && <FieldError>{errors.name.message}</FieldError>}
      </Field>
      <Field>
        <FieldTitle title="Add a Description for your Raffle" />
        <Typography variant="subtitle-lg" className="mb-3">
          Only the first 200 words are used for SEO previews.
        </Typography>
        <TextEditor
          className="max-w-205"
          value={getValues('description') || ''}
          aria-invalid={!!errors.description}
          onChange={(value) => setValue('description', value as string, { shouldDirty: true })}
        />
        {!!errors.description && <FieldError>{errors.description.message}</FieldError>}
      </Field>
      <Field className="flex-1">
        <FieldLabel>Add up to 5 Tags (optional)</FieldLabel>
        <TagsInput
          tags={tags}
          aria-invalid={!!errors.tags}
          onSetTags={(tags) =>
            setValue('tags', tags, {
              shouldValidate: true,
              shouldDirty: true
            })
          }
        />
        {!!errors.tags && <FieldError>{errors.tags.message}</FieldError>}
      </Field>
      <Field>
        <FieldTitle title="Add up to 4 Photos" />
        <Typography variant="subtitle-lg" className="mb-3">
          Maximum file size: 512 KB
        </Typography>
        <Uploader {...uploader} />
      </Field>
      <Field>
        <FieldTitle title="Set Raffle’s Deadline." />
        <div className="flex items-center gap-x-5">
          <Input
            variant="bordered"
            className="md:max-w-70 grow"
            type="number"
            min={0}
            aria-invalid={!!errors.deadline}
            placeholder="Blocks to go"
            {...register('deadline', {
              valueAsNumber: true
            })}
          />
          {!!deadline && (
            <Typography
              variant="subtitle-lg"
              className={`whitespace-nowrap ${hasMoreThanAMonthDeadline ? 'text-alert' : 'text-gray-2'}`}
            >
              ≈ {formatDuration(deadline * 2)}
            </Typography>
          )}
        </div>
        {!!errors.deadline && <FieldError>{errors.deadline.message}</FieldError>}
        {hasMoreThanAMonthDeadline && (
          <FieldAlert className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            <Typography variant="body-lg" asChild>
              <span>
                The selected deadline is more than one month away. Make sure this is what you
                intended.
              </span>
            </Typography>
          </FieldAlert>
        )}
      </Field>
      <div className="flex items-center justify-end">
        <Button
          variant="primary"
          className="w-32.5 sm:w-70"
          onClick={onSubmit}
          type="button"
          disabled={uploader.uploading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
