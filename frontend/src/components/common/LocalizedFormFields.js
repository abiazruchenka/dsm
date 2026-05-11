export default function LocalizedFormFields({
  value = {},
  onChange,
  type = 'text',
  placeholderPrefix = 'Field',
  disabled = false,
  textareaRows = 4,
  requiredDe = false,
}) {
  const langs = [
    { key: 'de', label: 'DE' },
    { key: 'en', label: 'EN' },
    { key: 'fr', label: 'FR' },
  ];

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';
  const inputProps = type === 'textarea'
    ? { rows: textareaRows }
    : { type: 'text' };

  return (
    <>
      {langs.map(({ key, label }) => (
        <div key={key} className="form-group">
          <InputComponent
            value={value[key] ?? ''}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder={`${placeholderPrefix} (${label})`}
            disabled={disabled}
            required={requiredDe && key === 'de'}
            {...inputProps}
          />
        </div>
      ))}
    </>
  );
}
