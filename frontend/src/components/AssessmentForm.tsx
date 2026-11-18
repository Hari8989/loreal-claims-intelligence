import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { AssessmentFormValues } from '../types/assessment';

interface AssessmentFormProps {
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: AssessmentFormValues) => Promise<void>;
  onReset: () => void;
}

type FieldErrors = Partial<Record<keyof AssessmentFormValues, string>>;

const emptyValues: AssessmentFormValues = {
  productName: '',
  productCategory: '',
  claimText: '',
  evidenceText: '',
};

const limits: Record<keyof AssessmentFormValues, number> = {
  productName: 200,
  productCategory: 100,
  claimText: 10_000,
  evidenceText: 50_000,
};

export function AssessmentForm({
  isLoading,
  errorMessage,
  onSubmit,
  onReset,
}: AssessmentFormProps) {
  const id = useId();
  const [values, setValues] = useState(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function updateField(field: keyof AssessmentFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): { cleanValues: AssessmentFormValues; errors: FieldErrors } {
    const cleanValues = {
      productName: values.productName.trim(),
      productCategory: values.productCategory.trim(),
      claimText: values.claimText.trim(),
      evidenceText: values.evidenceText.trim(),
    };
    const errors: FieldErrors = {};

    (Object.keys(cleanValues) as Array<keyof AssessmentFormValues>).forEach(
      (field) => {
        if (!cleanValues[field]) {
          errors[field] = 'This field is required.';
        } else if (cleanValues[field].length > limits[field]) {
          errors[field] = `Please use ${limits[field].toLocaleString()} characters or fewer.`;
        }
      },
    );

    return { cleanValues, errors };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { cleanValues, errors } = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || isLoading) return;
    await onSubmit(cleanValues);
  }

  return (
    <form className="assessment-form" onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <div>
          <p className="eyebrow">Assessment brief</p>
          <h2>Define the claim</h2>
        </div>
        <span className="required-note">
          <span aria-hidden="true">*</span> Required
        </span>
      </div>

      {errorMessage && (
        <div className="form-alert" role="alert">
          <span className="alert-icon" aria-hidden="true">!</span>
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="form-grid">
        <TextField
          id={`${id}-product`}
          label="Product name"
          value={values.productName}
          maxLength={limits.productName}
          placeholder="e.g. Revitalift Clinical Serum"
          error={fieldErrors.productName}
          onChange={(value) => updateField('productName', value)}
        />
        <TextField
          id={`${id}-category`}
          label="Product category"
          value={values.productCategory}
          maxLength={limits.productCategory}
          placeholder="e.g. Skincare"
          error={fieldErrors.productCategory}
          onChange={(value) => updateField('productCategory', value)}
        />
      </div>

      <TextAreaField
        id={`${id}-claim`}
        label="Product claim"
        value={values.claimText}
        maxLength={limits.claimText}
        placeholder="Enter the exact consumer-facing claim you want to assess."
        helper="Use the precise wording that appears, or will appear, on pack or in communications."
        error={fieldErrors.claimText}
        onChange={(value) => updateField('claimText', value)}
      />

      <TextAreaField
        id={`${id}-evidence`}
        label="Scientific evidence"
        value={values.evidenceText}
        maxLength={limits.evidenceText}
        placeholder="Paste the study abstract, relevant results, or a concise evidence summary."
        helper="Only the evidence submitted here is evaluated. Include study context and limitations where available."
        error={fieldErrors.evidenceText}
        onChange={(value) => updateField('evidenceText', value)}
        rows={7}
      />

      <div className="form-footer">
        <p className="form-footnote">
          Assessment results support review. They do not authorize a claim.
        </p>
        <div className="form-actions">
          <button
            className="button button-quiet"
            type="button"
            onClick={onReset}
            disabled={isLoading}
          >
            Clear form
          </button>
          <button className="button button-primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="button-spinner" aria-hidden="true" />
                Assessing…
              </>
            ) : (
              <>
                Assess claim
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h11M10 5l5 5-5 5" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {isLoading ? 'Assessment in progress.' : ''}
      </p>
    </form>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}

function TextField({
  id,
  label,
  value,
  maxLength,
  placeholder,
  error,
  onChange,
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <span aria-hidden="true" className="required-mark">*</span>
      </label>
      <input
        id={id}
        name={id}
        type="text"
        required
        autoComplete="off"
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="field-meta">
        {error ? (
          <span className="field-error" id={errorId} role="alert">
            {error}
          </span>
        ) : (
          <span className="field-hint" id={hintId}>
            Required
          </span>
        )}
        <span className="character-count" aria-label={`${value.length} of ${maxLength} characters`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  placeholder: string;
  helper: string;
  error?: string;
  onChange: (value: string) => void;
  rows?: number;
}

function TextAreaField({
  id,
  label,
  value,
  maxLength,
  placeholder,
  helper,
  error,
  onChange,
  rows = 4,
}: TextAreaFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} <span aria-hidden="true" className="required-mark">*</span>
      </label>
      <textarea
        id={id}
        name={id}
        required
        maxLength={maxLength}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="field-meta">
        {error ? (
          <span className="field-error" id={errorId} role="alert">
            {error}
          </span>
        ) : (
          <span className="field-hint" id={hintId}>
            {helper}
          </span>
        )}
        <span className="character-count" aria-label={`${value.length} of ${maxLength} characters`}>
          {value.length.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
