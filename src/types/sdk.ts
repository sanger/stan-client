/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type AddExternalIdRequest = {
  /** The external identifier used to identify the tissue. */
  externalName: string;
  /** The existing labware containing the tissue */
  labwareBarcode: string;
};

/** Request to assign external names to tissues at particular positions in labware. */
export type AddExternalIdsRequest = {
  /** The slot addresses and new external names. */
  addressNames: Array<AddressExternalName>;
  /** The barcode of the labware containing the tissue */
  labwareBarcode: string;
};

/** Request to add spatial locations to an existing tissue type. */
export type AddSpatialLocationsRequest = {
  /** The name of an existing tissue type. */
  name: string;
  /** The new spatial locations. */
  spatialLocations: Array<AddTissueTypeSpatialLocation>;
};

/** A request to add a tissue type. */
export type AddTissueTypeRequest = {
  /** The short code for the tissue type. */
  code: string;
  /** The name of the tissue type. */
  name: string;
  /** The spatial locations for the new tissue type. */
  spatialLocations: Array<AddTissueTypeSpatialLocation>;
};

/** A new spatial location for a particular tissue type. */
export type AddTissueTypeSpatialLocation = {
  /** The int code for the spatial location. */
  code: number;
  /** The name of the spatial location. */
  name: string;
};

/** A combination of an address and a comment id, used to record comments in particular slots of labware. */
export type AddressCommentInput = {
  /** The address of a slot. */
  address: string;
  /** The id of a comment in the database. */
  commentId: number;
};

/** A link between a slot address and an external name. */
export type AddressExternalName = {
  /** A slot address. */
  address: string;
  /** An external name. */
  externalName: string;
};

/** A request to transfer material from one source labware into multiple new destination labware (first slot). */
export type AliquotRequest = {
  /** The barcode of the source labware. */
  barcode: string;
  /** The name of the labware type for the destination labware. */
  labwareType: string;
  /** The number of destination labware to create. */
  numLabware: number;
  /** The name of the operation to record. */
  operationType: string;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** The information about a particular item of labware in an analyser request. */
export type AnalyserLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** Decoding consumables lot number. */
  decodingConsumablesLot?: string | null | undefined;
  /** The cassette position for the labware. */
  position: CassettePosition;
  /** The sample regions of interest in this labware. */
  samples: Array<SampleRoi>;
  /** The work number for the labware. */
  workNumber: string;
};

/** A request to record an analyser operation. */
export type AnalyserRequest = {
  /** The cell segmentation lot number. */
  cellSegmentationLot?: string | null | undefined;
  /** The id of the equipment used in this operation. */
  equipmentId: number;
  /** The labware involved in this request. */
  labware: Array<AnalyserLabware>;
  /** The lot number for the decoding reagents A. */
  lotNumberA: string;
  /** The lot number for the decoding reagents B. */
  lotNumberB: string;
  /** The name of the operation type to record. */
  operationType: string;
  /** The time at which this operation was performed. */
  performed?: string | null | undefined;
  /** Is this request a repeat? */
  repeat?: boolean | null | undefined;
  /** The run name. */
  runName: string;
};

/** A barcode and a sample id. */
export type BarcodeSampleId = {
  barcode: string;
  sampleId: number;
};

/** A request to register in a piece of labware containing one or more block-samples. */
export type BlockRegisterLabware = {
  /** The external barcode of the labware. */
  externalBarcode: string;
  /** The fixative used for the tissue. */
  fixative: string;
  /** The name of the type of labware containing the block. */
  labwareType: string;
  /** The medium used for the tissue. */
  medium: string;
  /** The samples in this block. */
  samples: Array<BlockRegisterSample>;
};

/** A request to register new blocks of tissue. */
export type BlockRegisterRequest = {
  /** The labware to register. */
  labware: Array<BlockRegisterLabware>;
  /** The work numbers for the request. */
  workNumbers: Array<string>;
};

/** A sample inside a block being registered. */
export type BlockRegisterSample = {
  /** The slot addresses containing the sample. */
  addresses: Array<string>;
  /** The biological risk number for this block. */
  bioRiskCode: string;
  /** The cellular classification of the tissue. */
  cellClass: string;
  /** The string to use as the donor name. */
  donorIdentifier: string;
  /** Is this a new block of tissue already in the application's database? */
  existingTissue?: boolean | null | undefined;
  /** The external identifier used to identify the tissue. */
  externalIdentifier: string;
  /** The highest section already taken from the tissue block. */
  highestSection: number;
  /** The HMDMC to use for the tissue. */
  hmdmc?: string | null | undefined;
  /** The life stage of the donor. */
  lifeStage?: LifeStage | null | undefined;
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: string;
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: string | null | undefined;
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: number;
  /** The species of the donor. */
  species: string;
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: string;
};

/** A request to cancel a particular planned action in a planned operation. */
export type CancelPlanAction = {
  /** The destination address of the planned action to cancel. */
  destinationAddress: string;
  /** The new section number (if any) of the planned action to cancel. */
  newSection?: string | null | undefined;
  /** The sample id of the planned action to cancel. */
  sampleId: number;
};

/** Position of a cassette in an analyser. */
export type CassettePosition =
  | 'left'
  | 'right';

/** A request to remove samples from particular slots in labware. */
export type CleanOutRequest = {
  /** The addresses of the slots to clean out. */
  addresses: Array<string>;
  /** The barcode of the labware. */
  barcode: string;
  /** The work number to link to the operation. */
  workNumber: string;
};

/** A request to record the completion of a process. */
export type CompletionRequest = {
  /** The details of the labware involved in this operation. */
  labware: Array<LabwareSampleComments>;
  /** The name of the type operations being recorded. */
  operationType: string;
  /** The work number associated with these operations. */
  workNumber: string;
};

/** The details for a particular labware in a complex stain request. */
export type ComplexStainLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** The bond barcode for the stain. */
  bondBarcode: string;
  /** The bond run number. */
  bondRun: number;
  /** The experiment panel. */
  panel: StainPanel;
  /** The plex for IHC if that is being recorded. */
  plexIHC?: number | null | undefined;
  /** The plex for RNAscope if that is being recorded. */
  plexRNAscope?: number | null | undefined;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** A request for a stain including bond barcodes and such. */
export type ComplexStainRequest = {
  /** The details of the labware being stained. */
  labware: Array<ComplexStainLabware>;
  /** The names of the types of stain being recorded. */
  stainTypes: Array<string>;
};

/** A specification of a particular piece of labware in a confirm request. */
export type ConfirmOperationLabware = {
  /** What comments, if any, should be recorded against particular addresses. */
  addressComments?: Array<AddressCommentInput> | null | undefined;
  /** The barcode of the labware. */
  barcode: string;
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: boolean | null | undefined;
  /** What individual planned actions should be cancelled, if any. */
  cancelledActions?: Array<CancelPlanAction> | null | undefined;
};

/** A request to confirm planned operations, created actual operations. */
export type ConfirmOperationRequest = {
  labware: Array<ConfirmOperationLabware>;
};

/** A specification of a section to confirm in a planned sectioning operation. */
export type ConfirmSection = {
  /** The comment ids to record against this sample in this slot. */
  commentIds?: Array<number> | null | undefined;
  /** The addresses of the destination slots for the section. */
  destinationAddresses: Array<string>;
  /** The section number of the new section. */
  newSection?: string | null | undefined;
  /** The original sample id of the source. */
  sampleId: number;
  /** The thickness of the section, overriding the thickness specified in the plan. */
  thickness?: string | null | undefined;
};

/** A specification of a particular piece of labware to confirm or cancel planned sectioning into. */
export type ConfirmSectionLabware = {
  /** What comments, if any, should be recorded on slots of the labware? */
  addressComments?: Array<AddressCommentInput> | null | undefined;
  /** The barcode of the labware. */
  barcode: string;
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: boolean | null | undefined;
  /** What individual sections, if any, should be created in the labware? */
  confirmSections?: Array<ConfirmSection> | null | undefined;
  /** The work number to link to the operation. */
  workNumber?: string | null | undefined;
};

/** A request to confirm (or cancel) planned sectioning operations. */
export type ConfirmSectionRequest = {
  /** The specification of what to confirm or cancel in each labware. */
  labware: Array<ConfirmSectionLabware>;
};

/** A type of control. */
export type ControlType =
  | 'negative'
  | 'positive';

/** A request to destroy some labware for a particular reason. */
export type DestroyRequest = {
  /** The barcodes of the labware to destroy. */
  barcodes: Array<string>;
  /** The id of a destruction reason. */
  reasonId: number;
};

/** Whether an operation was automated or manual. */
export type ExecutionType =
  | 'automated'
  | 'manual';

/** A request to record an extract operation. */
export type ExtractRequest = {
  /** The barcodes of the source labware. */
  barcodes: Array<string>;
  /** The id of the equipment being used in the extraction. If manual equipmentId is undefined */
  equipmentId?: number | null | undefined;
  /** The name of the labware type for the new destination labware. */
  labwareType: string;
  /** An optional work number to associate with these operations. */
  workNumber?: string | null | undefined;
};

