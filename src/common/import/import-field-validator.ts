import { ImportFieldRule } from '../interfaces/column-metadata.interface';
import { ImportRowError } from '../interfaces/import-row-error.interface';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidIsoDate(value: unknown): boolean {
  if (!value) return false;
  return !isNaN(new Date(String(value)).getTime());
}

export function validateImportRow(
  row: Record<string, unknown>,
  rowNumber: number,
  rules: ImportFieldRule[],
  errors: ImportRowError[],
): void {
  for (const rule of rules) {
    const value = row[rule.field];
    const hasValue = value !== null && value !== undefined && value !== '';

    if (rule.required && !hasValue) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        observation: `El campo "${rule.field}" es requerido`,
      });
      continue;
    }

    if (!hasValue || !rule.validation) continue;

    const { type, maxLength, min, max, enumValues } = rule.validation;
    const strVal = String(value);

    if (type !== 'number' && maxLength && strVal.length > maxLength) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value: strVal,
        observation: `El campo "${rule.field}" no puede superar ${maxLength} caracteres`,
      });
    }

    if (type === 'date' && !isValidIsoDate(value)) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value: strVal,
        observation: `El campo "${rule.field}" debe ser una fecha válida en formato ISO 8601`,
      });
    }

    if (type === 'email' && !EMAIL_REGEX.test(strVal)) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value: strVal,
        observation: `El campo "${rule.field}" debe ser un correo electrónico válido`,
      });
    }

    if (type === 'boolean' && typeof value !== 'boolean') {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value: strVal,
        observation: `El campo "${rule.field}" debe ser true o false`,
      });
    }

    if (type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push({
          row: rowNumber,
          field: rule.field,
          value: strVal,
          observation: `El campo "${rule.field}" debe ser un número válido`,
        });
      } else {
        if (min !== undefined && num < min) {
          errors.push({
            row: rowNumber,
            field: rule.field,
            value: strVal,
            observation: `El valor de "${rule.field}" debe ser mayor o igual a ${min}`,
          });
        }
        if (max !== undefined && num > max) {
          errors.push({
            row: rowNumber,
            field: rule.field,
            value: strVal,
            observation: `El valor de "${rule.field}" debe ser menor o igual a ${max}`,
          });
        }
      }
    }

    if (type === 'enum' && enumValues?.length && !enumValues.includes(strVal)) {
      errors.push({
        row: rowNumber,
        field: rule.field,
        value: strVal,
        observation: `El campo "${rule.field}" debe ser: ${enumValues.join(', ')}`,
      });
    }
  }
}
