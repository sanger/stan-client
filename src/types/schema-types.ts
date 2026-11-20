export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A row/column combination, either in the form "B5" (row 2, column 5), or "32,15" (row 32, column 15) */
  Address: { input: string; output: string; }
  /** A date, typically in the format yyyy-mm-dd. */
  Date: { input: string; output: string; }
  /** A point in time, typically in the format yyyy-mm-dd HH:MM:SS. */
  Timestamp: { input: string; output: string; }
};

/** A record of material being transferred from one slot to another as part of an operation. */
export type Action = {
  __typename?: 'Action';
  /** The destination slot, where the sample is after the operation. */
  destination: Slot;
  /** The id of the operation to which this action belongs. */
  operationId: Scalars['Int']['output'];
  /** The sample as it was created or copied in its destination slot. */
  sample: Sample;
  /** The source slot, where the sample already was before the operation. */
  source: Slot;
};

export type AddExternalIdRequest = {
  /** The external identifier used to identify the tissue. */
  externalName: Scalars['String']['input'];
  /** The existing labware containing the tissue */
  labwareBarcode: Scalars['String']['input'];
};

/** Request to assign external names to tissues at particular positions in labware. */
export type AddExternalIdsRequest = {
  /** The slot addresses and new external names. */
  addressNames: Array<AddressExternalName>;
  /** The barcode of the labware containing the tissue */
  labwareBarcode: Scalars['String']['input'];
};

/** Request to add spatial locations to an existing tissue type. */
export type AddSpatialLocationsRequest = {
  /** The name of an existing tissue type. */
  name: Scalars['String']['input'];
  /** The new spatial locations. */
  spatialLocations: Array<AddTissueTypeSpatialLocation>;
};

/** A request to add a tissue type. */
export type AddTissueTypeRequest = {
  /** The short code for the tissue type. */
  code: Scalars['String']['input'];
  /** The name of the tissue type. */
  name: Scalars['String']['input'];
  /** The spatial locations for the new tissue type. */
  spatialLocations: Array<AddTissueTypeSpatialLocation>;
};

/** A new spatial location for a particular tissue type. */
export type AddTissueTypeSpatialLocation = {
  /** The int code for the spatial location. */
  code: Scalars['Int']['input'];
  /** The name of the spatial location. */
  name: Scalars['String']['input'];
};

/** A combination of an address and a comment id, used to record comments in particular slots of labware. */
export type AddressCommentInput = {
  /** The address of a slot. */
  address: Scalars['Address']['input'];
  /** The id of a comment in the database. */
  commentId: Scalars['Int']['input'];
};

/** A link between a slot address and an external name. */
export type AddressExternalName = {
  /** A slot address. */
  address: Scalars['Address']['input'];
  /** An external name. */
  externalName: Scalars['String']['input'];
};

/** Permeabilisation data about a particular slot address. */
export type AddressPermData = {
  __typename?: 'AddressPermData';
  /** The slot address. */
  address: Scalars['Address']['output'];
  /** The control type, if this is a control. */
  controlType: Maybe<ControlType>;
  /** The number of seconds, if any. */
  seconds: Maybe<Scalars['Int']['output']>;
  /** Whether this result has been selected. */
  selected: Scalars['Boolean']['output'];
};

/** An address and a string associated with that address. */
export type AddressString = {
  __typename?: 'AddressString';
  address: Scalars['Address']['output'];
  string: Scalars['String']['output'];
};

/** A request to transfer material from one source labware into multiple new destination labware (first slot). */
export type AliquotRequest = {
  /** The barcode of the source labware. */
  barcode: Scalars['String']['input'];
  /** The name of the labware type for the destination labware. */
  labwareType: Scalars['String']['input'];
  /** The number of destination labware to create. */
  numLabware: Scalars['Int']['input'];
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** The information about a particular item of labware in an analyser request. */
export type AnalyserLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Decoding consumables lot number. */
  decodingConsumablesLot?: InputMaybe<Scalars['String']['input']>;
  /** The index of the cassette in the machine. */
  index?: InputMaybe<Scalars['Int']['input']>;
  /** The cassette position for the labware. */
  position?: InputMaybe<CassettePosition>;
  /** The sample regions of interest in this labware. */
  samples: Array<SampleRoi>;
  /** The work number for the labware. */
  workNumber: Scalars['String']['input'];
};

/** A request to record an analyser operation. */
export type AnalyserRequest = {
  /** The cell segmentation lot number. */
  cellSegmentationLot?: InputMaybe<Scalars['String']['input']>;
  /** The id of the equipment used in this operation. */
  equipmentId: Scalars['Int']['input'];
  /** The labware involved in this request. */
  labware: Array<AnalyserLabware>;
  /** The lot number for the decoding reagents A. */
  lotNumberA?: InputMaybe<Scalars['String']['input']>;
  /** The lot number for the decoding reagents B. */
  lotNumberB?: InputMaybe<Scalars['String']['input']>;
  /** The name of the operation type to record. */
  operationType: Scalars['String']['input'];
  /** The time at which this operation was performed. */
  performed?: InputMaybe<Scalars['Timestamp']['input']>;
  /** Is this request a repeat? */
  repeat?: InputMaybe<Scalars['Boolean']['input']>;
  /** The run name. */
  runName: Scalars['String']['input'];
  /** Comment id for the work type. */
  workTypeCommentId?: InputMaybe<Scalars['Int']['input']>;
};

/** Information to show when a user scans in labware for the analyser op. */
export type AnalyserScanData = {
  __typename?: 'AnalyserScanData';
  /** The barcode of the labware. */
  barcode: Scalars['String']['output'];
  /** Has cell segmentation been recorded? */
  cellSegmentationRecorded: Scalars['Boolean']['output'];
  /** The names of probes recorded on the labware. */
  probes: Array<Scalars['String']['output']>;
  /** The work numbers and xenium study ids linked to the labware. */
  workNumberXeniumStudyIds: Array<WorkNumberXeniumStudyId>;
};

/** A barcode and a sample id. */
export type BarcodeSampleId = {
  barcode: Scalars['String']['input'];
  sampleId: Scalars['Int']['input'];
};