/** Specification of extract results in a piece of labware. */
export type ExtractResultLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** The id of a comment, if any, linked to the result. */
  commentId?: number | null | undefined;
  /** The concentration measurement, if any. */
  concentration?: string | null | undefined;
  /** The result. */
  result: PassFail;
};

/** A request to record extract results. */
export type ExtractResultRequest = {
  /** The details of the results in each item of labware. */
  labware: Array<ExtractResultLabware>;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** A request to find some stored labware. Some, any or all fields may be filled. Each one refines the search results. */
export type FindRequest = {
  /** The maximum creation date for the labware. */
  createdMax?: string | null | undefined;
  /** The minimum creation date for the labware. */
  createdMin?: string | null | undefined;
  /** The names of donors to find stored samples of. */
  donorNames?: Array<string> | null | undefined;
  /** The barcode of a specific piece of labware to find. */
  labwareBarcode?: string | null | undefined;
  /** The name of a labware type to find labware of. */
  labwareTypeName?: string | null | undefined;
  /** The maximum number of records to return. Use a negative value to indicate no limit. */
  maxRecords?: number | null | undefined;
  /** The species of the samples. */
  species?: string | null | undefined;
  /** The names of tissues to find stored samples of. Maybe include * wildcards. */
  tissueExternalNames?: Array<string> | null | undefined;
  /** The name of a tissue type to find stored samples of. */
  tissueTypeName?: string | null | undefined;
  /** The work number associated with the labware. */
  workNumber?: string | null | undefined;
};

/** Raise a flag on a piece of labware. */
export type FlagLabwareRequest = {
  /** The barcodes of the flagged labware. */
  barcodes: Array<string>;
  /** The description of the flag. */
  description: string;
  /** Priority of the flag. */
  priority: FlagPriority;
  /** Work number to link to the flag. */
  workNumber?: string | null | undefined;
};

/** Priority of labware flags. */
export type FlagPriority =
  | 'flag'
  | 'note';

/** A traversal order for a grid. */
export type GridDirection =
  /** Down the leftmost column, then right to the next column, etc. */
  | 'DownRight'
  /** Right across the top row, then down to the next row, etc. */
  | 'RightDown'
  /** Right across the bottom row, then up to the next row, etc. */
  | 'RightUp'
  /** Up the leftmost column, then right to the next column, etc. */
  | 'UpRight';

/** A request to record an operation in place. */
export type InPlaceOpRequest = {
  /** The barcodes of the labware. */
  barcodes: Array<string>;
  /** The id of the equipment (if any) being used in this operation. */
  equipmentId?: number | null | undefined;
  /** The name of the type of operation being recorded. */
  operationType: string;
  /** Optional work numbers to associate with this operation. */
  workNumbers?: Array<string> | null | undefined;
};

/** Specification of results being recorded in an item of labware. */
export type LabwareResult = {
  /** The barcode of the labware. */
  barcode: string;
  /** An optional costing for the labware. */
  costing?: SlideCosting | null | undefined;
  /** A reagent lot number to associate with the labware. */
  reagentLot?: string | null | undefined;
  /** The individual results. */
  sampleResults?: Array<SampleResult> | null | undefined;
  /** Measurements to record in this labware. */
  slotMeasurements?: Array<SlotMeasurementRequest> | null | undefined;
};

/** The comments against samples in a particular piece of labware. */
export type LabwareSampleComments = {
  /** The barcode of the labware. */
  barcode: string;
  /** The comments to record against particular samples in this labware. */
  comments: Array<SampleAddressComment>;
  /** The (optional) completion time of the process for this labware. */
  completion?: string | null | undefined;
};

/** The state of an item of labware. */
export type LabwareState =
  /** The labware contains samples and can be used as a source in operations. */
  | 'active'
  /** The labware has been destroyed for a specific reason. */
  | 'destroyed'
  /** The labware has been used and discarded. */
  | 'discarded'
  /** The labware contains no samples. */
  | 'empty'
  /** The labware is frozen. */
  | 'frozen'
  /** The labware has been given out to another team or organisation. */
  | 'released'
  /** The labware has been used but may still be stored. */
  | 'used';

/** Specification of comments in slots of a piece of labware. */
export type LabwareWithSlotCommentsRequest = {
  /** The comments in slots of this labware. */
  addressComments: Array<AddressCommentInput>;
  /** The barcode of the labware. */
  barcode: string;
};

/** A request to record dual index and amplification ops. */
export type LibraryConRequest = {
  /** The barcode of the labware. */
  labwareBarcode: string;
  /** The type of reagent plate involved. */
  reagentPlateType?: string | null | undefined;
  /** The transfers from aliquot slots to destination slots. */
  reagentTransfers: Array<ReagentTransfer>;
  /** The measurement to record on slots in the destination. */
  slotMeasurements: Array<SlotMeasurementRequest>;
  /** The work number to associate with these operations. */
  workNumber: string;
};

/** A request to record transfer, dual index and amplification ops. */
export type LibraryPrepRequest = {
  /** The one destination labware for this request, and the description of what is transferred into it. */
  destination: SlotCopyDestination;
  /** The type of reagent plate involved. */
  reagentPlateType?: string | null | undefined;
  /** The transfers from aliquot slots to destination slots. */
  reagentTransfers: Array<ReagentTransfer>;
  /** The measurement to record on slots in the destination. */
  slotMeasurements: Array<SlotMeasurementRequest>;
  /** The source labware and new labware states for this request. */
  sources: Array<SlotCopySource>;
  /** The work number to associate with these operations. */
  workNumber: string;
};

/** A stage of life that an individual has reached when tissue is collected. */
export type LifeStage =
  | 'adult'
  | 'fetal'
  | 'paediatric';

/** Request to record an operation on multiple labware in-place with comments on some slots. */
export type OpWithSlotCommentsRequest = {
  /** The details of the labware. */
  labware: Array<LabwareWithSlotCommentsRequest>;
  /** The name of the operation type to record. */
  operationType: string;
  /** The work number. */
  workNumber?: string | null | undefined;
};

/** A request to record an operation in place with measurements in slots. */
export type OpWithSlotMeasurementsRequest = {
  /** The barcode of the labware. */
  barcode: string;
  /** The name of the type of operation to record. */
  operationType: string;
  /** The measurements to record in individual slots. */
  slotMeasurements: Array<SlotMeasurementRequest>;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** A request to alter the work linked to existing operations. */
export type OpWorkRequest = {
  /** The IDs of the operations to update. */
  opIds: Array<number>;
  /** The work number to link. */
  workNumber: string;
};

/** Record the orientation state of labware. */
export type OrientationRequest = {
  /** The barcode of the labware. */
  barcode: string;
  /** Is the orientation correct? */
  correct: boolean;
  /** The work number to link to the operation. */
  workNumber: string;
};

/** Data about registering a new original sample. */
export type OriginalSampleData = {
  /** The biological risk number for this sample. */
  bioRiskCode: string;
  /** The cellular classification of the sample. */
  cellClass: string;
  /** The string to use as the donor name. */
  donorIdentifier: string;
  /** The external identifier used to identify the tissue. */
  externalIdentifier?: string | null | undefined;
  /** The fixative used for the tissue. */
  fixative: string;
  /** The HMDMC to use for the tissue. */
  hmdmc?: string | null | undefined;
  /** The name of the type of labware containing the sample. */
  labwareType: string;
  /** The life stage of the donor. */
  lifeStage?: LifeStage | null | undefined;
  /** The pot number used to distinguish pots in a request. */
  potNumber?: number | null | undefined;
  /** The string to use for the replicate number of the tissue (optional). */
  replicateNumber?: string | null | undefined;
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: string | null | undefined;
  /** The solution used for the tissue. */
  solution: string;
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: number;
  /** The species of the donor. */
  species: string;
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: string;
  /** The optional work number to link to the registration. */
  workNumber?: string | null | undefined;
};

/** A request to register one or more original samples of tissue. */
export type OriginalSampleRegisterRequest = {
  samples: Array<OriginalSampleData>;
};

/** Panel, lot number, costing. */
export type PanelLot = {
  /** Costing. */
  costing: SlideCosting;
  /** Lot number. */
  lot: string;
  /** Name of the panel. */
  name: string;
};

/** A request to record paraffin processing. */
export type ParaffinProcessingRequest = {
  /** The labware barcodes. */
  barcodes: Array<string>;
  /** The comment ID. */
  commentId: number;
  /** The work number. */
  workNumber: string;
};

/** A pass or fail result. */
export type PassFail =
  | 'fail'
  | 'pass';

/** The permeabilisation data for a particular slot address. */
export type PermData = {
  /** The address of a slot in its labware. */
  address: string;
  /** The barcode of the labware being put into this slot as a control, if there is one. */
  controlBarcode?: string | null | undefined;
  /** The control type, if this is a control. */
  controlType?: ControlType | null | undefined;
  /** The number of seconds, if specified. */
  seconds?: number | null | undefined;
};

/** A request to create a plan operation. */
export type PlanRequest = {
  /** The specification of the labware created for the plan. */
  labware: Array<PlanRequestLabware>;
  /** The name of the type of operation we are planning. */
  operationType: string;
};

/** A specification of an action in a plan request. Describes the action on a sample being transferred between slots. */
export type PlanRequestAction = {
  /** The intended addresses of the sample in the destination labware. */
  addresses: Array<string>;
  /** The id of the existing sample. */
  sampleId: number;
  /** The thickness (if specified) of the new sample. */
  sampleThickness?: string | null | undefined;
  /** An indicator for the order sections are taken from their block. */
  sectioningOrder: number;
  /** The source of the sample (describing a slot in some existing labware). */
  source: PlanRequestSource;
};

/** A specification of new labware to be created for a plan request. */
export type PlanRequestLabware = {
  /** The actions, specifying which samples are transferred between which slots. */
  actions: Array<PlanRequestAction>;
  /** The barcode of the new labware, if the user needs to specify it. */
  barcode?: string | null | undefined;
  /** The costing of the labware, if any. */
  costing?: SlideCosting | null | undefined;
  /** The name of the type of labware. */
  labwareType: string;
  /** The lot number of the new labware, if any. */
  lotNumber?: string | null | undefined;
  /** Optional number of columns for custom-size labware. */
  numColumns?: number | null | undefined;
  /** Optional number of rows for custom-size labware. */
  numRows?: number | null | undefined;
};

/** A description of a source slot in a plan request. */
export type PlanRequestSource = {
  /** The address of the source slot in its labware. May be assumed to be A1 if omitted. */
  address?: string | null | undefined;
  /** The barcode of the source labware. */
  barcode: string;
};

/** A destination for pot processing. */
export type PotProcessingDestination = {
  /** Comment to record, if any. */
  commentId?: number | null | undefined;
  /** The fixative. */
  fixative: string;
  /** The name of the type of labware. */
  labwareType: string;
};

/** A request to transfer original sample into pots. */
export type PotProcessingRequest = {
  /** The destinations that will be created. */
  destinations: Array<PotProcessingDestination>;
  /** The source barcode. */
  sourceBarcode: string;
  /** Is the source labware discarded? */
  sourceDiscarded?: boolean | null | undefined;
  /** The work number. */
  workNumber: string;
};

/** The probe used on a piece of labware in an operation. */
export type ProbeLot = {
  /** The costing of the probe panel. */
  costing: SlideCosting;
  /** The lot number of the probe. */
  lot: string;
  /** The name of the probe panel. */
  name: string;
  /** The plex number. */
  plex?: number | null | undefined;
};

/** Labware in a probe operation request. */
export type ProbeOperationLabware = {
  /** Optional list of slot addresses to include in operation. */
  addresses?: Array<string> | null | undefined;
  /** The barcode of the labware. */
  barcode: string;
  /** Cassette lot number. */
  cassetteLot?: string | null | undefined;
  /** The costing for the kit used on this labware, if any. */
  kitCosting?: SlideCosting | null | undefined;
  /** The probes used on this labware. */
  probes: Array<ProbeLot>;
  /** Reagent lot number. */
  reagentLot?: string | null | undefined;
  /** The name of the spike probe, if used. */
  spike?: string | null | undefined;
  /** The work number of the operation on this labware. */
  workNumber: string;
};

/** Request to record an operation with probe panels. */
export type ProbeOperationRequest = {
  /** The labware involved in the operation. */
  labware: Array<ProbeOperationLabware>;
  /** The name of the type of operation. */
  operationType: string;
  /** The time when the operation was performed, if specified. */
  performed?: string | null | undefined;
};

/** Type of probe. */
export type ProbeType =
  | 'cytassist'
  | 'spike'
  | 'xenium';

/** Labware to be QC'd with comments and a completion time. */
export type QcLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** Zero or more comments applied to this labware in this operation. */
  comments: Array<number>;
  /** The time at which the process was completed. */
  completion?: string | null | undefined;
  /** The run-name to record. */
  runName?: string | null | undefined;
  /** Zero or more comments on individual samples in particular slots. */
  sampleComments?: Array<QcSampleComment> | null | undefined;
  /** The work number to link to the operation. */
  workNumber: string;
};

/** Request to record QC and completion time for one or more labware. */
export type QcLabwareRequest = {
  /** The specifications of labware to QC. */
  labware: Array<QcLabware>;
  /** The name of the operation to record. */
  operationType: string;
  /** Was it terminated early? */
  terminated?: boolean | null | undefined;
};

/** A comment on a particular sample in a particular slot. */
export type QcSampleComment = {
  /** The address of the slot. */
  address: string;
  /** The ID of the comment. */
  commentId: number;
  /** The ID of the sample. */
  sampleId: number;
};

/** An item of labware that RNA Analysis is being requested on. */
export type RnaAnalysisLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** The id of a preset comment, if any, to associate with the analysis. */
  commentId?: number | null | undefined;
  /** The measurements to record for this operation. */
  measurements: Array<StringMeasurement>;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** A request to record an RNA analysis operation. */
export type RnaAnalysisRequest = {
  /** The id of the equipment used in this operation. */
  equipmentId: number;
  /** The details of what to record on one or more labware. */
  labware: Array<RnaAnalysisLabware>;
  /** The name of the type of operation (a type RNA analsis). */
  operationType: string;
};

/** Request to undestroy/undiscard labware. */
export type ReactivateLabware = {
  /** The barcode of the labware to reactivate. */
  barcode: string;
  /** The comment id to associate with the reactivation. */
  commentId: number;
  /** The work number to associate with the reactivation. */
  workNumber: string;
};

/** A specification that a particular reagent slot should be transferred to an address. */
export type ReagentTransfer = {
  /** The address if a slot in the destination labware. */
  destinationAddress: string;
  /** The barcode of a reagent plate. */
  reagentPlateBarcode: string;
  /** The address of a slot in the reagent plate. */
  reagentSlotAddress: string;
};

/** A request to transfer reagents from reagent plates to a STAN labware. */
export type ReagentTransferRequest = {
  /** The barcode of the destination labware. */
  destinationBarcode: string;
  /** The name of the operation being performed. */
  operationType: string;
  /** The type of reagent plate involved. */
  plateType: string;
  /** The transfers from aliquot slots to destination slots. */
  transfers: Array<ReagentTransfer>;
  /** The work number to associate with the operation. */
  workNumber?: string | null | undefined;
};

/** A request to record permeabilisation data. */
export type RecordPermRequest = {
  /** The barcode of the labware. */
  barcode: string;
  /** The data for each slot in the labware. */
  permData: Array<PermData>;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** Details of a particular labware being released. */
export type ReleaseLabware = {
  /** The barcode of the labware to release. */
  barcode: string;
  /** The work number (optional) to associate with the release. */
  workNumber?: string | null | undefined;
};

/** A request to record releases for one or more labware. */
export type ReleaseRequest = {
  /** Release column groups for the release file. */
  columnOptions?: Array<string> | null | undefined;
  /** The name of the release destination. */
  destination: string;
  /** Additional recipients. */
  otherRecipients?: Array<string> | null | undefined;
  /** The name of the release recipient. */
  recipient: string;
  /** The details of the labware being released. */
  releaseLabware: Array<ReleaseLabware>;
};

/** A request to record results. */
export type ResultRequest = {
  /** The results for each item of labware. */
  labwareResults: Array<LabwareResult>;
  /** The name of the operation that will record the results. */
  operationType?: string | null | undefined;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** A comment against a particular sample at an address (in some particular labware). */
export type SampleAddressComment = {
  /** The address of the slot for the comment. */
  address: string;
  /** The id of the comment to record. */
  commentId: number;
  /** The id of the sample for the comment. */
  sampleId: number;
};

/** A request to record a comment against a particular sample. */
export type SampleIdCommentId = {
  /** The id of the comment to record. */
  commentId: number;
  /** The id of the sample to comment upon. */
  sampleId: number;
};

/** A key and value about a region of interest. */
export type SampleMetric = {
  /** The name of the metric. */
  name: string;
  /** The region of interest for this metric. */
  roi: string;
  /** The value of the metric. */
  value: string;
};

/** A request to save metrics. */
export type SampleMetricsRequest = {
  /** The labware barcode. */
  barcode: string;
  /** The metrics to save. */
  metrics: Array<SampleMetric>;
  /** The name of the operation to record. */
  operationType: string;
  /** The run name to link to the operation. */
  runName?: string | null | undefined;
  /** The work number to link to the operation. */
  workNumber: string;
};

/** A labware barcode and a comment id to add. */
export type SampleProcessingComment = {
  /** The barcode of the labware. */
  barcode: string;
  /** The id of the comment. */
  commentId: number;
};

/** Request to record operations and add comments to labware. */
export type SampleProcessingCommentRequest = {
  /** The comments to add for each labware. */
  labware: Array<SampleProcessingComment>;
};

/** Specifies a region of interest for a sample in a slot address. */
export type SampleRoi = {
  /** The address of the slot. */
  address: string;
  /** The region of interest of the sample. */
  roi: string;
  /** The id of the sample. */
  sampleId: number;
};

/** Specification of a result being recording. */
export type SampleResult = {
  /** The slot address that the result refers to. */
  address: string;
  /** The id of a comment, if any, linked to the result. */
  commentId?: number | null | undefined;
  /** The result if any defined. */
  result?: PassFail | null | undefined;
  /** List of comments to be recorded against particular samples. */
  sampleComments?: Array<SampleIdCommentId> | null | undefined;
};

/** Information about a section of tissue (already taken from some a block tracked elsewhere) to register. */
export type SectionRegisterContent = {
  /** The addresses of the slots in the labware where this section should be created. */
  addresses: Array<string>;
  /** The biological risk code for this sample. */
  bioRiskCode: string;
  /** The cellular classification of the section. */
  cellClass: string;
  /** The date the sample was sectioned. */
  dateSectioned?: string | null | undefined;
  /** A name for the donor. */
  donorIdentifier: string;
  /** The external name for the tissue from which this section was taken. */
  externalIdentifier: string;
  /** The fixative used for the tissue. */
  fixative: string;
  /** A HMDMC number, if any, to associate with this sample. */
  hmdmc?: string | null | undefined;
  /** The life stage of the donor. */
  lifeStage?: LifeStage | null | undefined;
  /** The medium used for the tissue. */
  medium: string;
  /** The region of this sample in this slot, if any. */
  region?: string | null | undefined;
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: string;
  /** The section number of this particular section from its original tissue block. */
  sectionNumber: string;
  /** The thickness, if known, of this section. */
  sectionThickness?: string | null | undefined;
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: number;
  /** The species from which this section originates. */
  species: string;
  /** The name of the tissue type (organ) for the tissue. */
  tissueType: string;
};

/** A request to register one or more sections into one piece of labware. */
export type SectionRegisterLabware = {
  /** The contents of the labware (new sections). */
  contents: Array<SectionRegisterContent>;
  /** The external barcode of this labware. */
  externalBarcode: string;
  /** The name of the type of labware. */
  labwareType: string;
  /** The lot number of the labware, if any. */
  lot?: string | null | undefined;
  /** The prebarcode of this labware, if any. */
  preBarcode?: string | null | undefined;
};

/** A request to register one or more labware containing new sections. */
export type SectionRegisterRequest = {
  /** The details of the labware being registered. */
  labware: Array<SectionRegisterLabware>;
  /** The work number to associate with the registration. */
  workNumber: string;
};

/** Details about labware in a segmentation request. */
export type SegmentationLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** The comment ids to link to the operation. */
  commentIds: Array<number>;
  /** The costing of the operation. */
  costing?: SlideCosting | null | undefined;
  /** The time with which the operation should be recorded. */
  performed?: string | null | undefined;
  /** Protein panels and lot numbers. */
  proteinPanels?: Array<PanelLot> | null | undefined;
  /** The reagent lot number. */
  reagentLot?: string | null | undefined;
  /** The work number to link to the operation. */
  workNumber: string;
};

/** A request to record segmentation on one or more labware. */
export type SegmentationRequest = {
  /** The details of the labware involved. */
  labware: Array<SegmentationLabware>;
  /** The name of the operation to record. */
  operationType: string;
};

/** Some information about the costing of a slide. */
export type SlideCosting =
  | 'Faculty'
  | 'SGP'
  | 'Warranty_replacement';

/** A specification that the contents of one slot should be copied to a particular address in new labware. */
export type SlotCopyContent = {
  /** The address of the destination slot. */
  destinationAddress: string;
  /** The address of the source slot in its labware. */
  sourceAddress: string;
  /** The barcode of the source labware. */
  sourceBarcode: string;
};

/** A destination for slot copy. */
export type SlotCopyDestination = {
  /** The barcode of the existing piece of labware. */
  barcode?: string | null | undefined;
  /** The bio state for samples in the destination (if specified). */
  bioState?: string | null | undefined;
  /** Cassette lot number, if specified. */
  cassetteLot?: string | null | undefined;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
  /** The costing of the slide, if specified. */
  costing?: SlideCosting | null | undefined;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: string | null | undefined;
  /** The lot number of the slide, if specified. */
  lotNumber?: string | null | undefined;
  /** The LP number of the new labware, if it has one. */
  lpNumber?: string | null | undefined;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: string | null | undefined;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: string | null | undefined;
  /** Reagent A lot number, if specified. */
  reagentALot?: string | null | undefined;
  /** Reagent B lot number, if specified. */
  reagentBLot?: string | null | undefined;
  /** Costing for reagent, if specified. */
  reagentCosting?: SlideCosting | null | undefined;
  /** Single reagent lot, if specified. */
  reagentLot?: string | null | undefined;
};

/** A request to copy the contents of slots from source labware to multiple new or prebarcoded destinations. */
export type SlotCopyRequest = {
  /** The destination labware and its contents. */
  destinations: Array<SlotCopyDestination>;
  /** Whether the execution was automated or manual. */
  executionType?: ExecutionType | null | undefined;
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: string;
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopySource>;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** Saved data for an incomplete slot copy operation. */
export type SlotCopySave = {
  /** The barcode of the existing piece of labware. */
  barcode?: string | null | undefined;
  /** The bio state for samples in the destination (if specified). */
  bioState?: string | null | undefined;
  /** Cassette lot number, if specified. */
  cassetteLot?: string | null | undefined;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
  /** The costing of the slide, if specified. */
  costing?: SlideCosting | null | undefined;
  /** Whether the execution was automated or manual. */
  executionType?: ExecutionType | null | undefined;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: string | null | undefined;
  /** The lot number of the slide, if specified. */
  lotNumber?: string | null | undefined;
  /** The LP number of the new labware, required. */
  lpNumber: string;
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: string;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: string | null | undefined;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: string | null | undefined;
  /** Reagent A lot number, if specified. */
  reagentALot?: string | null | undefined;
  /** Reagent B lot number, if specified. */
  reagentBLot?: string | null | undefined;
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopySource>;
  /** An optional work number to associate with this operation. */
  workNumber: string;
};

/** A source for slot copy, if a new labware state is specified. */
export type SlotCopySource = {
  /** The barcode of the source. */
  barcode: string;
  /** The new labware state of the source. */
  labwareState: LabwareState;
};

/** A measurement to be recorded in a particular slot of some item of labware. */
export type SlotMeasurementRequest = {
  /** The address of the slot. */
  address: string;
  /** Optional comment ids. */
  commentIds?: Array<number> | null | undefined;
  /** The name of the measurement. */
  name: string;
  /** The value of the measurement. */
  value: string;
};

/** A labware in a solution transfer request. */
export type SolutionTransferLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** The name solution. */
  solution: string;
};

/** A request to perform solution transfer. */
export type SolutionTransferRequest = {
  /** The details of the labware in the request. */
  labware: Array<SolutionTransferLabware>;
  /** The work number for the operations. */
  workNumber: string;
};

/** The panel used with a stain. */
export type StainPanel =
  | 'marker'
  | 'negative'
  | 'positive';

/** A request to record stains on some labware. */
export type StainRequest = {
  /** The barcodes of the labware being stained. */
  barcodes: Array<string>;
  /** Comment ids indicating reagent types used in stain. */
  commentIds?: Array<number> | null | undefined;
  /** The name of a stain type to record. */
  stainType: string;
  /** The times of particular measurements for the stains. */
  timeMeasurements: Array<TimeMeasurement>;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** A specification of an item to be put into storage. */
export type StoreInput = {
  /** The address, if any, in a location where the item should be stored. */
  address?: string | null | undefined;
  /** The barcode of the item to be stored. */
  barcode: string;
};

/** A specification for recording a measurement. */
export type StringMeasurement = {
  /** The thing being measured. */
  name: string;
  /** The value of the measurement. */
  value: string;
};

/** A measurement given as a number of seconds for some particular named measure. */
export type TimeMeasurement = {
  name: string;
  seconds: number;
};

/** Info describing a new block in a tissue block request. */
export type TissueBlockContent = {
  /** The addresses to place the sample in the new labware. */
  addresses: Array<string>;
  /** The id of a comment to record on the new block, if any. */
  commentId?: number | null | undefined;
  /** The replicate number for the new block. */
  replicate?: string | null | undefined;
  /** The barcode of the labware containing the source sample. */
  sourceBarcode: string;
  /** The id of the source sample. */
  sourceSampleId: number;
};

/** The input about a new block being created. */
export type TissueBlockLabware = {
  /** The contents (new samples) for the new labware. */
  contents: Array<TissueBlockContent>;
  /** The labware type for the new labware. */
  labwareType: string;
  /** The number of columns required in the labware, if overridden. */
  numColumns?: number | null | undefined;
  /** The number of rows required in the labware, if overridden. */
  numRows?: number | null | undefined;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: string | null | undefined;
};

/** A request to process original tissue into blocks. */
export type TissueBlockRequest = {
  /** Which source barcodes (if any) to discard as part of this request. */
  discardSourceBarcodes?: Array<string> | null | undefined;
  /** The labware (blocks) being created by this request. */
  labware: Array<TissueBlockLabware>;
  /** Which samples need to be removed from the source labware? */
  removedSourceSampleIds?: Array<BarcodeSampleId> | null | undefined;
  /** The work number associated with this request. */
  workNumber?: string | null | undefined;
};

/** The details of a previously released item of labware to receive back into the application. */
export type UnreleaseLabware = {
  /** The barcode of the labware. */
  barcode: string;
  /** The highest section number taken from the block, if it is a block. */
  highestSection?: number | null | undefined;
  /** The work number associated with the unrelease of this labware. */
  workNumber: string;
};

/** A request to receive back some previously released labware. */
export type UnreleaseRequest = {
  labware: Array<UnreleaseLabware>;
};

/** The levels of user privilege. */
export type UserRole =
  /** User can record work and can perform admin actions. */
  | 'admin'
  /** User cannot record anything. */
  | 'disabled'
  /** User can request work. */
  | 'enduser'
  /** User can record work. */
  | 'normal';

/** Request to record visium analysis, selecting a permeabilisation time. */
export type VisiumAnalysisRequest = {
  /** The barcode of the labware. */
  barcode: string;
  /** The address where the selected permeabilisation was recorded. */
  selectedAddress: string;
  /** The permeabilisation time that we want to select. */
  selectedTime: number;
  /** An optional work number to associate with this operation. */
  workNumber?: string | null | undefined;
};

/** The possible statuses of work. */
export type WorkStatus =
  /**
   * The work has been started, or resumed following a pause.
   * Work must be in this status for operations to be recorded in it.
   */
  | 'active'
  /** The work has been completed successfully. This is a final status. */
  | 'completed'
  /** The work has failed (for some particular reason). This is a final status. */
  | 'failed'
  /** The work has been paused (for some particular reason) by a user. */
  | 'paused'
  /** This is the initial status of new work. */
  | 'unstarted'
  /** The work has been withdrawn (for some particular reason). This is a final status. */
  | 'withdrawn';

export type ActionFieldsFragment = { operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } };

export type AddressPermDataFieldsFragment = { address: string, controlType: ControlType | null, seconds: number | null, selected: boolean };

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

export type FlagBarcodesFieldsFragment = { barcodes: Array<string>, priority: FlagPriority };

export type GraphSvgFieldsFragment = { svg: string };

export type HistoryEntryFieldsFragment = { destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null };

export type HistoryFieldsFragment = { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> };

export type HmdmcFieldsFragment = { hmdmc: string, enabled: boolean };

export type LabwareFieldsFragment = { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> };

export type LabwareFlaggedFieldsFragment = { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: FlagPriority | null, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> };

export type LabwareRoiFieldsFragment = { barcode: string, rois: Array<{ address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }> };

export type LabwareTypeFieldsFragment = { name: string, numRows: number, numColumns: number, labelType: { name: string } | null };

export type LinkedLocationFieldsFragment = { barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean };

export type LocationFieldsFragment = { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> };

export type NextReplicateDataFieldsFragment = { barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number };

export type OmeroProjectFieldsFragment = { name: string, enabled: boolean };

export type OperationFieldsFragment = { id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: UserRole } };

export type PlanActionFieldsFragment = { newSection: string | null, sampleThickness: string | null, sectioningOrder: number | null, sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } } }> }, destination: { address: string, labwareId: number } };

