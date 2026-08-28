"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

const FIELD =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/80 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-background";

interface FieldWrapperProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ id, label, hint, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper id={fieldId} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(FIELD, error && "border-red-300 focus:border-red-400", className)}
        {...props}
      />
    </FieldWrapper>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper id={fieldId} label={label} hint={hint} error={error}>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(FIELD, "min-h-[120px] resize-y", error && "border-red-300", className)}
        {...props}
      />
    </FieldWrapper>
  );
});

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, id, children, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper id={fieldId} label={label} hint={hint} error={error}>
      <select ref={ref} id={fieldId} className={cn(FIELD, "pr-8", className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
});
