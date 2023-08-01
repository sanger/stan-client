import * as validation from './index';
import * as Yup from 'yup';
import { GetRegistrationInfoQuery, LifeStage } from '../../types/sdk';

export default class RegistrationValidation {
  private registrationInfo: GetRegistrationInfoQuery;
  private tissueSampleRegistration: boolean;

  constructor(registrationInfo: GetRegistrationInfoQuery, tissueSampleRegistration?: boolean) {
    this.registrationInfo = registrationInfo;
    this.tissueSampleRegistration = tissueSampleRegistration ?? false;
  }
  get externalLabwareBarcode() {
    return validation.requiredString({
      label: 'External Labware Barcode'
    });
  }
  get xeniumBarcode() {
    return validation.requiredString({
      label: 'Xenium Barcode',
      restrictChars: /^[0-9]{7}$/,
      errorMessage: 'Xenium Barcode must be a 7 digit number.'
    });
  }

  get fixative() {
    return validation.requiredString({
      label: 'Fixative',
      oneOf: this.registrationInfo.fixatives.map((fixative) => fixative.name)
    });
  }

  get medium() {
    return validation.requiredString({
      label: 'Medium',
      oneOf: this.registrationInfo.mediums.map((m) => m.name)
    });
  }

  get solution() {
    return validation.requiredString({
      label: 'Solution',
      oneOf: this.registrationInfo.solutions.map((m) => m.name)
    });
  }

  get donorId() {
    return validation.requiredString({
      label: 'Donor ID',
      // Don't allow contiguous spaces
      restrictChars: /^(?!.*\s\s)[a-z0-9_ .\\/,:;-]+$/i,
      errorMessage:
        'Donor ID contains invalid characters. Only letters, numbers, spaces, hyphens, slashes, backslashes, commas, colons, semicolons, full stops and underscores are permitted.'
    });
  }

  get lifeStage() {
    return validation.requiredString({
      label: 'Life Stage',
      oneOf: Object.values(LifeStage)
    });
  }

  get species() {
    return validation.requiredString({
      label: 'Species',
      oneOf: this.registrationInfo.species.map((s) => s.name)
    });
  }

  get hmdmc() {
    return Yup.string().when('species', (species, schema) => {
      const val = species[0] as unknown as string;
      return val === 'Human'
        ? schema
            .oneOf(this.registrationInfo.hmdmcs.map((h) => h.hmdmc))
            .required()
            .label('HuMFre')
        : schema.length(0);
    });
  }

  get tissueType() {
    return validation.requiredString({
      label: 'Tissue Type',
      oneOf: this.registrationInfo.tissueTypes.map((tt) => tt.name)
    });
  }

  get externalIdentifier() {
    if (this.tissueSampleRegistration) {
      return validation.optionalString({
        label: 'External Identifier',
        restrictChars: validation.DEFAULT_PERMITTED_CHARS
      });
    } else {
      return validation.requiredString({
        label: 'External Identifier',
        restrictChars: validation.DEFAULT_PERMITTED_CHARS
      });
    }
  }

  get sectionExternalIdentifier() {
    return validation.requiredString({
      label: 'Section External Identifier',
      restrictChars: validation.DEFAULT_PERMITTED_CHARS
    });
  }

  get spatialLocation() {
    return validation.requiredNumber({
      label: 'Spatial Location',
      min: 0
    });
  }

  get replicateNumber() {
    if (this.tissueSampleRegistration) {
      return validation.optionalString({
        label: 'Replicate Number',
        restrictChars: /^[a-zA-Z0-9]{1,7}$/,
        errorMessage: 'Replicate number must be a string of up to 7 letters and numbers.'
      });
    } else {
      return validation.requiredString({
        label: 'Replicate Number',
        restrictChars: /^[a-zA-Z0-9]{1,7}$/,
        errorMessage: 'Replicate number must be a string of up to 7 letters and numbers.'
      });
    }
  }

  get lastKnownSectionNumber() {
    return validation.requiredNumber({
      label: 'Last Known Section Number',
      min: 0
    });
  }

  get sectionNumber() {
    return validation.requiredNumber({
      label: 'Section Number',
      min: 0
    });
  }
  get region() {
    return Yup.string()
      .oneOf(this.registrationInfo.slotRegions.map((sr) => sr.name))
      .label('Region')
      .test('Test', 'Section position is a required field for slot with multiple sections', (value, context) => {
        const pathKey = context.path;
        if (context.from && context.from.length > 1) {
          const values = context.from[1];
          const slotKey = Object.keys(values.value).find((key) => pathKey.includes(key));
          if (slotKey && values.value[slotKey as keyof typeof value].length > 1) {
            return !!value;
          } else return true;
        }
      })
      .test('Test', 'Unique value required for section position', (value, context) => {
        if (!value) return true;
        const pathKey = context.path;
        if (context.from && context.from.length > 1) {
          const values = context.from[1];
          const slotKey = Object.keys(values.value).find((key) => pathKey.includes(key));
          if (slotKey && values.value[slotKey as keyof typeof value].length > 1) {
            return values.value[slotKey as keyof typeof value].filter((item: any) => item.region === value).length <= 1;
          } else return true;
        } else return true;
      });
  }
  get sectionThickness() {
    return Yup.number().integer().min(0).label('Section Thickness');
  }

  get labwareType() {
    return validation.requiredString({
      label: 'Labware Type',
      oneOf: this.registrationInfo.labwareTypes.map((lt) => lt.name)
    });
  }

  get sampleCollectionDate() {
    return Yup.date().when('lifeStage', (lifeStage, schema) => {
      const val = lifeStage[0] as unknown as string;
      return val === LifeStage.Fetal
        ? schema
            .max(new Date(), `Please select a date on or before ${new Date().toLocaleDateString()}`)
            .nullable()
            .transform((curr, orig) => (orig === '' ? null : curr))
            .required('Sample Collection Date is a required field for fetal samples')
            .label('Sample Collection Date')
        : schema.notRequired();
    });
  }
}