export type PrinterFieldsFragment = { name: string, labelTypes: Array<{ name: string }> };

export type ProbePanelFieldsFragment = { name: string, enabled: boolean, type: ProbeType };

export type ProgramFieldsFragment = { name: string, enabled: boolean };

export type ProjectFieldsFragment = { name: string, enabled: boolean };

export type ProteinPanelFieldsFragment = { name: string, enabled: boolean };

export type ReagentPlateFieldsFragment = { barcode: string, numRows: number, numColumns: number, plateType: string | null, slots: Array<{ address: string, used: boolean }> };

export type ReagentSlotFieldsFragment = { address: string, used: boolean };

export type RegisterResultFieldsFragment = { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, clashes: Array<{ tissue: { externalName: string | null, donor: { donorName: string }, spatialLocation: { code: number, name: string, tissueType: { name: string } } }, labware: Array<{ barcode: string, labwareType: { name: string } }> }>, labwareSolutions: Array<{ barcode: string, solutionName: string } | null> };

export type ReleaseDestinationFieldsFragment = { name: string, enabled: boolean };

export type ReleaseFileOptionFieldsFragment = { displayName: string, queryParamName: string };

export type ReleaseRecipientFieldsFragment = { username: string, fullName: string | null, enabled: boolean };

export type RoiFieldsFragment = { address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } };

