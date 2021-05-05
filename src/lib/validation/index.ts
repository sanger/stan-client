import * as Yup from "yup";

export const DEFAULT_PERMITTED_CHARS = /^[a-z0-9-_]+$/i;

/**
 * Returns a valdiator for a required string
 * @param params.label the name of the field to validate
 * @param params.oneOf if present, a list of valid strings
 * @param params.restrictChars if present, string much match the given regular expression
 * @param params.errorMessage if present, will be used for the restrictChars error message
 */
export function requiredString(params: {
  label: string;
  oneOf?: Array<string>;
  restrictChars?: RegExp;
  errorMessage?: string;
}): Yup.StringSchema {
  let validation = Yup.string().required().label(params.label);
  if (params.oneOf) {
    validation = validation.oneOf(params.oneOf);
  }
  if (params.restrictChars) {
    validation = validation
      .trim()
      .matches(
        params.restrictChars,
        params.errorMessage ??
          `${params.label} contains invalid characters. Only letters, numbers, hyphens, and underscores are permitted`
      );
  }
  return validation;
}

/**
 * Returns a validator for a required number
 * @param params.label the name of the field to validate
 * @param params.min the minimum number allowed
 * @param params.max the maximum number allowed
 */
export function requiredNumber(params: {
  label: string;
  min?: number;
  max?: number;
}): Yup.NumberSchema {
  let validation = Yup.number().integer().required().label(params.label);
  if (typeof params.min === "number") {
    validation = validation.min(params.min);
  }
  if (typeof params.max === "number") {
    validation = validation.max(params.max);
  }
  return validation;
}
