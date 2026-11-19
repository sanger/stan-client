/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema-types';

import { GraphQLClient, type RequestOptions } from 'graphql-request';
import { gql } from 'graphql-request';
export * from './schema-types';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
export type ActionFieldsFragment = { operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } };

export type AddressPermDataFieldsFragment = { address: string, controlType: Types.ControlType | null, seconds: number | null, selected: boolean };

export type AnalyserScanDataFieldsFragment = { probes: Array<string>, cellSegmentationRecorded: boolean, workNumberXeniumStudyIds: Array<{ workNumber: string, xeniumStudyId: number | null }> };

export type BioRiskFieldsFragment = { code: string, enabled: boolean };

export type CellClassFieldsFragment = { name: string, enabled: boolean };

export type CommentFieldsFragment = { id: number, text: string, category: string, enabled: boolean };

export type CostCodeFieldsFragment = { code: string, enabled: boolean };

export type DestructionReasonFieldsFragment = { id: number, text: string, enabled: boolean };

export type DnapStudyFieldsFragment = { ssId: number, name: string, enabled: boolean };

export type EquipmentFieldsFragment = { id: number, name: string, category: string, enabled: boolean };

export type FileFieldsFragment = { created: string, name: string, url: string, work: { workNumber: string } };

export type FixativeFieldsFragment = { name: string, enabled: boolean };

export type FlagBarcodesFieldsFragment = { barcodes: Array<string>, priority: Types.FlagPriority };

export type GraphSvgFieldsFragment = { svg: string };

export type HistoryEntryFieldsFragment = { destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null };

export type HistoryFieldsFragment = { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> };

export type HmdmcFieldsFragment = { hmdmc: string, enabled: boolean };

export type LabwareFieldsFragment = { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> };

export type LabwareFlaggedFieldsFragment = { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: Types.FlagPriority | null, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> };

export type LabwareRoiFieldsFragment = { barcode: string, rois: Array<{ address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }> };

export type LabwareTypeFieldsFragment = { name: string, numRows: number, numColumns: number, labelType: { name: string } | null };

export type LinkedLocationFieldsFragment = { barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean };

export type LocationFieldsFragment = { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: Types.GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> };

export type NextReplicateDataFieldsFragment = { barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number };

export type OmeroProjectFieldsFragment = { name: string, enabled: boolean };

export type OperationFieldsFragment = { id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: Types.UserRole } };

export type PlanActionFieldsFragment = { newSection: string | null, sampleThickness: string | null, sectioningOrder: number | null, sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } } }> }, destination: { address: string, labwareId: number } };

export type PrinterFieldsFragment = { name: string, labelTypes: Array<{ name: string }> };

export type ProbePanelFieldsFragment = { name: string, enabled: boolean, type: Types.ProbeType };

export type ProgramFieldsFragment = { name: string, enabled: boolean };

export type ProjectFieldsFragment = { name: string, enabled: boolean };

export type ProteinPanelFieldsFragment = { name: string, enabled: boolean };

export type ReagentPlateFieldsFragment = { barcode: string, numRows: number, numColumns: number, plateType: string | null, slots: Array<{ address: string, used: boolean }> };

export type ReagentSlotFieldsFragment = { address: string, used: boolean };

export type RegisterResultFieldsFragment = { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, clashes: Array<{ tissue: { externalName: string | null, donor: { donorName: string }, spatialLocation: { code: number, name: string, tissueType: { name: string } } }, labware: Array<{ barcode: string, labwareType: { name: string } }> }>, labwareSolutions: Array<{ barcode: string, solutionName: string } | null> };

export type ReleaseDestinationFieldsFragment = { name: string, enabled: boolean };

export type ReleaseFileOptionFieldsFragment = { displayName: string, queryParamName: string };

export type ReleaseRecipientFieldsFragment = { username: string, fullName: string | null, enabled: boolean };

export type RoiFieldsFragment = { address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } };

export type SampleBioRiskFieldsFragment = { sampleId: number, bioRiskCode: string };

export type SampleFieldsFragment = { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } };

export type SamplePositionFieldsFragment = { address: string, region: string, sampleId: number, slotId: number, operationId: number };

export type SlotCopyLoadFieldsFragment = { operationType: string, workNumber: string, lpNumber: string, executionType: Types.ExecutionType | null, labwareType: string | null, barcode: string | null, bioState: string | null, costing: Types.SlideCosting | null, lotNumber: string | null, probeLotNumber: string | null, preBarcode: string | null, cassetteLot: string | null, sources: Array<{ barcode: string, labwareState: Types.LabwareState }>, contents: Array<{ sourceBarcode: string, sourceAddress: string, destinationAddress: string }> };

export type SlotFieldsFragment = { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> };

export type SlotPassFailFieldsFragment = { address: string, result: Types.PassFail, comment: string | null };

export type SlotRegionFieldsFragment = { enabled: boolean, name: string };

export type SolutionFieldsFragment = { name: string, enabled: boolean };

export type SpeciesFieldsFragment = { name: string, enabled: boolean };

export type StainTypeFieldsFragment = { name: string, measurementTypes: Array<string> };

export type SuggestedWorkFieldsFragment = { barcode: string, workNumber: string | null };

export type TissueFieldsFragment = { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } };

export type TissueTypeFieldsFragment = { name: string, code: string, spatialLocations: Array<{ code: number, name: string }> };

export type TreatmentTypeFieldsFragment = { name: string, enabled: boolean };

export type UserFieldsFragment = { username: string, role: Types.UserRole };

export type WorkFieldsFragment = { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> };

export type WorkProgressFieldsFragment = { mostRecentOperation: string | null, workComment: string | null, work: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> }, timestamps: Array<{ type: string, timestamp: string }> };

export type WorkProgressTimeStampFieldFragment = { type: string, timestamp: string };

export type WorkSummaryGroupFieldsFragment = { numWorks: number, status: Types.WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { name: string, enabled: boolean } };

export type WorkTypeFieldsFragment = { name: string, enabled: boolean };

export type WorkWithCommentFieldsFragment = { comment: string | null, work: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type AddBioRiskMutationVariables = Exact<{
  code: string;
}>;


export type AddBioRiskMutation = { addBioRisk: { code: string, enabled: boolean } };

export type AddCommentMutationVariables = Exact<{
  category: string;
  text: string;
}>;


export type AddCommentMutation = { addComment: { id: number, text: string, category: string, enabled: boolean } };

export type AddCostCodeMutationVariables = Exact<{
  code: string;
}>;


export type AddCostCodeMutation = { addCostCode: { code: string, enabled: boolean } };

export type AddDestructionReasonMutationVariables = Exact<{
  text: string;
}>;


export type AddDestructionReasonMutation = { addDestructionReason: { id: number, text: string, enabled: boolean } };

export type AddEquipmentMutationVariables = Exact<{
  category: string;
  name: string;
}>;


export type AddEquipmentMutation = { addEquipment: { id: number, name: string, category: string, enabled: boolean } };

export type AddExternalIdMutationVariables = Exact<{
  request: Types.AddExternalIdRequest;
}>;


export type AddExternalIdMutation = { addExternalID: { operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type AddExternalIdsMutationVariables = Exact<{
  request: Types.AddExternalIdsRequest;
}>;


export type AddExternalIdsMutation = { addExternalIds: { operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type AddFixativeMutationVariables = Exact<{
  name: string;
}>;


export type AddFixativeMutation = { addFixative: { name: string, enabled: boolean } };

export type AddHmdmcMutationVariables = Exact<{
  hmdmc: string;
}>;


export type AddHmdmcMutation = { addHmdmc: { hmdmc: string, enabled: boolean } };

export type AddOmeroProjectMutationVariables = Exact<{
  name: string;
}>;


export type AddOmeroProjectMutation = { addOmeroProject: { name: string, enabled: boolean } };

export type AddProbePanelMutationVariables = Exact<{
  type: Types.ProbeType;
  name: string;
}>;


export type AddProbePanelMutation = { addProbePanel: { name: string, enabled: boolean, type: Types.ProbeType } };

export type AddProgramMutationVariables = Exact<{
  name: string;
}>;


export type AddProgramMutation = { addProgram: { name: string, enabled: boolean } };

export type AddProjectMutationVariables = Exact<{
  name: string;
}>;


export type AddProjectMutation = { addProject: { name: string, enabled: boolean } };

export type AddProteinPanelMutationVariables = Exact<{
  name: string;
}>;


export type AddProteinPanelMutation = { addProteinPanel: { name: string, enabled: boolean } };

export type AddReleaseDestinationMutationVariables = Exact<{
  name: string;
}>;


export type AddReleaseDestinationMutation = { addReleaseDestination: { name: string, enabled: boolean } };

export type AddReleaseRecipientMutationVariables = Exact<{
  username: string;
  fullName?: string | null | undefined;
}>;


export type AddReleaseRecipientMutation = { addReleaseRecipient: { username: string, fullName: string | null, enabled: boolean } };

export type AddSlotRegionMutationVariables = Exact<{
  name: string;
}>;


export type AddSlotRegionMutation = { addSlotRegion: { enabled: boolean, name: string } };

export type AddSolutionMutationVariables = Exact<{
  name: string;
}>;


export type AddSolutionMutation = { addSolution: { name: string, enabled: boolean } };

export type AddSpatialLocationsMutationVariables = Exact<{
  request: Types.AddSpatialLocationsRequest;
}>;


export type AddSpatialLocationsMutation = { addSpatialLocations: { name: string, spatialLocations: Array<{ code: number, name: string }> } };

export type AddSpeciesMutationVariables = Exact<{
  name: string;
}>;


export type AddSpeciesMutation = { addSpecies: { name: string, enabled: boolean } };

export type AddTissueTypeMutationVariables = Exact<{
  request: Types.AddTissueTypeRequest;
}>;


export type AddTissueTypeMutation = { addTissueType: { name: string, code: string, spatialLocations: Array<{ code: number, name: string }> } };

export type AddTreatmentTypeMutationVariables = Exact<{
  name: string;
}>;


export type AddTreatmentTypeMutation = { addTreatmentType: { name: string, enabled: boolean } };

export type AddUserMutationVariables = Exact<{
  username: string;
}>;


export type AddUserMutation = { addUser: { username: string, role: Types.UserRole } };

export type AddWorkTypeMutationVariables = Exact<{
  name: string;
}>;


export type AddWorkTypeMutation = { addWorkType: { name: string, enabled: boolean } };

export type AliquotMutationVariables = Exact<{
  request: Types.AliquotRequest;
}>;


export type AliquotMutation = { aliquot: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ operationType: { name: string }, actions: Array<{ sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number }> }, destination: { address: string, labwareId: number } }> }> } };

export type ConfirmMutationVariables = Exact<{
  request: Types.ConfirmOperationRequest;
}>;


export type ConfirmMutation = { confirmOperation: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type ConfirmSectionMutationVariables = Exact<{
  request: Types.ConfirmSectionRequest;
}>;


export type ConfirmSectionMutation = { confirmSection: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type CreateWorkMutationVariables = Exact<{
  prefix: string;
  workTypes: Array<string>;
  workRequester: string;
  project: string;
  program: string;
  costCode: string;
  numBlocks?: number | null | undefined;
  numSlides?: number | null | undefined;
  numOriginalSamples?: number | null | undefined;
  omeroProject?: string | null | undefined;
  ssStudyId?: number | null | undefined;
  xeniumStudyId?: number | null | undefined;
  ateraStudyId?: number | null | undefined;
  treatmentTypes?: Array<string> | null | undefined;
  facultyLead: string;
}>;


export type CreateWorkMutation = { createWork: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type DestroyMutationVariables = Exact<{
  request: Types.DestroyRequest;
}>;


export type DestroyMutation = { destroy: { destructions: Array<{ labware: { barcode: string } | null }> } };

export type EmptyLocationMutationVariables = Exact<{
  barcode: string;
}>;


export type EmptyLocationMutation = { empty: { numUnstored: number } };

export type ExtractMutationVariables = Exact<{
  request: Types.ExtractRequest;
}>;


export type ExtractMutation = { extract: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ operationType: { name: string }, actions: Array<{ sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number }> }, destination: { address: string, labwareId: number } }> }> } };

export type FlagLabwareMutationVariables = Exact<{
  request: Types.FlagLabwareRequest;
}>;


export type FlagLabwareMutation = { flagLabware: { operations: Array<{ id: number }> } };

export type LoginMutationVariables = Exact<{
  username: string;
  password: string;
}>;


export type LoginMutation = { login: { user: { username: string, role: Types.UserRole } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: string | null };

export type PerformLibraryConstructionMutationVariables = Exact<{
  requests: Array<Types.LibraryConRequest>;
}>;


export type PerformLibraryConstructionMutation = { libraryCon: { operations: Array<{ id: number }> } };

export type PerformParaffinProcessingMutationVariables = Exact<{
  request: Types.ParaffinProcessingRequest;
}>;


export type PerformParaffinProcessingMutation = { performParaffinProcessing: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PerformSolutionTransferMutationVariables = Exact<{
  request: Types.SolutionTransferRequest;
}>;


export type PerformSolutionTransferMutation = { performSolutionTransfer: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PerformTissueBlockMutationVariables = Exact<{
  request: Types.TissueBlockRequest;
}>;


export type PerformTissueBlockMutation = { performTissueBlock: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PerformTissuePotMutationVariables = Exact<{
  request: Types.PotProcessingRequest;
}>;


export type PerformTissuePotMutation = { performPotProcessing: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PlanMutationVariables = Exact<{
  request: Types.PlanRequest;
}>;


export type PlanMutation = { plan: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ operationType: { name: string } | null, planActions: Array<{ newSection: string | null, sampleThickness: string | null, sectioningOrder: number | null, sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } } }> }, destination: { address: string, labwareId: number } }> }> } };

export type PrintMutationVariables = Exact<{
  barcodes: Array<string>;
  printer: string;
}>;


export type PrintMutation = { printLabware: string | null };

export type ReactivateLabwareMutationVariables = Exact<{
  items: Array<Types.ReactivateLabware>;
}>;


export type ReactivateLabwareMutation = { reactivateLabware: { labware: Array<{ barcode: string, state: Types.LabwareState }>, operations: Array<{ id: number }> } };

export type RecordAnalyserMutationVariables = Exact<{
  request: Types.AnalyserRequest;
}>;


export type RecordAnalyserMutation = { recordAnalyser: { operations: Array<{ id: number }> } };

export type RecordCompletionMutationVariables = Exact<{
  request: Types.CompletionRequest;
}>;


export type RecordCompletionMutation = { recordCompletion: { operations: Array<{ id: number }> } };

export type RecordComplexStainMutationVariables = Exact<{
  request: Types.ComplexStainRequest;
}>;


export type RecordComplexStainMutation = { recordComplexStain: { operations: Array<{ id: number }> } };

export type RecordExtractResultMutationVariables = Exact<{
  request: Types.ExtractResultRequest;
}>;


export type RecordExtractResultMutation = { recordExtractResult: { operations: Array<{ id: number }> } };

export type RecordInPlaceMutationVariables = Exact<{
  request: Types.InPlaceOpRequest;
}>;


