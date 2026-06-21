import { useEffect } from 'react';
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export function useFormAutoFocus<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
) {
  const {
    formState: { errors },
    setFocus,
  } = form;

  useEffect(() => {
    const entries = Object.keys(errors);
    if (entries.length > 0) {
      setFocus(entries[0] as Path<TFieldValues>);
    }
  }, [errors, setFocus]);
}