export type SampleBioRiskFieldsFragment = { sampleId: number, bioRiskCode: string };

export type SampleFieldsFragment = { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } };

export type SamplePositionFieldsFragment = { address: string, region: string, sampleId: number, slotId: number, operationId: number };

export type SlotCopyLoadFieldsFragment = { operationType: string, workNumber: string, lpNumber: string, executionType: ExecutionType | null, labwareType: string | null, barcode: string | null, bioState: string | null, costing: SlideCosting | null, lotNumber: string | null, probeLotNumber: string | null, preBarcode: string | null, cassetteLot: string | null, sources: Array<{ barcode: string, labwareState: LabwareState }>, contents: Array<{ sourceBarcode: string, sourceAddress: string, destinationAddress: string }> };

export type SlotFieldsFragment = { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> };

export type SlotPassFailFieldsFragment = { address: string, result: PassFail, comment: string | null };

export type SlotRegionFieldsFragment = { enabled: boolean, name: string };

export type SolutionFieldsFragment = { name: string, enabled: boolean };

export type SpeciesFieldsFragment = { name: string, enabled: boolean };

export type StainTypeFieldsFragment = { name: string, measurementTypes: Array<string> };

export type SuggestedWorkFieldsFragment = { barcode: string, workNumber: string | null };

export type TissueFieldsFragment = { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } };

export type TissueTypeFieldsFragment = { name: string, code: string, spatialLocations: Array<{ code: number, name: string }> };

export type TreatmentTypeFieldsFragment = { name: string, enabled: boolean };

export type UserFieldsFragment = { username: string, role: UserRole };

export type WorkFieldsFragment = { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> };

export type WorkProgressFieldsFragment = { mostRecentOperation: string | null, workComment: string | null, work: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> }, timestamps: Array<{ type: string, timestamp: string }> };

export type WorkProgressTimeStampFieldFragment = { type: string, timestamp: string };

export type WorkSummaryGroupFieldsFragment = { numWorks: number, status: WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { name: string, enabled: boolean } };

export type WorkTypeFieldsFragment = { name: string, enabled: boolean };

export type WorkWithCommentFieldsFragment = { comment: string | null, work: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

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
  request: AddExternalIdRequest;
}>;


export type AddExternalIdMutation = { addExternalID: { operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type AddExternalIdsMutationVariables = Exact<{
  request: AddExternalIdsRequest;
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
  type: ProbeType;
  name: string;
}>;


export type AddProbePanelMutation = { addProbePanel: { name: string, enabled: boolean, type: ProbeType } };

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
  request: AddSpatialLocationsRequest;
}>;


export type AddSpatialLocationsMutation = { addSpatialLocations: { name: string, spatialLocations: Array<{ code: number, name: string }> } };

export type AddSpeciesMutationVariables = Exact<{
  name: string;
}>;


export type AddSpeciesMutation = { addSpecies: { name: string, enabled: boolean } };

export type AddTissueTypeMutationVariables = Exact<{
  request: AddTissueTypeRequest;
}>;


export type AddTissueTypeMutation = { addTissueType: { name: string, code: string, spatialLocations: Array<{ code: number, name: string }> } };

export type AddTreatmentTypeMutationVariables = Exact<{
  name: string;
}>;


export type AddTreatmentTypeMutation = { addTreatmentType: { name: string, enabled: boolean } };

export type AddUserMutationVariables = Exact<{
  username: string;
}>;


export type AddUserMutation = { addUser: { username: string, role: UserRole } };

export type AddWorkTypeMutationVariables = Exact<{
  name: string;
}>;


export type AddWorkTypeMutation = { addWorkType: { name: string, enabled: boolean } };

export type AliquotMutationVariables = Exact<{
  request: AliquotRequest;
}>;


export type AliquotMutation = { aliquot: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ operationType: { name: string }, actions: Array<{ sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number }> }, destination: { address: string, labwareId: number } }> }> } };