export type RecordInPlaceMutation = { recordInPlace: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RecordLibraryPrepMutationVariables = Exact<{
  request: Types.LibraryPrepRequest;
}>;


export type RecordLibraryPrepMutation = { libraryPrep: { operations: Array<{ id: number }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RecordMetricsMutationVariables = Exact<{
  request: Types.SampleMetricsRequest;
}>;


export type RecordMetricsMutation = { recordSampleMetrics: { operations: Array<{ id: number }> } };

export type RecordOpWithSlotCommentsMutationVariables = Exact<{
  request: Types.OpWithSlotCommentsRequest;
}>;


export type RecordOpWithSlotCommentsMutation = { recordOpWithSlotComments: { operations: Array<{ id: number }> } };

export type RecordOpWithSlotMeasurementsMutationVariables = Exact<{
  request: Types.OpWithSlotMeasurementsRequest;
}>;


export type RecordOpWithSlotMeasurementsMutation = { recordOpWithSlotMeasurements: { operations: Array<{ id: number }> } };

export type RecordOrientationQcMutationVariables = Exact<{
  request: Types.OrientationRequest;
}>;


export type RecordOrientationQcMutation = { recordOrientationQC: { operations: Array<{ id: number }> } };

export type RecordPermMutationVariables = Exact<{
  request: Types.RecordPermRequest;
}>;


export type RecordPermMutation = { recordPerm: { operations: Array<{ id: number }> } };

export type RecordProbeOperationMutationVariables = Exact<{
  request: Types.ProbeOperationRequest;
}>;


export type RecordProbeOperationMutation = { recordProbeOperation: { operations: Array<{ id: number }> } };

export type RecordQcLabwareMutationVariables = Exact<{
  request: Types.QcLabwareRequest;
}>;


export type RecordQcLabwareMutation = { recordQCLabware: { operations: Array<{ id: number }> } };

export type RecordReagentTransferMutationVariables = Exact<{
  request: Types.ReagentTransferRequest;
}>;


export type RecordReagentTransferMutation = { reagentTransfer: { operations: Array<{ id: number }> } };

export type RecordRnaAnalysisMutationVariables = Exact<{
  request: Types.RnaAnalysisRequest;
}>;


export type RecordRnaAnalysisMutation = { recordRNAAnalysis: { operations: Array<{ id: number }> } };

export type RecordSampleProcessingCommentsMutationVariables = Exact<{
  request: Types.SampleProcessingCommentRequest;
}>;


export type RecordSampleProcessingCommentsMutation = { recordSampleProcessingComments: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type RecordStainResultMutationVariables = Exact<{
  request: Types.ResultRequest;
}>;


export type RecordStainResultMutation = { recordStainResult: { operations: Array<{ id: number }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RecordVisiumQcMutationVariables = Exact<{
  request: Types.ResultRequest;
}>;


export type RecordVisiumQcMutation = { recordVisiumQC: { operations: Array<{ id: number }> } };

export type RegisterAsEndUserMutationVariables = Exact<{
  username: string;
  password: string;
}>;


export type RegisterAsEndUserMutation = { registerAsEndUser: { user: { username: string, role: Types.UserRole } | null } };

export type RegisterOriginalSamplesMutationVariables = Exact<{
  request: Types.OriginalSampleRegisterRequest;
}>;


export type RegisterOriginalSamplesMutation = { registerOriginalSamples: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, clashes: Array<{ tissue: { externalName: string | null, donor: { donorName: string }, spatialLocation: { code: number, name: string, tissueType: { name: string } } }, labware: Array<{ barcode: string, labwareType: { name: string } }> }>, labwareSolutions: Array<{ barcode: string, solutionName: string } | null> } };

export type RegisterSectionsMutationVariables = Exact<{
  request: Types.SectionRegisterRequest;
}>;


export type RegisterSectionsMutation = { registerSections: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RegisterTissuesMutationVariables = Exact<{
  request: Types.BlockRegisterRequest;
}>;


export type RegisterTissuesMutation = { registerBlocks: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, clashes: Array<{ tissue: { externalName: string | null, donor: { donorName: string }, spatialLocation: { code: number, name: string, tissueType: { name: string } } }, labware: Array<{ barcode: string, labwareType: { name: string } }> }>, labwareSolutions: Array<{ barcode: string, solutionName: string } | null> } };

export type ReleaseLabwareMutationVariables = Exact<{
  releaseRequest: Types.ReleaseRequest;
}>;


export type ReleaseLabwareMutation = { release: { releases: Array<{ id: number, labware: { barcode: string }, destination: { name: string }, recipient: { username: string } }> } };

export type SaveSlotCopyMutationVariables = Exact<{
  request: Types.SlotCopySave;
}>;


export type SaveSlotCopyMutation = { saveSlotCopy: { operationType: string, workNumber: string, lpNumber: string, executionType: Types.ExecutionType | null, labwareType: string | null, barcode: string | null, bioState: string | null, costing: Types.SlideCosting | null, lotNumber: string | null, probeLotNumber: string | null, preBarcode: string | null, cassetteLot: string | null, sources: Array<{ barcode: string, labwareState: Types.LabwareState }>, contents: Array<{ sourceBarcode: string, sourceAddress: string, destinationAddress: string }> } };

export type SegmentationMutationVariables = Exact<{
  request: Types.SegmentationRequest;
}>;


export type SegmentationMutation = { segmentation: { operations: Array<{ id: number }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type SetBioRiskEnabledMutationVariables = Exact<{
  code: string;
  enabled: boolean;
}>;


export type SetBioRiskEnabledMutation = { setBioRiskEnabled: { code: string, enabled: boolean } };

export type SetCellClassEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetCellClassEnabledMutation = { setCellClassEnabled: { name: string, enabled: boolean } };

export type SetCommentEnabledMutationVariables = Exact<{
  commentId: number;
  enabled: boolean;
}>;


export type SetCommentEnabledMutation = { setCommentEnabled: { id: number, text: string, category: string, enabled: boolean } };

export type SetCostCodeEnabledMutationVariables = Exact<{
  code: string;
  enabled: boolean;
}>;


export type SetCostCodeEnabledMutation = { setCostCodeEnabled: { code: string, enabled: boolean } };

export type SetDestructionReasonEnabledMutationVariables = Exact<{
  text: string;
  enabled: boolean;
}>;


export type SetDestructionReasonEnabledMutation = { setDestructionReasonEnabled: { id: number, text: string, enabled: boolean } };

export type SetEquipmentEnabledMutationVariables = Exact<{
  equipmentId: number;
  enabled: boolean;
}>;


export type SetEquipmentEnabledMutation = { setEquipmentEnabled: { id: number, name: string, category: string, enabled: boolean } };

export type SetFixativeEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetFixativeEnabledMutation = { setFixativeEnabled: { name: string, enabled: boolean } };

export type SetHmdmcEnabledMutationVariables = Exact<{
  hmdmc: string;
  enabled: boolean;
}>;


export type SetHmdmcEnabledMutation = { setHmdmcEnabled: { hmdmc: string, enabled: boolean } };

export type SetLocationCustomNameMutationVariables = Exact<{
  locationBarcode: string;
  newCustomName: string;
}>;


export type SetLocationCustomNameMutation = { setLocationCustomName: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: Types.GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type SetOmeroProjectEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetOmeroProjectEnabledMutation = { setOmeroProjectEnabled: { name: string, enabled: boolean } };

export type SetOpWorkRequestMutationVariables = Exact<{
  request: Types.OpWorkRequest;
}>;


export type SetOpWorkRequestMutation = { setOperationWork: Array<{ id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: Types.UserRole } }> };

export type SetProbePanelEnabledMutationVariables = Exact<{
  type: Types.ProbeType;
  name: string;
  enabled: boolean;
}>;


export type SetProbePanelEnabledMutation = { setProbePanelEnabled: { name: string, enabled: boolean, type: Types.ProbeType } };

export type SetProgramEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetProgramEnabledMutation = { setProgramEnabled: { name: string, enabled: boolean } };

export type SetProjectEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetProjectEnabledMutation = { setProjectEnabled: { name: string, enabled: boolean } };

export type SetProteinPanelEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetProteinPanelEnabledMutation = { setProteinPanelEnabled: { name: string, enabled: boolean } };

export type SetReleaseDestinationEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetReleaseDestinationEnabledMutation = { setReleaseDestinationEnabled: { name: string, enabled: boolean } };

export type SetReleaseRecipientEnabledMutationVariables = Exact<{
  username: string;
  enabled: boolean;
}>;


export type SetReleaseRecipientEnabledMutation = { setReleaseRecipientEnabled: { username: string, fullName: string | null, enabled: boolean } };

export type SetSlotRegionEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetSlotRegionEnabledMutation = { setSlotRegionEnabled: { enabled: boolean, name: string } };

export type SetSolutionEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetSolutionEnabledMutation = { setSolutionEnabled: { name: string, enabled: boolean } };

export type SetSpeciesEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetSpeciesEnabledMutation = { setSpeciesEnabled: { name: string, enabled: boolean } };

export type SetTreatmentTypeEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetTreatmentTypeEnabledMutation = { setTreatmentTypeEnabled: { name: string, enabled: boolean } };

export type SetUserRoleMutationVariables = Exact<{
  username: string;
  role: Types.UserRole;
}>;


export type SetUserRoleMutation = { setUserRole: { username: string, role: Types.UserRole } };

export type SetWorkTypeEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetWorkTypeEnabledMutation = { setWorkTypeEnabled: { name: string, enabled: boolean } };

export type SlotCopyMutationVariables = Exact<{
  request: Types.SlotCopyRequest;
}>;


export type SlotCopyMutation = { slotCopy: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type StainMutationVariables = Exact<{
  request: Types.StainRequest;
}>;


export type StainMutation = { stain: { operations: Array<{ id: number }> } };

export type StoreMutationVariables = Exact<{
  store: Array<Types.StoreInput>;
  locationBarcode: string;
}>;


export type StoreMutation = { store: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: Types.GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type StoreBarcodeMutationVariables = Exact<{
  barcode: string;
  locationBarcode: string;
  address?: string | null | undefined;
}>;


export type StoreBarcodeMutation = { storeBarcode: { location: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: Types.GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } } };

export type TransferLocationItemsMutationVariables = Exact<{
  sourceBarcode: string;
  destinationBarcode: string;
}>;


export type TransferLocationItemsMutation = { transfer: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: Types.GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type UnreleaseMutationVariables = Exact<{
  request: Types.UnreleaseRequest;
}>;


export type UnreleaseMutation = { unrelease: { operations: Array<{ id: number }> } };

export type UnstoreBarcodeMutationVariables = Exact<{
  barcode: string;
}>;


export type UnstoreBarcodeMutation = { unstoreBarcode: { barcode: string, address: string | null } | null };

export type UpdateDnapStudiesMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateDnapStudiesMutation = { updateDnapStudies: Array<{ ssId: number, name: string, enabled: boolean }> };

export type UpdateReleaseRecipientFullNameMutationVariables = Exact<{
  username: string;
  fullName?: string | null | undefined;
}>;


export type UpdateReleaseRecipientFullNameMutation = { updateReleaseRecipientFullName: { username: string, fullName: string | null, enabled: boolean } };

export type UpdateWorkAteraStudyMutationVariables = Exact<{
  workNumber: string;
  ssStudyId?: number | null | undefined;
}>;


export type UpdateWorkAteraStudyMutation = { updateWorkAteraStudy: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkDnapStudyMutationVariables = Exact<{
  workNumber: string;
  ssStudyId?: number | null | undefined;
}>;


export type UpdateWorkDnapStudyMutation = { updateWorkDnapStudy: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkNumBlocksMutationVariables = Exact<{
  workNumber: string;
  numBlocks?: number | null | undefined;
}>;


export type UpdateWorkNumBlocksMutation = { updateWorkNumBlocks: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkNumOriginalSamplesMutationVariables = Exact<{
  workNumber: string;
  numOriginalSamples?: number | null | undefined;
}>;


export type UpdateWorkNumOriginalSamplesMutation = { updateWorkNumOriginalSamples: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkNumSlidesMutationVariables = Exact<{
  workNumber: string;
  numSlides?: number | null | undefined;
}>;


export type UpdateWorkNumSlidesMutation = { updateWorkNumSlides: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkOmeroProjectMutationVariables = Exact<{
  workNumber: string;
  omeroProject?: string | null | undefined;
}>;


export type UpdateWorkOmeroProjectMutation = { updateWorkOmeroProject: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkPriorityMutationVariables = Exact<{
  workNumber: string;
  priority?: string | null | undefined;
}>;


export type UpdateWorkPriorityMutation = { updateWorkPriority: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkStatusMutationVariables = Exact<{
  workNumber: string;
  status: Types.WorkStatus;
  commentId?: number | null | undefined;
}>;


export type UpdateWorkStatusMutation = { updateWorkStatus: { comment: string | null, work: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } } };

export type UpdateWorkTreatmentTypesMutationVariables = Exact<{
  workNumber: string;
  treatmentTypes: Array<string>;
}>;


export type UpdateWorkTreatmentTypesMutation = { updateWorkTreatmentTypes: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkTypesMutationVariables = Exact<{
  workNumber: string;
  workTypes: Array<string>;
}>;


export type UpdateWorkTypesMutation = { updateWorkWorkTypes: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkXeniumStudyMutationVariables = Exact<{
  workNumber: string;
  ssStudyId?: number | null | undefined;
}>;


export type UpdateWorkXeniumStudyMutation = { updateWorkXeniumStudy: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type VisiumAnalysisMutationVariables = Exact<{
  request: Types.VisiumAnalysisRequest;
}>;


export type VisiumAnalysisMutation = { visiumAnalysis: { operations: Array<{ id: number }> } };

export type AddCellClassMutationVariables = Exact<{
  name: string;
}>;


export type AddCellClassMutation = { addCellClass: { name: string, enabled: boolean } };

export type CleanOutMutationVariables = Exact<{
  request: Types.CleanOutRequest;
}>;


export type CleanOutMutation = { cleanOut: { operations: Array<{ id: number }> } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { user: { username: string, role: Types.UserRole } | null };

export type ExtractResultQueryVariables = Exact<{
  barcode: string;
}>;


export type ExtractResultQuery = { extractResult: { result: Types.PassFail | null, concentration: string | null, labware: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: Types.FlagPriority | null, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> } } };

export type FindQueryVariables = Exact<{
  request: Types.FindRequest;
}>;


export type FindQuery = { find: { numRecords: number, entries: Array<{ labwareId: number, sampleId: number, workNumbers: Array<string | null> }>, samples: Array<{ id: number, section: string | null, tissue: { replicate: string | null, externalName: string | null, spatialLocation: { tissueType: { name: string } }, donor: { donorName: string }, medium: { name: string }, fixative: { name: string } } }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, created: string, labwareType: { name: string } }>, locations: Array<{ id: number, barcode: string, customName: string | null, fixedName: string | null, direction: Types.GridDirection | null, qualifiedNameWithFirstBarcode: string | null, size: { numRows: number, numColumns: number } | null }>, labwareLocations: Array<{ labwareId: number, locationId: number, address: string | null }> } };

export type FindFilesQueryVariables = Exact<{
  workNumbers: Array<string>;
}>;


export type FindFilesQuery = { listFiles: Array<{ created: string, name: string, url: string, work: { workNumber: string } }> };

export type FindFlaggedLabwareQueryVariables = Exact<{
  barcode: string;
}>;


export type FindFlaggedLabwareQuery = { labwareFlagged: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: Types.FlagPriority | null, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> } };

export type FindHistoryQueryVariables = Exact<{
  workNumber?: string | null | undefined;
  barcode?: string | null | undefined;
  donorName?: Array<string> | null | undefined;
  externalName?: Array<string> | null | undefined;
  eventType?: string | null | undefined;
}>;


export type FindHistoryQuery = { history: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> } };

export type FindHistoryForDonorNameQueryVariables = Exact<{
  donorName: string;
}>;


export type FindHistoryForDonorNameQuery = { historyForDonorName: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> } };

export type FindHistoryForExternalNameQueryVariables = Exact<{
  externalName: string;
}>;


export type FindHistoryForExternalNameQuery = { historyForExternalName: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> } };

export type FindHistoryForLabwareBarcodeQueryVariables = Exact<{
  barcode: string;
}>;


export type FindHistoryForLabwareBarcodeQuery = { historyForLabwareBarcode: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> } };

export type FindHistoryForSampleIdQueryVariables = Exact<{
  sampleId: number;
}>;


export type FindHistoryForSampleIdQuery = { historyForSampleId: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> } };

export type FindHistoryForWorkNumberQueryVariables = Exact<{
  workNumber: string;
}>;


export type FindHistoryForWorkNumberQuery = { historyForWorkNumber: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: Types.FlagPriority }> } };

export type FindHistoryGraphQueryVariables = Exact<{
  workNumber?: string | null | undefined;
  barcode?: string | null | undefined;
  donorName?: Array<string> | null | undefined;
  externalName?: Array<string> | null | undefined;
  zoom?: number | null | undefined;
  fontSize?: number | null | undefined;
}>;


export type FindHistoryGraphQuery = { historyGraph: { svg: string } };

export type FindIfOpExistsQueryVariables = Exact<{
  operationType: string;
  barcode: string;
  run?: string | null | undefined;
  workNumber?: string | null | undefined;
}>;


export type FindIfOpExistsQuery = { opExists: boolean };

export type FindLabwareQueryVariables = Exact<{
  barcode: string;
}>;


export type FindLabwareQuery = { labware: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> } };

export type FindLabwareLocationQueryVariables = Exact<{
  barcodes: Array<string>;
}>;


export type FindLabwareLocationQuery = { stored: Array<{ location: { barcode: string } }> };

export type FindLatestOperationQueryVariables = Exact<{
  barcode: string;
  operationType: string;
}>;


export type FindLatestOperationQuery = { findLatestOp: { id: number } | null };

export type FindLocationByBarcodeQueryVariables = Exact<{
  barcode: string;
}>;


export type FindLocationByBarcodeQuery = { location: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: Types.GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type FindMeasurementByBarcodeAndNameQueryVariables = Exact<{
  barcode: string;
  measurementName: string;
}>;


export type FindMeasurementByBarcodeAndNameQuery = { measurementValueFromLabwareOrParent: Array<{ address: string, string: string }> };

export type FindMeasurementValueFromLabwareOrAncestorQueryVariables = Exact<{
  barcode: string;
  measurementName: string;
}>;


export type FindMeasurementValueFromLabwareOrAncestorQuery = { measurementValueFromLabwareOrAncestor: Array<{ address: string, string: string }> };

export type FindPassFailsQueryVariables = Exact<{
  barcode: string;
  operationType: string;
}>;


export type FindPassFailsQuery = { passFails: Array<{ operation: { id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: Types.UserRole } }, slotPassFails: Array<{ address: string, result: Types.PassFail, comment: string | null }> }> };

export type FindPermDataQueryVariables = Exact<{
  barcode: string;
}>;


export type FindPermDataQuery = { visiumPermData: { labware: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: Types.FlagPriority | null, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }, addressPermData: Array<{ address: string, controlType: Types.ControlType | null, seconds: number | null, selected: boolean }>, samplePositionResults: Array<{ address: string, region: string, sampleId: number, slotId: number, operationId: number }> } };

export type FindPlanDataQueryVariables = Exact<{
  barcode: string;
}>;


export type FindPlanDataQuery = { planData: { groups: Array<Array<string>>, sources: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: Types.FlagPriority | null, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, destination: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: Types.FlagPriority | null, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }, plan: { operationType: { name: string } | null, planActions: Array<{ newSection: string | null, sampleThickness: string | null, sectioningOrder: number | null, sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } } }> }, destination: { address: string, labwareId: number } }> } } };

export type FindReagentPlateQueryVariables = Exact<{
  barcode: string;
}>;


export type FindReagentPlateQuery = { reagentPlate: { numRows: number, numColumns: number, barcode: string, plateType: string | null, slots: Array<{ address: string, used: boolean }> } | null };

export type FindSamplePositionsQueryVariables = Exact<{
  labwareBarcode: string;
}>;


export type FindSamplePositionsQuery = { samplePositions: Array<{ address: string, region: string, sampleId: number, slotId: number, operationId: number }> };

export type FindStoragePathQueryVariables = Exact<{
  locationBarcode: string;
}>;


export type FindStoragePathQuery = { storagePath: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> };

export type FindWorkInfoQueryVariables = Exact<{
  status: Types.WorkStatus;
}>;


export type FindWorkInfoQuery = { works: Array<{ workNumber: string, workRequester: { username: string } | null, project: { name: string } }> };

export type FindWorkNumbersQueryVariables = Exact<{
  status: Types.WorkStatus;
}>;


export type FindWorkNumbersQuery = { works: Array<{ workNumber: string }> };

export type FindWorkProgressQueryVariables = Exact<{
  workNumber?: string | null | undefined;
  workTypes?: Array<string> | null | undefined;
  programs?: Array<string> | null | undefined;
  statuses?: Array<Types.WorkStatus> | null | undefined;
  requesters?: Array<string> | null | undefined;
}>;


export type FindWorkProgressQuery = { workProgress: Array<{ mostRecentOperation: string | null, workComment: string | null, work: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> }, timestamps: Array<{ type: string, timestamp: string }> }> };

export type FindWorksCreatedByQueryVariables = Exact<{
  username: string;
}>;


export type FindWorksCreatedByQuery = { worksCreatedBy: Array<{ workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> }> };

export type GetAllWorkInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWorkInfoQuery = { works: Array<{ workNumber: string, status: Types.WorkStatus, workRequester: { username: string } | null, project: { name: string } }> };

export type GetAnalyserScanDataQueryVariables = Exact<{
  barcode: string;
}>;


export type GetAnalyserScanDataQuery = { analyserScanData: { probes: Array<string>, cellSegmentationRecorded: boolean, workNumberXeniumStudyIds: Array<{ workNumber: string, xeniumStudyId: number | null }> } };

export type GetBioRisksQueryVariables = Exact<{
  includeDisabled?: boolean | null | undefined;
}>;


export type GetBioRisksQuery = { bioRisks: Array<{ code: string, enabled: boolean }> };

export type GetBlockProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlockProcessingInfoQuery = { mediums: Array<{ name: string }>, comments: Array<{ id: number, text: string, category: string, enabled: boolean }>, labwareTypes: Array<{ name: string, numRows: number, numColumns: number, labelType: { name: string } | null }> };

export type GetCellClassesQueryVariables = Exact<{
  includeDisabled?: boolean | null | undefined;
}>;


export type GetCellClassesQuery = { cellClasses: Array<{ name: string, enabled: boolean }> };

export type GetCleanedOutAddressesQueryVariables = Exact<{
  barcode: string;
}>;


export type GetCleanedOutAddressesQuery = { cleanedOutAddresses: Array<string> };

export type GetCommentsQueryVariables = Exact<{
  commentCategory?: string | null | undefined;
  includeDisabled?: boolean | null | undefined;
}>;


export type GetCommentsQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigurationQuery = { destructionReasons: Array<{ id: number, text: string, enabled: boolean }>, comments: Array<{ id: number, text: string, category: string, enabled: boolean }>, hmdmcs: Array<{ hmdmc: string, enabled: boolean }>, species: Array<{ name: string, enabled: boolean }>, fixatives: Array<{ name: string, enabled: boolean }>, releaseDestinations: Array<{ name: string, enabled: boolean }>, releaseRecipients: Array<{ username: string, fullName: string | null, enabled: boolean }>, projects: Array<{ name: string, enabled: boolean }>, costCodes: Array<{ code: string, enabled: boolean }>, workTypes: Array<{ name: string, enabled: boolean }>, equipments: Array<{ id: number, name: string, category: string, enabled: boolean }>, users: Array<{ username: string, role: Types.UserRole }>, solutions: Array<{ name: string, enabled: boolean }>, probePanels: Array<{ name: string, enabled: boolean, type: Types.ProbeType }>, programs: Array<{ name: string, enabled: boolean }>, omeroProjects: Array<{ name: string, enabled: boolean }>, dnapStudies: Array<{ ssId: number, name: string, enabled: boolean }>, bioRisks: Array<{ code: string, enabled: boolean }>, tissueTypes: Array<{ name: string, code: string, spatialLocations: Array<{ code: number, name: string }> }>, cellClasses: Array<{ name: string, enabled: boolean }>, proteinPanels: Array<{ name: string, enabled: boolean }>, treatmentTypes: Array<{ name: string, enabled: boolean }> };

export type GetDestroyInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDestroyInfoQuery = { destructionReasons: Array<{ id: number, text: string, enabled: boolean }> };

export type GetDestructionReasonsQueryVariables = Exact<{
  includeDisabled?: boolean | null | undefined;
}>;


export type GetDestructionReasonsQuery = { destructionReasons: Array<{ id: number, text: string, enabled: boolean }> };

export type GetDnapStudyQueryVariables = Exact<{
  ssId: number;
}>;


export type GetDnapStudyQuery = { dnapStudy: { ssId: number, name: string, enabled: boolean } | null };

export type GetEquipmentsQueryVariables = Exact<{
  category?: string | null | undefined;
  includeDisabled?: boolean | null | undefined;
}>;


export type GetEquipmentsQuery = { equipments: Array<{ id: number, name: string, category: string, enabled: boolean }> };

export type GetEventTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventTypesQuery = { eventTypes: Array<string> };

export type GetParaffinProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetParaffinProcessingInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetLabwareBioRiskCodesQueryVariables = Exact<{
  barcode: string;
}>;


export type GetLabwareBioRiskCodesQuery = { labwareBioRiskCodes: Array<{ sampleId: number, bioRiskCode: string }> };

export type GetLabwareCostingQueryVariables = Exact<{
  barcode: string;
}>;


export type GetLabwareCostingQuery = { labwareCosting: Types.SlideCosting | null };

export type GetLabwareFlagDetailsQueryVariables = Exact<{
  barcodes: Array<string>;
}>;


export type GetLabwareFlagDetailsQuery = { labwareFlagDetails: Array<{ barcode: string, flags: Array<{ barcode: string, priority: Types.FlagPriority, description: string }> }> };

export type GetLabwareInLocationQueryVariables = Exact<{
  locationBarcode: string;
}>;


export type GetLabwareInLocationQuery = { labwareInLocation: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> };

export type GetLabwareOperationsQueryVariables = Exact<{
  barcode: string;
  operationType: string;
}>;


export type GetLabwareOperationsQuery = { labwareOperations: Array<{ id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: Types.UserRole } } | null> | null };

