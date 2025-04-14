import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const variantSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  content: z.object({
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required'),
    imageUrl: z.string().optional(),
    actionUrl: z.string().optional(),
  }),
  targetPercentage: z.number().min(0).max(100),
});

const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  variants: z.array(variantSchema),
  startDate: z.date(),
  endDate: z.date(),
});

type TestFormData = z.infer<typeof testSchema>;

interface NotificationABTestFormProps {
  initialData?: Partial<TestFormData>;
  onSubmit: (data: TestFormData) => Promise<void>;
  isEditing?: boolean;
}

export const NotificationABTestForm: React.FC<NotificationABTestFormProps> = ({
  initialData,
  onSubmit,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: initialData,
  });

  const variants = watch('variants');

  const handleFormSubmit = async (data: TestFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('notifications.abTest.name')}
        </label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1"
          error={errors.name?.message}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('notifications.abTest.description')}
        </label>
        <Textarea
          id="description"
          {...register('description')}
          className="mt-1"
          error={errors.description?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            {t('notifications.abTest.startDate')}
          </label>
          <DatePicker
            id="startDate"
            control={control}
            name="startDate"
            className="mt-1"
            error={errors.startDate?.message}
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            {t('notifications.abTest.endDate')}
          </label>
          <DatePicker
            id="endDate"
            control={control}
            name="endDate"
            className="mt-1"
            error={errors.endDate?.message}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('notifications.abTest.variants')}
        </h3>
        {variants?.map((variant, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('notifications.abTest.variantId')}
                </label>
                <Input
                  {...register(`variants.${index}.variantId`)}
                  className="mt-1"
                  error={errors.variants?.[index]?.variantId?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('notifications.abTest.targetPercentage')}
                </label>
                <Input
                  type="number"
                  {...register(`variants.${index}.targetPercentage`, {
                    valueAsNumber: true,
                  })}
                  className="mt-1"
                  error={errors.variants?.[index]?.targetPercentage?.message}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('notifications.abTest.title')}
              </label>
              <Input
                {...register(`variants.${index}.content.title`)}
                className="mt-1"
                error={errors.variants?.[index]?.content?.title?.message}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                {t('notifications.abTest.body')}
              </label>
              <Textarea
                {...register(`variants.${index}.content.body`)}
                className="mt-1"
                error={errors.variants?.[index]?.content?.body?.message}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('notifications.abTest.imageUrl')}
                </label>
                <Input
                  {...register(`variants.${index}.content.imageUrl`)}
                  className="mt-1"
                  error={errors.variants?.[index]?.content?.imageUrl?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('notifications.abTest.actionUrl')}
                </label>
                <Input
                  {...register(`variants.${index}.content.actionUrl`)}
                  className="mt-1"
                  error={errors.variants?.[index]?.content?.actionUrl?.message}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white hover:bg-primary-dark"
        >
          {isSubmitting
            ? t('common.saving')
            : isEditing
              ? t('common.update')
              : t('common.create')}
        </Button>
      </div>
    </form>
  );
}; 