export type ConfirmMutationVariables = Exact<{
  request: ConfirmOperationRequest;
}>;


export type ConfirmMutation = { confirmOperation: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type ConfirmSectionMutationVariables = Exact<{
  request: ConfirmSectionRequest;
}>;


export type ConfirmSectionMutation = { confirmSection: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

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
  treatmentTypes?: Array<string> | null | undefined;
  facultyLead: string;
}>;


export type CreateWorkMutation = { createWork: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type DestroyMutationVariables = Exact<{
  request: DestroyRequest;
}>;


export type DestroyMutation = { destroy: { destructions: Array<{ labware: { barcode: string } | null }> } };

export type EmptyLocationMutationVariables = Exact<{
  barcode: string;
}>;


export type EmptyLocationMutation = { empty: { numUnstored: number } };

export type ExtractMutationVariables = Exact<{
  request: ExtractRequest;
}>;


export type ExtractMutation = { extract: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ operationType: { name: string }, actions: Array<{ sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number }> }, destination: { address: string, labwareId: number } }> }> } };

export type FlagLabwareMutationVariables = Exact<{
  request: FlagLabwareRequest;
}>;


export type FlagLabwareMutation = { flagLabware: { operations: Array<{ id: number }> } };

export type LoginMutationVariables = Exact<{
  username: string;
  password: string;
}>;


export type LoginMutation = { login: { user: { username: string, role: UserRole } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: string | null };

export type PerformLibraryConstructionMutationVariables = Exact<{
  requests: Array<LibraryConRequest>;
}>;


export type PerformLibraryConstructionMutation = { libraryCon: { operations: Array<{ id: number }> } };

export type PerformParaffinProcessingMutationVariables = Exact<{
  request: ParaffinProcessingRequest;
}>;


export type PerformParaffinProcessingMutation = { performParaffinProcessing: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PerformSolutionTransferMutationVariables = Exact<{
  request: SolutionTransferRequest;
}>;


export type PerformSolutionTransferMutation = { performSolutionTransfer: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PerformTissueBlockMutationVariables = Exact<{
  request: TissueBlockRequest;
}>;


export type PerformTissueBlockMutation = { performTissueBlock: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PerformTissuePotMutationVariables = Exact<{
  request: PotProcessingRequest;
}>;


export type PerformTissuePotMutation = { performPotProcessing: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type PlanMutationVariables = Exact<{
  request: PlanRequest;
}>;


export type PlanMutation = { plan: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ operationType: { name: string } | null, planActions: Array<{ newSection: string | null, sampleThickness: string | null, sectioningOrder: number | null, sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } } }> }, destination: { address: string, labwareId: number } }> }> } };

export type PrintMutationVariables = Exact<{
  barcodes: Array<string>;
  printer: string;
}>;


export type PrintMutation = { printLabware: string | null };

export type ReactivateLabwareMutationVariables = Exact<{
  items: Array<ReactivateLabware>;
}>;


export type ReactivateLabwareMutation = { reactivateLabware: { labware: Array<{ barcode: string, state: LabwareState }>, operations: Array<{ id: number }> } };

export type RecordAnalyserMutationVariables = Exact<{
  request: AnalyserRequest;
}>;


export type RecordAnalyserMutation = { recordAnalyser: { operations: Array<{ id: number }> } };

export type RecordCompletionMutationVariables = Exact<{
  request: CompletionRequest;
}>;


export type RecordCompletionMutation = { recordCompletion: { operations: Array<{ id: number }> } };

export type RecordComplexStainMutationVariables = Exact<{
  request: ComplexStainRequest;
}>;


export type RecordComplexStainMutation = { recordComplexStain: { operations: Array<{ id: number }> } };

export type RecordExtractResultMutationVariables = Exact<{
  request: ExtractResultRequest;
}>;


export type RecordExtractResultMutation = { recordExtractResult: { operations: Array<{ id: number }> } };

export type RecordInPlaceMutationVariables = Exact<{
  request: InPlaceOpRequest;
}>;