export type GetNextReplicateNumberQueryVariables = Exact<{
  barcodes: Array<string>;
}>;


export type GetNextReplicateNumberQuery = { nextReplicateNumbers: Array<{ barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number }> };

export type GetOmeroProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOmeroProjectsQuery = { omeroProjects: Array<{ name: string, enabled: boolean }> };

export type GetOperationTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOperationTypesQuery = { opTypes: Array<string> };

export type GetPotProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPotProcessingInfoQuery = { fixatives: Array<{ name: string }>, comments: Array<{ id: number, text: string, category: string, enabled: boolean }>, labwareTypes: Array<{ name: string, numRows: number, numColumns: number, labelType: { name: string } | null }> };

export type GetPrintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrintersQuery = { printers: Array<{ name: string, labelTypes: Array<{ name: string }> }> };

export type GetProbeHybSlotsQueryVariables = Exact<{
  barcode: string;
}>;


export type GetProbeHybSlotsQuery = { probeHybSlots: Array<string> };

export type GetProbePanelsQueryVariables = Exact<{
  type: Types.ProbeType;
}>;


export type GetProbePanelsQuery = { probePanels: Array<{ name: string, enabled: boolean, type: Types.ProbeType }> };

export type GetProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQuery = { programs: Array<{ name: string, enabled: boolean }> };

export type GetProteinPanelsQueryVariables = Exact<{
  includeDisabled?: boolean | null | undefined;
}>;


export type GetProteinPanelsQuery = { proteinPanels: Array<{ name: string, enabled: boolean }> };

export type GetRecordExtractResultInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecordExtractResultInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetRecordInPlaceInfoQueryVariables = Exact<{
  category?: string | null | undefined;
}>;


export type GetRecordInPlaceInfoQuery = { equipments: Array<{ id: number, name: string, category: string, enabled: boolean }> };

export type GetRegionsOfInterestQueryVariables = Exact<{
  barcodes: Array<string>;
}>;


export type GetRegionsOfInterestQuery = { rois: Array<{ barcode: string, rois: Array<{ address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }> }> };

export type GetRegistrationInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegistrationInfoQuery = { species: Array<{ name: string }>, hmdmcs: Array<{ hmdmc: string }>, labwareTypes: Array<{ name: string, numRows: number, numColumns: number, labelType: { name: string } | null }>, tissueTypes: Array<{ name: string, spatialLocations: Array<{ name: string, code: number }> }>, fixatives: Array<{ name: string }>, mediums: Array<{ name: string }>, solutions: Array<{ name: string }>, slotRegions: Array<{ name: string }>, bioRisks: Array<{ code: string }>, cellClasses: Array<{ name: string }> };

export type GetReleaseColumnOptionsQueryVariables = Exact<{
  includeDisabled?: boolean | null | undefined;
}>;


export type GetReleaseColumnOptionsQuery = { releaseColumnOptions: Array<{ displayName: string, queryParamName: string }> };

export type GetReleaseInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReleaseInfoQuery = { releaseDestinations: Array<{ name: string, enabled: boolean }>, releaseRecipients: Array<{ username: string, fullName: string | null, enabled: boolean }>, releaseColumnOptions: Array<{ displayName: string, queryParamName: string }> };

export type GetRunNamesQueryVariables = Exact<{
  barcode: string;
}>;


export type GetRunNamesQuery = { runNames: Array<string> };

export type GetRunRoisQueryVariables = Exact<{
  barcode: string;
  run: string;
}>;


export type GetRunRoisQuery = { runRois: Array<{ address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }> };

export type GetSampleProcessingCommentsInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSampleProcessingCommentsInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetSearchInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSearchInfoQuery = { tissueTypes: Array<{ name: string }>, labwareTypes: Array<{ name: string }>, species: Array<{ name: string }> };

export type GetSectioningCommentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningCommentsQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetSectioningInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningInfoQuery = { labwareTypes: Array<{ name: string, numRows: number, numColumns: number, labelType: { name: string } | null }> };

export type GetSlotRegionsQueryVariables = Exact<{
  includeDisabled?: boolean | null | undefined;
}>;


export type GetSlotRegionsQuery = { slotRegions: Array<{ name: string, enabled: boolean }> };

export type GetSolutionTransferInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSolutionTransferInfoQuery = { solutions: Array<{ name: string }> };

export type GetStainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainInfoQuery = { stainTypes: Array<{ name: string, measurementTypes: Array<string> }> };