/** Biological risk assessment number. */
export type BioRisk = {
  __typename?: 'BioRisk';
  /** The alphanumeric code representing this risk assessment. */
  code: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** The state of a particular sample. As samples are created in new labware by different operations, it is associated with new bio states. */
export type BioState = {
  __typename?: 'BioState';
  name: Scalars['String']['output'];
};

/** A request to register in a piece of labware containing one or more block-samples. */
export type BlockRegisterLabware = {
  /** The external barcode of the labware. */
  externalBarcode: Scalars['String']['input'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String']['input'];
  /** The name of the type of labware containing the block. */
  labwareType: Scalars['String']['input'];
  /** The medium used for the tissue. */
  medium: Scalars['String']['input'];
  /** The samples in this block. */
  samples: Array<BlockRegisterSample>;
};

/** A request to register new blocks of tissue. */
export type BlockRegisterRequest = {
  /** The labware to register. */
  labware: Array<BlockRegisterLabware>;
  /** The work numbers for the request. */
  workNumbers: Array<Scalars['String']['input']>;
};

/** A sample inside a block being registered. */
export type BlockRegisterSample = {
  /** The slot addresses containing the sample. */
  addresses: Array<Scalars['Address']['input']>;
  /** The biological risk number for this block. */
  bioRiskCode: Scalars['String']['input'];
  /** The cellular classification of the tissue. */
  cellClass: Scalars['String']['input'];
  /** The string to use as the donor name. */
  donorIdentifier: Scalars['String']['input'];
  /** Is this a new block of tissue already in the application's database? */
  existingTissue?: InputMaybe<Scalars['Boolean']['input']>;
  /** The external identifier used to identify the tissue. */
  externalIdentifier: Scalars['String']['input'];
  /** The highest section already taken from the tissue block. */
  highestSection: Scalars['Int']['input'];
  /** The HMDMC to use for the tissue. */
  hmdmc?: InputMaybe<Scalars['String']['input']>;
  /** The life stage of the donor. */
  lifeStage?: InputMaybe<LifeStage>;
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: Scalars['String']['input'];
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: InputMaybe<Scalars['Date']['input']>;
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int']['input'];
  /** The species of the donor. */
  species: Scalars['String']['input'];
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: Scalars['String']['input'];
};

/** A request to cancel a particular planned action in a planned operation. */
export type CancelPlanAction = {
  /** The destination address of the planned action to cancel. */
  destinationAddress: Scalars['Address']['input'];
  /** The new section number (if any) of the planned action to cancel. */
  newSection?: InputMaybe<Scalars['String']['input']>;
  /** The sample id of the planned action to cancel. */
  sampleId: Scalars['Int']['input'];
};

/** Position of a cassette in an analyser. */
export enum CassettePosition {
  Left = 'left',
  Right = 'right'
}

/** A cellular classification. */
export type CellClass = {
  __typename?: 'CellClass';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** A request to remove samples from particular slots in labware. */
export type CleanOutRequest = {
  /** The addresses of the slots to clean out. */
  addresses: Array<Scalars['Address']['input']>;
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
};

/** A preset comment that users may select to link to parts of operations they record. */
export type Comment = {
  __typename?: 'Comment';
  /** The category of the comment: Where is it applicable? */
  category: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  /** The unique id of this comment. */
  id: Scalars['Int']['output'];
  /** The text content of the comment: What comment is it? */
  text: Scalars['String']['output'];
};

/** A request to record the completion of a process. */
export type CompletionRequest = {
  /** The details of the labware involved in this operation. */
  labware: Array<LabwareSampleComments>;
  /** The name of the type operations being recorded. */
  operationType: Scalars['String']['input'];
  /** The work number associated with these operations. */
  workNumber: Scalars['String']['input'];
};

/** The details for a particular labware in a complex stain request. */
export type ComplexStainLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The bond barcode for the stain. */
  bondBarcode: Scalars['String']['input'];
  /** The bond run number. */
  bondRun: Scalars['Int']['input'];
  /** The experiment panel. */
  panel: StainPanel;
  /** The plex for IHC if that is being recorded. */
  plexIHC?: InputMaybe<Scalars['Int']['input']>;
  /** The plex for RNAscope if that is being recorded. */
  plexRNAscope?: InputMaybe<Scalars['Int']['input']>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request for a stain including bond barcodes and such. */
export type ComplexStainRequest = {
  /** The details of the labware being stained. */
  labware: Array<ComplexStainLabware>;
  /** The names of the types of stain being recorded. */
  stainTypes: Array<Scalars['String']['input']>;
};

/** A specification of a particular piece of labware in a confirm request. */
export type ConfirmOperationLabware = {
  /** What comments, if any, should be recorded against particular addresses. */
  addressComments?: InputMaybe<Array<AddressCommentInput>>;
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  /** What individual planned actions should be cancelled, if any. */
  cancelledActions?: InputMaybe<Array<CancelPlanAction>>;
};

/** A request to confirm planned operations, created actual operations. */
export type ConfirmOperationRequest = {
  labware: Array<ConfirmOperationLabware>;
};

/** The result of confirming a plan. */
export type ConfirmOperationResult = {
  __typename?: 'ConfirmOperationResult';
  /** The labware populated by the operations. */
  labware: Array<Labware>;
  /** The operations created. */
  operations: Array<Operation>;
};

/** A specification of a section to confirm in a planned sectioning operation. */
export type ConfirmSection = {
  /** The comment ids to record against this sample in this slot. */
  commentIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The addresses of the destination slots for the section. */
  destinationAddresses: Array<Scalars['Address']['input']>;
  /** The section number of the new section. */
  newSection?: InputMaybe<Scalars['String']['input']>;
  /** The original sample id of the source. */
  sampleId: Scalars['Int']['input'];
  /** The thickness of the section, overriding the thickness specified in the plan. */
  thickness?: InputMaybe<Scalars['String']['input']>;
};

/** A specification of a particular piece of labware to confirm or cancel planned sectioning into. */
export type ConfirmSectionLabware = {
  /** What comments, if any, should be recorded on slots of the labware? */
  addressComments?: InputMaybe<Array<AddressCommentInput>>;
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  /** What individual sections, if any, should be created in the labware? */
  confirmSections?: InputMaybe<Array<ConfirmSection>>;
  /** The work number to link to the operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request to confirm (or cancel) planned sectioning operations. */
export type ConfirmSectionRequest = {
  /** The specification of what to confirm or cancel in each labware. */
  labware: Array<ConfirmSectionLabware>;
};

/** A type of control. */
export enum ControlType {
  Negative = 'negative',
  Positive = 'positive'
}

/** A cost code that work can be associated with. */
export type CostCode = {
  __typename?: 'CostCode';
  code: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A request to destroy some labware for a particular reason. */
export type DestroyRequest = {
  /** The barcodes of the labware to destroy. */
  barcodes: Array<Scalars['String']['input']>;
  /** The id of a destruction reason. */
  reasonId: Scalars['Int']['input'];
};

/** The result of a request to destroy labware. */
export type DestroyResult = {
  __typename?: 'DestroyResult';
  /** The destructions created for this request. */
  destructions: Array<Destruction>;
};

/** A record that some piece of labware was destroyed for some particular reason. */
export type Destruction = {
  __typename?: 'Destruction';
  /** The time the destruction was carried out (or at least when it was recorded). */
  destroyed: Maybe<Scalars['Timestamp']['output']>;
  /** The labware destroyed. */
  labware: Maybe<Labware>;
  /** The reason for the destruction. */
  reason: Maybe<DestructionReason>;
  /** The user responsible for the destruction. */
  user: Maybe<User>;
};

/** A preset reason that labware may be destroyed. */
export type DestructionReason = {
  __typename?: 'DestructionReason';
  enabled: Scalars['Boolean']['output'];
  /** The unique id of this destruction reason. */
  id: Scalars['Int']['output'];
  /** The text of this reason: What reason is it? */
  text: Scalars['String']['output'];
};

/** A DNAP study. */
export type DnapStudy = {
  __typename?: 'DnapStudy';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  ssId: Scalars['Int']['output'];
};

/** A particular individual from which one or more instances of tissue may be taken. */
export type Donor = {
  __typename?: 'Donor';
  donorName: Scalars['String']['output'];
  /** The stage of life of this donor at the point the tissue was collected. */
  lifeStage: Maybe<LifeStage>;
  species: Species;
};

/** A piece of equipment that may be associated with certain operations. */
export type Equipment = {
  __typename?: 'Equipment';
  /** The category of equipment: What kind of thing is it or what is it used for? */
  category: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  /** The unique id of this equipment. */
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

/** Whether an operation was automated or manual. */
export enum ExecutionType {
  Automated = 'automated',
  Manual = 'manual'
}

/** A request to record an extract operation. */
export type ExtractRequest = {
  /** The barcodes of the source labware. */
  barcodes: Array<Scalars['String']['input']>;
  /** The id of the equipment being used in the extraction. If manual equipmentId is undefined */
  equipmentId?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the labware type for the new destination labware. */
  labwareType: Scalars['String']['input'];
  /** An optional work number to associate with these operations. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A piece of labware and an extract result, if any exists. */
export type ExtractResult = {
  __typename?: 'ExtractResult';
  /** The concentration recorded, if any. */
  concentration: Maybe<Scalars['String']['output']>;
  /** The labware the result refers to. */
  labware: LabwareFlagged;
  /** The result, if any. */
  result: Maybe<PassFail>;
};

/** Specification of extract results in a piece of labware. */
export type ExtractResultLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The id of a comment, if any, linked to the result. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The concentration measurement, if any. */
  concentration?: InputMaybe<Scalars['String']['input']>;
  /** The result. */
  result: PassFail;
};

/** A request to record extract results. */
export type ExtractResultRequest = {
  /** The details of the results in each item of labware. */
  labware: Array<ExtractResultLabware>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Information that a particular sample was found in a particular labware. */
export type FindEntry = {
  __typename?: 'FindEntry';
  /** The id of the labware where the sample was found. */
  labwareId: Scalars['Int']['output'];
  /** The id of the sample found. */
  sampleId: Scalars['Int']['output'];
  /** The list of work numbers associated with the entry. */
  workNumbers: Array<Maybe<Scalars['String']['output']>>;
};

/** A request to find some stored labware. Some, any or all fields may be filled. Each one refines the search results. */
export type FindRequest = {
  /** The maximum creation date for the labware. */
  createdMax?: InputMaybe<Scalars['Date']['input']>;
  /** The minimum creation date for the labware. */
  createdMin?: InputMaybe<Scalars['Date']['input']>;
  /** The names of donors to find stored samples of. */
  donorNames?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The barcode of a specific piece of labware to find. */
  labwareBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The name of a labware type to find labware of. */
  labwareTypeName?: InputMaybe<Scalars['String']['input']>;
  /** The maximum number of records to return. Use a negative value to indicate no limit. */
  maxRecords?: InputMaybe<Scalars['Int']['input']>;
  /** The species of the samples. */
  species?: InputMaybe<Scalars['String']['input']>;
  /** The names of tissues to find stored samples of. Maybe include * wildcards. */
  tissueExternalNames?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of a tissue type to find stored samples of. */
  tissueTypeName?: InputMaybe<Scalars['String']['input']>;
  /** The work number associated with the labware. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** The result of a find request: labware, its locations, and its contents. */
export type FindResult = {
  __typename?: 'FindResult';
  /** Links between samples and labware. */
  entries: Array<FindEntry>;
  /** Information about each labware found. */
  labware: Array<Labware>;
  /** Links between labware and locations. */
  labwareLocations: Array<LabwareLocationEntry>;
  /** Information about each location labware was found in. */
  locations: Array<Location>;
  /** The number of records found, which may be greater than the number of records returned. */
  numRecords: Scalars['Int']['output'];
  /** Information about each sample found. */
  samples: Array<Sample>;
};

/** A chemical used to fix a sample. */
export type Fixative = {
  __typename?: 'Fixative';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** A flag priority and a list of flagged barcodes. */
export type FlagBarcodes = {
  __typename?: 'FlagBarcodes';
  /** The barcodes linked with the flags. */
  barcodes: Array<Scalars['String']['output']>;
  /** The priority of flag linked to the barcodes. */
  priority: FlagPriority;
};

/** Information about flags related to some labware. */
export type FlagDetail = {
  __typename?: 'FlagDetail';
  /** The barcode of the labware whose flags have been looked up. */
  barcode: Scalars['String']['output'];
  /** Summaries of the flags applicable to the specified labware. */
  flags: Array<FlagSummary>;
};

/** Raise a flag on a piece of labware. */
export type FlagLabwareRequest = {
  /** The barcodes of the flagged labware. */
  barcodes: Array<Scalars['String']['input']>;
  /** The description of the flag. */
  description: Scalars['String']['input'];
  /** Priority of the flag. */
  priority: FlagPriority;
  /** Work number to link to the flag. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Priority of labware flags. */
export enum FlagPriority {
  Flag = 'flag',
  Note = 'note'
}

/** Summary of a particular labware flag. */
export type FlagSummary = {
  __typename?: 'FlagSummary';
  /** The labware barcode that was flagged. */
  barcode: Scalars['String']['output'];
  /** The description of the flag. */
  description: Scalars['String']['output'];
  /** The priority of the flag. */
  priority: FlagPriority;
};

/** The SVG of a graph. */
export type GraphSvg = {
  __typename?: 'GraphSVG';
  /** The svg data of the graph. */
  svg: Scalars['String']['output'];
};

/** A traversal order for a grid. */
export enum GridDirection {
  /** Down the leftmost column, then right to the next column, etc. */
  DownRight = 'DownRight',
  /** Right across the top row, then down to the next row, etc. */
  RightDown = 'RightDown',
  /** Right across the bottom row, then up to the next row, etc. */
  RightUp = 'RightUp',
  /** Up the leftmost column, then right to the next column, etc. */
  UpRight = 'UpRight'
}

/** History as returned for a history query. */
export type History = {
  __typename?: 'History';
  /** The entries found for the history. */
  entries: Array<HistoryEntry>;
  /** The included labware barcodes that are flagged. */
  flagBarcodes: Array<FlagBarcodes>;
  /** The labware referenced by the entries. */
  labware: Array<Labware>;
  /** The samples referenced by the entries. */
  samples: Array<Sample>;
};

/** An entry in the history: the IDs refer to objects that should also be included in the History. */
export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  /** The address of the destination slot involved in the event. */
  address: Maybe<Scalars['String']['output']>;
  /** The id of the destination labware of this event. */
  destinationLabwareId: Scalars['Int']['output'];
  /** Extra details (such as measurements and comments) included in this entry. */
  details: Array<Scalars['String']['output']>;
  /** The id of the operation or other event to which this entry refers. */
  eventId: Scalars['Int']['output'];
  /** The region of the destination slot involved in the event. */
  region: Maybe<Scalars['String']['output']>;
  /** The id of the sample involved in this event. */
  sampleId: Maybe<Scalars['Int']['output']>;
  /** The id of the source labware of this event. */
  sourceLabwareId: Scalars['Int']['output'];
  /** The time the event took place (or was recorded). */
  time: Scalars['Timestamp']['output'];
  /** The operation type of type of event to which this entry refers. */
  type: Scalars['String']['output'];
  /** The username of the user responsible for this event. */
  username: Scalars['String']['output'];
  /** The work number (if any) associated with this event. */
  workNumber: Maybe<Scalars['String']['output']>;
};

/** A permission number that can be linked to tissue. */
export type Hmdmc = {
  __typename?: 'Hmdmc';
  enabled: Scalars['Boolean']['output'];
  /** The HMDMC code for this permission. */
  hmdmc: Scalars['String']['output'];
};

/** A request to record an operation in place. */
export type InPlaceOpRequest = {
  /** The barcodes of the labware. */
  barcodes: Array<Scalars['String']['input']>;
  /** The id of the equipment (if any) being used in this operation. */
  equipmentId?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the type of operation being recorded. */
  operationType: Scalars['String']['input'];
  /** Optional work numbers to associate with this operation. */
  workNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A type of label that can be printed, typically including a barcode and some other information. */
export type LabelType = {
  __typename?: 'LabelType';
  name: Scalars['String']['output'];
};

export type Labware = {
  __typename?: 'Labware';
  /** The unique barcode of this labware. */
  barcode: Scalars['String']['output'];
  /** The time when this labware was created in the application. */
  created: Scalars['Timestamp']['output'];
  /** Has this labware been destroyed? */
  destroyed: Scalars['Boolean']['output'];
  /** Has this labware been discarded? */
  discarded: Scalars['Boolean']['output'];
  /** The external barcode of this labware, as input by the user. */
  externalBarcode: Maybe<Scalars['String']['output']>;
  /** Is this labware frozen? */
  frozen: Scalars['Boolean']['output'];
  /** The unique id of this labware. */
  id: Scalars['Int']['output'];
  /** The type of labware. */
  labwareType: LabwareType;
  /** The number of columns of slots. */
  numColumns: Scalars['Int']['output'];
  /** The number of rows of slots. */
  numRows: Scalars['Int']['output'];
  /** Has this labware been released? */
  released: Scalars['Boolean']['output'];
  /** The slots in this labware. */
  slots: Array<Slot>;
  /** The state, derived from the contents and other fields on the labware. */
  state: LabwareState;
  /** Has this labware been marked as used? */
  used: Scalars['Boolean']['output'];
};

/** Labware with an additional field specifying whether it is flagged. */
export type LabwareFlagged = {
  __typename?: 'LabwareFlagged';
  /** The unique barcode of this labware. */
  barcode: Scalars['String']['output'];
  /** The time when this labware was created in the application. */
  created: Scalars['Timestamp']['output'];
  /** Has this labware been destroyed? */
  destroyed: Scalars['Boolean']['output'];
  /** Has this labware been discarded? */
  discarded: Scalars['Boolean']['output'];
  /** The external barcode of this labware, as input by the user. */
  externalBarcode: Maybe<Scalars['String']['output']>;
  /** The highest priority of flag on this labware, if any. */
  flagPriority: Maybe<FlagPriority>;
  /** Is there a labware flag applicable to this labware? */
  flagged: Scalars['Boolean']['output'];
  /** Is this labware frozen? */
  frozen: Scalars['Boolean']['output'];
  /** The unique id of this labware. */
  id: Scalars['Int']['output'];
  /** The type of labware. */
  labwareType: LabwareType;
  /** The number of columns of slots. */
  numColumns: Scalars['Int']['output'];
  /** The number of rows of slots. */
  numRows: Scalars['Int']['output'];
  /** Has this labware been released? */
  released: Scalars['Boolean']['output'];
  /** The slots in this labware. */
  slots: Array<Slot>;
  /** The state, derived from the contents and other fields on the labware. */
  state: LabwareState;
  /** Has this labware been marked as used? */
  used: Scalars['Boolean']['output'];
};

/** Information that a particular labware was found in a particular location. */
export type LabwareLocationEntry = {
  __typename?: 'LabwareLocationEntry';
  /** The row/column address (if any) of the labware inside the location. */
  address: Maybe<Scalars['Address']['output']>;
  /** The id of the labware found. */
  labwareId: Scalars['Int']['output'];
  /** The id of the location where the labware was found. */
  locationId: Scalars['Int']['output'];
};

/** Specification of results being recorded in an item of labware. */
export type LabwareResult = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** An optional costing for the labware. */
  costing?: InputMaybe<SlideCosting>;
  /** A reagent lot number to associate with the labware. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
  /** The individual results. */
  sampleResults?: InputMaybe<Array<SampleResult>>;
  /** Measurements to record in this labware. */
  slotMeasurements?: InputMaybe<Array<SlotMeasurementRequest>>;
};

/** The regions of interest recorded in a particular labware. */
export type LabwareRoi = {
  __typename?: 'LabwareRoi';
  /** The barcode of the labware. */
  barcode: Scalars['String']['output'];
  /** The regions of interest recorded in the labware, if any. */
  rois: Array<Roi>;
};

/** The comments against samples in a particular piece of labware. */
export type LabwareSampleComments = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The comments to record against particular samples in this labware. */
  comments: Array<SampleAddressComment>;
  /** The (optional) completion time of the process for this labware. */
  completion?: InputMaybe<Scalars['Timestamp']['input']>;
};

/** A labware barcode and name of a solution. */
export type LabwareSolutionName = {
  __typename?: 'LabwareSolutionName';
  /** The barcode of an item of labware. */
  barcode: Scalars['String']['output'];
  /** The name of a solution. */
  solutionName: Scalars['String']['output'];
};

/** The state of an item of labware. */
export enum LabwareState {
  /** The labware contains samples and can be used as a source in operations. */
  Active = 'active',
  /** The labware has been destroyed for a specific reason. */
  Destroyed = 'destroyed',
  /** The labware has been used and discarded. */
  Discarded = 'discarded',
  /** The labware contains no samples. */
  Empty = 'empty',
  /** The labware is frozen. */
  Frozen = 'frozen',
  /** The labware has been given out to another team or organisation. */
  Released = 'released',
  /** The labware has been used but may still be stored. */
  Used = 'used'
}

/** A type of labware, such as slides and tubes. */
export type LabwareType = {
  __typename?: 'LabwareType';
  /** The type of label that should be used for this labware type. */
  labelType: Maybe<LabelType>;
  name: Scalars['String']['output'];
  /** The number of columns in an item of this labware type. */
  numColumns: Scalars['Int']['output'];
  /** The number of rows in an item of this labware type. */
  numRows: Scalars['Int']['output'];
};

/** Specification of comments in slots of a piece of labware. */
export type LabwareWithSlotCommentsRequest = {
  /** The comments in slots of this labware. */
  addressComments: Array<AddressCommentInput>;
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
};

/** A request to record dual index and amplification ops. */
export type LibraryConRequest = {
  /** The barcode of the labware. */
  labwareBarcode: Scalars['String']['input'];
  /** The type of reagent plate involved. */
  reagentPlateType?: InputMaybe<Scalars['String']['input']>;
  /** The transfers from aliquot slots to destination slots. */
  reagentTransfers: Array<ReagentTransfer>;
  /** The measurement to record on slots in the destination. */
  slotMeasurements: Array<SlotMeasurementRequest>;
  /** The work number to associate with these operations. */
  workNumber: Scalars['String']['input'];
};

/** A request to record transfer, dual index and amplification ops. */
export type LibraryPrepRequest = {
  /** The one destination labware for this request, and the description of what is transferred into it. */
  destination: SlotCopyDestination;
  /** The type of reagent plate involved. */
  reagentPlateType?: InputMaybe<Scalars['String']['input']>;
  /** The transfers from aliquot slots to destination slots. */
  reagentTransfers: Array<ReagentTransfer>;
  /** The measurement to record on slots in the destination. */
  slotMeasurements: Array<SlotMeasurementRequest>;
  /** The source labware and new labware states for this request. */
  sources: Array<SlotCopySource>;
  /** The work number to associate with these operations. */
  workNumber: Scalars['String']['input'];
};

/** A stage of life that an individual has reached when tissue is collected. */
export enum LifeStage {
  Adult = 'adult',
  Fetal = 'fetal',
  Paediatric = 'paediatric'
}

/** Information about a storage location, without links to other locations and items. */
export type LinkedLocation = {
  __typename?: 'LinkedLocation';
  /** The row/column address (if any) of this location in its parent location. */
  address: Maybe<Scalars['Address']['output']>;
  /** The barcode of this location. */
  barcode: Scalars['String']['output'];
  /** The custom name (if any) of this location, that may be changed through this API. */
  customName: Maybe<Scalars['String']['output']>;
  /** The fixed name of this location, not changeable through this API. */
  fixedName: Maybe<Scalars['String']['output']>;
  /** Is this location a leaf (i.e. does not contain other locations)? */
  leaf: Scalars['Boolean']['output'];
  /** The number of items directly stored in this location. */
  numStored: Scalars['Int']['output'];
};

/** A location where items may be stored. */
export type Location = {
  __typename?: 'Location';
  /** The row/column address (if any) of this location in its parent location. */
  address: Maybe<Scalars['Address']['output']>;
  /** The unique barcode of this location. */
  barcode: Scalars['String']['output'];
  /** The other locations inside this location. */
  children: Array<LinkedLocation>;
  /** The custom name (if any) of this location, that may be changed through this API. */
  customName: Maybe<Scalars['String']['output']>;
  /** The suggested order (if any) of addresses in this location where items should be stored. */
  direction: Maybe<GridDirection>;
  /** The fixed name (if any) of this location, not changeable through this API. */
  fixedName: Maybe<Scalars['String']['output']>;
  /** The unique id of this location. */
  id: Scalars['Int']['output'];
  /** Is this location a leaf (i.e. does not contain other locations)? */
  leaf: Scalars['Boolean']['output'];
  /** The number of items directly stored in this location. */
  numStored: Scalars['Int']['output'];
  /** Some information about the location (if any) containing this location. */
  parent: Maybe<LinkedLocation>;
  /** A combination of this location's name and its parents' names and barcodes. */
  qualifiedNameWithFirstBarcode: Maybe<Scalars['String']['output']>;
  /** The size of the grid (if any) where items may be stored in this location. */
  size: Maybe<Size>;
  /** The items stored in this location. */
  stored: Array<StoredItem>;
};

/** The result of an attempt to log in. */
export type LoginResult = {
  __typename?: 'LoginResult';
  /** The message describing the result of the login, if any. */
  message: Maybe<Scalars['String']['output']>;
  /** The authenticated user, if any. */
  user: Maybe<User>;
};

/** A chemical a sample is put in. */
export type Medium = {
  __typename?: 'Medium';
  name: Scalars['String']['output'];
};

/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type Mutation = {
  __typename?: 'Mutation';
  /** Create a new Bio Risk. */
  addBioRisk: BioRisk;
  /** Add a new cellular classification. */
  addCellClass: CellClass;
  /** Create a new comment that users can select to link to future operations. */
  addComment: Comment;
  /** Create a new cost code that can be associated with work. */
  addCostCode: CostCode;
  /** Create a new reason that users can record when destroying labware. */
  addDestructionReason: DestructionReason;
  /** Create a new piece of equipment that users can record using in future operations. */
  addEquipment: Equipment;
  /** Record an operation adding a external ID to a sample. */
  addExternalID: OperationResult;
  /** Record an op adding external names to tissues in a particular piece of labware. */
  addExternalIds: OperationResult;
  /** Create a new fixative that can be selected when registering tissue. */
  addFixative: Fixative;
  /** Create a new HMDMC that can be used when registering new tissue. */
  addHmdmc: Hmdmc;
  /** Add a new omero project. */
  addOmeroProject: OmeroProject;
  /** Add a new probe panel. */
  addProbePanel: ProbePanel;
  /** Create a new program that can be associated with work. */
  addProgram: Program;
  /** Create a new project that can be associated with work. */
  addProject: Project;
  /** Add a new protein panel. */
  addProteinPanel: ProteinPanel;
  /** Create a new release destination that can be associated with labware releases. */
  addReleaseDestination: ReleaseDestination;
  /** Create a new release recipient that can be associated with labware releases. */
  addReleaseRecipient: ReleaseRecipient;
  /** Add a new slot region. */
  addSlotRegion: SlotRegion;
  /** Add a new solution. */
  addSolution: Solution;
  /** Add spatial location to an existing tissue type. */
  addSpatialLocations: TissueType;
  /** Create a new species that can be associated with donors in tissue registration. */
  addSpecies: Species;
  /** Add a new tissue type. */
  addTissueType: TissueType;
  /** Add a new treatment type. */
  addTreatmentType: TreatmentType;
  /** Create a new user for the application. */
  addUser: User;
  /** Create a new work type. */
  addWorkType: WorkType;
  /** Transfer samples from one labware into multiple labware. */
  aliquot: OperationResult;
  /** Clean out a slot of a labware. */
  cleanOut: OperationResult;
  /** Confirm operations previously planned. */
  confirmOperation: ConfirmOperationResult;
  /** Confirm sections previously planned. */
  confirmSection: OperationResult;
  /** Create a new work, which will be allocated a new work number with the given prefix. */
  createWork: Work;
  /** Destroy some labware. */
  destroy: DestroyResult;
  /** Empty a specified location of its stored items. */
  empty: UnstoreResult;
  /** Record extract operations. */
  extract: OperationResult;
  /** Flag labware. */
  flagLabware: OperationResult;
  /** Perform library con request. */
  libraryCon: OperationResult;
  /** Perform library prep request. */
  libraryPrep: OperationResult;
  /** Log in with the given credentials. */
  login: LoginResult;
  /** Log out; end the current login session. */
  logout: Maybe<Scalars['String']['output']>;
  /** Perform paraffin processing. */
  performParaffinProcessing: OperationResult;
  /** Process an original sample into pots. */
  performPotProcessing: OperationResult;
  /** Add solutions to labware. */
  performSolutionTransfer: OperationResult;
  /** Process tissue into blocks. */
  performTissueBlock: OperationResult;
  /** Record planned operations. */
  plan: PlanResult;
  /** Print the specified labware barcodes on the specified printer. */
  printLabware: Maybe<Scalars['String']['output']>;
  /** Reactivate labware. */
  reactivateLabware: OperationResult;
  /** Record an operation transferring reagents from a reagent plate to an item of Stan labware. */
  reagentTransfer: OperationResult;
  /** Record analyser operation. */
  recordAnalyser: OperationResult;
  /** Record a process being completed. */
  recordCompletion: OperationResult;
  /** Record a stain operation with plex and bond information. */
  recordComplexStain: OperationResult;
  /** Record the result of an extract. */
  recordExtractResult: OperationResult;
  /** Record an operation in place. */
  recordInPlace: OperationResult;
  /** Record an operation in-place with comments on slots. */
  recordOpWithSlotComments: OperationResult;
  /** Record an operation with measurements in slots. */
  recordOpWithSlotMeasurements: OperationResult;
  /** Record Orientation QC. */
  recordOrientationQC: OperationResult;
  /** Record permeabilisation. */
  recordPerm: OperationResult;
  /** Record an operation involving probe panels. */
  recordProbeOperation: OperationResult;
  /** Record QC labware request. */
  recordQCLabware: OperationResult;
  /** Record RNA Analysis. */
  recordRNAAnalysis: OperationResult;
  /** Record metrics. */
  recordSampleMetrics: OperationResult;
  /** Record ops to add sample processing comments. */
  recordSampleProcessingComments: OperationResult;
  /** Record the result of a stain. */
  recordStainResult: OperationResult;
  /** Record Visium QC. */
  recordVisiumQC: OperationResult;
  /** Log in with your Sanger id and create an end user account. */
  registerAsEndUser: LoginResult;
  /** Register blocks of tissue. */
  registerBlocks: RegisterResult;
  /** Register original samples. */
  registerOriginalSamples: RegisterResult;
  /** Register sections of tissue. */
  registerSections: RegisterResult;
  /** Release some labware. */
  release: ReleaseResult;
  /** Rename existing equipment. */
  renameEquipment: Equipment;
  /** Save slot copy information for a future operation. */
  saveSlotCopy: SlotCopyLoad;
  /** Record segmentation. */
  segmentation: OperationResult;
  /** Enable or disable a Bio Risk. */
  setBioRiskEnabled: BioRisk;
  /** Enable or disable a cellular classification. */
  setCellClassEnabled: CellClass;
  /** Enable or disable a preset comment. */
  setCommentEnabled: Comment;
  /** Enable or disable a cost code. */
  setCostCodeEnabled: CostCode;
  /** Enable or disable a destruction reason. */
  setDestructionReasonEnabled: DestructionReason;
  /** Enable or disable a piece of equipment. */
  setEquipmentEnabled: Equipment;
  /** Enable or disable a fixative. */
  setFixativeEnabled: Fixative;
  /** Enable or disable an HMDMC. */
  setHmdmcEnabled: Hmdmc;
  /** Set the custom name of a specified location. */
  setLocationCustomName: Location;
  /** Enable or disable an omero project. */
  setOmeroProjectEnabled: OmeroProject;
  /** Link a work number to prior operations. */
  setOperationWork: Array<Operation>;
  /** Enable or disable a probe panel. */
  setProbePanelEnabled: ProbePanel;
  /** Enable or disable a program. */
  setProgramEnabled: Program;
  /** Enable or disable a project. */
  setProjectEnabled: Project;
  /** Enable or disable a protein panel. */
  setProteinPanelEnabled: ProteinPanel;
  /** Enable or disable a release destination. */
  setReleaseDestinationEnabled: ReleaseDestination;
  /** Enable or disable a release recipient. */
  setReleaseRecipientEnabled: ReleaseRecipient;
  /** Enable or disable a slot region. */
  setSlotRegionEnabled: SlotRegion;
  /** Enable or disable a solution. */
  setSolutionEnabled: Solution;
  /** Enable or disable a species. */
  setSpeciesEnabled: Species;
  /** Enable or disable a treatment type. */
  setTreatmentTypeEnabled: TreatmentType;
  /** Set the user role (privileges) for a user. */
  setUserRole: User;
  /** Enable or disable a work type. */
  setWorkTypeEnabled: WorkType;
  /** Record an operation copying slots from multiple source labware into various slots of one destination labware. */
  slotCopy: OperationResult;
  /** Record a new stain with time measurements. */
  stain: OperationResult;
  /** Store multiple items in a particular location, with optional addresses. */
  store: Location;
  /** Store an item in a particular location, optionally with an address. */
  storeBarcode: StoredItem;
  /** Transfer labware from one storage location to another. */
  transfer: Location;
  /** Unrelease some previously released labware. */
  unrelease: OperationResult;
  /** Remove a specified item from storage. */
  unstoreBarcode: Maybe<UnstoredItem>;
  /** Remove specified items from storage. */
  unstoreBarcodes: Scalars['Int']['output'];
  /** Updates the cytassist overview table. Useful for testing. */
  updateCytassistOverview: Scalars['Boolean']['output'];
  /** Updates Stan's internal list of Dnap Studies, and returns the enabled ones. */
  updateDnapStudies: Array<DnapStudy>;
  /** Update a release recipient fullName. */
  updateReleaseRecipientFullName: ReleaseRecipient;
  /** Update the Atera study of a work. */
  updateWorkAteraStudy: Work;
  /** Update the DNAP study of a work. */
  updateWorkDnapStudy: Work;
  /** Update the number of blocks field in a work. */
  updateWorkNumBlocks: Work;
  /** Update the number of original samples field in a work. */
  updateWorkNumOriginalSamples: Work;
  /** Update the number of slides field in a work. */
  updateWorkNumSlides: Work;
  /** Update the omero project of a work. */
  updateWorkOmeroProject: Work;
  /** Update the priority of a work. */
  updateWorkPriority: Work;
  /** Update the status of an existing work. */
  updateWorkStatus: WorkWithComment;
  /** Updates the treatment types of a work. */
  updateWorkTreatmentTypes: Work;
  /** Update the work types of a work. */
  updateWorkWorkTypes: Work;
  /** Update the Xenium study of a work. */
  updateWorkXeniumStudy: Work;
  /** Record Visium Analysis. */
  visiumAnalysis: OperationResult;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddBioRiskArgs = {
  code: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddCellClassArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddCommentArgs = {
  category: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddCostCodeArgs = {
  code: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddDestructionReasonArgs = {
  text: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddEquipmentArgs = {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddExternalIdArgs = {
  request: AddExternalIdRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddExternalIdsArgs = {
  request: AddExternalIdsRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddFixativeArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddHmdmcArgs = {
  hmdmc: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddOmeroProjectArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProbePanelArgs = {
  name: Scalars['String']['input'];
  type: ProbeType;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProgramArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProjectArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProteinPanelArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddReleaseDestinationArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddReleaseRecipientArgs = {
  fullName: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSlotRegionArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSolutionArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSpatialLocationsArgs = {
  request: AddSpatialLocationsRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSpeciesArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddTissueTypeArgs = {
  request: AddTissueTypeRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddTreatmentTypeArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddUserArgs = {
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddWorkTypeArgs = {
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAliquotArgs = {
  request: AliquotRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationCleanOutArgs = {
  request: CleanOutRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationConfirmOperationArgs = {
  request: ConfirmOperationRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationConfirmSectionArgs = {
  request: ConfirmSectionRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationCreateWorkArgs = {
  ateraStudyId: InputMaybe<Scalars['Int']['input']>;
  costCode: Scalars['String']['input'];
  facultyLead: Scalars['String']['input'];
  numBlocks: InputMaybe<Scalars['Int']['input']>;
  numOriginalSamples: InputMaybe<Scalars['Int']['input']>;
  numSlides: InputMaybe<Scalars['Int']['input']>;
  omeroProject: InputMaybe<Scalars['String']['input']>;
  prefix: Scalars['String']['input'];
  program: Scalars['String']['input'];
  project: Scalars['String']['input'];
  ssStudyId: InputMaybe<Scalars['Int']['input']>;
  treatmentTypes: InputMaybe<Array<Scalars['String']['input']>>;
  workRequester: Scalars['String']['input'];
  workTypes: Array<Scalars['String']['input']>;
  xeniumStudyId: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationDestroyArgs = {
  request: DestroyRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationEmptyArgs = {
  locationBarcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationExtractArgs = {
  request: ExtractRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationFlagLabwareArgs = {
  request: FlagLabwareRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationLibraryConArgs = {
  requests: Array<LibraryConRequest>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationLibraryPrepArgs = {
  request: LibraryPrepRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationPerformParaffinProcessingArgs = {
  request: ParaffinProcessingRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationPerformPotProcessingArgs = {
  request: PotProcessingRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationPerformSolutionTransferArgs = {
  request: SolutionTransferRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationPerformTissueBlockArgs = {
  request: TissueBlockRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationPlanArgs = {
  request: PlanRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationPrintLabwareArgs = {
  barcodes: Array<Scalars['String']['input']>;
  printer: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationReactivateLabwareArgs = {
  items: Array<ReactivateLabware>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationReagentTransferArgs = {
  request: ReagentTransferRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordAnalyserArgs = {
  request: AnalyserRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordCompletionArgs = {
  request: CompletionRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordComplexStainArgs = {
  request: ComplexStainRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordExtractResultArgs = {
  request: ExtractResultRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordInPlaceArgs = {
  request: InPlaceOpRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordOpWithSlotCommentsArgs = {
  request: OpWithSlotCommentsRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordOpWithSlotMeasurementsArgs = {
  request: OpWithSlotMeasurementsRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordOrientationQcArgs = {
  request: OrientationRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordPermArgs = {
  request: RecordPermRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordProbeOperationArgs = {
  request: ProbeOperationRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordQcLabwareArgs = {
  request: QcLabwareRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordRnaAnalysisArgs = {
  request: RnaAnalysisRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordSampleMetricsArgs = {
  request: SampleMetricsRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordSampleProcessingCommentsArgs = {
  request: SampleProcessingCommentRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordStainResultArgs = {
  request: ResultRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRecordVisiumQcArgs = {
  request: ResultRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterAsEndUserArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterBlocksArgs = {
  request: BlockRegisterRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterOriginalSamplesArgs = {
  request: OriginalSampleRegisterRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterSectionsArgs = {
  request: InputMaybe<SectionRegisterRequest>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationReleaseArgs = {
  request: ReleaseRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRenameEquipmentArgs = {
  equipmentId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSaveSlotCopyArgs = {
  request: SlotCopySave;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSegmentationArgs = {
  request: SegmentationRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetBioRiskEnabledArgs = {
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetCellClassEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetCommentEnabledArgs = {
  commentId: Scalars['Int']['input'];
  enabled: Scalars['Boolean']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetCostCodeEnabledArgs = {
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetDestructionReasonEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  text: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetEquipmentEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  equipmentId: Scalars['Int']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetFixativeEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetHmdmcEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  hmdmc: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetLocationCustomNameArgs = {
  customName: InputMaybe<Scalars['String']['input']>;
  locationBarcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetOmeroProjectEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetOperationWorkArgs = {
  request: OpWorkRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProbePanelEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  type: ProbeType;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProgramEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProjectEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProteinPanelEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetReleaseDestinationEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetReleaseRecipientEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetSlotRegionEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetSolutionEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetSpeciesEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetTreatmentTypeEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetUserRoleArgs = {
  role: UserRole;
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetWorkTypeEnabledArgs = {
  enabled: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSlotCopyArgs = {
  request: SlotCopyRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStainArgs = {
  request: StainRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStoreArgs = {
  locationBarcode: Scalars['String']['input'];
  store: Array<StoreInput>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStoreBarcodeArgs = {
  address: InputMaybe<Scalars['Address']['input']>;
  barcode: Scalars['String']['input'];
  locationBarcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationTransferArgs = {
  destinationBarcode: Scalars['String']['input'];
  sourceBarcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUnreleaseArgs = {
  request: UnreleaseRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUnstoreBarcodeArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUnstoreBarcodesArgs = {
  barcodes: Array<Scalars['String']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateReleaseRecipientFullNameArgs = {
  fullName: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkAteraStudyArgs = {
  ssStudyId: InputMaybe<Scalars['Int']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkDnapStudyArgs = {
  ssStudyId: InputMaybe<Scalars['Int']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumBlocksArgs = {
  numBlocks: InputMaybe<Scalars['Int']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumOriginalSamplesArgs = {
  numOriginalSamples: InputMaybe<Scalars['Int']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumSlidesArgs = {
  numSlides: InputMaybe<Scalars['Int']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkOmeroProjectArgs = {
  omeroProject: InputMaybe<Scalars['String']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkPriorityArgs = {
  priority: InputMaybe<Scalars['String']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkStatusArgs = {
  commentId: InputMaybe<Scalars['Int']['input']>;
  status: WorkStatus;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkTreatmentTypesArgs = {
  treatmentTypes: Array<Scalars['String']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkWorkTypesArgs = {
  workNumber: Scalars['String']['input'];
  workTypes: Array<Scalars['String']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkXeniumStudyArgs = {
  ssStudyId: InputMaybe<Scalars['Int']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationVisiumAnalysisArgs = {
  request: VisiumAnalysisRequest;
};

/** The data about original tissues and their next replicate numbers. */
export type NextReplicateData = {
  __typename?: 'NextReplicateData';
  /** The source barcodes for the new replicates. */
  barcodes: Array<Scalars['String']['output']>;
  /** The id of the donor. */
  donorId: Scalars['Int']['output'];
  /** The next replicate number for this group. */
  nextReplicateNumber: Scalars['Int']['output'];
  /** The id of the spatial location. */
  spatialLocationId: Scalars['Int']['output'];
};

/** A project in Omero. */
export type OmeroProject = {
  __typename?: 'OmeroProject';
  /** Whether the Omero project is available for use in Stan. */
  enabled: Scalars['Boolean']['output'];
  /** The name of the Omero project. */
  name: Scalars['String']['output'];
};

/** An operation and the pass/fails in the slots of its labware. */
export type OpPassFail = {
  __typename?: 'OpPassFail';
  /** An operation with one destination labware. */
  operation: Operation;
  /** The pass fails in each address of the destination labware. */
  slotPassFails: Array<SlotPassFail>;
};

/** Request to record an operation on multiple labware in-place with comments on some slots. */
export type OpWithSlotCommentsRequest = {
  /** The details of the labware. */
  labware: Array<LabwareWithSlotCommentsRequest>;
  /** The name of the operation type to record. */
  operationType: Scalars['String']['input'];
  /** The work number. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record an operation in place with measurements in slots. */
export type OpWithSlotMeasurementsRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The name of the type of operation to record. */
  operationType: Scalars['String']['input'];
  /** The measurements to record in individual slots. */
  slotMeasurements: Array<SlotMeasurementRequest>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request to alter the work linked to existing operations. */
export type OpWorkRequest = {
  /** The IDs of the operations to update. */
  opIds: Array<Scalars['Int']['input']>;
  /** The work number to link. */
  workNumber: Scalars['String']['input'];
};

/** A record of a particular operation being done involving labware and samples. */
export type Operation = {
  __typename?: 'Operation';
  /** The specific samples and slots and how they were used in this operation. */
  actions: Array<Action>;
  /** The unique id of the operation. */
  id: Scalars['Int']['output'];
  /** The type of operation. */
  operationType: OperationType;
  /** The time at which this operation is regarded to have been performed (typically the time it was recorded). */
  performed: Scalars['Timestamp']['output'];
  /** The user responsible for this operation. */
  user: User;
};

/** The result of a request to record operations. */
export type OperationResult = {
  __typename?: 'OperationResult';
  /** The destination labware for the operations. */
  labware: Array<Labware>;
  /** The new operations recorded. */
  operations: Array<Operation>;
};

/** A type of operation that may be recorded. */
export type OperationType = {
  __typename?: 'OperationType';
  name: Scalars['String']['output'];
};

/** Record the orientation state of labware. */
export type OrientationRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Is the orientation correct? */
  correct: Scalars['Boolean']['input'];
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
};

/** Data about registering a new original sample. */
export type OriginalSampleData = {
  /** The biological risk number for this sample. */
  bioRiskCode: Scalars['String']['input'];
  /** The cellular classification of the sample. */
  cellClass: Scalars['String']['input'];
  /** The string to use as the donor name. */
  donorIdentifier: Scalars['String']['input'];
  /** The external identifier used to identify the tissue. */
  externalIdentifier?: InputMaybe<Scalars['String']['input']>;
  /** The fixative used for the tissue. */
  fixative: Scalars['String']['input'];
  /** The HMDMC to use for the tissue. */
  hmdmc?: InputMaybe<Scalars['String']['input']>;
  /** The name of the type of labware containing the sample. */
  labwareType: Scalars['String']['input'];
  /** The life stage of the donor. */
  lifeStage?: InputMaybe<LifeStage>;
  /** The pot number used to distinguish pots in a request. */
  potNumber?: InputMaybe<Scalars['Int']['input']>;
  /** The string to use for the replicate number of the tissue (optional). */
  replicateNumber?: InputMaybe<Scalars['String']['input']>;
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: InputMaybe<Scalars['Date']['input']>;
  /** The solution used for the tissue. */
  solution: Scalars['String']['input'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int']['input'];
  /** The species of the donor. */
  species: Scalars['String']['input'];
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: Scalars['String']['input'];
  /** The optional work number to link to the registration. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
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
  lot: Scalars['String']['input'];
  /** Name of the panel. */
  name: Scalars['String']['input'];
};

/** A request to record paraffin processing. */
export type ParaffinProcessingRequest = {
  /** The labware barcodes. */
  barcodes: Array<Scalars['String']['input']>;
  /** The comment ID. */
  commentId: Scalars['Int']['input'];
  /** The work number. */
  workNumber: Scalars['String']['input'];
};

/** A pass or fail result. */
export enum PassFail {
  Fail = 'fail',
  Pass = 'pass'
}

/** The permeabilisation data for a particular slot address. */
export type PermData = {
  /** The address of a slot in its labware. */
  address: Scalars['Address']['input'];
  /** The barcode of the labware being put into this slot as a control, if there is one. */
  controlBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The control type, if this is a control. */
  controlType?: InputMaybe<ControlType>;
  /** The number of seconds, if specified. */
  seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** A planned action in a planned operation; describes a sample moving from one slot to another. */
export type PlanAction = {
  __typename?: 'PlanAction';
  /** The destination slot to which we want to add a sample. */
  destination: Slot;
  /** The new section number, if the source is a block and it is being sectioned. */
  newSection: Maybe<Scalars['String']['output']>;
  /** The sample in the source labware that we want to act upon. */
  sample: Sample;
  /** The planned thickness of the sample, if any. */
  sampleThickness: Maybe<Scalars['String']['output']>;
  /** An indicator for the order sections are taken from their block. */
  sectioningOrder: Maybe<Scalars['Int']['output']>;
  /** The source slot that contains the sample. */
  source: Slot;
};

/** Information about a plan previously recorded, now being looked up. */
export type PlanData = {
  __typename?: 'PlanData';
  /** The single item of destination labware for the plan. */
  destination: LabwareFlagged;
  /** The groups of addresses specified by the plan. */
  groups: Array<Array<Scalars['Address']['output']>>;
  /** The planned operation. */
  plan: PlanOperation;
  /** One or more items of source labware for the plan. */
  sources: Array<LabwareFlagged>;
};

/** A planned operation. */
export type PlanOperation = {
  __typename?: 'PlanOperation';
  /** The type of operation planned. */
  operationType: Maybe<OperationType>;
  /** The planned actions that describe the movement of samples in this operation. */
  planActions: Array<PlanAction>;
};

/** A request to create a plan operation. */
export type PlanRequest = {
  /** The specification of the labware created for the plan. */
  labware: Array<PlanRequestLabware>;
  /** The name of the type of operation we are planning. */
  operationType: Scalars['String']['input'];
};

/** A specification of an action in a plan request. Describes the action on a sample being transferred between slots. */
export type PlanRequestAction = {
  /** The intended addresses of the sample in the destination labware. */
  addresses: Array<Scalars['Address']['input']>;
  /** The id of the existing sample. */
  sampleId: Scalars['Int']['input'];
  /** The thickness (if specified) of the new sample. */
  sampleThickness?: InputMaybe<Scalars['String']['input']>;
  /** An indicator for the order sections are taken from their block. */
  sectioningOrder: Scalars['Int']['input'];
  /** The source of the sample (describing a slot in some existing labware). */
  source: PlanRequestSource;
};

/** A specification of new labware to be created for a plan request. */
export type PlanRequestLabware = {
  /** The actions, specifying which samples are transferred between which slots. */
  actions: Array<PlanRequestAction>;
  /** The barcode of the new labware, if the user needs to specify it. */
  barcode?: InputMaybe<Scalars['String']['input']>;
  /** The costing of the labware, if any. */
  costing?: InputMaybe<SlideCosting>;
  /** The name of the type of labware. */
  labwareType: Scalars['String']['input'];
  /** The lot number of the new labware, if any. */
  lotNumber?: InputMaybe<Scalars['String']['input']>;
  /** Optional number of columns for custom-size labware. */
  numColumns?: InputMaybe<Scalars['Int']['input']>;
  /** Optional number of rows for custom-size labware. */
  numRows?: InputMaybe<Scalars['Int']['input']>;
};

/** A description of a source slot in a plan request. */
export type PlanRequestSource = {
  /** The address of the source slot in its labware. May be assumed to be A1 if omitted. */
  address?: InputMaybe<Scalars['Address']['input']>;
  /** The barcode of the source labware. */
  barcode: Scalars['String']['input'];
};

/** The result of creating a new plan. */
export type PlanResult = {
  __typename?: 'PlanResult';
  /** The labware created for the plan, which is empty until the plan is confirmed. */
  labware: Array<Labware>;
  /** The planned operations created. */
  operations: Array<PlanOperation>;
};

/** A destination for pot processing. */
export type PotProcessingDestination = {
  /** Comment to record, if any. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The fixative. */
  fixative: Scalars['String']['input'];
  /** The name of the type of labware. */
  labwareType: Scalars['String']['input'];
};

/** A request to transfer original sample into pots. */
export type PotProcessingRequest = {
  /** The destinations that will be created. */
  destinations: Array<PotProcessingDestination>;
  /** The source barcode. */
  sourceBarcode: Scalars['String']['input'];
  /** Is the source labware discarded? */
  sourceDiscarded?: InputMaybe<Scalars['Boolean']['input']>;
  /** The work number. */
  workNumber: Scalars['String']['input'];
};

/** A printer, typically used to print labels for labware. */
export type Printer = {
  __typename?: 'Printer';
  /** The types of labels this printer is set up to print. */
  labelTypes: Array<LabelType>;
  name: Scalars['String']['output'];
};

/** The probe used on a piece of labware in an operation. */
export type ProbeLot = {
  /** The costing of the probe panel. */
  costing: SlideCosting;
  /** The lot number of the probe. */
  lot: Scalars['String']['input'];
  /** The name of the probe panel. */
  name: Scalars['String']['input'];
  /** The plex number. */
  plex?: InputMaybe<Scalars['Int']['input']>;
};

/** Labware in a probe operation request. */
export type ProbeOperationLabware = {
  /** Optional list of slot addresses to include in operation. */
  addresses?: InputMaybe<Array<Scalars['Address']['input']>>;
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Cassette lot number. */
  cassetteLot?: InputMaybe<Scalars['String']['input']>;
  /** The costing for the kit used on this labware, if any. */
  kitCosting?: InputMaybe<SlideCosting>;
  /** The probes used on this labware. */
  probes: Array<ProbeLot>;
  /** Reagent lot number. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
  /** Comment id indicating the sample prep reagent type. */
  reagentTypeCommentId?: InputMaybe<Scalars['Int']['input']>;
  /** The name of the spike probe, if used. */
  spike?: InputMaybe<Scalars['String']['input']>;
  /** The work number of the operation on this labware. */
  workNumber: Scalars['String']['input'];
};

/** Request to record an operation with probe panels. */
export type ProbeOperationRequest = {
  /** The labware involved in the operation. */
  labware: Array<ProbeOperationLabware>;
  /** The name of the type of operation. */
  operationType: Scalars['String']['input'];
  /** The time when the operation was performed, if specified. */
  performed?: InputMaybe<Scalars['Timestamp']['input']>;
};

/** A probe panel. */
export type ProbePanel = {
  __typename?: 'ProbePanel';
  /** Whether the probe panel is available for use. */
  enabled: Scalars['Boolean']['output'];
  /** The name of the probe panel. */
  name: Scalars['String']['output'];
  /** The type of probe. */
  type: ProbeType;
};

/** Type of probe. */
export enum ProbeType {
  Atera = 'atera',
  Cytassist = 'cytassist',
  Spike = 'spike',
  Xenium = 'xenium'
}

/** A program that work can be associated with. */
export type Program = {
  __typename?: 'Program';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** A project that work can be associated with. */
export type Project = {
  __typename?: 'Project';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** A protein panel. */
export type ProteinPanel = {
  __typename?: 'ProteinPanel';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** Labware to be QC'd with comments and a completion time. */
export type QcLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Zero or more comments applied to this labware in this operation. */
  comments: Array<Scalars['Int']['input']>;
  /** The time at which the process was completed. */
  completion?: InputMaybe<Scalars['Timestamp']['input']>;
  /** The run-name to record. */
  runName?: InputMaybe<Scalars['String']['input']>;
  /** Zero or more comments on individual samples in particular slots. */
  sampleComments?: InputMaybe<Array<QcSampleComment>>;
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
};

/** Request to record QC and completion time for one or more labware. */
export type QcLabwareRequest = {
  /** The specifications of labware to QC. */
  labware: Array<QcLabware>;
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** Was it terminated early? */
  terminated?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A comment on a particular sample in a particular slot. */
export type QcSampleComment = {
  /** The address of the slot. */
  address: Scalars['Address']['input'];
  /** The ID of the comment. */
  commentId: Scalars['Int']['input'];
  /** The ID of the sample. */
  sampleId: Scalars['Int']['input'];
};

/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type Query = {
  __typename?: 'Query';
  /** Data shown when scanning in labware for analyser op. */
  analyserScanData: AnalyserScanData;
  /** Get all bio risks that are enabled, or get all including those that are disabled. */
  bioRisks: Array<BioRisk>;
  /** Get all cellular classifications that are enabled, or get all including disabled. */
  cellClasses: Array<CellClass>;
  /** Get addresses of cleaned out slots in the specified labware.. */
  cleanedOutAddresses: Array<Scalars['Address']['output']>;
  /** Get all enabled comments in a particular category, or all enabled in any category; optionally include disabled. */
  comments: Array<Comment>;
  /** Get all the cost codes that are enabled, or get all including those that are disabled. */
  costCodes: Array<CostCode>;
  /** Get all the destruction reasons that are enabled, or get all including those that are disabled. */
  destructionReasons: Array<DestructionReason>;
  /** Get all the DNAP studies that are enabled, or get all including those that are disabled. */
  dnapStudies: Array<DnapStudy>;
  /** Load the study with the given Sequencescape id (if it exists). */
  dnapStudy: Maybe<DnapStudy>;
  /** Get all enabled equipments in a particular category, or all enabled in any category; optionally include disabled. */
  equipments: Array<Equipment>;
  /** Event types. */
  eventTypes: Array<Scalars['String']['output']>;
  /** Get a previously recorded extract result for a given labware barcode. */
  extractResult: ExtractResult;
  /** Find where labware is stored, given some criteria. */
  find: FindResult;
  /** Look up the latest operation of some specified type whose destinations included a given labware barcode. */
  findLatestOp: Maybe<Operation>;
  /** Get all the fixatives that are enabled, or get all including those that are disabled. */
  fixatives: Array<Fixative>;
  /** Get the history associated with a specified work number, and/or barcode, external name, donor name. */
  history: History;
  /** Get the history for a specified donor. */
  historyForDonorName: History;
  /** Get the history containing a tissue with the given external name. */
  historyForExternalName: History;
  /** Get the history containing a given labware barcode. */
  historyForLabwareBarcode: History;
  /** Get the history containing a given sample id. */
  historyForSampleId: History;
  /** Get the operation history for a specified work number. */
  historyForWorkNumber: History;
  /** Get a graph of the indicated history. Zoom and fontSize are optional. */
  historyGraph: GraphSvg;
  /** Get all the HMDMCs that are enabled, or get all including those that are disabled. */
  hmdmcs: Array<Hmdmc>;
  /** Get the labware with the given barcode. */
  labware: Labware;
  /** Bio risk codes for samples in the specified labware. */
  labwareBioRiskCodes: Array<SampleBioRisk>;
  /** Get the existing costing (if any) for an item of labware. */
  labwareCosting: Maybe<SlideCosting>;
  /** Get labware flag details applicable to the specified labware. */
  labwareFlagDetails: Array<FlagDetail>;
  /** Get the labware and check if it is flagged. */
  labwareFlagged: LabwareFlagged;
  /** Get the labware contained in a particular location. */
  labwareInLocation: Array<Labware>;
  /** Get operations into a given labware barcode of a given operation type. */
  labwareOperations: Maybe<Array<Maybe<Operation>>>;
  /** Get all the labware types available. */
  labwareTypes: Array<LabwareType>;
  /** List files linked to work numbers. */
  listFiles: Array<StanFile>;
  /** Get the specified storage location. */
  location: Location;
  /** Get named measurement values for each slot from the indicated labware or any of its ancestor labware. */
  measurementValueFromLabwareOrAncestor: Array<AddressString>;
  /** Get named measurement values for each slot from the indicated labware or its parent labware. */
  measurementValueFromLabwareOrParent: Array<AddressString>;
  /** Get all the mediums available. */
  mediums: Array<Medium>;
  /** Get the next replicate data for the given source labware barcodes. */
  nextReplicateNumbers: Array<NextReplicateData>;
  /** Get all the omero projects that are enabled, or including those that are disabled. */
  omeroProjects: Array<OmeroProject>;
  /**
   * Does the specified operation exist on the specified labware?
   * With the specified run name, work number if provided.
   */
  opExists: Scalars['Boolean']['output'];
  /** Operation types. */
  opTypes: Array<Scalars['String']['output']>;
  /** Get an operation and the pass/fail result recorded on it, for a given labware barcode and operation type name. */
  passFails: Array<OpPassFail>;
  /** Get the information about a planned operation previously recorded for a specific labware barcode. */
  planData: PlanData;
  /** Get all printers available, or get all printers that support a named label type. */
  printers: Array<Printer>;
  /** Gets info about which slots have been used in probe hybridisation. */
  probeHybSlots: Array<Scalars['Address']['output']>;
  /** Get all probe panels of a particular type, optionally including the disabled. */
  probePanels: Array<ProbePanel>;
  /** Get all programs that are enabled, or get all including those that are disabled. */
  programs: Array<Program>;
  /** Get all the projects that are enabled, or get all including those that are disabled. */
  projects: Array<Project>;
  /** Get protein panels that are enabled, or all including disabled. */
  proteinPanels: Array<ProteinPanel>;
  /** Get a reagent plate, if it exists. May return null. */
  reagentPlate: Maybe<ReagentPlate>;
  /** Get the available release file groups. */
  releaseColumnOptions: Array<ReleaseFileOption>;
  /** Get all the release destinations that are enabled, or get all including those that are disabled. */
  releaseDestinations: Array<ReleaseDestination>;
  /** Get all the release recipients that are enabled, or get all including those that are disabled. */
  releaseRecipients: Array<ReleaseRecipient>;
  /** Reloads saved slot copy information. */
  reloadSlotCopy: Maybe<SlotCopyLoad>;
  /** Get regions of interest in the indicated labware. */
  rois: Array<LabwareRoi>;
  /** Run names recorded for the specified labware. */
  runNames: Array<Scalars['String']['output']>;
  /** Get regions of interest for the indicated labware and run name. */
  runRois: Array<Roi>;
  /** Gets the sample positions (if any) specified in a particular item of labware. */
  samplePositions: Array<SamplePosition>;
  /** Get all the slot regions, optionally including those that are disabled. */
  slotRegions: Array<SlotRegion>;
  /** Get all the solutions that are enabled, or get all including those that are disabled. */
  solutions: Array<Solution>;
  /** Get all the species that are enabled, or get all including those that are disabled. */
  species: Array<Species>;
  /** Get the reagent types for H&E staining. */
  stainReagentTypes: Array<Comment>;
  /** Get the available stain types. */
  stainTypes: Array<StainType>;
  /** Gets the parent hierarchy, from the root to the specified location. */
  storagePath: Array<LinkedLocation>;
  /** Get the information about stored items with the given barcodes. */
  stored: Array<StoredItem>;
  /** Get suggested labware for work. */
  suggestedLabwareForWork: Array<Labware>;
  /** Get suggested work (if any) for labware. By default, only returns active work. */
  suggestedWorkForLabware: SuggestedWorkResponse;
  /** Get all the tissue types available. */
  tissueTypes: Array<TissueType>;
  /** Get treatment types that are enabled, or all including disabled. */
  treatmentTypes: Array<TreatmentType>;
  /** Get the current logged in user. */
  user: Maybe<User>;
  /** Get all the users that are enabled, or get all including those that are disabled. */
  users: Array<User>;
  /** Gets info about the current version of the application. */
  version: VersionInfo;
  /** Get an item of labware and the visium permeabilisation data recorded on it, if any. */
  visiumPermData: VisiumPermData;
  /** Get the work with the specified work number. */
  work: Work;
  /**
   * Get the work progress (some particular timestamps) associated with a specified work number, and/or
   * work types, programs, statuses.
   */
  workProgress: Array<WorkProgress>;
  /** Get all the work types that are enabled, or get all including those that are disabled. */
  workTypes: Array<WorkType>;
  /** Get all the works, or get all the works in the given specified statuses. */
  works: Array<Work>;
  /** Get all work created by the specified user. */
  worksCreatedBy: Array<Work>;
  /** Get summary of works. */
  worksSummary: WorkSummaryData;
  /** Get all the works with associated comment, or get all the ones in the given statuses. */
  worksWithComments: Array<WorkWithComment>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryAnalyserScanDataArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryBioRisksArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCellClassesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCleanedOutAddressesArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCommentsArgs = {
  category: InputMaybe<Scalars['String']['input']>;
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCostCodesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDestructionReasonsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDnapStudiesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDnapStudyArgs = {
  ssId: Scalars['Int']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryEquipmentsArgs = {
  category: InputMaybe<Scalars['String']['input']>;
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryExtractResultArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryFindArgs = {
  request: FindRequest;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryFindLatestOpArgs = {
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryFixativesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryArgs = {
  barcode: InputMaybe<Scalars['String']['input']>;
  donorName: InputMaybe<Array<Scalars['String']['input']>>;
  eventType: InputMaybe<Scalars['String']['input']>;
  externalName: InputMaybe<Array<Scalars['String']['input']>>;
  workNumber: InputMaybe<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForDonorNameArgs = {
  donorName: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForExternalNameArgs = {
  externalName: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForLabwareBarcodeArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForSampleIdArgs = {
  sampleId: Scalars['Int']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForWorkNumberArgs = {
  workNumber: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryGraphArgs = {
  barcode: InputMaybe<Scalars['String']['input']>;
  donorName: InputMaybe<Array<Scalars['String']['input']>>;
  externalName: InputMaybe<Array<Scalars['String']['input']>>;
  fontSize: InputMaybe<Scalars['Int']['input']>;
  workNumber: InputMaybe<Scalars['String']['input']>;
  zoom: InputMaybe<Scalars['Float']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHmdmcsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareBioRiskCodesArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareCostingArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareFlagDetailsArgs = {
  barcodes: Array<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareFlaggedArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareInLocationArgs = {
  locationBarcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareOperationsArgs = {
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareTypesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryListFilesArgs = {
  workNumbers: Array<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLocationArgs = {
  locationBarcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryMeasurementValueFromLabwareOrAncestorArgs = {
  barcode: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryMeasurementValueFromLabwareOrParentArgs = {
  barcode: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryNextReplicateNumbersArgs = {
  barcodes: Array<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryOmeroProjectsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryOpExistsArgs = {
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
  run: InputMaybe<Scalars['String']['input']>;
  workNumber: InputMaybe<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryPassFailsArgs = {
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryPlanDataArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryPrintersArgs = {
  labelType: InputMaybe<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProbeHybSlotsArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProbePanelsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
  type: InputMaybe<ProbeType>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProgramsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProjectsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProteinPanelsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReagentPlateArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseColumnOptionsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseDestinationsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseRecipientsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReloadSlotCopyArgs = {
  lpNumber: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
  workNumber: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryRoisArgs = {
  barcodes: Array<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryRunNamesArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryRunRoisArgs = {
  barcode: Scalars['String']['input'];
  run: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySamplePositionsArgs = {
  labwareBarcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySlotRegionsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySolutionsArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySpeciesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryStoragePathArgs = {
  locationBarcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryStoredArgs = {
  barcodes: Array<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySuggestedLabwareForWorkArgs = {
  forRelease: InputMaybe<Scalars['Boolean']['input']>;
  workNumber: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySuggestedWorkForLabwareArgs = {
  barcodes: Array<Scalars['String']['input']>;
  includeInactive: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryTissueTypesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryTreatmentTypesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryUsersArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryVisiumPermDataArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorkArgs = {
  workNumber: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorkProgressArgs = {
  programs: InputMaybe<Array<Scalars['String']['input']>>;
  requesters: InputMaybe<Array<Scalars['String']['input']>>;
  statuses: InputMaybe<Array<WorkStatus>>;
  workNumber: InputMaybe<Scalars['String']['input']>;
  workTypes: InputMaybe<Array<Scalars['String']['input']>>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorkTypesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorksArgs = {
  status: InputMaybe<Array<WorkStatus>>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorksCreatedByArgs = {
  username: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorksWithCommentsArgs = {
  status: InputMaybe<Array<WorkStatus>>;
};

/** An item of labware that RNA Analysis is being requested on. */
export type RnaAnalysisLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The id of a preset comment, if any, to associate with the analysis. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The measurements to record for this operation. */
  measurements: Array<StringMeasurement>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record an RNA analysis operation. */
export type RnaAnalysisRequest = {
  /** The id of the equipment used in this operation. */
  equipmentId: Scalars['Int']['input'];
  /** The details of what to record on one or more labware. */
  labware: Array<RnaAnalysisLabware>;
  /** The name of the type of operation (a type RNA analsis). */
  operationType: Scalars['String']['input'];
};

/** Request to undestroy/undiscard labware. */
export type ReactivateLabware = {
  /** The barcode of the labware to reactivate. */
  barcode: Scalars['String']['input'];
  /** The comment id to associate with the reactivation. */
  commentId: Scalars['Int']['input'];
  /** The work number to associate with the reactivation. */
  workNumber: Scalars['String']['input'];
};

/** A plate of reagents. */
export type ReagentPlate = {
  __typename?: 'ReagentPlate';
  barcode: Scalars['String']['output'];
  numColumns: Scalars['Int']['output'];
  numRows: Scalars['Int']['output'];
  plateType: Maybe<Scalars['String']['output']>;
  slots: Array<ReagentSlot>;
};

/** A slot in a reagent plate. */
export type ReagentSlot = {
  __typename?: 'ReagentSlot';
  address: Scalars['Address']['output'];
  used: Scalars['Boolean']['output'];
};

/** A specification that a particular reagent slot should be transferred to an address. */
export type ReagentTransfer = {
  /** The address if a slot in the destination labware. */
  destinationAddress: Scalars['Address']['input'];
  /** The barcode of a reagent plate. */
  reagentPlateBarcode: Scalars['String']['input'];
  /** The address of a slot in the reagent plate. */
  reagentSlotAddress: Scalars['Address']['input'];
};

/** A request to transfer reagents from reagent plates to a STAN labware. */
export type ReagentTransferRequest = {
  /** The barcode of the destination labware. */
  destinationBarcode: Scalars['String']['input'];
  /** The name of the operation being performed. */
  operationType: Scalars['String']['input'];
  /** The type of reagent plate involved. */
  plateType: Scalars['String']['input'];
  /** The transfers from aliquot slots to destination slots. */
  transfers: Array<ReagentTransfer>;
  /** The work number to associate with the operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record permeabilisation data. */
export type RecordPermRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The data for each slot in the labware. */
  permData: Array<PermData>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Information about a clash, where a given tissue name already exists in the database. */
export type RegisterClash = {
  __typename?: 'RegisterClash';
  /** The existing labware containing the tissue at registration. */
  labware: Array<Labware>;
  /** The tissue with the given name. */
  tissue: Tissue;
};

/** The result of a register request. It is expected to contain either labware or clashes. */
export type RegisterResult = {
  __typename?: 'RegisterResult';
  /** The clashes that prevented registration. */
  clashes: Array<RegisterClash>;
  /** The labware created. */
  labware: Array<Labware>;
  /** The names of solutions used for labware barcodes, if any. */
  labwareSolutions: Array<Maybe<LabwareSolutionName>>;
};

/** A record that labware was sent out or given away. */
export type Release = {
  __typename?: 'Release';
  /** Where the labware was sent. */
  destination: ReleaseDestination;
  /** The unique id of this release. */
  id: Scalars['Int']['output'];
  /** The labware that was released. */
  labware: Labware;
  /** Who is responsible for receiving the labware. */
  recipient: ReleaseRecipient;
};

/** A description of a place to which labware may be released. */
export type ReleaseDestination = {
  __typename?: 'ReleaseDestination';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** An option for customising the columns in a release file. */
export type ReleaseFileOption = {
  __typename?: 'ReleaseFileOption';
  /** The name that is displayed to the user. */
  displayName: Scalars['String']['output'];
  /** The option name that is used as a query parameter. */
  queryParamName: Scalars['String']['output'];
};

/** Details of a particular labware being released. */
export type ReleaseLabware = {
  /** The barcode of the labware to release. */
  barcode: Scalars['String']['input'];
  /** The work number (optional) to associate with the release. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A username for someone responsible for receiving released labware. */
export type ReleaseRecipient = {
  __typename?: 'ReleaseRecipient';
  enabled: Scalars['Boolean']['output'];
  fullName: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

/** A request to record releases for one or more labware. */
export type ReleaseRequest = {
  /** Release column groups for the release file. */
  columnOptions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the release destination. */
  destination: Scalars['String']['input'];
  /** Additional recipients. */
  otherRecipients?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of the release recipient. */
  recipient: Scalars['String']['input'];
  /** The details of the labware being released. */
  releaseLabware: Array<ReleaseLabware>;
};

/** The result of a release request. */
export type ReleaseResult = {
  __typename?: 'ReleaseResult';
  /** The releases recorded for this request. */
  releases: Array<Release>;
};

/** A request to record results. */
export type ResultRequest = {
  /** The results for each item of labware. */
  labwareResults: Array<LabwareResult>;
  /** The name of the operation that will record the results. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A region of interest for a sample in an operation. */
export type Roi = {
  __typename?: 'Roi';
  /** The address of the slot. */
  address: Scalars['Address']['output'];
  /** The id of the operation in which the ROI was recorded. */
  operationId: Scalars['Int']['output'];
  /** The description of the region of interest. */
  roi: Scalars['String']['output'];
  /** The sample in the ROI. */
  sample: Sample;
  /** The id of the slot. */
  slotId: Scalars['Int']['output'];
};

/** A particular sample of tissue, in a particular state. */
export type Sample = {
  __typename?: 'Sample';
  /** The state of this particular sample. */
  bioState: BioState;
  /** For blocks, what is the highest section number already taken from this block? */
  blockHighestSection: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  /** An optional string describing the particular slice through the block of tissue that this sample came from. */
  section: Maybe<Scalars['String']['output']>;
  /** The tissue this sample is derived from. */
  tissue: Tissue;
};

/** A comment against a particular sample at an address (in some particular labware). */
export type SampleAddressComment = {
  /** The address of the slot for the comment. */
  address: Scalars['Address']['input'];
  /** The id of the comment to record. */
  commentId: Scalars['Int']['input'];
  /** The id of the sample for the comment. */
  sampleId: Scalars['Int']['input'];
};

/** A link between a sample and a bio risk. */
export type SampleBioRisk = {
  __typename?: 'SampleBioRisk';
  bioRiskCode: Scalars['String']['output'];
  sampleId: Scalars['Int']['output'];
};

/** A request to record a comment against a particular sample. */
export type SampleIdCommentId = {
  /** The id of the comment to record. */
  commentId: Scalars['Int']['input'];
  /** The id of the sample to comment upon. */
  sampleId: Scalars['Int']['input'];
};

/** A key and value about a region of interest. */
export type SampleMetric = {
  /** The name of the metric. */
  name: Scalars['String']['input'];
  /** The region of interest for this metric. */
  roi: Scalars['String']['input'];
  /** The value of the metric. */
  value: Scalars['String']['input'];
};

/** A request to save metrics. */
export type SampleMetricsRequest = {
  /** The labware barcode. */
  barcode: Scalars['String']['input'];
  /** The metrics to save. */
  metrics: Array<SampleMetric>;
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** The run name to link to the operation. */
  runName?: InputMaybe<Scalars['String']['input']>;
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
};

/** The region of a sample in a particular slot. */
export type SamplePosition = {
  __typename?: 'SamplePosition';
  /** The address of the slot. */
  address: Scalars['Address']['output'];
  /** The operation id related to this sample position */
  operationId: Scalars['Int']['output'];
  /** The name of the region of the sample in the slot. */
  region: Scalars['String']['output'];
  /** The ID of the sample. */
  sampleId: Scalars['Int']['output'];
  /** The ID of the slot. */
  slotId: Scalars['Int']['output'];
};

/** A labware barcode and a comment id to add. */
export type SampleProcessingComment = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The id of the comment. */
  commentId: Scalars['Int']['input'];
};

/** Request to record operations and add comments to labware. */
export type SampleProcessingCommentRequest = {
  /** The comments to add for each labware. */
  labware: Array<SampleProcessingComment>;
};

/** Specifies a region of interest for a sample in a slot address. */
export type SampleRoi = {
  /** The address of the slot. */
  address: Scalars['Address']['input'];
  /** The region of interest of the sample. */
  roi: Scalars['String']['input'];
  /** The id of the sample. */
  sampleId: Scalars['Int']['input'];
};

/** Specification of a result being recording. */
export type SampleResult = {
  /** The slot address that the result refers to. */
  address: Scalars['Address']['input'];
  /** The id of a comment, if any, linked to the result. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The result if any defined. */
  result?: InputMaybe<PassFail>;
  /** List of comments to be recorded against particular samples. */
  sampleComments?: InputMaybe<Array<SampleIdCommentId>>;
};

/** Information about a section of tissue (already taken from some a block tracked elsewhere) to register. */
export type SectionRegisterContent = {
  /** The addresses of the slots in the labware where this section should be created. */
  addresses: Array<Scalars['Address']['input']>;
  /** The biological risk code for this sample. */
  bioRiskCode: Scalars['String']['input'];
  /** The cellular classification of the section. */
  cellClass: Scalars['String']['input'];
  /** The date the sample was sectioned. */
  dateSectioned?: InputMaybe<Scalars['Date']['input']>;
  /** A name for the donor. */
  donorIdentifier: Scalars['String']['input'];
  /** The external name for the tissue from which this section was taken. */
  externalIdentifier: Scalars['String']['input'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String']['input'];
  /** A HMDMC number, if any, to associate with this sample. */
  hmdmc?: InputMaybe<Scalars['String']['input']>;
  /** The life stage of the donor. */
  lifeStage?: InputMaybe<LifeStage>;
  /** The medium used for the tissue. */
  medium: Scalars['String']['input'];
  /** The region of this sample in this slot, if any. */
  region?: InputMaybe<Scalars['String']['input']>;
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: Scalars['String']['input'];
  /** The section number of this particular section from its original tissue block. */
  sectionNumber: Scalars['String']['input'];
  /** The thickness, if known, of this section. */
  sectionThickness?: InputMaybe<Scalars['String']['input']>;
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int']['input'];
  /** The species from which this section originates. */
  species: Scalars['String']['input'];
  /** The name of the tissue type (organ) for the tissue. */
  tissueType: Scalars['String']['input'];
};

/** A request to register one or more sections into one piece of labware. */
export type SectionRegisterLabware = {
  /** The contents of the labware (new sections). */
  contents: Array<SectionRegisterContent>;
  /** The external barcode of this labware. */
  externalBarcode: Scalars['String']['input'];
  /** The name of the type of labware. */
  labwareType: Scalars['String']['input'];
  /** The lot number of the labware, if any. */
  lot?: InputMaybe<Scalars['String']['input']>;
  /** The prebarcode of this labware, if any. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
};

/** A request to register one or more labware containing new sections. */
export type SectionRegisterRequest = {
  /** The details of the labware being registered. */
  labware: Array<SectionRegisterLabware>;
  /** The work number to associate with the registration. */
  workNumber: Scalars['String']['input'];
};

/** Details about labware in a segmentation request. */
export type SegmentationLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The comment ids to link to the operation. */
  commentIds: Array<Scalars['Int']['input']>;
  /** The costing of the operation. */
  costing?: InputMaybe<SlideCosting>;
  /** The time with which the operation should be recorded. */
  performed?: InputMaybe<Scalars['Timestamp']['input']>;
  /** Protein panels and lot numbers. */
  proteinPanels?: InputMaybe<Array<PanelLot>>;
  /** The reagent lot number. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
};

/** A request to record segmentation on one or more labware. */
export type SegmentationRequest = {
  /** The details of the labware involved. */
  labware: Array<SegmentationLabware>;
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
};

/** The size of a 2D grid. */
export type Size = {
  __typename?: 'Size';
  /** The number of columns in this layout. */
  numColumns: Scalars['Int']['output'];
  /** The number of rows in this layout. */
  numRows: Scalars['Int']['output'];
};

/** Some information about the costing of a slide. */
export enum SlideCosting {
  Faculty = 'Faculty',
  Sgp = 'SGP',
  WarrantyReplacement = 'Warranty_replacement'
}

/** A slot in a piece of labware, which may contain samples. */
export type Slot = {
  __typename?: 'Slot';
  /** The address of this slot inside its labware. No two slots in the same item of labware have the same address. */
  address: Scalars['Address']['output'];
  /** The unique id of this slot. */
  id: Scalars['Int']['output'];
  /** The id of the labware to which the slot belongs. */
  labwareId: Scalars['Int']['output'];
  /** The list of samples contained in this slot. May be empty. */
  samples: Array<Sample>;
};

/** A specification that the contents of one slot should be copied to a particular address in new labware. */
export type SlotCopyContent = {
  /** The address of the destination slot. */
  destinationAddress: Scalars['Address']['input'];
  /** The address of the source slot in its labware. */
  sourceAddress: Scalars['Address']['input'];
  /** The barcode of the source labware. */
  sourceBarcode: Scalars['String']['input'];
};

/** A destination for slot copy. */
export type SlotCopyDestination = {
  /** The barcode of the existing piece of labware. */
  barcode?: InputMaybe<Scalars['String']['input']>;
  /** The bio state for samples in the destination (if specified). */
  bioState?: InputMaybe<Scalars['String']['input']>;
  /** Cassette lot number, if specified. */
  cassetteLot?: InputMaybe<Scalars['String']['input']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
  /** The costing of the slide, if specified. */
  costing?: InputMaybe<SlideCosting>;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: InputMaybe<Scalars['String']['input']>;
  /** The lot number of the slide, if specified. */
  lotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The LP number of the new labware, if it has one. */
  lpNumber?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: InputMaybe<Scalars['String']['input']>;
  /** Reagent A lot number, if specified. */
  reagentALot?: InputMaybe<Scalars['String']['input']>;
  /** Reagent B lot number, if specified. */
  reagentBLot?: InputMaybe<Scalars['String']['input']>;
  /** Costing for reagent, if specified. */
  reagentCosting?: InputMaybe<SlideCosting>;
  /** Single reagent lot, if specified. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
};

/** Loaded data for an incomplete slot copy operation. */
export type SlotCopyLoad = {
  __typename?: 'SlotCopyLoad';
  /** The barcode of the existing piece of labware. */
  barcode: Maybe<Scalars['String']['output']>;
  /** The bio state for samples in the destination (if specified). */
  bioState: Maybe<Scalars['String']['output']>;
  /** Cassette lot number, if specified. */
  cassetteLot: Maybe<Scalars['String']['output']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyLoadContent>;
  /** The costing of the slide, if specified. */
  costing: Maybe<SlideCosting>;
  /** Whether the execution was automated or manual. */
  executionType: Maybe<ExecutionType>;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType: Maybe<Scalars['String']['output']>;
  /** The lot number of the slide, if specified. */
  lotNumber: Maybe<Scalars['String']['output']>;
  /** The LP number of the new labware, required. */
  lpNumber: Scalars['String']['output'];
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: Scalars['String']['output'];
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode: Maybe<Scalars['String']['output']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber: Maybe<Scalars['String']['output']>;
  /** Reagent A lot number, if specified. */
  reagentALot: Maybe<Scalars['String']['output']>;
  /** Reagent B lot number, if specified. */
  reagentBLot: Maybe<Scalars['String']['output']>;
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopyLoadSource>;
  /** An optional work number to associate with this operation. */
  workNumber: Scalars['String']['output'];
};

/** Loaded data about a transfer in an incomplete slot copy operation. */
export type SlotCopyLoadContent = {
  __typename?: 'SlotCopyLoadContent';
  /** The address of the destination slot. */
  destinationAddress: Scalars['Address']['output'];
  /** The address of the source slot in its labware. */
  sourceAddress: Scalars['Address']['output'];
  /** The barcode of the source labware. */
  sourceBarcode: Scalars['String']['output'];
};

/** Loaded data about a source labware for an incomplete slot copy operation. */
export type SlotCopyLoadSource = {
  __typename?: 'SlotCopyLoadSource';
  /** The barcode of the source. */
  barcode: Scalars['String']['output'];
  /** The new labware state of the source. */
  labwareState: LabwareState;
};

/** A request to copy the contents of slots from source labware to multiple new or prebarcoded destinations. */
export type SlotCopyRequest = {
  /** The destination labware and its contents. */
  destinations: Array<SlotCopyDestination>;
  /** Whether the execution was automated or manual. */
  executionType?: InputMaybe<ExecutionType>;
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: Scalars['String']['input'];
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopySource>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** Saved data for an incomplete slot copy operation. */
export type SlotCopySave = {
  /** The barcode of the existing piece of labware. */
  barcode?: InputMaybe<Scalars['String']['input']>;
  /** The bio state for samples in the destination (if specified). */
  bioState?: InputMaybe<Scalars['String']['input']>;
  /** Cassette lot number, if specified. */
  cassetteLot?: InputMaybe<Scalars['String']['input']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
  /** The costing of the slide, if specified. */
  costing?: InputMaybe<SlideCosting>;
  /** Whether the execution was automated or manual. */
  executionType?: InputMaybe<ExecutionType>;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: InputMaybe<Scalars['String']['input']>;
  /** The lot number of the slide, if specified. */
  lotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The LP number of the new labware, required. */
  lpNumber: Scalars['String']['input'];
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: Scalars['String']['input'];
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: InputMaybe<Scalars['String']['input']>;
  /** Reagent A lot number, if specified. */
  reagentALot?: InputMaybe<Scalars['String']['input']>;
  /** Reagent B lot number, if specified. */
  reagentBLot?: InputMaybe<Scalars['String']['input']>;
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopySource>;
  /** An optional work number to associate with this operation. */
  workNumber: Scalars['String']['input'];
};

/** A source for slot copy, if a new labware state is specified. */
export type SlotCopySource = {
  /** The barcode of the source. */
  barcode: Scalars['String']['input'];
  /** The new labware state of the source. */
  labwareState: LabwareState;
};

/** A measurement to be recorded in a particular slot of some item of labware. */
export type SlotMeasurementRequest = {
  /** The address of the slot. */
  address: Scalars['Address']['input'];
  /** Optional comment ids. */
  commentIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The name of the measurement. */
  name: Scalars['String']['input'];
  /** The value of the measurement. */
  value: Scalars['String']['input'];
};

/** A pass/fail result in a particular slot of some labware. */
export type SlotPassFail = {
  __typename?: 'SlotPassFail';
  /** The address of the slot in its labware. */
  address: Scalars['Address']['output'];
  /** The comment, if any, recorded with the result. */
  comment: Maybe<Scalars['String']['output']>;
  /** The result. */
  result: PassFail;
};

/** A description of a region in a slot. */
export type SlotRegion = {
  __typename?: 'SlotRegion';
  /** Whether this region is enabled. */
  enabled: Scalars['Boolean']['output'];
  /** The name of this region. */
  name: Scalars['String']['output'];
};

/** A solution used in an operation. */
export type Solution = {
  __typename?: 'Solution';
  /** Whether the solution is available for use. */
  enabled: Scalars['Boolean']['output'];
  /** The unique name of the solution. */
  name: Scalars['String']['output'];
};

/** A labware in a solution transfer request. */
export type SolutionTransferLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The name solution. */
  solution: Scalars['String']['input'];
};

/** A request to perform solution transfer. */
export type SolutionTransferRequest = {
  /** The details of the labware in the request. */
  labware: Array<SolutionTransferLabware>;
  /** The work number for the operations. */
  workNumber: Scalars['String']['input'];
};

/** A location in an organ that tissue was taken from. */
export type SpatialLocation = {
  __typename?: 'SpatialLocation';
  /** The int code used to identify this spatial location in the particular tissue type. */
  code: Scalars['Int']['output'];
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  /** The tissue type (organ) to which this location belongs. */
  tissueType: TissueType;
};

/** A species, such as human, to which tissue may belong. */
export type Species = {
  __typename?: 'Species';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** The panel used with a stain. */
export enum StainPanel {
  Marker = 'marker',
  Negative = 'negative',
  Positive = 'positive'
}

/** A request to record stains on some labware. */
export type StainRequest = {
  /** The barcodes of the labware being stained. */
  barcodes: Array<Scalars['String']['input']>;
  /** Comment ids indicating reagent types used in stain. */
  commentIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The name of a stain type to record. */
  stainType: Scalars['String']['input'];
  /** The times of particular measurements for the stains. */
  timeMeasurements: Array<TimeMeasurement>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A type of stain that may be performed. */
export type StainType = {
  __typename?: 'StainType';
  /** The types of measurements we may expect to be recorded as part of a stain of this type. */
  measurementTypes: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/** A file uploaded to Stan. */
export type StanFile = {
  __typename?: 'StanFile';
  /** When this stanfile was uploaded. */
  created: Scalars['Timestamp']['output'];
  /** The name of the file. */
  name: Scalars['String']['output'];
  /** The url to download the file. */
  url: Scalars['String']['output'];
  /** The user who uploaded the file. */
  user: User;
  /** The work with which this file is associated. */
  work: Work;
};

/** A specification of an item to be put into storage. */
export type StoreInput = {
  /** The address, if any, in a location where the item should be stored. */
  address?: InputMaybe<Scalars['Address']['input']>;
  /** The barcode of the item to be stored. */
  barcode: Scalars['String']['input'];
};

/** An item in storage. */
export type StoredItem = {
  __typename?: 'StoredItem';
  /** The row/column address (if any) of the item in its location. */
  address: Maybe<Scalars['Address']['output']>;
  /** The index of the address (if any) in the location. */
  addressIndex: Maybe<Scalars['Int']['output']>;
  /** The barcode of the item. */
  barcode: Scalars['String']['output'];
  /** The location of the item. */
  location: Location;
};

/** A specification for recording a measurement. */
export type StringMeasurement = {
  /** The thing being measured. */
  name: Scalars['String']['input'];
  /** The value of the measurement. */
  value: Scalars['String']['input'];
};

/** A link between a labware barcode and a work number. */
export type SuggestedWork = {
  __typename?: 'SuggestedWork';
  /** The barcode of the labware. */
  barcode: Scalars['String']['output'];
  /** The work number of the suggested work, or null. */
  workNumber: Maybe<Scalars['String']['output']>;
};

/** The response to a suggested work query. */
export type SuggestedWorkResponse = {
  __typename?: 'SuggestedWorkResponse';
  /** The work numbers for each barcode. Barcodes without suggested work will be omitted. */
  suggestedWorks: Array<SuggestedWork>;
  /** The works indicated. */
  works: Array<Work>;
};

/** A measurement given as a number of seconds for some particular named measure. */
export type TimeMeasurement = {
  name: Scalars['String']['input'];
  seconds: Scalars['Int']['input'];
};

/** A piece of tissue from which multiple samples may originate. */
export type Tissue = {
  __typename?: 'Tissue';
  /** The cellular classification of the tissue. */
  cellClass: CellClass;
  /** The date the original sample was collected, if known. */
  collectionDate: Maybe<Scalars['Date']['output']>;
  /** The individual from whom this tissue was taken. */
  donor: Donor;
  externalName: Maybe<Scalars['String']['output']>;
  /** The fixative used on this tissue. */
  fixative: Fixative;
  hmdmc: Maybe<Hmdmc>;
  /** The medium used on this tissue. */
  medium: Medium;
  /** A number (optionall followed by a letter) that helps to distinguish this tissue from other similar tissues. */
  replicate: Maybe<Scalars['String']['output']>;
  /** The location in a particular organ from which this tissue was taken. */
  spatialLocation: SpatialLocation;
};

/** Info describing a new block in a tissue block request. */
export type TissueBlockContent = {
  /** The addresses to place the sample in the new labware. */
  addresses: Array<Scalars['Address']['input']>;
  /** The id of a comment to record on the new block, if any. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The replicate number for the new block. */
  replicate?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the labware containing the source sample. */
  sourceBarcode: Scalars['String']['input'];
  /** The id of the source sample. */
  sourceSampleId: Scalars['Int']['input'];
};

/** The input about a new block being created. */
export type TissueBlockLabware = {
  /** The contents (new samples) for the new labware. */
  contents: Array<TissueBlockContent>;
  /** The labware type for the new labware. */
  labwareType: Scalars['String']['input'];
  /** The number of columns required in the labware, if overridden. */
  numColumns?: InputMaybe<Scalars['Int']['input']>;
  /** The number of rows required in the labware, if overridden. */
  numRows?: InputMaybe<Scalars['Int']['input']>;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
};

/** A request to process original tissue into blocks. */
export type TissueBlockRequest = {
  /** Which source barcodes (if any) to discard as part of this request. */
  discardSourceBarcodes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The labware (blocks) being created by this request. */
  labware: Array<TissueBlockLabware>;
  /** Which samples need to be removed from the source labware? */
  removedSourceSampleIds?: InputMaybe<Array<BarcodeSampleId>>;
  /** The work number associated with this request. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** The type of tissue, typically an organ. */
export type TissueType = {
  __typename?: 'TissueType';
  /** The short code for the tissue type. */
  code: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  /** The name of the tissue type. */
  name: Scalars['String']['output'];
  /** The possible spatial locations for tissue of this type. */
  spatialLocations: Array<SpatialLocation>;
};

/** A treatment type. */
export type TreatmentType = {
  __typename?: 'TreatmentType';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** The details of a previously released item of labware to receive back into the application. */
export type UnreleaseLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The highest section number taken from the block, if it is a block. */
  highestSection?: InputMaybe<Scalars['Int']['input']>;
  /** The work number associated with the unrelease of this labware. */
  workNumber: Scalars['String']['input'];
};

/** A request to receive back some previously released labware. */
export type UnreleaseRequest = {
  labware: Array<UnreleaseLabware>;
};

/** The result of a request to empty a location. */
export type UnstoreResult = {
  __typename?: 'UnstoreResult';
  /** The number of items unstored. */
  numUnstored: Scalars['Int']['output'];
  /** The details of the item unstored. */
  unstored: Array<UnstoredItem>;
};

/** An item no longer in storage. */
export type UnstoredItem = {
  __typename?: 'UnstoredItem';
  /** The row/column address (if any) where the item was stored. */
  address: Maybe<Scalars['Address']['output']>;
  /** The barcode of the item. */
  barcode: Scalars['String']['output'];
};

/** A user, who is associated with performing actions in the application. */
export type User = {
  __typename?: 'User';
  role: UserRole;
  username: Scalars['String']['output'];
};

/** The levels of user privilege. */
export enum UserRole {
  /** User can record work and can perform admin actions. */
  Admin = 'admin',
  /** User cannot record anything. */
  Disabled = 'disabled',
  /** User can request work. */
  Enduser = 'enduser',
  /** User can record work. */
  Normal = 'normal'
}

/** Info about the app version. */
export type VersionInfo = {
  __typename?: 'VersionInfo';
  /** The latest commit id. */
  commit: Scalars['String']['output'];
  /** The output of git describe. */
  describe: Scalars['String']['output'];
  /** The version from the pom file. */
  version: Maybe<Scalars['String']['output']>;
};

/** Request to record visium analysis, selecting a permeabilisation time. */
export type VisiumAnalysisRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The address where the selected permeabilisation was recorded. */
  selectedAddress: Scalars['Address']['input'];
  /** The permeabilisation time that we want to select. */
  selectedTime: Scalars['Int']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** The permeabilisation data recorded for a particular piece of labware. */
export type VisiumPermData = {
  __typename?: 'VisiumPermData';
  /** The permeabilisation data for each slot. */
  addressPermData: Array<AddressPermData>;
  /** The labware in question. */
  labware: LabwareFlagged;
  /** The region of a sample in a particular slot referenced by the entries */
  samplePositionResults: Array<SamplePosition>;
};

/** Work that can be used to collect together operations done on related samples for a particular purpose. */
export type Work = {
  __typename?: 'Work';
  /** The atera study for this work, if any. */
  ateraStudy: Maybe<DnapStudy>;
  /** The cost code responsible for paying for this work. */
  costCode: CostCode;
  /** The DNAP study associated with this work, if any. */
  dnapStudy: Maybe<DnapStudy>;
  /** The faculty lead for this work, if any. */
  facultyLead: Maybe<ReleaseDestination>;
  /**
   * The number of blocks that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numBlocks: Maybe<Scalars['Int']['output']>;
  /**
   * The number of original samples that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numOriginalSamples: Maybe<Scalars['Int']['output']>;
  /**
   * The number of slides that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numSlides: Maybe<Scalars['Int']['output']>;
  /** The omero project associated with this work, if any. */
  omeroProject: Maybe<OmeroProject>;
  /**
   * A string describing the priority of this work.
   * This is set and updated by users during the course of the work.
   */
  priority: Maybe<Scalars['String']['output']>;
  /** The program associated with this work. */
  program: Program;
  /** The project for which this work is done. */
  project: Project;
  /** The current status of the work. */
  status: WorkStatus;
  /** The treatment types for this work, if any. */
  treatmentTypes: Array<TreatmentType>;
  /** The unique (generated) string identifying this work. */
  workNumber: Scalars['String']['output'];
  /** The name of the person requesting the work.(Note sure how to deal with this as the existing work will all be null but future work we want it mandatory?) */
  workRequester: Maybe<ReleaseRecipient>;
  /** The types of this work. */
  workTypes: Array<WorkType>;
  /** The xenium study for this work, if any. */
  xeniumStudy: Maybe<DnapStudy>;
};

/** A work number and a possible xenium study sequencescape id. */
export type WorkNumberXeniumStudyId = {
  __typename?: 'WorkNumberXeniumStudyId';
  /** A work number. */
  workNumber: Scalars['String']['output'];
  /** The sequencescape ID of a xenium study, if the work is linked to one. */
  xeniumStudyId: Maybe<Scalars['Int']['output']>;
};

/** The things that have happened for a particular work, as requested by a user. */
export type WorkProgress = {
  __typename?: 'WorkProgress';
  /** The most recent operation for a given piece of work */
  mostRecentOperation: Maybe<Scalars['String']['output']>;
  /** The things that happened for that work, and when they happened. */
  timestamps: Array<WorkProgressTimestamp>;
  /** The work under consideration. */
  work: Work;
  /** The comment associated with the work status. */
  workComment: Maybe<Scalars['String']['output']>;
};

/** An indication that something happened at some particular time. */
export type WorkProgressTimestamp = {
  __typename?: 'WorkProgressTimestamp';
  /** The timestamp when the thing happened. */
  timestamp: Scalars['Timestamp']['output'];
  /** The name of the thing that happened. */
  type: Scalars['String']['output'];
};

/** The possible statuses of work. */
export enum WorkStatus {
  /**
   * The work has been started, or resumed following a pause.
   * Work must be in this status for operations to be recorded in it.
   */
  Active = 'active',
  /** The work has been completed successfully. This is a final status. */
  Completed = 'completed',
  /** The work has failed (for some particular reason). This is a final status. */
  Failed = 'failed',
  /** The work has been paused (for some particular reason) by a user. */
  Paused = 'paused',
  /** This is the initial status of new work. */
  Unstarted = 'unstarted',
  /** The work has been withdrawn (for some particular reason). This is a final status. */
  Withdrawn = 'withdrawn'
}

/** All data needed for a Work Summary. */
export type WorkSummaryData = {
  __typename?: 'WorkSummaryData';
  workSummaryGroups: Array<WorkSummaryGroup>;
  workTypes: Array<WorkType>;
};

/** A group in a work summary. */
export type WorkSummaryGroup = {
  __typename?: 'WorkSummaryGroup';
  /** The number of works in this group. */
  numWorks: Scalars['Int']['output'];
  /** The work status of this group. */
  status: WorkStatus;
  /** The total number of blocks required as specified in these works. */
  totalNumBlocks: Scalars['Int']['output'];
  /** The total number of original samples required as specified in these works. */
  totalNumOriginalSamples: Scalars['Int']['output'];
  /** The total number of slides required as specified in these works. */
  totalNumSlides: Scalars['Int']['output'];
  /** The work type of this group. */
  workType: WorkType;
};

/** A type of work, describing what kind of work it is (its purpose or activity). */
export type WorkType = {
  __typename?: 'WorkType';
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

/** A work along with a comment that was recorded to explain its current status. */
export type WorkWithComment = {
  __typename?: 'WorkWithComment';
  /** The text of the comment (if any) that was recorded when the work last changed its status. */
  comment: Maybe<Scalars['String']['output']>;
  /** The work. */
  work: Work;
};