export type RecordInPlaceMutation = { recordInPlace: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RecordLibraryPrepMutationVariables = Exact<{
  request: LibraryPrepRequest;
}>;


export type RecordLibraryPrepMutation = { libraryPrep: { operations: Array<{ id: number }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RecordMetricsMutationVariables = Exact<{
  request: SampleMetricsRequest;
}>;


export type RecordMetricsMutation = { recordSampleMetrics: { operations: Array<{ id: number }> } };

export type RecordOpWithSlotCommentsMutationVariables = Exact<{
  request: OpWithSlotCommentsRequest;
}>;


export type RecordOpWithSlotCommentsMutation = { recordOpWithSlotComments: { operations: Array<{ id: number }> } };

export type RecordOpWithSlotMeasurementsMutationVariables = Exact<{
  request: OpWithSlotMeasurementsRequest;
}>;


export type RecordOpWithSlotMeasurementsMutation = { recordOpWithSlotMeasurements: { operations: Array<{ id: number }> } };

export type RecordOrientationQcMutationVariables = Exact<{
  request: OrientationRequest;
}>;


export type RecordOrientationQcMutation = { recordOrientationQC: { operations: Array<{ id: number }> } };

export type RecordPermMutationVariables = Exact<{
  request: RecordPermRequest;
}>;


export type RecordPermMutation = { recordPerm: { operations: Array<{ id: number }> } };

export type RecordProbeOperationMutationVariables = Exact<{
  request: ProbeOperationRequest;
}>;


export type RecordProbeOperationMutation = { recordProbeOperation: { operations: Array<{ id: number }> } };

export type RecordQcLabwareMutationVariables = Exact<{
  request: QcLabwareRequest;
}>;


export type RecordQcLabwareMutation = { recordQCLabware: { operations: Array<{ id: number }> } };

export type RecordReagentTransferMutationVariables = Exact<{
  request: ReagentTransferRequest;
}>;


export type RecordReagentTransferMutation = { reagentTransfer: { operations: Array<{ id: number }> } };

export type RecordRnaAnalysisMutationVariables = Exact<{
  request: RnaAnalysisRequest;
}>;


export type RecordRnaAnalysisMutation = { recordRNAAnalysis: { operations: Array<{ id: number }> } };

export type RecordSampleProcessingCommentsMutationVariables = Exact<{
  request: SampleProcessingCommentRequest;
}>;


export type RecordSampleProcessingCommentsMutation = { recordSampleProcessingComments: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, operations: Array<{ performed: string, operationType: { name: string }, user: { username: string } }> } };

export type RecordStainResultMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordStainResultMutation = { recordStainResult: { operations: Array<{ id: number }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RecordVisiumQcMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordVisiumQcMutation = { recordVisiumQC: { operations: Array<{ id: number }> } };

export type RegisterAsEndUserMutationVariables = Exact<{
  username: string;
  password: string;
}>;


export type RegisterAsEndUserMutation = { registerAsEndUser: { user: { username: string, role: UserRole } | null } };

export type RegisterOriginalSamplesMutationVariables = Exact<{
  request: OriginalSampleRegisterRequest;
}>;


export type RegisterOriginalSamplesMutation = { registerOriginalSamples: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, clashes: Array<{ tissue: { externalName: string | null, donor: { donorName: string }, spatialLocation: { code: number, name: string, tissueType: { name: string } } }, labware: Array<{ barcode: string, labwareType: { name: string } }> }>, labwareSolutions: Array<{ barcode: string, solutionName: string } | null> } };

export type RegisterSectionsMutationVariables = Exact<{
  request: SectionRegisterRequest;
}>;


export type RegisterSectionsMutation = { registerSections: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type RegisterTissuesMutationVariables = Exact<{
  request: BlockRegisterRequest;
}>;


export type RegisterTissuesMutation = { registerBlocks: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, clashes: Array<{ tissue: { externalName: string | null, donor: { donorName: string }, spatialLocation: { code: number, name: string, tissueType: { name: string } } }, labware: Array<{ barcode: string, labwareType: { name: string } }> }>, labwareSolutions: Array<{ barcode: string, solutionName: string } | null> } };

export type ReleaseLabwareMutationVariables = Exact<{
  releaseRequest: ReleaseRequest;
}>;


export type ReleaseLabwareMutation = { release: { releases: Array<{ id: number, labware: { barcode: string }, destination: { name: string }, recipient: { username: string } }> } };

export type SaveSlotCopyMutationVariables = Exact<{
  request: SlotCopySave;
}>;


export type SaveSlotCopyMutation = { saveSlotCopy: { operationType: string, workNumber: string, lpNumber: string, executionType: ExecutionType | null, labwareType: string | null, barcode: string | null, bioState: string | null, costing: SlideCosting | null, lotNumber: string | null, probeLotNumber: string | null, preBarcode: string | null, cassetteLot: string | null, sources: Array<{ barcode: string, labwareState: LabwareState }>, contents: Array<{ sourceBarcode: string, sourceAddress: string, destinationAddress: string }> } };

export type SegmentationMutationVariables = Exact<{
  request: SegmentationRequest;
}>;


export type SegmentationMutation = { segmentation: { operations: Array<{ id: number }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

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


export type SetLocationCustomNameMutation = { setLocationCustomName: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type SetOmeroProjectEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetOmeroProjectEnabledMutation = { setOmeroProjectEnabled: { name: string, enabled: boolean } };

export type SetOpWorkRequestMutationVariables = Exact<{
  request: OpWorkRequest;
}>;


export type SetOpWorkRequestMutation = { setOperationWork: Array<{ id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: UserRole } }> };

export type SetProbePanelEnabledMutationVariables = Exact<{
  type: ProbeType;
  name: string;
  enabled: boolean;
}>;


export type SetProbePanelEnabledMutation = { setProbePanelEnabled: { name: string, enabled: boolean, type: ProbeType } };

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
  role: UserRole;
}>;


export type SetUserRoleMutation = { setUserRole: { username: string, role: UserRole } };

export type SetWorkTypeEnabledMutationVariables = Exact<{
  name: string;
  enabled: boolean;
}>;


export type SetWorkTypeEnabledMutation = { setWorkTypeEnabled: { name: string, enabled: boolean } };

export type SlotCopyMutationVariables = Exact<{
  request: SlotCopyRequest;
}>;


export type SlotCopyMutation = { slotCopy: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> } };

export type StainMutationVariables = Exact<{
  request: StainRequest;
}>;


export type StainMutation = { stain: { operations: Array<{ id: number }> } };

export type StoreMutationVariables = Exact<{
  store: Array<StoreInput>;
  locationBarcode: string;
}>;


export type StoreMutation = { store: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type StoreBarcodeMutationVariables = Exact<{
  barcode: string;
  locationBarcode: string;
  address?: string | null | undefined;
}>;


export type StoreBarcodeMutation = { storeBarcode: { location: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } } };

export type TransferLocationItemsMutationVariables = Exact<{
  sourceBarcode: string;
  destinationBarcode: string;
}>;


export type TransferLocationItemsMutation = { transfer: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

export type UnreleaseMutationVariables = Exact<{
  request: UnreleaseRequest;
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

export type UpdateWorkDnapStudyMutationVariables = Exact<{
  workNumber: string;
  ssStudyId?: number | null | undefined;
}>;


export type UpdateWorkDnapStudyMutation = { updateWorkDnapStudy: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkNumBlocksMutationVariables = Exact<{
  workNumber: string;
  numBlocks?: number | null | undefined;
}>;


export type UpdateWorkNumBlocksMutation = { updateWorkNumBlocks: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkNumOriginalSamplesMutationVariables = Exact<{
  workNumber: string;
  numOriginalSamples?: number | null | undefined;
}>;


export type UpdateWorkNumOriginalSamplesMutation = { updateWorkNumOriginalSamples: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkNumSlidesMutationVariables = Exact<{
  workNumber: string;
  numSlides?: number | null | undefined;
}>;


export type UpdateWorkNumSlidesMutation = { updateWorkNumSlides: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkOmeroProjectMutationVariables = Exact<{
  workNumber: string;
  omeroProject?: string | null | undefined;
}>;


export type UpdateWorkOmeroProjectMutation = { updateWorkOmeroProject: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkPriorityMutationVariables = Exact<{
  workNumber: string;
  priority?: string | null | undefined;
}>;


export type UpdateWorkPriorityMutation = { updateWorkPriority: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkStatusMutationVariables = Exact<{
  workNumber: string;
  status: WorkStatus;
  commentId?: number | null | undefined;
}>;


export type UpdateWorkStatusMutation = { updateWorkStatus: { comment: string | null, work: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } } };

export type UpdateWorkTreatmentTypesMutationVariables = Exact<{
  workNumber: string;
  treatmentTypes: Array<string>;
}>;


export type UpdateWorkTreatmentTypesMutation = { updateWorkTreatmentTypes: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkTypesMutationVariables = Exact<{
  workNumber: string;
  workTypes: Array<string>;
}>;


export type UpdateWorkTypesMutation = { updateWorkWorkTypes: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type UpdateWorkXeniumStudyMutationVariables = Exact<{
  workNumber: string;
  ssStudyId?: number | null | undefined;
}>;


export type UpdateWorkXeniumStudyMutation = { updateWorkXeniumStudy: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } };

export type VisiumAnalysisMutationVariables = Exact<{
  request: VisiumAnalysisRequest;
}>;


export type VisiumAnalysisMutation = { visiumAnalysis: { operations: Array<{ id: number }> } };

export type AddCellClassMutationVariables = Exact<{
  name: string;
}>;


export type AddCellClassMutation = { addCellClass: { name: string, enabled: boolean } };

export type CleanOutMutationVariables = Exact<{
  request: CleanOutRequest;
}>;


export type CleanOutMutation = { cleanOut: { operations: Array<{ id: number }> } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { user: { username: string, role: UserRole } | null };

export type ExtractResultQueryVariables = Exact<{
  barcode: string;
}>;


export type ExtractResultQuery = { extractResult: { result: PassFail | null, concentration: string | null, labware: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: FlagPriority | null, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> } } };

export type FindQueryVariables = Exact<{
  request: FindRequest;
}>;


export type FindQuery = { find: { numRecords: number, entries: Array<{ labwareId: number, sampleId: number, workNumbers: Array<string | null> }>, samples: Array<{ id: number, section: string | null, tissue: { replicate: string | null, externalName: string | null, spatialLocation: { tissueType: { name: string } }, donor: { donorName: string }, medium: { name: string }, fixative: { name: string } } }>, labware: Array<{ id: number, barcode: string, externalBarcode: string | null, created: string, labwareType: { name: string } }>, locations: Array<{ id: number, barcode: string, customName: string | null, fixedName: string | null, direction: GridDirection | null, qualifiedNameWithFirstBarcode: string | null, size: { numRows: number, numColumns: number } | null }>, labwareLocations: Array<{ labwareId: number, locationId: number, address: string | null }> } };

export type FindFilesQueryVariables = Exact<{
  workNumbers: Array<string>;
}>;


export type FindFilesQuery = { listFiles: Array<{ created: string, name: string, url: string, work: { workNumber: string } }> };

export type FindFlaggedLabwareQueryVariables = Exact<{
  barcode: string;
}>;


export type FindFlaggedLabwareQuery = { labwareFlagged: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: FlagPriority | null, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> } };

export type FindHistoryQueryVariables = Exact<{
  workNumber?: string | null | undefined;
  barcode?: string | null | undefined;
  donorName?: Array<string> | null | undefined;
  externalName?: Array<string> | null | undefined;
  eventType?: string | null | undefined;
}>;


export type FindHistoryQuery = { history: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForDonorNameQueryVariables = Exact<{
  donorName: string;
}>;


export type FindHistoryForDonorNameQuery = { historyForDonorName: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForExternalNameQueryVariables = Exact<{
  externalName: string;
}>;


export type FindHistoryForExternalNameQuery = { historyForExternalName: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForLabwareBarcodeQueryVariables = Exact<{
  barcode: string;
}>;


export type FindHistoryForLabwareBarcodeQuery = { historyForLabwareBarcode: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForSampleIdQueryVariables = Exact<{
  sampleId: number;
}>;


export type FindHistoryForSampleIdQuery = { historyForSampleId: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForWorkNumberQueryVariables = Exact<{
  workNumber: string;
}>;


export type FindHistoryForWorkNumberQuery = { historyForWorkNumber: { labware: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }>, entries: Array<{ destinationLabwareId: number, details: Array<string>, eventId: number, sampleId: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber: string | null, address: string | null, region: string | null }>, flagBarcodes: Array<{ barcodes: Array<string>, priority: FlagPriority }> } };

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


export type FindLabwareQuery = { labware: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> } };

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


export type FindLocationByBarcodeQuery = { location: { barcode: string, fixedName: string | null, customName: string | null, address: string | null, direction: GridDirection | null, numStored: number, leaf: boolean, parent: { barcode: string, fixedName: string | null, customName: string | null } | null, size: { numRows: number, numColumns: number } | null, stored: Array<{ barcode: string, address: string | null }>, children: Array<{ barcode: string, fixedName: string | null, customName: string | null, address: string | null, numStored: number, leaf: boolean }> } };

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


export type FindPassFailsQuery = { passFails: Array<{ operation: { id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: UserRole } }, slotPassFails: Array<{ address: string, result: PassFail, comment: string | null }> }> };

export type FindPermDataQueryVariables = Exact<{
  barcode: string;
}>;


export type FindPermDataQuery = { visiumPermData: { labware: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: FlagPriority | null, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }, addressPermData: Array<{ address: string, controlType: ControlType | null, seconds: number | null, selected: boolean }>, samplePositionResults: Array<{ address: string, region: string, sampleId: number, slotId: number, operationId: number }> } };

export type FindPlanDataQueryVariables = Exact<{
  barcode: string;
}>;


export type FindPlanDataQuery = { planData: { groups: Array<Array<string>>, sources: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: FlagPriority | null, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }>, destination: { id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority: FlagPriority | null, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }, plan: { operationType: { name: string } | null, planActions: Array<{ newSection: string | null, sampleThickness: string | null, sectioningOrder: number | null, sample: { id: number }, source: { address: string, labwareId: number, samples: Array<{ id: number, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } } }> }, destination: { address: string, labwareId: number } }> } } };

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
  status: WorkStatus;
}>;


export type FindWorkInfoQuery = { works: Array<{ workNumber: string, workRequester: { username: string } | null, project: { name: string } }> };

export type FindWorkNumbersQueryVariables = Exact<{
  status: WorkStatus;
}>;


export type FindWorkNumbersQuery = { works: Array<{ workNumber: string }> };

export type FindWorkProgressQueryVariables = Exact<{
  workNumber?: string | null | undefined;
  workTypes?: Array<string> | null | undefined;
  programs?: Array<string> | null | undefined;
  statuses?: Array<WorkStatus> | null | undefined;
  requesters?: Array<string> | null | undefined;
}>;


export type FindWorkProgressQuery = { workProgress: Array<{ mostRecentOperation: string | null, workComment: string | null, work: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> }, timestamps: Array<{ type: string, timestamp: string }> }> };

export type FindWorksCreatedByQueryVariables = Exact<{
  username: string;
}>;


export type FindWorksCreatedByQuery = { worksCreatedBy: Array<{ workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> }> };

export type GetAllWorkInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWorkInfoQuery = { works: Array<{ workNumber: string, status: WorkStatus, workRequester: { username: string } | null, project: { name: string } }> };

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


export type GetConfigurationQuery = { destructionReasons: Array<{ id: number, text: string, enabled: boolean }>, comments: Array<{ id: number, text: string, category: string, enabled: boolean }>, hmdmcs: Array<{ hmdmc: string, enabled: boolean }>, species: Array<{ name: string, enabled: boolean }>, fixatives: Array<{ name: string, enabled: boolean }>, releaseDestinations: Array<{ name: string, enabled: boolean }>, releaseRecipients: Array<{ username: string, fullName: string | null, enabled: boolean }>, projects: Array<{ name: string, enabled: boolean }>, costCodes: Array<{ code: string, enabled: boolean }>, workTypes: Array<{ name: string, enabled: boolean }>, equipments: Array<{ id: number, name: string, category: string, enabled: boolean }>, users: Array<{ username: string, role: UserRole }>, solutions: Array<{ name: string, enabled: boolean }>, xeniumProbePanels: Array<{ name: string, enabled: boolean, type: ProbeType }>, cytassistProbePanels: Array<{ name: string, enabled: boolean, type: ProbeType }>, spikeProbePanels: Array<{ name: string, enabled: boolean, type: ProbeType }>, programs: Array<{ name: string, enabled: boolean }>, omeroProjects: Array<{ name: string, enabled: boolean }>, dnapStudies: Array<{ ssId: number, name: string, enabled: boolean }>, bioRisks: Array<{ code: string, enabled: boolean }>, tissueTypes: Array<{ name: string, code: string, spatialLocations: Array<{ code: number, name: string }> }>, cellClasses: Array<{ name: string, enabled: boolean }>, proteinPanels: Array<{ name: string, enabled: boolean }>, treatmentTypes: Array<{ name: string, enabled: boolean }> };

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


export type GetLabwareCostingQuery = { labwareCosting: SlideCosting | null };

export type GetLabwareFlagDetailsQueryVariables = Exact<{
  barcodes: Array<string>;
}>;


export type GetLabwareFlagDetailsQuery = { labwareFlagDetails: Array<{ barcode: string, flags: Array<{ barcode: string, priority: FlagPriority, description: string }> }> };

export type GetLabwareInLocationQueryVariables = Exact<{
  locationBarcode: string;
}>;


export type GetLabwareInLocationQuery = { labwareInLocation: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> };

export type GetLabwareOperationsQueryVariables = Exact<{
  barcode: string;
  operationType: string;
}>;


export type GetLabwareOperationsQuery = { labwareOperations: Array<{ id: number, performed: string, operationType: { name: string }, actions: Array<{ operationId: number, source: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, destination: { id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }>, user: { username: string, role: UserRole } } | null> | null };

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
  type: ProbeType;
}>;


export type GetProbePanelsQuery = { probePanels: Array<{ name: string, enabled: boolean, type: ProbeType }> };

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


export type GetRegionsOfInterestQuery = { rois: Array<{ barcode: string, rois: Array<{ address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }> }> };

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


export type GetRunRoisQuery = { runRois: Array<{ address: string, roi: string, sample: { id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } } }> };

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


export type GetSuggestedLabwareForWorkQuery = { suggestedLabwareForWork: Array<{ id: number, barcode: string, externalBarcode: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, frozen: boolean, created: string, numRows: number, numColumns: number, labwareType: { name: string, numRows: number, numColumns: number, labelType: { name: string } | null }, slots: Array<{ id: number, address: string, labwareId: number, samples: Array<{ id: number, section: string | null, blockHighestSection: number | null, tissue: { externalName: string | null, replicate: string | null, collectionDate: string | null, donor: { donorName: string, lifeStage: LifeStage | null }, spatialLocation: { code: number, name: string, tissueType: { name: string } }, hmdmc: { hmdmc: string } | null, medium: { name: string }, fixative: { name: string, enabled: boolean } }, bioState: { name: string } }> }> }> };

export type GetSuggestedWorkForLabwareQueryVariables = Exact<{
  barcodes: Array<string>;
  includeInactive?: boolean | null | undefined;
}>;


export type GetSuggestedWorkForLabwareQuery = { suggestedWorkForLabware: { suggestedWorks: Array<{ barcode: string, workNumber: string | null }> } };

export type GetVisiumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVisiumQcInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type GetWorkAllocationInfoQueryVariables = Exact<{
  commentCategory: string;
  workStatuses?: Array<WorkStatus> | null | undefined;
}>;


export type GetWorkAllocationInfoQuery = { projects: Array<{ name: string, enabled: boolean }>, programs: Array<{ name: string, enabled: boolean }>, costCodes: Array<{ code: string, enabled: boolean }>, worksWithComments: Array<{ comment: string | null, work: { workNumber: string, status: WorkStatus, numBlocks: number | null, numSlides: number | null, numOriginalSamples: number | null, priority: string | null, workRequester: { username: string, fullName: string | null, enabled: boolean } | null, project: { name: string, enabled: boolean }, program: { name: string, enabled: boolean }, costCode: { code: string, enabled: boolean }, workTypes: Array<{ name: string, enabled: boolean }>, omeroProject: { name: string, enabled: boolean } | null, dnapStudy: { ssId: number, name: string, enabled: boolean } | null, xeniumStudy: { ssId: number, name: string, enabled: boolean } | null, facultyLead: { name: string, enabled: boolean } | null, treatmentTypes: Array<{ name: string, enabled: boolean }> } }>, workTypes: Array<{ name: string, enabled: boolean }>, comments: Array<{ id: number, text: string, category: string, enabled: boolean }>, releaseRecipients: Array<{ username: string, fullName: string | null, enabled: boolean }>, omeroProjects: Array<{ name: string, enabled: boolean }>, dnapStudies: Array<{ ssId: number, name: string, enabled: boolean }>, releaseDestinations: Array<{ name: string, enabled: boolean }>, treatmentTypes: Array<{ name: string, enabled: boolean }> };

export type GetWorkNumbersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkNumbersQuery = { works: Array<{ workNumber: string }> };

export type GetWorkProgressInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkProgressInputsQuery = { workTypes: Array<{ name: string }>, programs: Array<{ name: string }>, releaseRecipients: Array<{ username: string }> };

export type GetWorkSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkSummaryQuery = { worksSummary: { workSummaryGroups: Array<{ numWorks: number, status: WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { name: string, enabled: boolean } }>, workTypes: Array<{ name: string }> } };

export type GetWorkTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkTypesQuery = { workTypes: Array<{ name: string }> };

export type GetXeniumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetXeniumQcInfoQuery = { comments: Array<{ id: number, text: string, category: string, enabled: boolean }> };

export type ReloadSlotCopyQueryVariables = Exact<{
  operationType: string;
  workNumber: string;
  lpNumber: string;
}>;


export type ReloadSlotCopyQuery = { reloadSlotCopy: { operationType: string, workNumber: string, lpNumber: string, executionType: ExecutionType | null, labwareType: string | null, barcode: string | null, bioState: string | null, costing: SlideCosting | null, lotNumber: string | null, probeLotNumber: string | null, preBarcode: string | null, cassetteLot: string | null, sources: Array<{ barcode: string, labwareState: LabwareState }>, contents: Array<{ sourceBarcode: string, sourceAddress: string, destinationAddress: string }> } | null };