export type GetStainReagentTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainReagentTypesQuery = { stainReagentTypes: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetStainingQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainingQcInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetSuggestedLabwareForWorkQueryVariables = Exact<{
  workNumber: string;
  forRelease?: boolean | null | undefined;
}>;


export type GetSuggestedLabwareForWorkQuery = { suggestedLabwareForWork: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: Types.LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: Types.LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> };

export type GetSuggestedWorkForLabwareQueryVariables = Exact<{
  barcodes: Array<string>;
  includeInactive?: boolean | null | undefined;
}>;


export type GetSuggestedWorkForLabwareQuery = { suggestedWorkForLabware: { suggestedWorks: Array<{ barcode: string, workNumber: string | null }> } };

export type GetVisiumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVisiumQcInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetWorkAllocationInfoQueryVariables = Exact<{
  commentCategory: string;
  workStatuses?: Array<Types.WorkStatus> | null | undefined;
}>;


export type GetWorkAllocationInfoQuery = { projects: Array<{ name: string, enabled: boolean }>, programs: Array<{ name: string, enabled: boolean }>, costCodes: Array<{ code: string, enabled: boolean }>, worksWithComments: Array<{ comment: string | null, work: { workNumber: string, status: Types.WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, ateraStudy: { ssId: number, name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } }>, workTypes: Array<{ name: string, enabled: boolean }>, comments: Array<{ id: number, text: string, category: string, enabled: boolean }>, releaseRecipients: Array<{ username: string, fullName: string | null, enabled: boolean }>, omeroProjects: Array<{ name: string, enabled: boolean }>, dnapStudies: Array<{ ssId: number, name: string, enabled: boolean }>, releaseDestinations: Array<{ name: string, enabled: boolean }>, treatmentTypes: Array<{ name: string, enabled: boolean }> };

export type GetWorkNumbersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkNumbersQuery = { works: Array<{ workNumber: string }> };

export type GetWorkProgressInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkProgressInputsQuery = { workTypes: Array<{ name: string }>, programs: Array<{ name: string }>, releaseRecipients: Array<{ username: string }> };

export type GetWorkSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkSummaryQuery = { worksSummary: { workSummaryGroups: Array<{ numWorks: number, status: Types.WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { name: string, enabled: boolean } }>, workTypes: Array<{ name: string }> } };

export type GetWorkTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkTypesQuery = { workTypes: Array<{ name: string }> };

export type GetXeniumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetXeniumQcInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type ReloadSlotCopyQueryVariables = Exact<{
  operationType: string;
  workNumber: string;
  lpNumber: string;
}>;


export type ReloadSlotCopyQuery = { reloadSlotCopy: { operationType: string, workNumber: string, lpNumber: string, executionType: Types.ExecutionType | null, labwareType: string | null, barcode: string | null, bioState: string | null, costing: Types.SlideCosting | null, lotNumber: string | null, probeLotNumber: string | null, preBarcode: string | null, cassetteLot: string | null, sources: Array<{ barcode: string, labwareState: Types.LabwareState }>, contents: Array<{ sourceBarcode: string, sourceAddress: string, destinationAddress: string }> } | null };

export const AddressPermDataFieldsFragmentDoc = gql`
    fragment AddressPermDataFields on AddressPermData {
  address
  controlType
  seconds
  selected
}
    `;
export const AnalyserScanDataFieldsFragmentDoc = gql`
    fragment AnalyserScanDataFields on AnalyserScanData {
  workNumberXeniumStudyIds {
    workNumber
    xeniumStudyId
  }
  probes
  cellSegmentationRecorded
}
    `;
export const BioRiskFieldsFragmentDoc = gql`
    fragment BioRiskFields on BioRisk {
  code
  enabled
}
    `;
export const CellClassFieldsFragmentDoc = gql`
    fragment CellClassFields on CellClass {
  name
  enabled
}
    `;
export const CommentFieldsFragmentDoc = gql`
    fragment CommentFields on Comment {
  id
  text
  category
  enabled
}
    `;
export const DestructionReasonFieldsFragmentDoc = gql`
    fragment DestructionReasonFields on DestructionReason {
  id
  text
  enabled
}
    `;
export const EquipmentFieldsFragmentDoc = gql`
    fragment EquipmentFields on Equipment {
  id
  name
  category
  enabled
}
    `;
export const FileFieldsFragmentDoc = gql`
    fragment FileFields on StanFile {
  created
  name
  url
  work {
    workNumber
  }
}
    `;
export const FixativeFieldsFragmentDoc = gql`
    fragment FixativeFields on Fixative {
  name
  enabled
}
    `;
export const GraphSvgFieldsFragmentDoc = gql`
    fragment GraphSVGFields on GraphSVG {
  svg
}
    `;
export const LabwareTypeFieldsFragmentDoc = gql`
    fragment LabwareTypeFields on LabwareType {
  name
  numRows
  numColumns
  labelType {
    name
  }
}
    `;
export const TissueFieldsFragmentDoc = gql`
    fragment TissueFields on Tissue {
  donor {
    donorName
    lifeStage
  }
  externalName
  spatialLocation {
    tissueType {
      name
    }
    code
    name
  }
  hmdmc {
    hmdmc
  }
  replicate
  medium {
    name
  }
  fixative {
    name
    enabled
  }
  collectionDate
}
    `;
export const SampleFieldsFragmentDoc = gql`
    fragment SampleFields on Sample {
  id
  section
  tissue {
    ...TissueFields
  }
  bioState {
    name
  }
  blockHighestSection
}
    `;
export const SlotFieldsFragmentDoc = gql`
    fragment SlotFields on Slot {
  id
  address
  labwareId
  samples {
    ...SampleFields
  }
}
    `;
export const LabwareFieldsFragmentDoc = gql`
    fragment LabwareFields on Labware {
  id
  barcode
  externalBarcode
  destroyed
  discarded
  released
  state
  frozen
  created
  numRows
  numColumns
  labwareType {
    ...LabwareTypeFields
  }
  slots {
    ...SlotFields
  }
}
    `;
export const HistoryEntryFieldsFragmentDoc = gql`
    fragment HistoryEntryFields on HistoryEntry {
  destinationLabwareId
  details
  eventId
  sampleId
  sourceLabwareId
  time
  username
  type
  workNumber
  address
  region
}
    `;
export const FlagBarcodesFieldsFragmentDoc = gql`
    fragment FlagBarcodesFields on FlagBarcodes {
  barcodes
  priority
}
    `;
export const HistoryFieldsFragmentDoc = gql`
    fragment HistoryFields on History {
  labware {
    ...LabwareFields
  }
  samples {
    ...SampleFields
  }
  entries {
    ...HistoryEntryFields
  }
  flagBarcodes {
    ...FlagBarcodesFields
  }
}
    `;
export const HmdmcFieldsFragmentDoc = gql`
    fragment HmdmcFields on Hmdmc {
  hmdmc
  enabled
}
    `;
export const LabwareFlaggedFieldsFragmentDoc = gql`
    fragment LabwareFlaggedFields on LabwareFlagged {
  id
  barcode
  externalBarcode
  destroyed
  discarded
  released
  flagged
  flagPriority
  state
  frozen
  created
  numRows
  numColumns
  labwareType {
    ...LabwareTypeFields
  }
  slots {
    ...SlotFields
  }
}
    `;
export const RoiFieldsFragmentDoc = gql`
    fragment RoiFields on Roi {
  sample {
    ...SampleFields
  }
  address
  roi
}
    `;
export const LabwareRoiFieldsFragmentDoc = gql`
    fragment LabwareRoiFields on LabwareRoi {
  barcode
  rois {
    ...RoiFields
  }
}
    `;
export const LinkedLocationFieldsFragmentDoc = gql`
    fragment LinkedLocationFields on LinkedLocation {
  barcode
  fixedName
  customName
  address
  numStored
  leaf
}
    `;
export const LocationFieldsFragmentDoc = gql`
    fragment LocationFields on Location {
  barcode
  fixedName
  customName
  address
  direction
  numStored
  leaf
  parent {
    barcode
    fixedName
    customName
  }
  size {
    numRows
    numColumns
  }
  stored {
    barcode
    address
  }
  children {
    ...LinkedLocationFields
  }
}
    `;
export const NextReplicateDataFieldsFragmentDoc = gql`
    fragment NextReplicateDataFields on NextReplicateData {
  barcodes
  donorId
  nextReplicateNumber
  spatialLocationId
}
    `;
export const ActionFieldsFragmentDoc = gql`
    fragment ActionFields on Action {
  source {
    ...SlotFields
  }
  destination {
    ...SlotFields
  }
  operationId
  sample {
    ...SampleFields
  }
}
    `;
export const UserFieldsFragmentDoc = gql`
    fragment UserFields on User {
  username
  role
}
    `;
export const OperationFieldsFragmentDoc = gql`
    fragment OperationFields on Operation {
  id
  operationType {
    name
  }
  actions {
    ...ActionFields
  }
  user {
    ...UserFields
  }
  performed
}
    `;
export const PlanActionFieldsFragmentDoc = gql`
    fragment PlanActionFields on PlanAction {
  newSection
  sampleThickness
  sectioningOrder
  sample {
    id
  }
  source {
    address
    labwareId
    samples {
      id
      tissue {
        ...TissueFields
      }
    }
  }
  destination {
    address
    labwareId
  }
}
    `;
export const PrinterFieldsFragmentDoc = gql`
    fragment PrinterFields on Printer {
  name
  labelTypes {
    name
  }
}
    `;
export const ProbePanelFieldsFragmentDoc = gql`
    fragment ProbePanelFields on ProbePanel {
  name
  enabled
  type
}
    `;
export const ProteinPanelFieldsFragmentDoc = gql`
    fragment ProteinPanelFields on ProteinPanel {
  name
  enabled
}
    `;
export const ReagentSlotFieldsFragmentDoc = gql`
    fragment ReagentSlotFields on ReagentSlot {
  address
  used
}
    `;
export const ReagentPlateFieldsFragmentDoc = gql`
    fragment ReagentPlateFields on ReagentPlate {
  barcode
  slots {
    ...ReagentSlotFields
  }
  numRows
  numColumns
  plateType
}
    `;
export const RegisterResultFieldsFragmentDoc = gql`
    fragment RegisterResultFields on RegisterResult {
  labware {
    ...LabwareFields
  }
  clashes {
    tissue {
      externalName
      donor {
        donorName
      }
      spatialLocation {
        code
        name
        tissueType {
          name
        }
      }
    }
    labware {
      barcode
      labwareType {
        name
      }
    }
  }
  labwareSolutions {
    barcode
    solutionName
  }
}
    `;
export const ReleaseFileOptionFieldsFragmentDoc = gql`
    fragment ReleaseFileOptionFields on ReleaseFileOption {
  displayName
  queryParamName
}
    `;
export const SampleBioRiskFieldsFragmentDoc = gql`
    fragment SampleBioRiskFields on SampleBioRisk {
  sampleId
  bioRiskCode
}
    `;
export const SamplePositionFieldsFragmentDoc = gql`
    fragment SamplePositionFields on SamplePosition {
  address
  region
  sampleId
  slotId
  operationId
}
    `;
export const SlotCopyLoadFieldsFragmentDoc = gql`
    fragment SlotCopyLoadFields on SlotCopyLoad {
  sources {
    barcode
    labwareState
  }
  operationType
  workNumber
  lpNumber
  executionType
  labwareType
  barcode
  bioState
  costing
  lotNumber
  probeLotNumber
  preBarcode
  cassetteLot
  contents {
    sourceBarcode
    sourceAddress
    destinationAddress
  }
}
    `;
export const SlotPassFailFieldsFragmentDoc = gql`
    fragment SlotPassFailFields on SlotPassFail {
  address
  result
  comment
}
    `;
export const SlotRegionFieldsFragmentDoc = gql`
    fragment SlotRegionFields on SlotRegion {
  enabled
  name
}
    `;
export const SolutionFieldsFragmentDoc = gql`
    fragment SolutionFields on Solution {
  name
  enabled
}
    `;
export const SpeciesFieldsFragmentDoc = gql`
    fragment SpeciesFields on Species {
  name
  enabled
}
    `;
export const StainTypeFieldsFragmentDoc = gql`
    fragment StainTypeFields on StainType {
  name
  measurementTypes
}
    `;
export const SuggestedWorkFieldsFragmentDoc = gql`
    fragment SuggestedWorkFields on SuggestedWork {
  barcode
  workNumber
}
    `;
export const TissueTypeFieldsFragmentDoc = gql`
    fragment TissueTypeFields on TissueType {
  name
  code
  spatialLocations {
    code
    name
  }
}
    `;
export const ReleaseRecipientFieldsFragmentDoc = gql`
    fragment ReleaseRecipientFields on ReleaseRecipient {
  username
  fullName
  enabled
}
    `;
export const ProjectFieldsFragmentDoc = gql`
    fragment ProjectFields on Project {
  name
  enabled
}
    `;
export const ProgramFieldsFragmentDoc = gql`
    fragment ProgramFields on Program {
  name
  enabled
}
    `;
export const CostCodeFieldsFragmentDoc = gql`
    fragment CostCodeFields on CostCode {
  code
  enabled
}
    `;
export const WorkTypeFieldsFragmentDoc = gql`
    fragment WorkTypeFields on WorkType {
  name
  enabled
}
    `;
export const OmeroProjectFieldsFragmentDoc = gql`
    fragment OmeroProjectFields on OmeroProject {
  name
  enabled
}
    `;
export const DnapStudyFieldsFragmentDoc = gql`
    fragment DnapStudyFields on DnapStudy {
  ssId
  name
  enabled
}
    `;
export const ReleaseDestinationFieldsFragmentDoc = gql`
    fragment ReleaseDestinationFields on ReleaseDestination {
  name
  enabled
}
    `;
export const TreatmentTypeFieldsFragmentDoc = gql`
    fragment TreatmentTypeFields on TreatmentType {
  name
  enabled
}
    `;
export const WorkFieldsFragmentDoc = gql`
    fragment WorkFields on Work {
  workNumber
  status
  workRequester {
    ...ReleaseRecipientFields
  }
  project {
    ...ProjectFields
  }
  program {
    ...ProgramFields
  }
  costCode {
    ...CostCodeFields
  }
  workTypes {
    ...WorkTypeFields
  }
  omeroProject {
    ...OmeroProjectFields
  }
  ateraStudy {
    ...DnapStudyFields
  }
  dnapStudy {
    ...DnapStudyFields
  }
  xeniumStudy {
    ...DnapStudyFields
  }
  facultyLead {
    ...ReleaseDestinationFields
  }
  numBlocks
  numSlides
  numOriginalSamples
  priority
  treatmentTypes {
    ...TreatmentTypeFields
  }
}
    `;
export const WorkProgressTimeStampFieldFragmentDoc = gql`
    fragment WorkProgressTimeStampField on WorkProgressTimestamp {
  type
  timestamp
}
    `;
export const WorkProgressFieldsFragmentDoc = gql`
    fragment WorkProgressFields on WorkProgress {
  work {
    ...WorkFields
  }
  timestamps {
    ...WorkProgressTimeStampField
  }
  mostRecentOperation
  workComment
}
    `;
export const WorkSummaryGroupFieldsFragmentDoc = gql`
    fragment WorkSummaryGroupFields on WorkSummaryGroup {
  workType {
    ...WorkTypeFields
  }
  numWorks
  status
  totalNumBlocks
  totalNumSlides
  totalNumOriginalSamples
}
    `;
export const WorkWithCommentFieldsFragmentDoc = gql`
    fragment WorkWithCommentFields on WorkWithComment {
  work {
    ...WorkFields
  }
  comment
}
    `;
export const AddBioRiskDocument = gql`
    mutation AddBioRisk($code: String!) {
  addBioRisk(code: $code) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`;
export const AddCommentDocument = gql`
    mutation AddComment($category: String!, $text: String!) {
  addComment(category: $category, text: $text) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const AddCostCodeDocument = gql`
    mutation AddCostCode($code: String!) {
  addCostCode(code: $code) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`;
export const AddDestructionReasonDocument = gql`
    mutation AddDestructionReason($text: String!) {
  addDestructionReason(text: $text) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const AddEquipmentDocument = gql`
    mutation AddEquipment($category: String!, $name: String!) {
  addEquipment(category: $category, name: $name) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
export const AddExternalIdDocument = gql`
    mutation AddExternalID($request: AddExternalIDRequest!) {
  addExternalID(request: $request) {
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    `;
export const AddExternalIdsDocument = gql`
    mutation AddExternalIds($request: AddExternalIdsRequest!) {
  addExternalIds(request: $request) {
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    `;
export const AddFixativeDocument = gql`
    mutation AddFixative($name: String!) {
  addFixative(name: $name) {
    ...FixativeFields
  }
}
    ${FixativeFieldsFragmentDoc}`;
export const AddHmdmcDocument = gql`
    mutation AddHmdmc($hmdmc: String!) {
  addHmdmc(hmdmc: $hmdmc) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`;
export const AddOmeroProjectDocument = gql`
    mutation AddOmeroProject($name: String!) {
  addOmeroProject(name: $name) {
    ...OmeroProjectFields
  }
}
    ${OmeroProjectFieldsFragmentDoc}`;
export const AddProbePanelDocument = gql`
    mutation AddProbePanel($type: ProbeType!, $name: String!) {
  addProbePanel(type: $type, name: $name) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`;
export const AddProgramDocument = gql`
    mutation AddProgram($name: String!) {
  addProgram(name: $name) {
    ...ProgramFields
  }
}
    ${ProgramFieldsFragmentDoc}`;
export const AddProjectDocument = gql`
    mutation AddProject($name: String!) {
  addProject(name: $name) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const AddProteinPanelDocument = gql`
    mutation AddProteinPanel($name: String!) {
  addProteinPanel(name: $name) {
    ...ProteinPanelFields
  }
}
    ${ProteinPanelFieldsFragmentDoc}`;
export const AddReleaseDestinationDocument = gql`
    mutation AddReleaseDestination($name: String!) {
  addReleaseDestination(name: $name) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`;
export const AddReleaseRecipientDocument = gql`
    mutation AddReleaseRecipient($username: String!, $fullName: String) {
  addReleaseRecipient(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const AddSlotRegionDocument = gql`
    mutation AddSlotRegion($name: String!) {
  addSlotRegion(name: $name) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`;
export const AddSolutionDocument = gql`
    mutation AddSolution($name: String!) {
  addSolution(name: $name) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`;
export const AddSpatialLocationsDocument = gql`
    mutation AddSpatialLocations($request: AddSpatialLocationsRequest!) {
  addSpatialLocations(request: $request) {
    name
    spatialLocations {
      code
      name
    }
  }
}
    `;
export const AddSpeciesDocument = gql`
    mutation AddSpecies($name: String!) {
  addSpecies(name: $name) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
export const AddTissueTypeDocument = gql`
    mutation AddTissueType($request: AddTissueTypeRequest!) {
  addTissueType(request: $request) {
    name
    code
    spatialLocations {
      code
      name
    }
  }
}
    `;
export const AddTreatmentTypeDocument = gql`
    mutation AddTreatmentType($name: String!) {
  addTreatmentType(name: $name) {
    ...TreatmentTypeFields
  }
}
    ${TreatmentTypeFieldsFragmentDoc}`;
export const AddUserDocument = gql`
    mutation AddUser($username: String!) {
  addUser(username: $username) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const AddWorkTypeDocument = gql`
    mutation AddWorkType($name: String!) {
  addWorkType(name: $name) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`;
export const AliquotDocument = gql`
    mutation Aliquot($request: AliquotRequest!) {
  aliquot(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      actions {
        sample {
          id
        }
        source {
          address
          labwareId
          samples {
            id
          }
        }
        destination {
          address
          labwareId
        }
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const ConfirmDocument = gql`
    mutation Confirm($request: ConfirmOperationRequest!) {
  confirmOperation(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const ConfirmSectionDocument = gql`
    mutation ConfirmSection($request: ConfirmSectionRequest!) {
  confirmSection(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const CreateWorkDocument = gql`
    mutation CreateWork($prefix: String!, $workTypes: [String!]!, $workRequester: String!, $project: String!, $program: String!, $costCode: String!, $numBlocks: Int, $numSlides: Int, $numOriginalSamples: Int, $omeroProject: String, $ssStudyId: Int, $xeniumStudyId: Int, $ateraStudyId: Int, $treatmentTypes: [String!], $facultyLead: String!) {
  createWork(
    prefix: $prefix
    workTypes: $workTypes
    workRequester: $workRequester
    project: $project
    program: $program
    costCode: $costCode
    numBlocks: $numBlocks
    numSlides: $numSlides
    numOriginalSamples: $numOriginalSamples
    omeroProject: $omeroProject
    ssStudyId: $ssStudyId
    xeniumStudyId: $xeniumStudyId
    ateraStudyId: $ateraStudyId
    treatmentTypes: $treatmentTypes
    facultyLead: $facultyLead
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const DestroyDocument = gql`
    mutation Destroy($request: DestroyRequest!) {
  destroy(request: $request) {
    destructions {
      labware {
        barcode
      }
    }
  }
}
    `;
export const EmptyLocationDocument = gql`
    mutation EmptyLocation($barcode: String!) {
  empty(locationBarcode: $barcode) {
    numUnstored
  }
}
    `;
export const ExtractDocument = gql`
    mutation Extract($request: ExtractRequest!) {
  extract(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      actions {
        sample {
          id
        }
        source {
          address
          labwareId
          samples {
            id
          }
        }
        destination {
          address
          labwareId
        }
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const FlagLabwareDocument = gql`
    mutation FlagLabware($request: FlagLabwareRequest!) {
  flagLabware(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    user {
      ...UserFields
    }
  }
}
    ${UserFieldsFragmentDoc}`;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export const PerformLibraryConstructionDocument = gql`
    mutation PerformLibraryConstruction($requests: [LibraryConRequest!]!) {
  libraryCon(requests: $requests) {
    operations {
      id
    }
  }
}
    `;
export const PerformParaffinProcessingDocument = gql`
    mutation PerformParaffinProcessing($request: ParaffinProcessingRequest!) {
  performParaffinProcessing(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const PerformSolutionTransferDocument = gql`
    mutation PerformSolutionTransfer($request: SolutionTransferRequest!) {
  performSolutionTransfer(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const PerformTissueBlockDocument = gql`
    mutation PerformTissueBlock($request: TissueBlockRequest!) {
  performTissueBlock(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const PerformTissuePotDocument = gql`
    mutation PerformTissuePot($request: PotProcessingRequest!) {
  performPotProcessing(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const PlanDocument = gql`
    mutation Plan($request: PlanRequest!) {
  plan(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      planActions {
        ...PlanActionFields
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${PlanActionFieldsFragmentDoc}`;
export const PrintDocument = gql`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
}
    `;
export const ReactivateLabwareDocument = gql`
    mutation ReactivateLabware($items: [ReactivateLabware!]!) {
  reactivateLabware(items: $items) {
    labware {
      barcode
      state
    }
    operations {
      id
    }
  }
}
    `;
export const RecordAnalyserDocument = gql`
    mutation RecordAnalyser($request: AnalyserRequest!) {
  recordAnalyser(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordCompletionDocument = gql`
    mutation RecordCompletion($request: CompletionRequest!) {
  recordCompletion(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordComplexStainDocument = gql`
    mutation RecordComplexStain($request: ComplexStainRequest!) {
  recordComplexStain(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordExtractResultDocument = gql`
    mutation RecordExtractResult($request: ExtractResultRequest!) {
  recordExtractResult(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordInPlaceDocument = gql`
    mutation RecordInPlace($request: InPlaceOpRequest!) {
  recordInPlace(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const RecordLibraryPrepDocument = gql`
    mutation RecordLibraryPrep($request: LibraryPrepRequest!) {
  libraryPrep(request: $request) {
    operations {
      id
    }
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const RecordMetricsDocument = gql`
    mutation RecordMetrics($request: SampleMetricsRequest!) {
  recordSampleMetrics(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordOpWithSlotCommentsDocument = gql`
    mutation RecordOpWithSlotComments($request: OpWithSlotCommentsRequest!) {
  recordOpWithSlotComments(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordOpWithSlotMeasurementsDocument = gql`
    mutation RecordOpWithSlotMeasurements($request: OpWithSlotMeasurementsRequest!) {
  recordOpWithSlotMeasurements(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordOrientationQcDocument = gql`
    mutation RecordOrientationQC($request: OrientationRequest!) {
  recordOrientationQC(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordPermDocument = gql`
    mutation RecordPerm($request: RecordPermRequest!) {
  recordPerm(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordProbeOperationDocument = gql`
    mutation RecordProbeOperation($request: ProbeOperationRequest!) {
  recordProbeOperation(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordQcLabwareDocument = gql`
    mutation RecordQCLabware($request: QCLabwareRequest!) {
  recordQCLabware(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordReagentTransferDocument = gql`
    mutation RecordReagentTransfer($request: ReagentTransferRequest!) {
  reagentTransfer(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordRnaAnalysisDocument = gql`
    mutation RecordRNAAnalysis($request: RNAAnalysisRequest!) {
  recordRNAAnalysis(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordSampleProcessingCommentsDocument = gql`
    mutation RecordSampleProcessingComments($request: SampleProcessingCommentRequest!) {
  recordSampleProcessingComments(request: $request) {
    labware {
      ...LabwareFields
    }
    operations {
      operationType {
        name
      }
      user {
        username
      }
      performed
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const RecordStainResultDocument = gql`
    mutation RecordStainResult($request: ResultRequest!) {
  recordStainResult(request: $request) {
    operations {
      id
    }
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const RecordVisiumQcDocument = gql`
    mutation RecordVisiumQC($request: ResultRequest!) {
  recordVisiumQC(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RegisterAsEndUserDocument = gql`
    mutation RegisterAsEndUser($username: String!, $password: String!) {
  registerAsEndUser(username: $username, password: $password) {
    user {
      ...UserFields
    }
  }
}
    ${UserFieldsFragmentDoc}`;
export const RegisterOriginalSamplesDocument = gql`
    mutation RegisterOriginalSamples($request: OriginalSampleRegisterRequest!) {
  registerOriginalSamples(request: $request) {
    ...RegisterResultFields
  }
}
    ${RegisterResultFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const RegisterSectionsDocument = gql`
    mutation RegisterSections($request: SectionRegisterRequest!) {
  registerSections(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const RegisterTissuesDocument = gql`
    mutation RegisterTissues($request: BlockRegisterRequest!) {
  registerBlocks(request: $request) {
    ...RegisterResultFields
  }
}
    ${RegisterResultFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const ReleaseLabwareDocument = gql`
    mutation ReleaseLabware($releaseRequest: ReleaseRequest!) {
  release(request: $releaseRequest) {
    releases {
      id
      labware {
        barcode
      }
      destination {
        name
      }
      recipient {
        username
      }
    }
  }
}
    `;
export const SaveSlotCopyDocument = gql`
    mutation SaveSlotCopy($request: SlotCopySave!) {
  saveSlotCopy(request: $request) {
    ...SlotCopyLoadFields
  }
}
    ${SlotCopyLoadFieldsFragmentDoc}`;
export const SegmentationDocument = gql`
    mutation Segmentation($request: SegmentationRequest!) {
  segmentation(request: $request) {
    operations {
      id
    }
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const SetBioRiskEnabledDocument = gql`
    mutation SetBioRiskEnabled($code: String!, $enabled: Boolean!) {
  setBioRiskEnabled(code: $code, enabled: $enabled) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`;
export const SetCellClassEnabledDocument = gql`
    mutation SetCellClassEnabled($name: String!, $enabled: Boolean!) {
  setCellClassEnabled(name: $name, enabled: $enabled) {
    ...CellClassFields
  }
}
    ${CellClassFieldsFragmentDoc}`;
export const SetCommentEnabledDocument = gql`
    mutation SetCommentEnabled($commentId: Int!, $enabled: Boolean!) {
  setCommentEnabled(commentId: $commentId, enabled: $enabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const SetCostCodeEnabledDocument = gql`
    mutation SetCostCodeEnabled($code: String!, $enabled: Boolean!) {
  setCostCodeEnabled(code: $code, enabled: $enabled) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`;
export const SetDestructionReasonEnabledDocument = gql`
    mutation SetDestructionReasonEnabled($text: String!, $enabled: Boolean!) {
  setDestructionReasonEnabled(text: $text, enabled: $enabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const SetEquipmentEnabledDocument = gql`
    mutation SetEquipmentEnabled($equipmentId: Int!, $enabled: Boolean!) {
  setEquipmentEnabled(equipmentId: $equipmentId, enabled: $enabled) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
export const SetFixativeEnabledDocument = gql`
    mutation SetFixativeEnabled($name: String!, $enabled: Boolean!) {
  setFixativeEnabled(name: $name, enabled: $enabled) {
    ...FixativeFields
  }
}
    ${FixativeFieldsFragmentDoc}`;
export const SetHmdmcEnabledDocument = gql`
    mutation SetHmdmcEnabled($hmdmc: String!, $enabled: Boolean!) {
  setHmdmcEnabled(hmdmc: $hmdmc, enabled: $enabled) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`;
export const SetLocationCustomNameDocument = gql`
    mutation SetLocationCustomName($locationBarcode: String!, $newCustomName: String!) {
  setLocationCustomName(
    locationBarcode: $locationBarcode
    customName: $newCustomName
  ) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
export const SetOmeroProjectEnabledDocument = gql`
    mutation SetOmeroProjectEnabled($name: String!, $enabled: Boolean!) {
  setOmeroProjectEnabled(name: $name, enabled: $enabled) {
    ...OmeroProjectFields
  }
}
    ${OmeroProjectFieldsFragmentDoc}`;
export const SetOpWorkRequestDocument = gql`
    mutation SetOpWorkRequest($request: OpWorkRequest!) {
  setOperationWork(request: $request) {
    ...OperationFields
  }
}
    ${OperationFieldsFragmentDoc}
${ActionFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${UserFieldsFragmentDoc}`;
export const SetProbePanelEnabledDocument = gql`
    mutation SetProbePanelEnabled($type: ProbeType!, $name: String!, $enabled: Boolean!) {
  setProbePanelEnabled(type: $type, name: $name, enabled: $enabled) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`;
export const SetProgramEnabledDocument = gql`
    mutation SetProgramEnabled($name: String!, $enabled: Boolean!) {
  setProgramEnabled(name: $name, enabled: $enabled) {
    ...ProgramFields
  }
}
    ${ProgramFieldsFragmentDoc}`;
export const SetProjectEnabledDocument = gql`
    mutation SetProjectEnabled($name: String!, $enabled: Boolean!) {
  setProjectEnabled(name: $name, enabled: $enabled) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const SetProteinPanelEnabledDocument = gql`
    mutation SetProteinPanelEnabled($name: String!, $enabled: Boolean!) {
  setProteinPanelEnabled(name: $name, enabled: $enabled) {
    ...ProteinPanelFields
  }
}
    ${ProteinPanelFieldsFragmentDoc}`;
export const SetReleaseDestinationEnabledDocument = gql`
    mutation SetReleaseDestinationEnabled($name: String!, $enabled: Boolean!) {
  setReleaseDestinationEnabled(name: $name, enabled: $enabled) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`;
export const SetReleaseRecipientEnabledDocument = gql`
    mutation SetReleaseRecipientEnabled($username: String!, $enabled: Boolean!) {
  setReleaseRecipientEnabled(username: $username, enabled: $enabled) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const SetSlotRegionEnabledDocument = gql`
    mutation SetSlotRegionEnabled($name: String!, $enabled: Boolean!) {
  setSlotRegionEnabled(name: $name, enabled: $enabled) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`;
export const SetSolutionEnabledDocument = gql`
    mutation SetSolutionEnabled($name: String!, $enabled: Boolean!) {
  setSolutionEnabled(name: $name, enabled: $enabled) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`;
export const SetSpeciesEnabledDocument = gql`
    mutation SetSpeciesEnabled($name: String!, $enabled: Boolean!) {
  setSpeciesEnabled(name: $name, enabled: $enabled) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
export const SetTreatmentTypeEnabledDocument = gql`
    mutation SetTreatmentTypeEnabled($name: String!, $enabled: Boolean!) {
  setTreatmentTypeEnabled(name: $name, enabled: $enabled) {
    ...TreatmentTypeFields
  }
}
    ${TreatmentTypeFieldsFragmentDoc}`;
export const SetUserRoleDocument = gql`
    mutation SetUserRole($username: String!, $role: UserRole!) {
  setUserRole(username: $username, role: $role) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const SetWorkTypeEnabledDocument = gql`
    mutation SetWorkTypeEnabled($name: String!, $enabled: Boolean!) {
  setWorkTypeEnabled(name: $name, enabled: $enabled) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`;
export const SlotCopyDocument = gql`
    mutation SlotCopy($request: SlotCopyRequest!) {
  slotCopy(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const StainDocument = gql`
    mutation Stain($request: StainRequest!) {
  stain(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const StoreDocument = gql`
    mutation Store($store: [StoreInput!]!, $locationBarcode: String!) {
  store(store: $store, locationBarcode: $locationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
export const StoreBarcodeDocument = gql`
    mutation StoreBarcode($barcode: String!, $locationBarcode: String!, $address: Address) {
  storeBarcode(
    barcode: $barcode
    locationBarcode: $locationBarcode
    address: $address
  ) {
    location {
      ...LocationFields
    }
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
export const TransferLocationItemsDocument = gql`
    mutation TransferLocationItems($sourceBarcode: String!, $destinationBarcode: String!) {
  transfer(sourceBarcode: $sourceBarcode, destinationBarcode: $destinationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
export const UnreleaseDocument = gql`
    mutation Unrelease($request: UnreleaseRequest!) {
  unrelease(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const UnstoreBarcodeDocument = gql`
    mutation UnstoreBarcode($barcode: String!) {
  unstoreBarcode(barcode: $barcode) {
    barcode
    address
  }
}
    `;
export const UpdateDnapStudiesDocument = gql`
    mutation UpdateDnapStudies {
  updateDnapStudies {
    ssId
    name
    enabled
  }
}
    `;
export const UpdateReleaseRecipientFullNameDocument = gql`
    mutation UpdateReleaseRecipientFullName($username: String!, $fullName: String) {
  updateReleaseRecipientFullName(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const UpdateWorkAteraStudyDocument = gql`
    mutation UpdateWorkAteraStudy($workNumber: String!, $ssStudyId: Int) {
  updateWorkAteraStudy(workNumber: $workNumber, ssStudyId: $ssStudyId) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkDnapStudyDocument = gql`
    mutation UpdateWorkDnapStudy($workNumber: String!, $ssStudyId: Int) {
  updateWorkDnapStudy(workNumber: $workNumber, ssStudyId: $ssStudyId) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkNumBlocksDocument = gql`
    mutation UpdateWorkNumBlocks($workNumber: String!, $numBlocks: Int) {
  updateWorkNumBlocks(workNumber: $workNumber, numBlocks: $numBlocks) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkNumOriginalSamplesDocument = gql`
    mutation UpdateWorkNumOriginalSamples($workNumber: String!, $numOriginalSamples: Int) {
  updateWorkNumOriginalSamples(
    workNumber: $workNumber
    numOriginalSamples: $numOriginalSamples
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkNumSlidesDocument = gql`
    mutation UpdateWorkNumSlides($workNumber: String!, $numSlides: Int) {
  updateWorkNumSlides(workNumber: $workNumber, numSlides: $numSlides) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkOmeroProjectDocument = gql`
    mutation UpdateWorkOmeroProject($workNumber: String!, $omeroProject: String) {
  updateWorkOmeroProject(workNumber: $workNumber, omeroProject: $omeroProject) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkPriorityDocument = gql`
    mutation UpdateWorkPriority($workNumber: String!, $priority: String) {
  updateWorkPriority(workNumber: $workNumber, priority: $priority) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkStatusDocument = gql`
    mutation UpdateWorkStatus($workNumber: String!, $status: WorkStatus!, $commentId: Int) {
  updateWorkStatus(
    workNumber: $workNumber
    status: $status
    commentId: $commentId
  ) {
    ...WorkWithCommentFields
  }
}
    ${WorkWithCommentFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkTreatmentTypesDocument = gql`
    mutation UpdateWorkTreatmentTypes($workNumber: String!, $treatmentTypes: [String!]!) {
  updateWorkTreatmentTypes(
    workNumber: $workNumber
    treatmentTypes: $treatmentTypes
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkTypesDocument = gql`
    mutation UpdateWorkTypes($workNumber: String!, $workTypes: [String!]!) {
  updateWorkWorkTypes(workNumber: $workNumber, workTypes: $workTypes) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const UpdateWorkXeniumStudyDocument = gql`
    mutation UpdateWorkXeniumStudy($workNumber: String!, $ssStudyId: Int) {
  updateWorkXeniumStudy(workNumber: $workNumber, ssStudyId: $ssStudyId) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const VisiumAnalysisDocument = gql`
    mutation VisiumAnalysis($request: VisiumAnalysisRequest!) {
  visiumAnalysis(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const AddCellClassDocument = gql`
    mutation AddCellClass($name: String!) {
  addCellClass(name: $name) {
    ...CellClassFields
  }
}
    ${CellClassFieldsFragmentDoc}`;
export const CleanOutDocument = gql`
    mutation CleanOut($request: CleanOutRequest!) {
  cleanOut(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const CurrentUserDocument = gql`
    query CurrentUser {
  user {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const ExtractResultDocument = gql`
    query ExtractResult($barcode: String!) {
  extractResult(barcode: $barcode) {
    result
    concentration
    labware {
      ...LabwareFlaggedFields
    }
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const FindDocument = gql`
    query Find($request: FindRequest!) {
  find(request: $request) {
    numRecords
    entries {
      labwareId
      sampleId
      workNumbers
    }
    samples {
      id
      section
      tissue {
        replicate
        spatialLocation {
          tissueType {
            name
          }
        }
        externalName
        donor {
          donorName
        }
        medium {
          name
        }
        fixative {
          name
        }
      }
    }
    labware {
      id
      barcode
      externalBarcode
      created
      labwareType {
        name
      }
    }
    locations {
      id
      barcode
      customName
      fixedName
      direction
      size {
        numRows
        numColumns
      }
      qualifiedNameWithFirstBarcode
    }
    labwareLocations {
      labwareId
      locationId
      address
    }
  }
}
    `;
export const FindFilesDocument = gql`
    query FindFiles($workNumbers: [String!]!) {
  listFiles(workNumbers: $workNumbers) {
    ...FileFields
  }
}
    ${FileFieldsFragmentDoc}`;
export const FindFlaggedLabwareDocument = gql`
    query FindFlaggedLabware($barcode: String!) {
  labwareFlagged(barcode: $barcode) {
    ...LabwareFlaggedFields
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const FindHistoryDocument = gql`
    query FindHistory($workNumber: String, $barcode: String, $donorName: [String!], $externalName: [String!], $eventType: String) {
  history(
    workNumber: $workNumber
    barcode: $barcode
    donorName: $donorName
    externalName: $externalName
    eventType: $eventType
  ) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindHistoryForDonorNameDocument = gql`
    query FindHistoryForDonorName($donorName: String!) {
  historyForDonorName(donorName: $donorName) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindHistoryForExternalNameDocument = gql`
    query FindHistoryForExternalName($externalName: String!) {
  historyForExternalName(externalName: $externalName) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindHistoryForLabwareBarcodeDocument = gql`
    query FindHistoryForLabwareBarcode($barcode: String!) {
  historyForLabwareBarcode(barcode: $barcode) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindHistoryForSampleIdDocument = gql`
    query FindHistoryForSampleId($sampleId: Int!) {
  historyForSampleId(sampleId: $sampleId) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindHistoryForWorkNumberDocument = gql`
    query FindHistoryForWorkNumber($workNumber: String!) {
  historyForWorkNumber(workNumber: $workNumber) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindHistoryGraphDocument = gql`
    query FindHistoryGraph($workNumber: String, $barcode: String, $donorName: [String!], $externalName: [String!], $zoom: Float, $fontSize: Int) {
  historyGraph(
    workNumber: $workNumber
    barcode: $barcode
    donorName: $donorName
    externalName: $externalName
    zoom: $zoom
    fontSize: $fontSize
  ) {
    ...GraphSVGFields
  }
}
    ${GraphSvgFieldsFragmentDoc}`;
export const FindIfOpExistsDocument = gql`
    query FindIfOpExists($operationType: String!, $barcode: String!, $run: String, $workNumber: String) {
  opExists(
    operationType: $operationType
    barcode: $barcode
    run: $run
    workNumber: $workNumber
  )
}
    `;
export const FindLabwareDocument = gql`
    query FindLabware($barcode: String!) {
  labware(barcode: $barcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const FindLabwareLocationDocument = gql`
    query FindLabwareLocation($barcodes: [String!]!) {
  stored(barcodes: $barcodes) {
    location {
      barcode
    }
  }
}
    `;
export const FindLatestOperationDocument = gql`
    query FindLatestOperation($barcode: String!, $operationType: String!) {
  findLatestOp(barcode: $barcode, operationType: $operationType) {
    id
  }
}
    `;
export const FindLocationByBarcodeDocument = gql`
    query FindLocationByBarcode($barcode: String!) {
  location(locationBarcode: $barcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
export const FindMeasurementByBarcodeAndNameDocument = gql`
    query FindMeasurementByBarcodeAndName($barcode: String!, $measurementName: String!) {
  measurementValueFromLabwareOrParent(barcode: $barcode, name: $measurementName) {
    address
    string
  }
}
    `;
export const FindMeasurementValueFromLabwareOrAncestorDocument = gql`
    query FindMeasurementValueFromLabwareOrAncestor($barcode: String!, $measurementName: String!) {
  measurementValueFromLabwareOrAncestor(barcode: $barcode, name: $measurementName) {
    address
    string
  }
}
    `;
export const FindPassFailsDocument = gql`
    query FindPassFails($barcode: String!, $operationType: String!) {
  passFails(barcode: $barcode, operationType: $operationType) {
    operation {
      ...OperationFields
    }
    slotPassFails {
      ...SlotPassFailFields
    }
  }
}
    ${OperationFieldsFragmentDoc}
${ActionFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${UserFieldsFragmentDoc}
${SlotPassFailFieldsFragmentDoc}`;
export const FindPermDataDocument = gql`
    query FindPermData($barcode: String!) {
  visiumPermData(barcode: $barcode) {
    labware {
      ...LabwareFlaggedFields
    }
    addressPermData {
      address
      controlType
      seconds
      selected
    }
    samplePositionResults {
      ...SamplePositionFields
    }
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${SamplePositionFieldsFragmentDoc}`;
export const FindPlanDataDocument = gql`
    query FindPlanData($barcode: String!) {
  planData(barcode: $barcode) {
    sources {
      ...LabwareFlaggedFields
    }
    destination {
      ...LabwareFlaggedFields
    }
    plan {
      operationType {
        name
      }
      planActions {
        ...PlanActionFields
      }
    }
    groups
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${PlanActionFieldsFragmentDoc}`;
export const FindReagentPlateDocument = gql`
    query FindReagentPlate($barcode: String!) {
  reagentPlate(barcode: $barcode) {
    numRows
    numColumns
    barcode
    slots {
      ...ReagentSlotFields
    }
    plateType
  }
}
    ${ReagentSlotFieldsFragmentDoc}`;
export const FindSamplePositionsDocument = gql`
    query FindSamplePositions($labwareBarcode: String!) {
  samplePositions(labwareBarcode: $labwareBarcode) {
    ...SamplePositionFields
  }
}
    ${SamplePositionFieldsFragmentDoc}`;
export const FindStoragePathDocument = gql`
    query FindStoragePath($locationBarcode: String!) {
  storagePath(locationBarcode: $locationBarcode) {
    ...LinkedLocationFields
  }
}
    ${LinkedLocationFieldsFragmentDoc}`;
export const FindWorkInfoDocument = gql`
    query FindWorkInfo($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
    workRequester {
      username
    }
    project {
      name
    }
  }
}
    `;
export const FindWorkNumbersDocument = gql`
    query FindWorkNumbers($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
  }
}
    `;
export const FindWorkProgressDocument = gql`
    query FindWorkProgress($workNumber: String, $workTypes: [String!], $programs: [String!], $statuses: [WorkStatus!], $requesters: [String!]) {
  workProgress(
    workNumber: $workNumber
    workTypes: $workTypes
    programs: $programs
    statuses: $statuses
    requesters: $requesters
  ) {
    ...WorkProgressFields
  }
}
    ${WorkProgressFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}
${WorkProgressTimeStampFieldFragmentDoc}`;
export const FindWorksCreatedByDocument = gql`
    query FindWorksCreatedBy($username: String!) {
  worksCreatedBy(username: $username) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const GetAllWorkInfoDocument = gql`
    query GetAllWorkInfo {
  works {
    workNumber
    workRequester {
      username
    }
    project {
      name
    }
    status
  }
}
    `;
export const GetAnalyserScanDataDocument = gql`
    query GetAnalyserScanData($barcode: String!) {
  analyserScanData(barcode: $barcode) {
    ...AnalyserScanDataFields
  }
}
    ${AnalyserScanDataFieldsFragmentDoc}`;
export const GetBioRisksDocument = gql`
    query GetBioRisks($includeDisabled: Boolean) {
  bioRisks(includeDisabled: $includeDisabled) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`;
export const GetBlockProcessingInfoDocument = gql`
    query GetBlockProcessingInfo {
  mediums {
    name
  }
  comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${CommentFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}`;
export const GetCellClassesDocument = gql`
    query GetCellClasses($includeDisabled: Boolean) {
  cellClasses(includeDisabled: $includeDisabled) {
    ...CellClassFields
  }
}
    ${CellClassFieldsFragmentDoc}`;
export const GetCleanedOutAddressesDocument = gql`
    query GetCleanedOutAddresses($barcode: String!) {
  cleanedOutAddresses(barcode: $barcode)
}
    `;
export const GetCommentsDocument = gql`
    query GetComments($commentCategory: String, $includeDisabled: Boolean) {
  comments(category: $commentCategory, includeDisabled: $includeDisabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetConfigurationDocument = gql`
    query GetConfiguration {
  destructionReasons(includeDisabled: true) {
    ...DestructionReasonFields
  }
  comments(includeDisabled: true) {
    ...CommentFields
  }
  hmdmcs(includeDisabled: true) {
    ...HmdmcFields
  }
  species(includeDisabled: true) {
    ...SpeciesFields
  }
  fixatives(includeDisabled: true) {
    ...FixativeFields
  }
  releaseDestinations(includeDisabled: true) {
    ...ReleaseDestinationFields
  }
  releaseRecipients(includeDisabled: true) {
    ...ReleaseRecipientFields
  }
  projects(includeDisabled: true) {
    ...ProjectFields
  }
  costCodes(includeDisabled: true) {
    ...CostCodeFields
  }
  workTypes(includeDisabled: true) {
    ...WorkTypeFields
  }
  equipments(includeDisabled: true) {
    ...EquipmentFields
  }
  users(includeDisabled: true) {
    ...UserFields
  }
  solutions(includeDisabled: true) {
    ...SolutionFields
  }
  probePanels: probePanels(includeDisabled: true) {
    ...ProbePanelFields
  }
  programs(includeDisabled: true) {
    ...ProgramFields
  }
  omeroProjects(includeDisabled: true) {
    ...OmeroProjectFields
  }
  dnapStudies(includeDisabled: true) {
    ...DnapStudyFields
  }
  bioRisks(includeDisabled: true) {
    ...BioRiskFields
  }
  tissueTypes {
    ...TissueTypeFields
  }
  cellClasses(includeDisabled: true) {
    ...CellClassFields
  }
  proteinPanels(includeDisabled: true) {
    ...ProteinPanelFields
  }
  treatmentTypes(includeDisabled: true) {
    ...TreatmentTypeFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}
${CommentFieldsFragmentDoc}
${HmdmcFieldsFragmentDoc}
${SpeciesFieldsFragmentDoc}
${FixativeFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ProjectFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${EquipmentFieldsFragmentDoc}
${UserFieldsFragmentDoc}
${SolutionFieldsFragmentDoc}
${ProbePanelFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${BioRiskFieldsFragmentDoc}
${TissueTypeFieldsFragmentDoc}
${CellClassFieldsFragmentDoc}
${ProteinPanelFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}`;
export const GetDestroyInfoDocument = gql`
    query GetDestroyInfo {
  destructionReasons {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const GetDestructionReasonsDocument = gql`
    query GetDestructionReasons($includeDisabled: Boolean) {
  destructionReasons(includeDisabled: $includeDisabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const GetDnapStudyDocument = gql`
    query GetDnapStudy($ssId: Int!) {
  dnapStudy(ssId: $ssId) {
    ...DnapStudyFields
  }
}
    ${DnapStudyFieldsFragmentDoc}`;
export const GetEquipmentsDocument = gql`
    query GetEquipments($category: String, $includeDisabled: Boolean) {
  equipments(category: $category, includeDisabled: $includeDisabled) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
export const GetEventTypesDocument = gql`
    query GetEventTypes {
  eventTypes
}
    `;
export const GetParaffinProcessingInfoDocument = gql`
    query GetParaffinProcessingInfo {
  comments(includeDisabled: false, category: "Paraffin processing program") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetLabwareBioRiskCodesDocument = gql`
    query GetLabwareBioRiskCodes($barcode: String!) {
  labwareBioRiskCodes(barcode: $barcode) {
    ...SampleBioRiskFields
  }
}
    ${SampleBioRiskFieldsFragmentDoc}`;
export const GetLabwareCostingDocument = gql`
    query GetLabwareCosting($barcode: String!) {
  labwareCosting(barcode: $barcode)
}
    `;
export const GetLabwareFlagDetailsDocument = gql`
    query GetLabwareFlagDetails($barcodes: [String!]!) {
  labwareFlagDetails(barcodes: $barcodes) {
    barcode
    flags {
      barcode
      priority
      description
    }
  }
}
    `;
export const GetLabwareInLocationDocument = gql`
    query GetLabwareInLocation($locationBarcode: String!) {
  labwareInLocation(locationBarcode: $locationBarcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const GetLabwareOperationsDocument = gql`
    query GetLabwareOperations($barcode: String!, $operationType: String!) {
  labwareOperations(barcode: $barcode, operationType: $operationType) {
    ...OperationFields
  }
}
    ${OperationFieldsFragmentDoc}
${ActionFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}
${UserFieldsFragmentDoc}`;
export const GetNextReplicateNumberDocument = gql`
    query GetNextReplicateNumber($barcodes: [String!]!) {
  nextReplicateNumbers(barcodes: $barcodes) {
    ...NextReplicateDataFields
  }
}
    ${NextReplicateDataFieldsFragmentDoc}`;
export const GetOmeroProjectsDocument = gql`
    query GetOmeroProjects {
  omeroProjects {
    name
    enabled
  }
}
    `;
export const GetOperationTypesDocument = gql`
    query GetOperationTypes {
  opTypes
}
    `;
export const GetPotProcessingInfoDocument = gql`
    query GetPotProcessingInfo {
  fixatives {
    name
  }
  comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${CommentFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}`;
export const GetPrintersDocument = gql`
    query GetPrinters {
  printers {
    ...PrinterFields
  }
}
    ${PrinterFieldsFragmentDoc}`;
export const GetProbeHybSlotsDocument = gql`
    query GetProbeHybSlots($barcode: String!) {
  probeHybSlots(barcode: $barcode)
}
    `;
export const GetProbePanelsDocument = gql`
    query GetProbePanels($type: ProbeType!) {
  probePanels(type: $type) {
    name
    enabled
    type
  }
}
    `;
export const GetProgramsDocument = gql`
    query GetPrograms {
  programs {
    name
    enabled
  }
}
    `;
export const GetProteinPanelsDocument = gql`
    query GetProteinPanels($includeDisabled: Boolean) {
  proteinPanels(includeDisabled: $includeDisabled) {
    ...ProteinPanelFields
  }
}
    ${ProteinPanelFieldsFragmentDoc}`;
export const GetRecordExtractResultInfoDocument = gql`
    query GetRecordExtractResultInfo {
  comments(category: "extract result", includeDisabled: false) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetRecordInPlaceInfoDocument = gql`
    query GetRecordInPlaceInfo($category: String) {
  equipments(includeDisabled: false, category: $category) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
export const GetRegionsOfInterestDocument = gql`
    query GetRegionsOfInterest($barcodes: [String!]!) {
  rois(barcodes: $barcodes) {
    ...LabwareRoiFields
  }
}
    ${LabwareRoiFieldsFragmentDoc}
${RoiFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const GetRegistrationInfoDocument = gql`
    query GetRegistrationInfo {
  species {
    name
  }
  hmdmcs {
    hmdmc
  }
  labwareTypes {
    ...LabwareTypeFields
  }
  tissueTypes {
    name
    spatialLocations {
      name
      code
    }
  }
  fixatives {
    name
  }
  mediums {
    name
  }
  solutions {
    name
  }
  slotRegions {
    name
  }
  bioRisks {
    code
  }
  cellClasses {
    name
  }
}
    ${LabwareTypeFieldsFragmentDoc}`;
export const GetReleaseColumnOptionsDocument = gql`
    query GetReleaseColumnOptions($includeDisabled: Boolean) {
  releaseColumnOptions(includeDisabled: $includeDisabled) {
    ...ReleaseFileOptionFields
  }
}
    ${ReleaseFileOptionFieldsFragmentDoc}`;
export const GetReleaseInfoDocument = gql`
    query GetReleaseInfo {
  releaseDestinations {
    ...ReleaseDestinationFields
  }
  releaseRecipients {
    ...ReleaseRecipientFields
  }
  releaseColumnOptions {
    ...ReleaseFileOptionFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${ReleaseFileOptionFieldsFragmentDoc}`;
export const GetRunNamesDocument = gql`
    query GetRunNames($barcode: String!) {
  runNames(barcode: $barcode)
}
    `;
export const GetRunRoisDocument = gql`
    query GetRunRois($barcode: String!, $run: String!) {
  runRois(barcode: $barcode, run: $run) {
    ...RoiFields
  }
}
    ${RoiFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const GetSampleProcessingCommentsInfoDocument = gql`
    query GetSampleProcessingCommentsInfo {
  comments: comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetSearchInfoDocument = gql`
    query GetSearchInfo {
  tissueTypes {
    name
  }
  labwareTypes {
    name
  }
  species {
    name
  }
}
    `;
export const GetSectioningCommentsDocument = gql`
    query GetSectioningComments {
  comments(category: "section") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetSectioningInfoDocument = gql`
    query GetSectioningInfo {
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${LabwareTypeFieldsFragmentDoc}`;
export const GetSlotRegionsDocument = gql`
    query GetSlotRegions($includeDisabled: Boolean) {
  slotRegions(includeDisabled: $includeDisabled) {
    name
    enabled
  }
}
    `;
export const GetSolutionTransferInfoDocument = gql`
    query GetSolutionTransferInfo {
  solutions {
    name
  }
}
    `;
export const GetStainInfoDocument = gql`
    query GetStainInfo {
  stainTypes {
    ...StainTypeFields
  }
}
    ${StainTypeFieldsFragmentDoc}`;
export const GetStainReagentTypesDocument = gql`
    query GetStainReagentTypes {
  stainReagentTypes {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetStainingQcInfoDocument = gql`
    query GetStainingQCInfo {
  comments(includeDisabled: false, category: "Imaging QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetSuggestedLabwareForWorkDocument = gql`
    query GetSuggestedLabwareForWork($workNumber: String!, $forRelease: Boolean) {
  suggestedLabwareForWork(workNumber: $workNumber, forRelease: $forRelease) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${TissueFieldsFragmentDoc}`;
export const GetSuggestedWorkForLabwareDocument = gql`
    query GetSuggestedWorkForLabware($barcodes: [String!]!, $includeInactive: Boolean) {
  suggestedWorkForLabware(barcodes: $barcodes, includeInactive: $includeInactive) {
    suggestedWorks {
      ...SuggestedWorkFields
    }
  }
}
    ${SuggestedWorkFieldsFragmentDoc}`;
export const GetVisiumQcInfoDocument = gql`
    query GetVisiumQCInfo {
  comments(includeDisabled: false, category: "Visium QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetWorkAllocationInfoDocument = gql`
    query GetWorkAllocationInfo($commentCategory: String!, $workStatuses: [WorkStatus!]) {
  projects(includeDisabled: false) {
    ...ProjectFields
  }
  programs(includeDisabled: false) {
    ...ProgramFields
  }
  costCodes(includeDisabled: false) {
    ...CostCodeFields
  }
  worksWithComments(status: $workStatuses) {
    ...WorkWithCommentFields
  }
  workTypes {
    ...WorkTypeFields
  }
  comments(category: $commentCategory, includeDisabled: false) {
    ...CommentFields
  }
  releaseRecipients(includeDisabled: false) {
    ...ReleaseRecipientFields
  }
  omeroProjects(includeDisabled: false) {
    ...OmeroProjectFields
  }
  dnapStudies(includeDisabled: false) {
    ...DnapStudyFields
  }
  releaseDestinations(includeDisabled: false) {
    ...ReleaseDestinationFields
  }
  treatmentTypes(includeDisabled: false) {
    ...TreatmentTypeFields
  }
}
    ${ProjectFieldsFragmentDoc}
${ProgramFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkWithCommentFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${OmeroProjectFieldsFragmentDoc}
${DnapStudyFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${TreatmentTypeFieldsFragmentDoc}
${CommentFieldsFragmentDoc}`;
export const GetWorkNumbersDocument = gql`
    query GetWorkNumbers {
  works {
    workNumber
  }
}
    `;
export const GetWorkProgressInputsDocument = gql`
    query GetWorkProgressInputs {
  workTypes(includeDisabled: true) {
    name
  }
  programs(includeDisabled: true) {
    name
  }
  releaseRecipients(includeDisabled: true) {
    username
  }
}
    `;
export const GetWorkSummaryDocument = gql`
    query GetWorkSummary {
  worksSummary {
    workSummaryGroups {
      ...WorkSummaryGroupFields
    }
    workTypes {
      name
    }
  }
}
    ${WorkSummaryGroupFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}`;
export const GetWorkTypesDocument = gql`
    query GetWorkTypes {
  workTypes(includeDisabled: true) {
    name
  }
}
    `;
export const GetXeniumQcInfoDocument = gql`
    query GetXeniumQCInfo {
  comments(includeDisabled: false, category: "Xenium analyser QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const ReloadSlotCopyDocument = gql`
    query ReloadSlotCopy($operationType: String!, $workNumber: String!, $lpNumber: String!) {
  reloadSlotCopy(
    operationType: $operationType
    workNumber: $workNumber
    lpNumber: $lpNumber
  ) {
    ...SlotCopyLoadFields
  }
}
    ${SlotCopyLoadFieldsFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AddBioRisk(variables: AddBioRiskMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddBioRiskMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddBioRiskMutation>({ document: AddBioRiskDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddBioRisk', 'mutation', variables);
    },
    AddComment(variables: AddCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCommentMutation>({ document: AddCommentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddComment', 'mutation', variables);
    },
    AddCostCode(variables: AddCostCodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddCostCodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCostCodeMutation>({ document: AddCostCodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddCostCode', 'mutation', variables);
    },
    AddDestructionReason(variables: AddDestructionReasonMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddDestructionReasonMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddDestructionReasonMutation>({ document: AddDestructionReasonDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddDestructionReason', 'mutation', variables);
    },
    AddEquipment(variables: AddEquipmentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddEquipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddEquipmentMutation>({ document: AddEquipmentDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddEquipment', 'mutation', variables);
    },
    AddExternalID(variables: AddExternalIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddExternalIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddExternalIdMutation>({ document: AddExternalIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddExternalID', 'mutation', variables);
    },
    AddExternalIds(variables: AddExternalIdsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddExternalIdsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddExternalIdsMutation>({ document: AddExternalIdsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddExternalIds', 'mutation', variables);
    },
    AddFixative(variables: AddFixativeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddFixativeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFixativeMutation>({ document: AddFixativeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddFixative', 'mutation', variables);
    },
    AddHmdmc(variables: AddHmdmcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddHmdmcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddHmdmcMutation>({ document: AddHmdmcDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddHmdmc', 'mutation', variables);
    },
    AddOmeroProject(variables: AddOmeroProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddOmeroProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddOmeroProjectMutation>({ document: AddOmeroProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddOmeroProject', 'mutation', variables);
    },
    AddProbePanel(variables: AddProbePanelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddProbePanelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProbePanelMutation>({ document: AddProbePanelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddProbePanel', 'mutation', variables);
    },
    AddProgram(variables: AddProgramMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddProgramMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProgramMutation>({ document: AddProgramDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddProgram', 'mutation', variables);
    },
    AddProject(variables: AddProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProjectMutation>({ document: AddProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddProject', 'mutation', variables);
    },
    AddProteinPanel(variables: AddProteinPanelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddProteinPanelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProteinPanelMutation>({ document: AddProteinPanelDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddProteinPanel', 'mutation', variables);
    },
    AddReleaseDestination(variables: AddReleaseDestinationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddReleaseDestinationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReleaseDestinationMutation>({ document: AddReleaseDestinationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddReleaseDestination', 'mutation', variables);
    },
    AddReleaseRecipient(variables: AddReleaseRecipientMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddReleaseRecipientMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReleaseRecipientMutation>({ document: AddReleaseRecipientDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddReleaseRecipient', 'mutation', variables);
    },
    AddSlotRegion(variables: AddSlotRegionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddSlotRegionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSlotRegionMutation>({ document: AddSlotRegionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddSlotRegion', 'mutation', variables);
    },
    AddSolution(variables: AddSolutionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddSolutionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSolutionMutation>({ document: AddSolutionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddSolution', 'mutation', variables);
    },
    AddSpatialLocations(variables: AddSpatialLocationsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddSpatialLocationsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSpatialLocationsMutation>({ document: AddSpatialLocationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddSpatialLocations', 'mutation', variables);
    },
    AddSpecies(variables: AddSpeciesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddSpeciesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSpeciesMutation>({ document: AddSpeciesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddSpecies', 'mutation', variables);
    },
    AddTissueType(variables: AddTissueTypeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddTissueTypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddTissueTypeMutation>({ document: AddTissueTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddTissueType', 'mutation', variables);
    },
    AddTreatmentType(variables: AddTreatmentTypeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddTreatmentTypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddTreatmentTypeMutation>({ document: AddTreatmentTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddTreatmentType', 'mutation', variables);
    },
    AddUser(variables: AddUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddUserMutation>({ document: AddUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddUser', 'mutation', variables);
    },
    AddWorkType(variables: AddWorkTypeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddWorkTypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddWorkTypeMutation>({ document: AddWorkTypeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddWorkType', 'mutation', variables);
    },
    Aliquot(variables: AliquotMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AliquotMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AliquotMutation>({ document: AliquotDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Aliquot', 'mutation', variables);
    },
    Confirm(variables: ConfirmMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ConfirmMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ConfirmMutation>({ document: ConfirmDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Confirm', 'mutation', variables);
    },
    ConfirmSection(variables: ConfirmSectionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ConfirmSectionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ConfirmSectionMutation>({ document: ConfirmSectionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ConfirmSection', 'mutation', variables);
    },
    CreateWork(variables: CreateWorkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateWorkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWorkMutation>({ document: CreateWorkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateWork', 'mutation', variables);
    },
    Destroy(variables: DestroyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DestroyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DestroyMutation>({ document: DestroyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Destroy', 'mutation', variables);
    },
    EmptyLocation(variables: EmptyLocationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<EmptyLocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EmptyLocationMutation>({ document: EmptyLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'EmptyLocation', 'mutation', variables);
    },
    Extract(variables: ExtractMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ExtractMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExtractMutation>({ document: ExtractDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Extract', 'mutation', variables);
    },
    FlagLabware(variables: FlagLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FlagLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<FlagLabwareMutation>({ document: FlagLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FlagLabware', 'mutation', variables);
    },
    Login(variables: LoginMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LoginMutation>({ document: LoginDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Login', 'mutation', variables);
    },
    Logout(variables?: LogoutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<LogoutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LogoutMutation>({ document: LogoutDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Logout', 'mutation', variables);
    },
    PerformLibraryConstruction(variables: PerformLibraryConstructionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PerformLibraryConstructionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformLibraryConstructionMutation>({ document: PerformLibraryConstructionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PerformLibraryConstruction', 'mutation', variables);
    },
    PerformParaffinProcessing(variables: PerformParaffinProcessingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PerformParaffinProcessingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformParaffinProcessingMutation>({ document: PerformParaffinProcessingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PerformParaffinProcessing', 'mutation', variables);
    },
    PerformSolutionTransfer(variables: PerformSolutionTransferMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PerformSolutionTransferMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformSolutionTransferMutation>({ document: PerformSolutionTransferDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PerformSolutionTransfer', 'mutation', variables);
    },
    PerformTissueBlock(variables: PerformTissueBlockMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PerformTissueBlockMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformTissueBlockMutation>({ document: PerformTissueBlockDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PerformTissueBlock', 'mutation', variables);
    },
    PerformTissuePot(variables: PerformTissuePotMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PerformTissuePotMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformTissuePotMutation>({ document: PerformTissuePotDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'PerformTissuePot', 'mutation', variables);
    },
    Plan(variables: PlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlanMutation>({ document: PlanDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Plan', 'mutation', variables);
    },
    Print(variables: PrintMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<PrintMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PrintMutation>({ document: PrintDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Print', 'mutation', variables);
    },
    ReactivateLabware(variables: ReactivateLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ReactivateLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReactivateLabwareMutation>({ document: ReactivateLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ReactivateLabware', 'mutation', variables);
    },
    RecordAnalyser(variables: RecordAnalyserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordAnalyserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordAnalyserMutation>({ document: RecordAnalyserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordAnalyser', 'mutation', variables);
    },
    RecordCompletion(variables: RecordCompletionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordCompletionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordCompletionMutation>({ document: RecordCompletionDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordCompletion', 'mutation', variables);
    },
    RecordComplexStain(variables: RecordComplexStainMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordComplexStainMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordComplexStainMutation>({ document: RecordComplexStainDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordComplexStain', 'mutation', variables);
    },
    RecordExtractResult(variables: RecordExtractResultMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordExtractResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordExtractResultMutation>({ document: RecordExtractResultDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordExtractResult', 'mutation', variables);
    },
    RecordInPlace(variables: RecordInPlaceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordInPlaceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordInPlaceMutation>({ document: RecordInPlaceDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordInPlace', 'mutation', variables);
    },
    RecordLibraryPrep(variables: RecordLibraryPrepMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordLibraryPrepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordLibraryPrepMutation>({ document: RecordLibraryPrepDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordLibraryPrep', 'mutation', variables);
    },
    RecordMetrics(variables: RecordMetricsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordMetricsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordMetricsMutation>({ document: RecordMetricsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordMetrics', 'mutation', variables);
    },
    RecordOpWithSlotComments(variables: RecordOpWithSlotCommentsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordOpWithSlotCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOpWithSlotCommentsMutation>({ document: RecordOpWithSlotCommentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordOpWithSlotComments', 'mutation', variables);
    },
    RecordOpWithSlotMeasurements(variables: RecordOpWithSlotMeasurementsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordOpWithSlotMeasurementsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOpWithSlotMeasurementsMutation>({ document: RecordOpWithSlotMeasurementsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordOpWithSlotMeasurements', 'mutation', variables);
    },
    RecordOrientationQC(variables: RecordOrientationQcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordOrientationQcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOrientationQcMutation>({ document: RecordOrientationQcDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordOrientationQC', 'mutation', variables);
    },
    RecordPerm(variables: RecordPermMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordPermMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordPermMutation>({ document: RecordPermDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordPerm', 'mutation', variables);
    },
    RecordProbeOperation(variables: RecordProbeOperationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordProbeOperationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordProbeOperationMutation>({ document: RecordProbeOperationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordProbeOperation', 'mutation', variables);
    },
    RecordQCLabware(variables: RecordQcLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordQcLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordQcLabwareMutation>({ document: RecordQcLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordQCLabware', 'mutation', variables);
    },
    RecordReagentTransfer(variables: RecordReagentTransferMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordReagentTransferMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordReagentTransferMutation>({ document: RecordReagentTransferDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordReagentTransfer', 'mutation', variables);
    },
    RecordRNAAnalysis(variables: RecordRnaAnalysisMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordRnaAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordRnaAnalysisMutation>({ document: RecordRnaAnalysisDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordRNAAnalysis', 'mutation', variables);
    },
    RecordSampleProcessingComments(variables: RecordSampleProcessingCommentsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordSampleProcessingCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordSampleProcessingCommentsMutation>({ document: RecordSampleProcessingCommentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordSampleProcessingComments', 'mutation', variables);
    },
    RecordStainResult(variables: RecordStainResultMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordStainResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordStainResultMutation>({ document: RecordStainResultDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordStainResult', 'mutation', variables);
    },
    RecordVisiumQC(variables: RecordVisiumQcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RecordVisiumQcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordVisiumQcMutation>({ document: RecordVisiumQcDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RecordVisiumQC', 'mutation', variables);
    },
    RegisterAsEndUser(variables: RegisterAsEndUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RegisterAsEndUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterAsEndUserMutation>({ document: RegisterAsEndUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RegisterAsEndUser', 'mutation', variables);
    },
    RegisterOriginalSamples(variables: RegisterOriginalSamplesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RegisterOriginalSamplesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterOriginalSamplesMutation>({ document: RegisterOriginalSamplesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RegisterOriginalSamples', 'mutation', variables);
    },
    RegisterSections(variables: RegisterSectionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RegisterSectionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterSectionsMutation>({ document: RegisterSectionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RegisterSections', 'mutation', variables);
    },
    RegisterTissues(variables: RegisterTissuesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RegisterTissuesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterTissuesMutation>({ document: RegisterTissuesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RegisterTissues', 'mutation', variables);
    },
    ReleaseLabware(variables: ReleaseLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ReleaseLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReleaseLabwareMutation>({ document: ReleaseLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ReleaseLabware', 'mutation', variables);
    },
    SaveSlotCopy(variables: SaveSlotCopyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SaveSlotCopyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveSlotCopyMutation>({ document: SaveSlotCopyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SaveSlotCopy', 'mutation', variables);
    },
    Segmentation(variables: SegmentationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SegmentationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SegmentationMutation>({ document: SegmentationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Segmentation', 'mutation', variables);
    },
    SetBioRiskEnabled(variables: SetBioRiskEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetBioRiskEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetBioRiskEnabledMutation>({ document: SetBioRiskEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetBioRiskEnabled', 'mutation', variables);
    },
    SetCellClassEnabled(variables: SetCellClassEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetCellClassEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCellClassEnabledMutation>({ document: SetCellClassEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetCellClassEnabled', 'mutation', variables);
    },
    SetCommentEnabled(variables: SetCommentEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetCommentEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCommentEnabledMutation>({ document: SetCommentEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetCommentEnabled', 'mutation', variables);
    },
    SetCostCodeEnabled(variables: SetCostCodeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetCostCodeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCostCodeEnabledMutation>({ document: SetCostCodeEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetCostCodeEnabled', 'mutation', variables);
    },
    SetDestructionReasonEnabled(variables: SetDestructionReasonEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetDestructionReasonEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetDestructionReasonEnabledMutation>({ document: SetDestructionReasonEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetDestructionReasonEnabled', 'mutation', variables);
    },
    SetEquipmentEnabled(variables: SetEquipmentEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetEquipmentEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetEquipmentEnabledMutation>({ document: SetEquipmentEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetEquipmentEnabled', 'mutation', variables);
    },
    SetFixativeEnabled(variables: SetFixativeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetFixativeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetFixativeEnabledMutation>({ document: SetFixativeEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetFixativeEnabled', 'mutation', variables);
    },
    SetHmdmcEnabled(variables: SetHmdmcEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetHmdmcEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetHmdmcEnabledMutation>({ document: SetHmdmcEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetHmdmcEnabled', 'mutation', variables);
    },
    SetLocationCustomName(variables: SetLocationCustomNameMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetLocationCustomNameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetLocationCustomNameMutation>({ document: SetLocationCustomNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetLocationCustomName', 'mutation', variables);
    },
    SetOmeroProjectEnabled(variables: SetOmeroProjectEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetOmeroProjectEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOmeroProjectEnabledMutation>({ document: SetOmeroProjectEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetOmeroProjectEnabled', 'mutation', variables);
    },
    SetOpWorkRequest(variables: SetOpWorkRequestMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetOpWorkRequestMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOpWorkRequestMutation>({ document: SetOpWorkRequestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetOpWorkRequest', 'mutation', variables);
    },
    SetProbePanelEnabled(variables: SetProbePanelEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetProbePanelEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProbePanelEnabledMutation>({ document: SetProbePanelEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetProbePanelEnabled', 'mutation', variables);
    },
    SetProgramEnabled(variables: SetProgramEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetProgramEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProgramEnabledMutation>({ document: SetProgramEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetProgramEnabled', 'mutation', variables);
    },
    SetProjectEnabled(variables: SetProjectEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetProjectEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProjectEnabledMutation>({ document: SetProjectEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetProjectEnabled', 'mutation', variables);
    },
    SetProteinPanelEnabled(variables: SetProteinPanelEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetProteinPanelEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProteinPanelEnabledMutation>({ document: SetProteinPanelEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetProteinPanelEnabled', 'mutation', variables);
    },
    SetReleaseDestinationEnabled(variables: SetReleaseDestinationEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetReleaseDestinationEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetReleaseDestinationEnabledMutation>({ document: SetReleaseDestinationEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetReleaseDestinationEnabled', 'mutation', variables);
    },
    SetReleaseRecipientEnabled(variables: SetReleaseRecipientEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetReleaseRecipientEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetReleaseRecipientEnabledMutation>({ document: SetReleaseRecipientEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetReleaseRecipientEnabled', 'mutation', variables);
    },
    SetSlotRegionEnabled(variables: SetSlotRegionEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetSlotRegionEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSlotRegionEnabledMutation>({ document: SetSlotRegionEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetSlotRegionEnabled', 'mutation', variables);
    },
    SetSolutionEnabled(variables: SetSolutionEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetSolutionEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSolutionEnabledMutation>({ document: SetSolutionEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetSolutionEnabled', 'mutation', variables);
    },
    SetSpeciesEnabled(variables: SetSpeciesEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetSpeciesEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSpeciesEnabledMutation>({ document: SetSpeciesEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetSpeciesEnabled', 'mutation', variables);
    },
    SetTreatmentTypeEnabled(variables: SetTreatmentTypeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetTreatmentTypeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetTreatmentTypeEnabledMutation>({ document: SetTreatmentTypeEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetTreatmentTypeEnabled', 'mutation', variables);
    },
    SetUserRole(variables: SetUserRoleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetUserRoleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetUserRoleMutation>({ document: SetUserRoleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetUserRole', 'mutation', variables);
    },
    SetWorkTypeEnabled(variables: SetWorkTypeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SetWorkTypeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetWorkTypeEnabledMutation>({ document: SetWorkTypeEnabledDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SetWorkTypeEnabled', 'mutation', variables);
    },
    SlotCopy(variables: SlotCopyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SlotCopyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SlotCopyMutation>({ document: SlotCopyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SlotCopy', 'mutation', variables);
    },
    Stain(variables: StainMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StainMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StainMutation>({ document: StainDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Stain', 'mutation', variables);
    },
    Store(variables: StoreMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StoreMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StoreMutation>({ document: StoreDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Store', 'mutation', variables);
    },
    StoreBarcode(variables: StoreBarcodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<StoreBarcodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StoreBarcodeMutation>({ document: StoreBarcodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'StoreBarcode', 'mutation', variables);
    },
    TransferLocationItems(variables: TransferLocationItemsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<TransferLocationItemsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<TransferLocationItemsMutation>({ document: TransferLocationItemsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'TransferLocationItems', 'mutation', variables);
    },
    Unrelease(variables: UnreleaseMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UnreleaseMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnreleaseMutation>({ document: UnreleaseDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Unrelease', 'mutation', variables);
    },
    UnstoreBarcode(variables: UnstoreBarcodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UnstoreBarcodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnstoreBarcodeMutation>({ document: UnstoreBarcodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UnstoreBarcode', 'mutation', variables);
    },
    UpdateDnapStudies(variables?: UpdateDnapStudiesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateDnapStudiesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateDnapStudiesMutation>({ document: UpdateDnapStudiesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateDnapStudies', 'mutation', variables);
    },
    UpdateReleaseRecipientFullName(variables: UpdateReleaseRecipientFullNameMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateReleaseRecipientFullNameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateReleaseRecipientFullNameMutation>({ document: UpdateReleaseRecipientFullNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateReleaseRecipientFullName', 'mutation', variables);
    },
    UpdateWorkAteraStudy(variables: UpdateWorkAteraStudyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkAteraStudyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkAteraStudyMutation>({ document: UpdateWorkAteraStudyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkAteraStudy', 'mutation', variables);
    },
    UpdateWorkDnapStudy(variables: UpdateWorkDnapStudyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkDnapStudyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkDnapStudyMutation>({ document: UpdateWorkDnapStudyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkDnapStudy', 'mutation', variables);
    },
    UpdateWorkNumBlocks(variables: UpdateWorkNumBlocksMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkNumBlocksMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumBlocksMutation>({ document: UpdateWorkNumBlocksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkNumBlocks', 'mutation', variables);
    },
    UpdateWorkNumOriginalSamples(variables: UpdateWorkNumOriginalSamplesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkNumOriginalSamplesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumOriginalSamplesMutation>({ document: UpdateWorkNumOriginalSamplesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkNumOriginalSamples', 'mutation', variables);
    },
    UpdateWorkNumSlides(variables: UpdateWorkNumSlidesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkNumSlidesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumSlidesMutation>({ document: UpdateWorkNumSlidesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkNumSlides', 'mutation', variables);
    },
    UpdateWorkOmeroProject(variables: UpdateWorkOmeroProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkOmeroProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkOmeroProjectMutation>({ document: UpdateWorkOmeroProjectDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkOmeroProject', 'mutation', variables);
    },
    UpdateWorkPriority(variables: UpdateWorkPriorityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkPriorityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkPriorityMutation>({ document: UpdateWorkPriorityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkPriority', 'mutation', variables);
    },
    UpdateWorkStatus(variables: UpdateWorkStatusMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkStatusMutation>({ document: UpdateWorkStatusDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkStatus', 'mutation', variables);
    },
    UpdateWorkTreatmentTypes(variables: UpdateWorkTreatmentTypesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkTreatmentTypesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkTreatmentTypesMutation>({ document: UpdateWorkTreatmentTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkTreatmentTypes', 'mutation', variables);
    },
    UpdateWorkTypes(variables: UpdateWorkTypesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkTypesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkTypesMutation>({ document: UpdateWorkTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkTypes', 'mutation', variables);
    },
    UpdateWorkXeniumStudy(variables: UpdateWorkXeniumStudyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateWorkXeniumStudyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkXeniumStudyMutation>({ document: UpdateWorkXeniumStudyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateWorkXeniumStudy', 'mutation', variables);
    },
    VisiumAnalysis(variables: VisiumAnalysisMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<VisiumAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VisiumAnalysisMutation>({ document: VisiumAnalysisDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'VisiumAnalysis', 'mutation', variables);
    },
    AddCellClass(variables: AddCellClassMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<AddCellClassMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCellClassMutation>({ document: AddCellClassDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'AddCellClass', 'mutation', variables);
    },
    CleanOut(variables: CleanOutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CleanOutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CleanOutMutation>({ document: CleanOutDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CleanOut', 'mutation', variables);
    },
    CurrentUser(variables?: CurrentUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CurrentUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CurrentUserQuery>({ document: CurrentUserDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CurrentUser', 'query', variables);
    },
    ExtractResult(variables: ExtractResultQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ExtractResultQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExtractResultQuery>({ document: ExtractResultDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ExtractResult', 'query', variables);
    },
    Find(variables: FindQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindQuery>({ document: FindDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'Find', 'query', variables);
    },
    FindFiles(variables: FindFilesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindFilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindFilesQuery>({ document: FindFilesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindFiles', 'query', variables);
    },
    FindFlaggedLabware(variables: FindFlaggedLabwareQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindFlaggedLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindFlaggedLabwareQuery>({ document: FindFlaggedLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindFlaggedLabware', 'query', variables);
    },
    FindHistory(variables?: FindHistoryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryQuery>({ document: FindHistoryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistory', 'query', variables);
    },
    FindHistoryForDonorName(variables: FindHistoryForDonorNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryForDonorNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForDonorNameQuery>({ document: FindHistoryForDonorNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistoryForDonorName', 'query', variables);
    },
    FindHistoryForExternalName(variables: FindHistoryForExternalNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryForExternalNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForExternalNameQuery>({ document: FindHistoryForExternalNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistoryForExternalName', 'query', variables);
    },
    FindHistoryForLabwareBarcode(variables: FindHistoryForLabwareBarcodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryForLabwareBarcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForLabwareBarcodeQuery>({ document: FindHistoryForLabwareBarcodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistoryForLabwareBarcode', 'query', variables);
    },
    FindHistoryForSampleId(variables: FindHistoryForSampleIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryForSampleIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForSampleIdQuery>({ document: FindHistoryForSampleIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistoryForSampleId', 'query', variables);
    },
    FindHistoryForWorkNumber(variables: FindHistoryForWorkNumberQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryForWorkNumberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForWorkNumberQuery>({ document: FindHistoryForWorkNumberDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistoryForWorkNumber', 'query', variables);
    },
    FindHistoryGraph(variables?: FindHistoryGraphQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindHistoryGraphQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryGraphQuery>({ document: FindHistoryGraphDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindHistoryGraph', 'query', variables);
    },
    FindIfOpExists(variables: FindIfOpExistsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindIfOpExistsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindIfOpExistsQuery>({ document: FindIfOpExistsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindIfOpExists', 'query', variables);
    },
    FindLabware(variables: FindLabwareQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLabwareQuery>({ document: FindLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindLabware', 'query', variables);
    },
    FindLabwareLocation(variables: FindLabwareLocationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindLabwareLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLabwareLocationQuery>({ document: FindLabwareLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindLabwareLocation', 'query', variables);
    },
    FindLatestOperation(variables: FindLatestOperationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindLatestOperationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLatestOperationQuery>({ document: FindLatestOperationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindLatestOperation', 'query', variables);
    },
    FindLocationByBarcode(variables: FindLocationByBarcodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindLocationByBarcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLocationByBarcodeQuery>({ document: FindLocationByBarcodeDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindLocationByBarcode', 'query', variables);
    },
    FindMeasurementByBarcodeAndName(variables: FindMeasurementByBarcodeAndNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindMeasurementByBarcodeAndNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindMeasurementByBarcodeAndNameQuery>({ document: FindMeasurementByBarcodeAndNameDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindMeasurementByBarcodeAndName', 'query', variables);
    },
    FindMeasurementValueFromLabwareOrAncestor(variables: FindMeasurementValueFromLabwareOrAncestorQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindMeasurementValueFromLabwareOrAncestorQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindMeasurementValueFromLabwareOrAncestorQuery>({ document: FindMeasurementValueFromLabwareOrAncestorDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindMeasurementValueFromLabwareOrAncestor', 'query', variables);
    },
    FindPassFails(variables: FindPassFailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindPassFailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPassFailsQuery>({ document: FindPassFailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindPassFails', 'query', variables);
    },
    FindPermData(variables: FindPermDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindPermDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPermDataQuery>({ document: FindPermDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindPermData', 'query', variables);
    },
    FindPlanData(variables: FindPlanDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindPlanDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPlanDataQuery>({ document: FindPlanDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindPlanData', 'query', variables);
    },
    FindReagentPlate(variables: FindReagentPlateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindReagentPlateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindReagentPlateQuery>({ document: FindReagentPlateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindReagentPlate', 'query', variables);
    },
    FindSamplePositions(variables: FindSamplePositionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindSamplePositionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindSamplePositionsQuery>({ document: FindSamplePositionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindSamplePositions', 'query', variables);
    },
    FindStoragePath(variables: FindStoragePathQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindStoragePathQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindStoragePathQuery>({ document: FindStoragePathDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindStoragePath', 'query', variables);
    },
    FindWorkInfo(variables: FindWorkInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindWorkInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkInfoQuery>({ document: FindWorkInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindWorkInfo', 'query', variables);
    },
    FindWorkNumbers(variables: FindWorkNumbersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindWorkNumbersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkNumbersQuery>({ document: FindWorkNumbersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindWorkNumbers', 'query', variables);
    },
    FindWorkProgress(variables?: FindWorkProgressQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindWorkProgressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkProgressQuery>({ document: FindWorkProgressDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindWorkProgress', 'query', variables);
    },
    FindWorksCreatedBy(variables: FindWorksCreatedByQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<FindWorksCreatedByQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorksCreatedByQuery>({ document: FindWorksCreatedByDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'FindWorksCreatedBy', 'query', variables);
    },
    GetAllWorkInfo(variables?: GetAllWorkInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAllWorkInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllWorkInfoQuery>({ document: GetAllWorkInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAllWorkInfo', 'query', variables);
    },
    GetAnalyserScanData(variables: GetAnalyserScanDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAnalyserScanDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAnalyserScanDataQuery>({ document: GetAnalyserScanDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAnalyserScanData', 'query', variables);
    },
    GetBioRisks(variables?: GetBioRisksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBioRisksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBioRisksQuery>({ document: GetBioRisksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBioRisks', 'query', variables);
    },
    GetBlockProcessingInfo(variables?: GetBlockProcessingInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBlockProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlockProcessingInfoQuery>({ document: GetBlockProcessingInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBlockProcessingInfo', 'query', variables);
    },
    GetCellClasses(variables?: GetCellClassesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetCellClassesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCellClassesQuery>({ document: GetCellClassesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCellClasses', 'query', variables);
    },
    GetCleanedOutAddresses(variables: GetCleanedOutAddressesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetCleanedOutAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCleanedOutAddressesQuery>({ document: GetCleanedOutAddressesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetCleanedOutAddresses', 'query', variables);
    },
    GetComments(variables?: GetCommentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetCommentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCommentsQuery>({ document: GetCommentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetComments', 'query', variables);
    },
    GetConfiguration(variables?: GetConfigurationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetConfigurationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConfigurationQuery>({ document: GetConfigurationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetConfiguration', 'query', variables);
    },
    GetDestroyInfo(variables?: GetDestroyInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetDestroyInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDestroyInfoQuery>({ document: GetDestroyInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDestroyInfo', 'query', variables);
    },
    GetDestructionReasons(variables?: GetDestructionReasonsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetDestructionReasonsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDestructionReasonsQuery>({ document: GetDestructionReasonsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDestructionReasons', 'query', variables);
    },
    GetDnapStudy(variables: GetDnapStudyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetDnapStudyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDnapStudyQuery>({ document: GetDnapStudyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDnapStudy', 'query', variables);
    },
    GetEquipments(variables?: GetEquipmentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetEquipmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEquipmentsQuery>({ document: GetEquipmentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEquipments', 'query', variables);
    },
    GetEventTypes(variables?: GetEventTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetEventTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEventTypesQuery>({ document: GetEventTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetEventTypes', 'query', variables);
    },
    GetParaffinProcessingInfo(variables?: GetParaffinProcessingInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetParaffinProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetParaffinProcessingInfoQuery>({ document: GetParaffinProcessingInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetParaffinProcessingInfo', 'query', variables);
    },
    GetLabwareBioRiskCodes(variables: GetLabwareBioRiskCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLabwareBioRiskCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareBioRiskCodesQuery>({ document: GetLabwareBioRiskCodesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLabwareBioRiskCodes', 'query', variables);
    },
    GetLabwareCosting(variables: GetLabwareCostingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLabwareCostingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareCostingQuery>({ document: GetLabwareCostingDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLabwareCosting', 'query', variables);
    },
    GetLabwareFlagDetails(variables: GetLabwareFlagDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLabwareFlagDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareFlagDetailsQuery>({ document: GetLabwareFlagDetailsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLabwareFlagDetails', 'query', variables);
    },
    GetLabwareInLocation(variables: GetLabwareInLocationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLabwareInLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareInLocationQuery>({ document: GetLabwareInLocationDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLabwareInLocation', 'query', variables);
    },
    GetLabwareOperations(variables: GetLabwareOperationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLabwareOperationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareOperationsQuery>({ document: GetLabwareOperationsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLabwareOperations', 'query', variables);
    },
    GetNextReplicateNumber(variables: GetNextReplicateNumberQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetNextReplicateNumberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNextReplicateNumberQuery>({ document: GetNextReplicateNumberDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetNextReplicateNumber', 'query', variables);
    },
    GetOmeroProjects(variables?: GetOmeroProjectsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetOmeroProjectsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOmeroProjectsQuery>({ document: GetOmeroProjectsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetOmeroProjects', 'query', variables);
    },
    GetOperationTypes(variables?: GetOperationTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetOperationTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOperationTypesQuery>({ document: GetOperationTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetOperationTypes', 'query', variables);
    },
    GetPotProcessingInfo(variables?: GetPotProcessingInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetPotProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPotProcessingInfoQuery>({ document: GetPotProcessingInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPotProcessingInfo', 'query', variables);
    },
    GetPrinters(variables?: GetPrintersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetPrintersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPrintersQuery>({ document: GetPrintersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPrinters', 'query', variables);
    },
    GetProbeHybSlots(variables: GetProbeHybSlotsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProbeHybSlotsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProbeHybSlotsQuery>({ document: GetProbeHybSlotsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProbeHybSlots', 'query', variables);
    },
    GetProbePanels(variables: GetProbePanelsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProbePanelsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProbePanelsQuery>({ document: GetProbePanelsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProbePanels', 'query', variables);
    },
    GetPrograms(variables?: GetProgramsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProgramsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProgramsQuery>({ document: GetProgramsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPrograms', 'query', variables);
    },
    GetProteinPanels(variables?: GetProteinPanelsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetProteinPanelsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProteinPanelsQuery>({ document: GetProteinPanelsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetProteinPanels', 'query', variables);
    },
    GetRecordExtractResultInfo(variables?: GetRecordExtractResultInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordExtractResultInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordExtractResultInfoQuery>({ document: GetRecordExtractResultInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordExtractResultInfo', 'query', variables);
    },
    GetRecordInPlaceInfo(variables?: GetRecordInPlaceInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRecordInPlaceInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordInPlaceInfoQuery>({ document: GetRecordInPlaceInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRecordInPlaceInfo', 'query', variables);
    },
    GetRegionsOfInterest(variables: GetRegionsOfInterestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRegionsOfInterestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRegionsOfInterestQuery>({ document: GetRegionsOfInterestDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRegionsOfInterest', 'query', variables);
    },
    GetRegistrationInfo(variables?: GetRegistrationInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRegistrationInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRegistrationInfoQuery>({ document: GetRegistrationInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRegistrationInfo', 'query', variables);
    },
    GetReleaseColumnOptions(variables?: GetReleaseColumnOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetReleaseColumnOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReleaseColumnOptionsQuery>({ document: GetReleaseColumnOptionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetReleaseColumnOptions', 'query', variables);
    },
    GetReleaseInfo(variables?: GetReleaseInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetReleaseInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReleaseInfoQuery>({ document: GetReleaseInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetReleaseInfo', 'query', variables);
    },
    GetRunNames(variables: GetRunNamesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRunNamesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRunNamesQuery>({ document: GetRunNamesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRunNames', 'query', variables);
    },
    GetRunRois(variables: GetRunRoisQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetRunRoisQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRunRoisQuery>({ document: GetRunRoisDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetRunRois', 'query', variables);
    },
    GetSampleProcessingCommentsInfo(variables?: GetSampleProcessingCommentsInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSampleProcessingCommentsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSampleProcessingCommentsInfoQuery>({ document: GetSampleProcessingCommentsInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSampleProcessingCommentsInfo', 'query', variables);
    },
    GetSearchInfo(variables?: GetSearchInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSearchInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSearchInfoQuery>({ document: GetSearchInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSearchInfo', 'query', variables);
    },
    GetSectioningComments(variables?: GetSectioningCommentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSectioningCommentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSectioningCommentsQuery>({ document: GetSectioningCommentsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSectioningComments', 'query', variables);
    },
    GetSectioningInfo(variables?: GetSectioningInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSectioningInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSectioningInfoQuery>({ document: GetSectioningInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSectioningInfo', 'query', variables);
    },
    GetSlotRegions(variables?: GetSlotRegionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSlotRegionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSlotRegionsQuery>({ document: GetSlotRegionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSlotRegions', 'query', variables);
    },
    GetSolutionTransferInfo(variables?: GetSolutionTransferInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSolutionTransferInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSolutionTransferInfoQuery>({ document: GetSolutionTransferInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSolutionTransferInfo', 'query', variables);
    },
    GetStainInfo(variables?: GetStainInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetStainInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainInfoQuery>({ document: GetStainInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetStainInfo', 'query', variables);
    },
    GetStainReagentTypes(variables?: GetStainReagentTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetStainReagentTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainReagentTypesQuery>({ document: GetStainReagentTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetStainReagentTypes', 'query', variables);
    },
    GetStainingQCInfo(variables?: GetStainingQcInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetStainingQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainingQcInfoQuery>({ document: GetStainingQcInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetStainingQCInfo', 'query', variables);
    },
    GetSuggestedLabwareForWork(variables: GetSuggestedLabwareForWorkQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSuggestedLabwareForWorkQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSuggestedLabwareForWorkQuery>({ document: GetSuggestedLabwareForWorkDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSuggestedLabwareForWork', 'query', variables);
    },
    GetSuggestedWorkForLabware(variables: GetSuggestedWorkForLabwareQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetSuggestedWorkForLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSuggestedWorkForLabwareQuery>({ document: GetSuggestedWorkForLabwareDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetSuggestedWorkForLabware', 'query', variables);
    },
    GetVisiumQCInfo(variables?: GetVisiumQcInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetVisiumQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVisiumQcInfoQuery>({ document: GetVisiumQcInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetVisiumQCInfo', 'query', variables);
    },
    GetWorkAllocationInfo(variables: GetWorkAllocationInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWorkAllocationInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkAllocationInfoQuery>({ document: GetWorkAllocationInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWorkAllocationInfo', 'query', variables);
    },
    GetWorkNumbers(variables?: GetWorkNumbersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWorkNumbersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkNumbersQuery>({ document: GetWorkNumbersDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWorkNumbers', 'query', variables);
    },
    GetWorkProgressInputs(variables?: GetWorkProgressInputsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWorkProgressInputsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkProgressInputsQuery>({ document: GetWorkProgressInputsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWorkProgressInputs', 'query', variables);
    },
    GetWorkSummary(variables?: GetWorkSummaryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWorkSummaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkSummaryQuery>({ document: GetWorkSummaryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWorkSummary', 'query', variables);
    },
    GetWorkTypes(variables?: GetWorkTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetWorkTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkTypesQuery>({ document: GetWorkTypesDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetWorkTypes', 'query', variables);
    },
    GetXeniumQCInfo(variables?: GetXeniumQcInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetXeniumQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetXeniumQcInfoQuery>({ document: GetXeniumQcInfoDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetXeniumQCInfo', 'query', variables);
    },
    ReloadSlotCopy(variables: ReloadSlotCopyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<ReloadSlotCopyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReloadSlotCopyQuery>({ document: ReloadSlotCopyDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'ReloadSlotCopy', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;