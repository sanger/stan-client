import { GraphQLClient, RequestOptions } from 'graphql-request';
import { gql } from 'graphql-request';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A row/column combination, either in the form "B5" (row 2, column 5), or "32,15" (row 32, column 15) */
  Address: { input: string; output: string; }
  /** A point in time, typically in the format yyyy-mm-dd HH:MM:SS. */
  Timestamp: { input: string; output: string; }
  /** A date, typically in the format yyyy-mm-dd. */
  Date: { input: string; output: string; }
};

/** The levels of user privilege. */
export enum UserRole {
  /** User cannot record anything. */
  Disabled = 'disabled',
  /** User can request work. */
  Enduser = 'enduser',
  /** User can record work. */
  Normal = 'normal',
  /** User can record work and can perform admin actions. */
  Admin = 'admin'
}

/** The state of an item of labware. */
export enum LabwareState {
  /** The labware contains no samples. */
  Empty = 'empty',
  /** The labware contains samples and can be used as a source in operations. */
  Active = 'active',
  /** The labware has been used and discarded. */
  Discarded = 'discarded',
  /** The labware has been given out to another team or organisation. */
  Released = 'released',
  /** The labware has been destroyed for a specific reason. */
  Destroyed = 'destroyed',
  /** The labware has been used but may still be stored. */
  Used = 'used'
}

/** A pass or fail result. */
export enum PassFail {
  Pass = 'pass',
  Fail = 'fail'
}

/** A type of control. */
export enum ControlType {
  Positive = 'positive',
  Negative = 'negative'
}

/** A stage of life that an individual has reached when tissue is collected. */
export enum LifeStage {
  Adult = 'adult',
  Paediatric = 'paediatric',
  Fetal = 'fetal'
}

/** Some information about the costing of a slide. */
export enum SlideCosting {
  Faculty = 'Faculty',
  Sgp = 'SGP',
  WarrantyReplacement = 'Warranty_replacement'
}

/** Position of a cassette in an analyser. */
export enum CassettePosition {
  Left = 'left',
  Right = 'right'
}

/** Whether an operation was automated or manual. */
export enum ExecutionType {
  Automated = 'automated',
  Manual = 'manual'
}

/** Priority of labware flags. */
export enum FlagPriority {
  Note = 'note',
  Flag = 'flag'
}

/** Type of probe. */
export enum ProbeType {
  Xenium = 'xenium',
  Cytassist = 'cytassist',
  Spike = 'spike'
}

/** A user, who is associated with performing actions in the application. */
export type User = {
  __typename?: 'User';
  username: Scalars['String']['output'];
  role: UserRole;
};

/** The result of an attempt to log in. */
export type LoginResult = {
  __typename?: 'LoginResult';
  /** The message describing the result of the login, if any. */
  message?: Maybe<Scalars['String']['output']>;
  /** The authenticated user, if any. */
  user?: Maybe<User>;
};

/** A chemical a sample is put in. */
export type Medium = {
  __typename?: 'Medium';
  name: Scalars['String']['output'];
};

/** A chemical used to fix a sample. */
export type Fixative = {
  __typename?: 'Fixative';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** The type of tissue, typically an organ. */
export type TissueType = {
  __typename?: 'TissueType';
  /** The name of the tissue type. */
  name: Scalars['String']['output'];
  /** The short code for the tissue type. */
  code: Scalars['String']['output'];
  /** The possible spatial locations for tissue of this type. */
  spatialLocations: Array<SpatialLocation>;
};

/** A location in an organ that tissue was taken from. */
export type SpatialLocation = {
  __typename?: 'SpatialLocation';
  name: Scalars['String']['output'];
  /** The int code used to identify this spatial location in the particular tissue type. */
  code: Scalars['Int']['output'];
  /** The tissue type (organ) to which this location belongs. */
  tissueType: TissueType;
};

/** A permission number that can be linked to tissue. */
export type Hmdmc = {
  __typename?: 'Hmdmc';
  /** The HMDMC code for this permission. */
  hmdmc: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** Biological risk assessment number. */
export type BioRisk = {
  __typename?: 'BioRisk';
  /** The alphanumeric code representing this risk assessment. */
  code: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A link between a sample and a bio risk. */
export type SampleBioRisk = {
  __typename?: 'SampleBioRisk';
  sampleId: Scalars['Int']['output'];
  bioRiskCode: Scalars['String']['output'];
};

/** A type of label that can be printed, typically including a barcode and some other information. */
export type LabelType = {
  __typename?: 'LabelType';
  name: Scalars['String']['output'];
};

/** A type of labware, such as slides and tubes. */
export type LabwareType = {
  __typename?: 'LabwareType';
  name: Scalars['String']['output'];
  /** The number of rows in an item of this labware type. */
  numRows: Scalars['Int']['output'];
  /** The number of columns in an item of this labware type. */
  numColumns: Scalars['Int']['output'];
  /** The type of label that should be used for this labware type. */
  labelType?: Maybe<LabelType>;
};

/** A species, such as human, to which tissue may belong. */
export type Species = {
  __typename?: 'Species';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A particular individual from which one or more instances of tissue may be taken. */
export type Donor = {
  __typename?: 'Donor';
  donorName: Scalars['String']['output'];
  /** The stage of life of this donor at the point the tissue was collected. */
  lifeStage?: Maybe<LifeStage>;
  species: Species;
};

/** The state of a particular sample. As samples are created in new labware by different operations, it is associated with new bio states. */
export type BioState = {
  __typename?: 'BioState';
  name: Scalars['String']['output'];
};

/** A cellular classification. */
export type CellClass = {
  __typename?: 'CellClass';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A piece of tissue from which multiple samples may originate. */
export type Tissue = {
  __typename?: 'Tissue';
  externalName?: Maybe<Scalars['String']['output']>;
  /** A number (optionall followed by a letter) that helps to distinguish this tissue from other similar tissues. */
  replicate?: Maybe<Scalars['String']['output']>;
  /** The location in a particular organ from which this tissue was taken. */
  spatialLocation: SpatialLocation;
  /** The individual from whom this tissue was taken. */
  donor: Donor;
  hmdmc?: Maybe<Hmdmc>;
  /** The medium used on this tissue. */
  medium: Medium;
  /** The fixative used on this tissue. */
  fixative: Fixative;
  /** The cellular classification of the tissue. */
  cellClass: CellClass;
  /** The date the original sample was collected, if known. */
  collectionDate?: Maybe<Scalars['Date']['output']>;
};

/** A particular sample of tissue, in a particular state. */
export type Sample = {
  __typename?: 'Sample';
  id: Scalars['Int']['output'];
  /** An optional number describing the particular slice through the block of tissue that this sample came from. */
  section?: Maybe<Scalars['Int']['output']>;
  /** The tissue this sample is derived from. */
  tissue: Tissue;
  /** The state of this particular sample. */
  bioState: BioState;
};

/** A slot in a piece of labware, which may contain samples. */
export type Slot = {
  __typename?: 'Slot';
  /** The unique id of this slot. */
  id: Scalars['Int']['output'];
  /** The address of this slot inside its labware. No two slots in the same item of labware have the same address. */
  address: Scalars['Address']['output'];
  /** The id of the labware to which the slot belongs. */
  labwareId: Scalars['Int']['output'];
  /** The list of samples contained in this slot. May be empty. */
  samples: Array<Sample>;
  /** Is this slot a block of tissue? Blocks have different properties from sections. */
  block: Scalars['Boolean']['output'];
  /** For blocks, what is the highest section number already taken from this block? */
  blockHighestSection?: Maybe<Scalars['Int']['output']>;
};

export type Labware = {
  __typename?: 'Labware';
  /** The unique id of this labware. */
  id: Scalars['Int']['output'];
  /** The unique barcode of this labware. */
  barcode: Scalars['String']['output'];
  /** The external barcode of this labware, as input by the user. */
  externalBarcode?: Maybe<Scalars['String']['output']>;
  /** The type of labware. */
  labwareType: LabwareType;
  /** The slots in this labware. The number of slots and their addresses are determined by the labware type. */
  slots: Array<Slot>;
  /** Has this labware been released? */
  released: Scalars['Boolean']['output'];
  /** Has this labware been destroyed? */
  destroyed: Scalars['Boolean']['output'];
  /** Has this labware been discarded? */
  discarded: Scalars['Boolean']['output'];
  /** Has this labware been marked as used? */
  used: Scalars['Boolean']['output'];
  /** The state, derived from the contents and other fields on the labware. */
  state: LabwareState;
  /** The time when this labware was created in the application. */
  created: Scalars['Timestamp']['output'];
};

/** Labware with an additional field specifying whether it is flagged. */
export type LabwareFlagged = {
  __typename?: 'LabwareFlagged';
  /** The unique id of this labware. */
  id: Scalars['Int']['output'];
  /** The unique barcode of this labware. */
  barcode: Scalars['String']['output'];
  /** The external barcode of this labware, as input by the user. */
  externalBarcode?: Maybe<Scalars['String']['output']>;
  /** The type of labware. */
  labwareType: LabwareType;
  /** The slots in this labware. The number of slots and their addresses are determined by the labware type. */
  slots: Array<Slot>;
  /** Has this labware been released? */
  released: Scalars['Boolean']['output'];
  /** Has this labware been destroyed? */
  destroyed: Scalars['Boolean']['output'];
  /** Has this labware been discarded? */
  discarded: Scalars['Boolean']['output'];
  /** Has this labware been marked as used? */
  used: Scalars['Boolean']['output'];
  /** The state, derived from the contents and other fields on the labware. */
  state: LabwareState;
  /** The time when this labware was created in the application. */
  created: Scalars['Timestamp']['output'];
  /** Is there a labware flag applicable to this labware? */
  flagged: Scalars['Boolean']['output'];
  /** The highest priority of flag on this labware, if any. */
  flagPriority?: Maybe<FlagPriority>;
};

/** A solution used in an operation. */
export type Solution = {
  __typename?: 'Solution';
  /** The unique name of the solution. */
  name: Scalars['String']['output'];
  /** Whether the solution is available for use. */
  enabled: Scalars['Boolean']['output'];
};

/** A project in Omero. */
export type OmeroProject = {
  __typename?: 'OmeroProject';
  /** The name of the Omero project. */
  name: Scalars['String']['output'];
  /** Whether the Omero project is available for use in Stan. */
  enabled: Scalars['Boolean']['output'];
};

/** A probe panel. */
export type ProbePanel = {
  __typename?: 'ProbePanel';
  /** The name of the probe panel. */
  name: Scalars['String']['output'];
  /** The type of probe. */
  type: ProbeType;
  /** Whether the probe panel is available for use. */
  enabled: Scalars['Boolean']['output'];
};

/** A request to register a new block of tissue. */
export type BlockRegisterRequest = {
  /** The string to use as the donor name. */
  donorIdentifier: Scalars['String']['input'];
  /** The life stage of the donor. */
  lifeStage?: InputMaybe<LifeStage>;
  /** The HMDMC to use for the tissue. */
  hmdmc?: InputMaybe<Scalars['String']['input']>;
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: Scalars['String']['input'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int']['input'];
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: Scalars['String']['input'];
  /** The external identifier used to identify the tissue. */
  externalIdentifier: Scalars['String']['input'];
  /** The highest section already taken from the tissue block. */
  highestSection: Scalars['Int']['input'];
  /** The name of the type of labware containing the block. */
  labwareType: Scalars['String']['input'];
  /** The medium used for the tissue. */
  medium: Scalars['String']['input'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String']['input'];
  /** The species of the donor. */
  species: Scalars['String']['input'];
  /** The cellular classification of the tissue. */
  cellClass: Scalars['String']['input'];
  /** Is this a new block of tissue already in the application's database? */
  existingTissue?: InputMaybe<Scalars['Boolean']['input']>;
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: InputMaybe<Scalars['Date']['input']>;
  /** The biological risk number for this block. */
  bioRiskCode: Scalars['String']['input'];
};

/** A request to register one or more blocks of tissue. */
export type RegisterRequest = {
  blocks: Array<BlockRegisterRequest>;
  workNumbers: Array<Scalars['String']['input']>;
};

/** Information about a section of tissue (already taken from some a block tracked elsewhere) to register. */
export type SectionRegisterContent = {
  /** The address of the slot in the labware where this section should be created. */
  address: Scalars['Address']['input'];
  /** The species from which this section originates. */
  species: Scalars['String']['input'];
  /** The cellular classification of the section. */
  cellClass: Scalars['String']['input'];
  /** A HMDMC number, if any, to associate with this sample. */
  hmdmc?: InputMaybe<Scalars['String']['input']>;
  /** A name for the donor. */
  donorIdentifier: Scalars['String']['input'];
  /** The life stage of the donor. */
  lifeStage?: InputMaybe<LifeStage>;
  /** The external name for the tissue from which this section was taken. */
  externalIdentifier: Scalars['String']['input'];
  /** The name of the tissue type (organ) for the tissue. */
  tissueType: Scalars['String']['input'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int']['input'];
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: Scalars['String']['input'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String']['input'];
  /** The medium used for the tissue. */
  medium: Scalars['String']['input'];
  /** The section number of this particular section from its original tissue block. */
  sectionNumber: Scalars['Int']['input'];
  /** The thickness, if known, of this section. */
  sectionThickness?: InputMaybe<Scalars['String']['input']>;
  /** The region of this sample in this slot, if any. */
  region?: InputMaybe<Scalars['String']['input']>;
  /** The date the sample was sectioned. */
  dateSectioned?: InputMaybe<Scalars['Date']['input']>;
  /** The biological risk code for this sample. */
  bioRiskCode: Scalars['String']['input'];
};

/** A request to register one or more sections into one piece of labware. */
export type SectionRegisterLabware = {
  /** The name of the type of labware. */
  labwareType: Scalars['String']['input'];
  /** The external barcode of this labware. */
  externalBarcode: Scalars['String']['input'];
  /** The prebarcode of this labware, if any. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The contents of the labware (new sections). */
  contents: Array<SectionRegisterContent>;
};

/** A request to register one or more labware containing new sections. */
export type SectionRegisterRequest = {
  /** The details of the labware being registered. */
  labware: Array<SectionRegisterLabware>;
  /** The work number to associate with the registration. */
  workNumber: Scalars['String']['input'];
};

/** Data about registering a new original sample. */
export type OriginalSampleData = {
  /** The string to use as the donor name. */
  donorIdentifier: Scalars['String']['input'];
  /** The life stage of the donor. */
  lifeStage?: InputMaybe<LifeStage>;
  /** The HMDMC to use for the tissue. */
  hmdmc?: InputMaybe<Scalars['String']['input']>;
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: Scalars['String']['input'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int']['input'];
  /** The string to use for the replicate number of the tissue (optional). */
  replicateNumber?: InputMaybe<Scalars['String']['input']>;
  /** The external identifier used to identify the tissue. */
  externalIdentifier?: InputMaybe<Scalars['String']['input']>;
  /** The name of the type of labware containing the sample. */
  labwareType: Scalars['String']['input'];
  /** The solution used for the tissue. */
  solution: Scalars['String']['input'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String']['input'];
  /** The species of the donor. */
  species: Scalars['String']['input'];
  /** The cellular classification of the sample. */
  cellClass: Scalars['String']['input'];
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: InputMaybe<Scalars['Date']['input']>;
  /** The optional work number to link to the registration. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The biological risk number for this sample. */
  bioRiskCode: Scalars['String']['input'];
};

/** A request to register one or more original samples of tissue. */
export type OriginalSampleRegisterRequest = {
  samples: Array<OriginalSampleData>;
};

/** Information about a clash, where a given tissue name already exists in the database. */
export type RegisterClash = {
  __typename?: 'RegisterClash';
  /** The tissue with the given name. */
  tissue: Tissue;
  /** The existing labware containing the tissue at registration. */
  labware: Array<Labware>;
};

/** A labware barcode and name of a solution. */
export type LabwareSolutionName = {
  __typename?: 'LabwareSolutionName';
  /** The barcode of an item of labware. */
  barcode: Scalars['String']['output'];
  /** The name of a solution. */
  solutionName: Scalars['String']['output'];
};

/** The result of a register request. It is expected to contain either labware or clashes. */
export type RegisterResult = {
  __typename?: 'RegisterResult';
  /** The labware created. */
  labware: Array<Labware>;
  /** The clashes that prevented registration. */
  clashes: Array<RegisterClash>;
  /** The names of solutions used for labware barcodes, if any. */
  labwareSolutions: Array<Maybe<LabwareSolutionName>>;
};

/** A description of a source slot in a plan request. */
export type PlanRequestSource = {
  /** The barcode of the source labware. */
  barcode: Scalars['String']['input'];
  /** The address of the source slot in its labware. May be assumed to be A1 if omitted. */
  address?: InputMaybe<Scalars['Address']['input']>;
};

/** A type of operation that may be recorded. */
export type OperationType = {
  __typename?: 'OperationType';
  name: Scalars['String']['output'];
};

/** A planned action in a planned operation; describes a sample moving from one slot to another. */
export type PlanAction = {
  __typename?: 'PlanAction';
  /** The source slot that contains the sample. */
  source: Slot;
  /** The destination slot to which we want to add a sample. */
  destination: Slot;
  /** The sample in the source labware that we want to act upon. */
  sample: Sample;
  /** The new section number, if the source is a block and it is being sectioned. */
  newSection?: Maybe<Scalars['Int']['output']>;
  /** The planned thickness of the sample, if any. */
  sampleThickness?: Maybe<Scalars['String']['output']>;
};

/** A planned operation. */
export type PlanOperation = {
  __typename?: 'PlanOperation';
  /** The type of operation planned. */
  operationType?: Maybe<OperationType>;
  /** The planned actions that describe the movement of samples in this operation. */
  planActions: Array<PlanAction>;
};

/** A specification of an action in a plan request. Describes the action on a sample being transferred between slots. */
export type PlanRequestAction = {
  /** The intended address of the sample in the destination labware. */
  address: Scalars['Address']['input'];
  /** The id of the existing sample. */
  sampleId: Scalars['Int']['input'];
  /** The thickness (if specified) of the new sample. */
  sampleThickness?: InputMaybe<Scalars['String']['input']>;
  /** The source of the sample (describing a slot in some existing labware). */
  source: PlanRequestSource;
};

/** A specification of new labware to be created for a plan request. */
export type PlanRequestLabware = {
  /** The name of the type of labware. */
  labwareType: Scalars['String']['input'];
  /** The barcode of the new labware, if the user needs to specify it. */
  barcode?: InputMaybe<Scalars['String']['input']>;
  /** The lot number of the new labware, if any. */
  lotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The costing of the labware, if any. */
  costing?: InputMaybe<SlideCosting>;
  /** The actions, specifying which samples are transferred between which slots. */
  actions: Array<PlanRequestAction>;
};

/** A request to create a plan operation. */
export type PlanRequest = {
  /** The name of the type of operation we are planning. */
  operationType: Scalars['String']['input'];
  /** The specification of the labware created for the plan. */
  labware: Array<PlanRequestLabware>;
};

/** A combination of an address and a comment id, used to record comments in particular slots of labware. */
export type AddressCommentInput = {
  /** The address of a slot. */
  address: Scalars['Address']['input'];
  /** The id of a comment in the database. */
  commentId: Scalars['Int']['input'];
};

/** A request to cancel a particular planned action in a planned operation. */
export type CancelPlanAction = {
  /** The destination address of the planned action to cancel. */
  destinationAddress: Scalars['Address']['input'];
  /** The sample id of the planned action to cancel. */
  sampleId: Scalars['Int']['input'];
  /** The new section number (if any) of the planned action to cancel. */
  newSection?: InputMaybe<Scalars['Int']['input']>;
};

/** A specification of a particular piece of labware in a confirm request. */
export type ConfirmOperationLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  /** What individual planned actions should be cancelled, if any. */
  cancelledActions?: InputMaybe<Array<CancelPlanAction>>;
  /** What comments, if any, should be recorded against particular addresses. */
  addressComments?: InputMaybe<Array<AddressCommentInput>>;
};

/** A request to confirm planned operations, created actual operations. */
export type ConfirmOperationRequest = {
  labware: Array<ConfirmOperationLabware>;
};

/** A specification of a section to confirm in a planned sectioning operation. */
export type ConfirmSection = {
  /** The address of the destination slot for the section. */
  destinationAddress: Scalars['Address']['input'];
  /** The original sample id of the source. */
  sampleId: Scalars['Int']['input'];
  /** The section number of the new section. */
  newSection?: InputMaybe<Scalars['Int']['input']>;
  /** The comment ids to record against this sample in this slot. */
  commentIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** The region of this sample in this slot, if any. */
  region?: InputMaybe<Scalars['String']['input']>;
  /** The thickness of the section, overriding the thickness specified in the plan. */
  thickness?: InputMaybe<Scalars['String']['input']>;
};

/** A specification of a particular piece of labware to confirm or cancel planned sectioning into. */
export type ConfirmSectionLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The work number to link to the operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  /** What individual sections, if any, should be created in the labware? */
  confirmSections?: InputMaybe<Array<ConfirmSection>>;
  /** What comments, if any, should be recorded on slots of the labware? */
  addressComments?: InputMaybe<Array<AddressCommentInput>>;
};

/** A request to confirm (or cancel) planned sectioning operations. */
export type ConfirmSectionRequest = {
  /** The specification of what to confirm or cancel in each labware. */
  labware: Array<ConfirmSectionLabware>;
};

/** A specification that the contents of one slot should be copied to a particular address in new labware. */
export type SlotCopyContent = {
  /** The barcode of the source labware. */
  sourceBarcode: Scalars['String']['input'];
  /** The address of the source slot in its labware. */
  sourceAddress: Scalars['Address']['input'];
  /** The address of the destination slot. */
  destinationAddress: Scalars['Address']['input'];
};

/** A destination for slot copy. */
export type SlotCopyDestination = {
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the existing piece of labware. */
  barcode?: InputMaybe<Scalars['String']['input']>;
  /** The bio state for samples in the destination (if specified). */
  bioState?: InputMaybe<Scalars['String']['input']>;
  /** The costing of the slide, if specified. */
  costing?: InputMaybe<SlideCosting>;
  /** The lot number of the slide, if specified. */
  lotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The LP number of the new labware, if it has one. */
  lpNumber?: InputMaybe<Scalars['String']['input']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
};

/** A source for slot copy, if a new labware state is specified. */
export type SlotCopySource = {
  /** The barcode of the source. */
  barcode: Scalars['String']['input'];
  /** The new labware state of the source. */
  labwareState: LabwareState;
};

/** A request to copy the contents of slots from source labware to multiple new or prebarcoded destinations. */
export type SlotCopyRequest = {
  /** The destination labware and its contents. */
  destinations: Array<SlotCopyDestination>;
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopySource>;
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** Whether the execution was automated or manual. */
  executionType?: InputMaybe<ExecutionType>;
};

/** Saved data for an incomplete slot copy operation. */
export type SlotCopySave = {
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopySource>;
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber: Scalars['String']['input'];
  /** The LP number of the new labware, required. */
  lpNumber: Scalars['String']['input'];
  /** Whether the execution was automated or manual. */
  executionType?: InputMaybe<ExecutionType>;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the existing piece of labware. */
  barcode?: InputMaybe<Scalars['String']['input']>;
  /** The bio state for samples in the destination (if specified). */
  bioState?: InputMaybe<Scalars['String']['input']>;
  /** The costing of the slide, if specified. */
  costing?: InputMaybe<SlideCosting>;
  /** The lot number of the slide, if specified. */
  lotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
};

/** Loaded data about a source labware for an incomplete slot copy operation. */
export type SlotCopyLoadSource = {
  __typename?: 'SlotCopyLoadSource';
  /** The barcode of the source. */
  barcode: Scalars['String']['output'];
  /** The new labware state of the source. */
  labwareState: LabwareState;
};

/** Loaded data about a transfer in an incomplete slot copy operation. */
export type SlotCopyLoadContent = {
  __typename?: 'SlotCopyLoadContent';
  /** The barcode of the source labware. */
  sourceBarcode: Scalars['String']['output'];
  /** The address of the source slot in its labware. */
  sourceAddress: Scalars['Address']['output'];
  /** The address of the destination slot. */
  destinationAddress: Scalars['Address']['output'];
};

/** Loaded data for an incomplete slot copy operation. */
export type SlotCopyLoad = {
  __typename?: 'SlotCopyLoad';
  /** The source labware and their new labware states (if specified). */
  sources: Array<SlotCopyLoadSource>;
  /** The name of the type of operation being recorded to describe the contents being copied. */
  operationType: Scalars['String']['output'];
  /** An optional work number to associate with this operation. */
  workNumber: Scalars['String']['output'];
  /** The LP number of the new labware, required. */
  lpNumber: Scalars['String']['output'];
  /** Whether the execution was automated or manual. */
  executionType?: Maybe<ExecutionType>;
  /** The name of the type of the destination labware (if it is new labware). */
  labwareType?: Maybe<Scalars['String']['output']>;
  /** The barcode of the existing piece of labware. */
  barcode?: Maybe<Scalars['String']['output']>;
  /** The bio state for samples in the destination (if specified). */
  bioState?: Maybe<Scalars['String']['output']>;
  /** The costing of the slide, if specified. */
  costing?: Maybe<SlideCosting>;
  /** The lot number of the slide, if specified. */
  lotNumber?: Maybe<Scalars['String']['output']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: Maybe<Scalars['String']['output']>;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: Maybe<Scalars['String']['output']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyLoadContent>;
};

/** A request to record an operation in place. */
export type InPlaceOpRequest = {
  /** The name of the type of operation being recorded. */
  operationType: Scalars['String']['input'];
  /** The barcodes of the labware. */
  barcodes: Array<Scalars['String']['input']>;
  /** The id of the equipment (if any) being used in this operation. */
  equipmentId?: InputMaybe<Scalars['Int']['input']>;
  /** Optional work numbers to associate with this operation. */
  workNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** A record of material being transferred from one slot to another as part of an operation. */
export type Action = {
  __typename?: 'Action';
  /** The source slot, where the sample already was before the operation. */
  source: Slot;
  /** The destination slot, where the sample is after the operation. */
  destination: Slot;
  /** The id of the operation to which this action belongs. */
  operationId: Scalars['Int']['output'];
  /** The sample as it was created or copied in its destination slot. */
  sample: Sample;
};

/** A record of a particular operation being done involving labware and samples. */
export type Operation = {
  __typename?: 'Operation';
  /** The unique id of the operation. */
  id: Scalars['Int']['output'];
  /** The type of operation. */
  operationType: OperationType;
  /** The specific samples and slots and how they were used in this operation. */
  actions: Array<Action>;
  /** The user responsible for this operation. */
  user: User;
  /** The time at which this operation is regarded to have been performed (typically the time it was recorded). */
  performed: Scalars['Timestamp']['output'];
};

/** The result of confirming a plan. */
export type ConfirmOperationResult = {
  __typename?: 'ConfirmOperationResult';
  /** The labware populated by the operations. */
  labware: Array<Labware>;
  /** The operations created. */
  operations: Array<Operation>;
};

/** The result of creating a new plan. */
export type PlanResult = {
  __typename?: 'PlanResult';
  /** The labware created for the plan, which is empty until the plan is confirmed. */
  labware: Array<Labware>;
  /** The planned operations created. */
  operations: Array<PlanOperation>;
};

/** A printer, typically used to print labels for labware. */
export type Printer = {
  __typename?: 'Printer';
  name: Scalars['String']['output'];
  /** The types of labels this printer is set up to print. */
  labelTypes: Array<LabelType>;
};

/** A preset comment that users may select to link to parts of operations they record. */
export type Comment = {
  __typename?: 'Comment';
  /** The unique id of this comment. */
  id: Scalars['Int']['output'];
  /** The text content of the comment: What comment is it? */
  text: Scalars['String']['output'];
  /** The category of the comment: Where is it applicable? */
  category: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A description of a region in a slot. */
export type SlotRegion = {
  __typename?: 'SlotRegion';
  /** The name of this region. */
  name: Scalars['String']['output'];
  /** Whether this region is enabled. */
  enabled: Scalars['Boolean']['output'];
};

/** The region of a sample in a particular slot. */
export type SamplePosition = {
  __typename?: 'SamplePosition';
  /** The ID of the slot. */
  slotId: Scalars['Int']['output'];
  /** The address of the slot. */
  address: Scalars['Address']['output'];
  /** The ID of the sample. */
  sampleId: Scalars['Int']['output'];
  /** The name of the region of the sample in the slot. */
  region: Scalars['String']['output'];
  /** The operation id related to this sample position */
  operationId: Scalars['Int']['output'];
};

/** A piece of equipment that may be associated with certain operations. */
export type Equipment = {
  __typename?: 'Equipment';
  /** The unique id of this equipment. */
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  /** The category of equipment: What kind of thing is it or what is it used for? */
  category: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A description of a place to which labware may be released. */
export type ReleaseDestination = {
  __typename?: 'ReleaseDestination';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A username for someone responsible for receiving released labware. */
export type ReleaseRecipient = {
  __typename?: 'ReleaseRecipient';
  username: Scalars['String']['output'];
  fullName?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
};

/** A record that labware was sent out or given away. */
export type Release = {
  __typename?: 'Release';
  /** The unique id of this release. */
  id: Scalars['Int']['output'];
  /** The labware that was released. */
  labware: Labware;
  /** Where the labware was sent. */
  destination: ReleaseDestination;
  /** Who is responsible for receiving the labware. */
  recipient: ReleaseRecipient;
};

/** The result of a release request. */
export type ReleaseResult = {
  __typename?: 'ReleaseResult';
  /** The releases recorded for this request. */
  releases: Array<Release>;
};

/** Details of a particular labware being released. */
export type ReleaseLabware = {
  /** The barcode of the labware to release. */
  barcode: Scalars['String']['input'];
  /** The work number (optional) to associate with the release. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record releases for one or more labware. */
export type ReleaseRequest = {
  /** The details of the labware being released. */
  releaseLabware: Array<ReleaseLabware>;
  /** The name of the release destination. */
  destination: Scalars['String']['input'];
  /** The name of the release recipient. */
  recipient: Scalars['String']['input'];
  /** Additional recipients. */
  otherRecipients?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Release column groups for the release file. */
  columnOptions?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** An option for customising the columns in a release file. */
export type ReleaseFileOption = {
  __typename?: 'ReleaseFileOption';
  /** The name that is displayed to the user. */
  displayName: Scalars['String']['output'];
  /** The option name that is used as a query parameter. */
  queryParamName: Scalars['String']['output'];
};

/** A request to record an extract operation. */
export type ExtractRequest = {
  /** The barcodes of the source labware. */
  barcodes: Array<Scalars['String']['input']>;
  /** The name of the labware type for the new destination labware. */
  labwareType: Scalars['String']['input'];
  /** An optional work number to associate with these operations. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The id of the equipment being used in the extraction. If manual equipmentId is undefined */
  equipmentId?: InputMaybe<Scalars['Int']['input']>;
};

/** The result of a request to record operations. */
export type OperationResult = {
  __typename?: 'OperationResult';
  /** The destination labware for the operations. */
  labware: Array<Labware>;
  /** The new operations recorded. */
  operations: Array<Operation>;
};

/** A preset reason that labware may be destroyed. */
export type DestructionReason = {
  __typename?: 'DestructionReason';
  /** The unique id of this destruction reason. */
  id: Scalars['Int']['output'];
  /** The text of this reason: What reason is it? */
  text: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A record that some piece of labware was destroyed for some particular reason. */
export type Destruction = {
  __typename?: 'Destruction';
  /** The labware destroyed. */
  labware?: Maybe<Labware>;
  /** The user responsible for the destruction. */
  user?: Maybe<User>;
  /** The time the destruction was carried out (or at least when it was recorded). */
  destroyed?: Maybe<Scalars['Timestamp']['output']>;
  /** The reason for the destruction. */
  reason?: Maybe<DestructionReason>;
};

/** The result of a request to destroy labware. */
export type DestroyResult = {
  __typename?: 'DestroyResult';
  /** The destructions created for this request. */
  destructions: Array<Destruction>;
};

/** A request to destroy some labware for a particular reason. */
export type DestroyRequest = {
  /** The barcodes of the labware to destroy. */
  barcodes: Array<Scalars['String']['input']>;
  /** The id of a destruction reason. */
  reasonId: Scalars['Int']['input'];
};

/** An item in storage. */
export type StoredItem = {
  __typename?: 'StoredItem';
  /** The barcode of the item. */
  barcode: Scalars['String']['output'];
  /** The location of the item. */
  location: Location;
  /** The row/column address (if any) of the item in its location. */
  address?: Maybe<Scalars['Address']['output']>;
  /** The index of the address (if any) in the location. */
  addressIndex?: Maybe<Scalars['Int']['output']>;
};

/** An item no longer in storage. */
export type UnstoredItem = {
  __typename?: 'UnstoredItem';
  /** The barcode of the item. */
  barcode: Scalars['String']['output'];
  /** The row/column address (if any) where the item was stored. */
  address?: Maybe<Scalars['Address']['output']>;
};

/** The size of a 2D grid. */
export type Size = {
  __typename?: 'Size';
  /** The number of rows in this layout. */
  numRows: Scalars['Int']['output'];
  /** The number of columns in this layout. */
  numColumns: Scalars['Int']['output'];
};

/** A traversal order for a grid. */
export enum GridDirection {
  /** Right across the top row, then down to the next row, etc. */
  RightDown = 'RightDown',
  /** Down the leftmost column, then right to the next column, etc. */
  DownRight = 'DownRight',
  /** Right across the bottom row, then up to the next row, etc. */
  RightUp = 'RightUp',
  /** Up the leftmost column, then right to the next column, etc. */
  UpRight = 'UpRight'
}

/** A location where items may be stored. */
export type Location = {
  __typename?: 'Location';
  /** The unique id of this location. */
  id: Scalars['Int']['output'];
  /** The unique barcode of this location. */
  barcode: Scalars['String']['output'];
  /** The fixed name (if any) of this location, not changeable through this API. */
  fixedName?: Maybe<Scalars['String']['output']>;
  /** The custom name (if any) of this location, that may be changed through this API. */
  customName?: Maybe<Scalars['String']['output']>;
  /** The row/column address (if any) of this location in its parent location. */
  address?: Maybe<Scalars['Address']['output']>;
  /** The size of the grid (if any) where items may be stored in this location. */
  size?: Maybe<Size>;
  /** Some information about the location (if any) containing this location. */
  parent?: Maybe<LinkedLocation>;
  /** The items stored in this location. */
  stored: Array<StoredItem>;
  /** The other locations inside this location. */
  children: Array<LinkedLocation>;
  /** The suggested order (if any) of addresses in this location where items should be stored. */
  direction?: Maybe<GridDirection>;
  /** A combination of this location's name and its parents' names and barcodes. */
  qualifiedNameWithFirstBarcode?: Maybe<Scalars['String']['output']>;
  /** The number of items directly stored in this location. */
  numStored: Scalars['Int']['output'];
  /** Is this location a leaf (i.e. does not contain other locations)? */
  leaf: Scalars['Boolean']['output'];
};

/** Information about a storage location, without links to other locations and items. */
export type LinkedLocation = {
  __typename?: 'LinkedLocation';
  /** The barcode of this location. */
  barcode: Scalars['String']['output'];
  /** The fixed name of this location, not changeable through this API. */
  fixedName?: Maybe<Scalars['String']['output']>;
  /** The custom name (if any) of this location, that may be changed through this API. */
  customName?: Maybe<Scalars['String']['output']>;
  /** The row/column address (if any) of this location in its parent location. */
  address?: Maybe<Scalars['Address']['output']>;
  /** The number of items directly stored in this location. */
  numStored: Scalars['Int']['output'];
  /** Is this location a leaf (i.e. does not contain other locations)? */
  leaf: Scalars['Boolean']['output'];
};

/** The result of a request to empty a location. */
export type UnstoreResult = {
  __typename?: 'UnstoreResult';
  /** The number of items unstored. */
  numUnstored: Scalars['Int']['output'];
  /** The details of the item unstored. */
  unstored: Array<UnstoredItem>;
};

/** Information that a particular sample was found in a particular labware. */
export type FindEntry = {
  __typename?: 'FindEntry';
  /** The id of the sample found. */
  sampleId: Scalars['Int']['output'];
  /** The id of the labware where the sample was found. */
  labwareId: Scalars['Int']['output'];
  /** The list of work numbers associated with the entry. */
  workNumbers: Array<Maybe<Scalars['String']['output']>>;
};

/** Information that a particular labware was found in a particular location. */
export type LabwareLocationEntry = {
  __typename?: 'LabwareLocationEntry';
  /** The id of the labware found. */
  labwareId: Scalars['Int']['output'];
  /** The id of the location where the labware was found. */
  locationId: Scalars['Int']['output'];
  /** The row/column address (if any) of the labware inside the location. */
  address?: Maybe<Scalars['Address']['output']>;
};

/** The result of a find request: labware, its locations, and its contents. */
export type FindResult = {
  __typename?: 'FindResult';
  /** Links between samples and labware. */
  entries: Array<FindEntry>;
  /** Information about each sample found. */
  samples: Array<Sample>;
  /** Information about each labware found. */
  labware: Array<Labware>;
  /** Information about each location labware was found in. */
  locations: Array<Location>;
  /** Links between labware and locations. */
  labwareLocations: Array<LabwareLocationEntry>;
  /** The number of records found, which may be greater than the number of records returned. */
  numRecords: Scalars['Int']['output'];
};

/** A request to find some stored labware. Some, any or all fields may be filled. Each one refines the search results. */
export type FindRequest = {
  /** The barcode of a specific piece of labware to find. */
  labwareBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The names of donors to find stored samples of. */
  donorNames?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The names of tissues to find stored samples of. Maybe include * wildcards. */
  tissueExternalNames?: InputMaybe<Array<Scalars['String']['input']>>;
  /** The name of a tissue type to find stored samples of. */
  tissueTypeName?: InputMaybe<Scalars['String']['input']>;
  /** The name of a labware type to find labware of. */
  labwareTypeName?: InputMaybe<Scalars['String']['input']>;
  /** The maximum number of records to return. Use a negative value to indicate no limit. */
  maxRecords?: InputMaybe<Scalars['Int']['input']>;
  /** The work number associated with the labware. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The minimum creation date for the labware. */
  createdMin?: InputMaybe<Scalars['Date']['input']>;
  /** The maximum creation date for the labware. */
  createdMax?: InputMaybe<Scalars['Date']['input']>;
  /** The species of the samples. */
  species?: InputMaybe<Scalars['String']['input']>;
};

/** An entry in the history: the IDs refer to objects that should also be included in the History. */
export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  /** The id of the operation or other event to which this entry refers. */
  eventId: Scalars['Int']['output'];
  /** The operation type of type of event to which this entry refers. */
  type: Scalars['String']['output'];
  /** The time the event took place (or was recorded). */
  time: Scalars['Timestamp']['output'];
  /** The id of the source labware of this event. */
  sourceLabwareId: Scalars['Int']['output'];
  /** The id of the destination labware of this event. */
  destinationLabwareId: Scalars['Int']['output'];
  /** The id of the sample involved in this event. */
  sampleId?: Maybe<Scalars['Int']['output']>;
  /** The username of the user responsible for this event. */
  username: Scalars['String']['output'];
  /** The work number (if any) associated with this event. */
  workNumber?: Maybe<Scalars['String']['output']>;
  /** Extra details (such as measurements and comments) included in this entry. */
  details: Array<Scalars['String']['output']>;
  /** The address of the destination slot involved in the event. */
  address?: Maybe<Scalars['String']['output']>;
  /** The region of the destination slot involved in the event. */
  region?: Maybe<Scalars['String']['output']>;
};

/** A flag priority and a list of flagged barcodes. */
export type FlagBarcodes = {
  __typename?: 'FlagBarcodes';
  /** The priority of flag linked to the barcodes. */
  priority: FlagPriority;
  /** The barcodes linked with the flags. */
  barcodes: Array<Scalars['String']['output']>;
};

/** History as returned for a history query. */
export type History = {
  __typename?: 'History';
  /** The entries found for the history. */
  entries: Array<HistoryEntry>;
  /** The labware referenced by the entries. */
  labware: Array<Labware>;
  /** The samples referenced by the entries. */
  samples: Array<Sample>;
  /** The included labware barcodes that are flagged. */
  flagBarcodes: Array<FlagBarcodes>;
};

/** The SVG of a graph. */
export type GraphSvg = {
  __typename?: 'GraphSVG';
  /** The svg data of the graph. */
  svg: Scalars['String']['output'];
};

/** Information about a plan previously recorded, now being looked up. */
export type PlanData = {
  __typename?: 'PlanData';
  /** One or more items of source labware for the plan. */
  sources: Array<LabwareFlagged>;
  /** The planned operation. */
  plan: PlanOperation;
  /** The single item of destination labware for the plan. */
  destination: LabwareFlagged;
};

/** A project that work can be associated with. */
export type Project = {
  __typename?: 'Project';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A program that work can be associated with. */
export type Program = {
  __typename?: 'Program';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A cost code that work can be associated with. */
export type CostCode = {
  __typename?: 'CostCode';
  code: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A DNAP study. */
export type DnapStudy = {
  __typename?: 'DnapStudy';
  ssId: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** A type of work, describing what kind of work it is (its purpose or activity). */
export type WorkType = {
  __typename?: 'WorkType';
  name: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
};

/** The possible statuses of work. */
export enum WorkStatus {
  /** This is the initial status of new work. */
  Unstarted = 'unstarted',
  /**
   * The work has been started, or resumed following a pause.
   * Work must be in this status for operations to be recorded in it.
   */
  Active = 'active',
  /** The work has been paused (for some particular reason) by a user. */
  Paused = 'paused',
  /** The work has been completed successfully. This is a final status. */
  Completed = 'completed',
  /** The work has failed (for some particular reason). This is a final status. */
  Failed = 'failed',
  /** The work has been withdrawn (for some particular reason). This is a final status. */
  Withdrawn = 'withdrawn'
}

/** Work that can be used to collect together operations done on related samples for a particular purpose. */
export type Work = {
  __typename?: 'Work';
  /** The type of work: what does it entail? */
  workType: WorkType;
  /** The project for which this work is done. */
  project: Project;
  /** The program associated with this work. */
  program: Program;
  /** The cost code responsible for paying for this work. */
  costCode: CostCode;
  /** The unique (generated) string identifying this work. */
  workNumber: Scalars['String']['output'];
  /** The name of the person requesting the work.(Note sure how to deal with this as the existing work will all be null but future work we want it mandatory?) */
  workRequester?: Maybe<ReleaseRecipient>;
  /** The current status of the work. */
  status: WorkStatus;
  /**
   * The number of blocks that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numBlocks?: Maybe<Scalars['Int']['output']>;
  /**
   * The number of slides that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numSlides?: Maybe<Scalars['Int']['output']>;
  /**
   * The number of original samples that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numOriginalSamples?: Maybe<Scalars['Int']['output']>;
  /**
   * A string describing the priority of this work.
   * This is set and updated by users during the course of the work.
   */
  priority?: Maybe<Scalars['String']['output']>;
  /** The omero project associated with this work, if any. */
  omeroProject?: Maybe<OmeroProject>;
  /** The DNAP study associated with this work, if any. */
  dnapStudy?: Maybe<DnapStudy>;
};

/** A work along with a comment that was recorded to explain its current status. */
export type WorkWithComment = {
  __typename?: 'WorkWithComment';
  /** The work. */
  work: Work;
  /** The text of the comment (if any) that was recorded when the work last changed its status. */
  comment?: Maybe<Scalars['String']['output']>;
};

/** An indication that something happened at some particular time. */
export type WorkProgressTimestamp = {
  __typename?: 'WorkProgressTimestamp';
  /** The name of the thing that happened. */
  type: Scalars['String']['output'];
  /** The timestamp when the thing happened. */
  timestamp: Scalars['Timestamp']['output'];
};

/** The things that have happened for a particular work, as requested by a user. */
export type WorkProgress = {
  __typename?: 'WorkProgress';
  /** The work under consideration. */
  work: Work;
  /** The comment associated with the work status. */
  workComment?: Maybe<Scalars['String']['output']>;
  /** The things that happened for that work, and when they happened. */
  timestamps: Array<WorkProgressTimestamp>;
  /** The most recent operation for a given piece of work */
  mostRecentOperation?: Maybe<Scalars['String']['output']>;
};

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

/** Information about flags related to some labware. */
export type FlagDetail = {
  __typename?: 'FlagDetail';
  /** The barcode of the labware whose flags have been looked up. */
  barcode: Scalars['String']['output'];
  /** Summaries of the flags applicable to the specified labware. */
  flags: Array<FlagSummary>;
};

/** A measurement given as a number of seconds for some particular named measure. */
export type TimeMeasurement = {
  name: Scalars['String']['input'];
  seconds: Scalars['Int']['input'];
};

/** A type of stain that may be performed. */
export type StainType = {
  __typename?: 'StainType';
  name: Scalars['String']['output'];
  /** The types of measurements we may expect to be recorded as part of a stain of this type. */
  measurementTypes: Array<Scalars['String']['output']>;
};

/** A request to record stains on some labware. */
export type StainRequest = {
  /** The name of a stain type to record. */
  stainType: Scalars['String']['input'];
  /** The barcodes of the labware being stained. */
  barcodes: Array<Scalars['String']['input']>;
  /** The times of particular measurements for the stains. */
  timeMeasurements: Array<TimeMeasurement>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** Comment ids indicating reagent types used in stain. */
  commentIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** The panel used with a stain. */
export enum StainPanel {
  Positive = 'positive',
  Negative = 'negative',
  Marker = 'marker'
}

/** The details for a particular labware in a complex stain request. */
export type ComplexStainLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The bond barcode for the stain. */
  bondBarcode: Scalars['String']['input'];
  /** The bond run number. */
  bondRun: Scalars['Int']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The plex for RNAscope if that is being recorded. */
  plexRNAscope?: InputMaybe<Scalars['Int']['input']>;
  /** The plex for IHC if that is being recorded. */
  plexIHC?: InputMaybe<Scalars['Int']['input']>;
  /** The experiment panel. */
  panel: StainPanel;
};

/** A request for a stain including bond barcodes and such. */
export type ComplexStainRequest = {
  /** The names of the types of stain being recorded. */
  stainTypes: Array<Scalars['String']['input']>;
  /** The details of the labware being stained. */
  labware: Array<ComplexStainLabware>;
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

/** A request to record a comment against a particular sample. */
export type SampleIdCommentId = {
  /** The id of the sample to comment upon. */
  sampleId: Scalars['Int']['input'];
  /** The id of the comment to record. */
  commentId: Scalars['Int']['input'];
};

/** Specification of a result being recording. */
export type SampleResult = {
  /** The slot address that the result refers to. */
  address: Scalars['Address']['input'];
  /** The result if any defined. */
  result?: InputMaybe<PassFail>;
  /** The id of a comment, if any, linked to the result. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** List of comments to be recorded against particular samples. */
  sampleComments?: InputMaybe<Array<SampleIdCommentId>>;
};

/** Specification of results being recorded in an item of labware. */
export type LabwareResult = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The individual results. */
  sampleResults?: InputMaybe<Array<SampleResult>>;
  /** Measurements to record in this labware. */
  slotMeasurements?: InputMaybe<Array<SlotMeasurementRequest>>;
  /** An optional costing for the labware. */
  costing?: InputMaybe<SlideCosting>;
  /** A reagent lot number to associate with the labware. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record results. */
export type ResultRequest = {
  /** The name of the operation that will record the results. */
  operationType?: InputMaybe<Scalars['String']['input']>;
  /** The results for each item of labware. */
  labwareResults: Array<LabwareResult>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A comment against a particular sample at an address (in some particular labware). */
export type SampleAddressComment = {
  /** The id of the sample for the comment. */
  sampleId: Scalars['Int']['input'];
  /** The address of the slot for the comment. */
  address: Scalars['Address']['input'];
  /** The id of the comment to record. */
  commentId: Scalars['Int']['input'];
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

/** A request to record the completion of a process. */
export type CompletionRequest = {
  /** The name of the type operations being recorded. */
  operationType: Scalars['String']['input'];
  /** The work number associated with these operations. */
  workNumber: Scalars['String']['input'];
  /** The details of the labware involved in this operation. */
  labware: Array<LabwareSampleComments>;
};

/** Specification of extract results in a piece of labware. */
export type ExtractResultLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The result. */
  result: PassFail;
  /** The concentration measurement, if any. */
  concentration?: InputMaybe<Scalars['String']['input']>;
  /** The id of a comment, if any, linked to the result. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
};

/** A request to record extract results. */
export type ExtractResultRequest = {
  /** The details of the results in each item of labware. */
  labware: Array<ExtractResultLabware>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** The permeabilisation data for a particular slot address. */
export type PermData = {
  /** The address of a slot in its labware. */
  address: Scalars['Address']['input'];
  /** The number of seconds, if specified. */
  seconds?: InputMaybe<Scalars['Int']['input']>;
  /** The control type, if this is a control. */
  controlType?: InputMaybe<ControlType>;
  /** The barcode of the labware being put into this slot as a control, if there is one. */
  controlBarcode?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record permeabilisation data. */
export type RecordPermRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The data for each slot in the labware. */
  permData: Array<PermData>;
};

/** Permeabilisation data about a particular slot address. */
export type AddressPermData = {
  __typename?: 'AddressPermData';
  /** The slot address. */
  address: Scalars['Address']['output'];
  /** The number of seconds, if any. */
  seconds?: Maybe<Scalars['Int']['output']>;
  /** The control type, if this is a control. */
  controlType?: Maybe<ControlType>;
  /** Whether this result has been selected. */
  selected: Scalars['Boolean']['output'];
};

/** The permeabilisation data recorded for a particular piece of labware. */
export type VisiumPermData = {
  __typename?: 'VisiumPermData';
  /** The labware in question. */
  labware: LabwareFlagged;
  /** The permeabilisation data for each slot. */
  addressPermData: Array<AddressPermData>;
  /** The region of a sample in a particular slot referenced by the entries */
  samplePositionResults: Array<SamplePosition>;
};

/** Request to record visium analysis, selecting a permeabilisation time. */
export type VisiumAnalysisRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The address where the selected permeabilisation was recorded. */
  selectedAddress: Scalars['Address']['input'];
  /** The permeabilisation time that we want to select. */
  selectedTime: Scalars['Int']['input'];
};

/** A pass/fail result in a particular slot of some labware. */
export type SlotPassFail = {
  __typename?: 'SlotPassFail';
  /** The address of the slot in its labware. */
  address: Scalars['Address']['output'];
  /** The result. */
  result: PassFail;
  /** The comment, if any, recorded with the result. */
  comment?: Maybe<Scalars['String']['output']>;
};

/** An operation and the pass/fails in the slots of its labware. */
export type OpPassFail = {
  __typename?: 'OpPassFail';
  /** An operation with one destination labware. */
  operation: Operation;
  /** The pass fails in each address of the destination labware. */
  slotPassFails: Array<SlotPassFail>;
};

/** A piece of labware and an extract result, if any exists. */
export type ExtractResult = {
  __typename?: 'ExtractResult';
  /** The labware the result refers to. */
  labware: LabwareFlagged;
  /** The result, if any. */
  result?: Maybe<PassFail>;
  /** The concentration recorded, if any. */
  concentration?: Maybe<Scalars['String']['output']>;
};

/** A specification for recording a measurement. */
export type StringMeasurement = {
  /** The thing being measured. */
  name: Scalars['String']['input'];
  /** The value of the measurement. */
  value: Scalars['String']['input'];
};

/** An item of labware that RNA Analysis is being requested on. */
export type RnaAnalysisLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The id of a preset comment, if any, to associate with the analysis. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The measurements to record for this operation. */
  measurements: Array<StringMeasurement>;
};

/** A request to record an RNA analysis operation. */
export type RnaAnalysisRequest = {
  /** The name of the type of operation (a type RNA analsis). */
  operationType: Scalars['String']['input'];
  /** The details of what to record on one or more labware. */
  labware: Array<RnaAnalysisLabware>;
  /** The id of the equipment used in this operation. */
  equipmentId: Scalars['Int']['input'];
};

/** A measurement to be recorded in a particular slot of some item of labware. */
export type SlotMeasurementRequest = {
  /** The address of the slot. */
  address: Scalars['Address']['input'];
  /** The name of the measurement. */
  name: Scalars['String']['input'];
  /** The value of the measurement. */
  value: Scalars['String']['input'];
  /** An optional comment id. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
};

/** A request to record an operation in place with measurements in slots. */
export type OpWithSlotMeasurementsRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The name of the type of operation to record. */
  operationType: Scalars['String']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The measurements to record in individual slots. */
  slotMeasurements: Array<SlotMeasurementRequest>;
};

/** A specification of an item to be put into storage. */
export type StoreInput = {
  /** The barcode of the item to be stored. */
  barcode: Scalars['String']['input'];
  /** The address, if any, in a location where the item should be stored. */
  address?: InputMaybe<Scalars['Address']['input']>;
};

/** A request to transfer material from one source labware into multiple new destination labware (first slot). */
export type AliquotRequest = {
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** The barcode of the source labware. */
  barcode: Scalars['String']['input'];
  /** The name of the labware type for the destination labware. */
  labwareType: Scalars['String']['input'];
  /** The number of destination labware to create. */
  numLabware: Scalars['Int']['input'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
};

/** A slot in a reagent plate. */
export type ReagentSlot = {
  __typename?: 'ReagentSlot';
  address: Scalars['Address']['output'];
  used: Scalars['Boolean']['output'];
};

/** A plate of reagents. */
export type ReagentPlate = {
  __typename?: 'ReagentPlate';
  barcode: Scalars['String']['output'];
  slots: Array<ReagentSlot>;
  plateType?: Maybe<Scalars['String']['output']>;
};

/** The data about original tissues and their next replicate numbers. */
export type NextReplicateData = {
  __typename?: 'NextReplicateData';
  /** The source barcodes for the new replicates. */
  barcodes: Array<Scalars['String']['output']>;
  /** The id of the donor. */
  donorId: Scalars['Int']['output'];
  /** The id of the spatial location. */
  spatialLocationId: Scalars['Int']['output'];
  /** The next replicate number for this group. */
  nextReplicateNumber: Scalars['Int']['output'];
};

/** A group in a work summary. */
export type WorkSummaryGroup = {
  __typename?: 'WorkSummaryGroup';
  /** The work type of this group. */
  workType: WorkType;
  /** The work status of this group. */
  status: WorkStatus;
  /** The number of works in this group. */
  numWorks: Scalars['Int']['output'];
  /** The total number of blocks required as specified in these works. */
  totalNumBlocks: Scalars['Int']['output'];
  /** The total number of slides required as specified in these works. */
  totalNumSlides: Scalars['Int']['output'];
  /** The total number of original samples required as specified in these works. */
  totalNumOriginalSamples: Scalars['Int']['output'];
};

/** All data needed for a Work Summary. */
export type WorkSummaryData = {
  __typename?: 'WorkSummaryData';
  workSummaryGroups: Array<WorkSummaryGroup>;
  workTypes: Array<WorkType>;
};

/** A file uploaded to Stan. */
export type StanFile = {
  __typename?: 'StanFile';
  /** When this stanfile was uploaded. */
  created: Scalars['Timestamp']['output'];
  /** The work with which this file is associated. */
  work: Work;
  /** The user who uploaded the file. */
  user: User;
  /** The name of the file. */
  name: Scalars['String']['output'];
  /** The url to download the file. */
  url: Scalars['String']['output'];
};

/** A link between a labware barcode and a work number. */
export type SuggestedWork = {
  __typename?: 'SuggestedWork';
  /** The barcode of the labware. */
  barcode: Scalars['String']['output'];
  /** The work number of the suggested work, or null. */
  workNumber?: Maybe<Scalars['String']['output']>;
};

/** The response to a suggested work query. */
export type SuggestedWorkResponse = {
  __typename?: 'SuggestedWorkResponse';
  /** The work numbers for each barcode. Barcodes without suggested work will be omitted. */
  suggestedWorks: Array<SuggestedWork>;
  /** The works indicated. */
  works: Array<Work>;
};

/** An address and a string associated with that address. */
export type AddressString = {
  __typename?: 'AddressString';
  address: Scalars['Address']['output'];
  string: Scalars['String']['output'];
};

/** A specification that a particular reagent slot should be transferred to an address. */
export type ReagentTransfer = {
  /** The barcode of a reagent plate. */
  reagentPlateBarcode: Scalars['String']['input'];
  /** The address of a slot in the reagent plate. */
  reagentSlotAddress: Scalars['Address']['input'];
  /** The address if a slot in the destination labware. */
  destinationAddress: Scalars['Address']['input'];
};

/** A request to transfer reagents from reagent plates to a STAN labware. */
export type ReagentTransferRequest = {
  /** The name of the operation being performed. */
  operationType: Scalars['String']['input'];
  /** The work number to associate with the operation. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The barcode of the destination labware. */
  destinationBarcode: Scalars['String']['input'];
  /** The transfers from aliquot slots to destination slots. */
  transfers: Array<ReagentTransfer>;
  /** The type of reagent plate involved. */
  plateType: Scalars['String']['input'];
};

/** A request to record transfer, dual index and amplification ops. */
export type LibraryPrepRequest = {
  /** The work number to associate with these operations. */
  workNumber: Scalars['String']['input'];
  /** The source labware and new labware states for this request. */
  sources: Array<SlotCopySource>;
  /** The one destination labware for this request, and the description of what is transferred into it. */
  destination: SlotCopyDestination;
  /** The transfers from aliquot slots to destination slots. */
  reagentTransfers: Array<ReagentTransfer>;
  /** The type of reagent plate involved. */
  reagentPlateType?: InputMaybe<Scalars['String']['input']>;
  /** The measurement to record on slots in the destination. */
  slotMeasurements: Array<SlotMeasurementRequest>;
};

/** A request to process original tissue into blocks. */
export type TissueBlockRequest = {
  /** The work number associated with this request. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The labware (blocks) being created by this request. */
  labware: Array<TissueBlockLabware>;
  /** Which source barcodes (if any) to discard as part of this request. */
  discardSourceBarcodes?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** The input about a new block being created. */
export type TissueBlockLabware = {
  /** The original tissue barcode. */
  sourceBarcode: Scalars['String']['input'];
  /** The labware type for the new labware. */
  labwareType: Scalars['String']['input'];
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']['input']>;
  /** The comment (if any) associated with this operation. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
  /** The replicate number for the new block. */
  replicate: Scalars['String']['input'];
};

/** A request to transfer original sample into pots. */
export type PotProcessingRequest = {
  /** The source barcode. */
  sourceBarcode: Scalars['String']['input'];
  /** The work number. */
  workNumber: Scalars['String']['input'];
  /** The destinations that will be created. */
  destinations: Array<PotProcessingDestination>;
  /** Is the source labware discarded? */
  sourceDiscarded?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A destination for pot processing. */
export type PotProcessingDestination = {
  /** The name of the type of labware. */
  labwareType: Scalars['String']['input'];
  /** The fixative. */
  fixative: Scalars['String']['input'];
  /** Comment to record, if any. */
  commentId?: InputMaybe<Scalars['Int']['input']>;
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

export type AddExternalIdRequest = {
  /** The external identifier used to identify the tissue. */
  externalName: Scalars['String']['input'];
  /** The existing labware containing the tissue */
  labwareBarcode: Scalars['String']['input'];
};

/** A request to perform solution transfer. */
export type SolutionTransferRequest = {
  /** The work number for the operations. */
  workNumber: Scalars['String']['input'];
  /** The details of the labware in the request. */
  labware: Array<SolutionTransferLabware>;
};

/** A labware in a solution transfer request. */
export type SolutionTransferLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The name solution. */
  solution: Scalars['String']['input'];
};

/** A request to record paraffin processing. */
export type ParaffinProcessingRequest = {
  /** The work number. */
  workNumber: Scalars['String']['input'];
  /** The labware barcodes. */
  barcodes: Array<Scalars['String']['input']>;
  /** The comment ID. */
  commentId: Scalars['Int']['input'];
};

/** Request to record an operation on multiple labware in-place with comments on some slots. */
export type OpWithSlotCommentsRequest = {
  /** The name of the operation type to record. */
  operationType: Scalars['String']['input'];
  /** The work number. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** The details of the labware. */
  labware: Array<LabwareWithSlotCommentsRequest>;
};

/** Specification of comments in slots of a piece of labware. */
export type LabwareWithSlotCommentsRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The comments in slots of this labware. */
  addressComments: Array<AddressCommentInput>;
};

/** Request to record an operation with probe panels. */
export type ProbeOperationRequest = {
  /** The name of the type of operation. */
  operationType: Scalars['String']['input'];
  /** The time when the operation was performed, if specified. */
  performed?: InputMaybe<Scalars['Timestamp']['input']>;
  /** The labware involved in the operation. */
  labware: Array<ProbeOperationLabware>;
};

/** Labware in a probe operation request. */
export type ProbeOperationLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The work number of the operation on this labware. */
  workNumber: Scalars['String']['input'];
  /** The costing for the kit used on this labware. */
  kitCosting: SlideCosting;
  /** Reagent lot number. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
  /** The probes used on this labware. */
  probes: Array<ProbeLot>;
  /** The name of the spike probe, if used. */
  spike?: InputMaybe<Scalars['String']['input']>;
  /** Optional list of slot addresses to include in operation. */
  addresses?: InputMaybe<Array<Scalars['Address']['input']>>;
};

/** The probe used on a piece of labware in an operation. */
export type ProbeLot = {
  /** The name of the probe panel. */
  name: Scalars['String']['input'];
  /** The lot number of the probe. */
  lot: Scalars['String']['input'];
  /** The plex number. */
  plex?: InputMaybe<Scalars['Int']['input']>;
  /** The costing of the probe panel. */
  costing: SlideCosting;
};

/** Specifies a region of interest for a sample in a slot address. */
export type SampleRoi = {
  /** The address of the slot. */
  address: Scalars['Address']['input'];
  /** The id of the sample. */
  sampleId: Scalars['Int']['input'];
  /** The region of interest of the sample. */
  roi: Scalars['String']['input'];
};

/** The information about a particular item of labware in an analyser request. */
export type AnalyserLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The work number for the labware. */
  workNumber: Scalars['String']['input'];
  /** The cassette position for the labware. */
  position: CassettePosition;
  /** Decoding consumables lot number. */
  decodingConsumablesLot?: InputMaybe<Scalars['String']['input']>;
  /** The sample regions of interest in this labware. */
  samples: Array<SampleRoi>;
};

/** A request to record an analyser operation. */
export type AnalyserRequest = {
  /** The name of the operation type to record. */
  operationType: Scalars['String']['input'];
  /** The lot number for the decoding reagents A. */
  lotNumberA: Scalars['String']['input'];
  /** The lot number for the decoding reagents B. */
  lotNumberB: Scalars['String']['input'];
  /** The run name. */
  runName: Scalars['String']['input'];
  /** The time at which this operation was performed. */
  performed?: InputMaybe<Scalars['Timestamp']['input']>;
  /** The labware involved in this request. */
  labware: Array<AnalyserLabware>;
  /** The id of the equipment used in this operation. */
  equipmentId: Scalars['Int']['input'];
  /** The cell segmentation lot number. */
  cellSegmentationLot?: InputMaybe<Scalars['String']['input']>;
};

/** A region of interest for a sample in an operation. */
export type Roi = {
  __typename?: 'Roi';
  /** The id of the slot. */
  slotId: Scalars['Int']['output'];
  /** The address of the slot. */
  address: Scalars['Address']['output'];
  /** The sample in the ROI. */
  sample: Sample;
  /** The id of the operation in which the ROI was recorded. */
  operationId: Scalars['Int']['output'];
  /** The description of the region of interest. */
  roi: Scalars['String']['output'];
};

/** The regions of interest recorded in a particular labware. */
export type LabwareRoi = {
  __typename?: 'LabwareRoi';
  /** The barcode of the labware. */
  barcode: Scalars['String']['output'];
  /** The regions of interest recorded in the labware, if any. */
  rois: Array<Roi>;
};

/** Information to show when a user scans in labware for the analyser op. */
export type AnalyserScanData = {
  __typename?: 'AnalyserScanData';
  /** The barcode of the labware. */
  barcode: Scalars['String']['output'];
  /** The work numbers linked to the labware. */
  workNumbers: Array<Scalars['String']['output']>;
  /** The names of probes recorded on the labware. */
  probes: Array<Scalars['String']['output']>;
  /** Has cell segmentation been recorded? */
  cellSegmentationRecorded: Scalars['Boolean']['output'];
};

/** A comment on a particular sample in a particular slot. */
export type QcSampleComment = {
  /** The address of the slot. */
  address: Scalars['Address']['input'];
  /** The ID of the sample. */
  sampleId: Scalars['Int']['input'];
  /** The ID of the comment. */
  commentId: Scalars['Int']['input'];
};

/** Labware to be QC'd with comments and a completion time. */
export type QcLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The run-name to record. */
  runName?: InputMaybe<Scalars['String']['input']>;
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
  /** The time at which the process was completed. */
  completion?: InputMaybe<Scalars['Timestamp']['input']>;
  /** Zero or more comments applied to this labware in this operation. */
  comments: Array<Scalars['Int']['input']>;
  /** Zero or more comments on individual samples in particular slots. */
  sampleComments?: InputMaybe<Array<QcSampleComment>>;
};

/** Request to record QC and completion time for one or more labware. */
export type QcLabwareRequest = {
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** The specifications of labware to QC. */
  labware: Array<QcLabware>;
};

/** Raise a flag on a piece of labware. */
export type FlagLabwareRequest = {
  /** The barcodes of the flagged labware. */
  barcodes: Array<Scalars['String']['input']>;
  /** The description of the flag. */
  description: Scalars['String']['input'];
  /** Work number to link to the flag. */
  workNumber?: InputMaybe<Scalars['String']['input']>;
  /** Priority of the flag. */
  priority: FlagPriority;
};

/** Record the orientation state of labware. */
export type OrientationRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
  /** Is the orientation correct? */
  correct: Scalars['Boolean']['input'];
};

/** Request to undestroy/undiscard labware. */
export type ReactivateLabware = {
  /** The barcode of the labware to reactivate. */
  barcode: Scalars['String']['input'];
  /** The work number to associate with the reactivation. */
  workNumber: Scalars['String']['input'];
  /** The comment id to associate with the reactivation. */
  commentId: Scalars['Int']['input'];
};

/** Details about labware in a segmentation request. */
export type SegmentationLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
  /** The comment ids to link to the operation. */
  commentIds: Array<Scalars['Int']['input']>;
  /** The costing of the operation. */
  costing?: InputMaybe<SlideCosting>;
  /** The time with which the operation should be recorded. */
  performed?: InputMaybe<Scalars['Timestamp']['input']>;
  /** The reagent lot number. */
  reagentLot?: InputMaybe<Scalars['String']['input']>;
};

/** A request to record segmentation on one or more labware. */
export type SegmentationRequest = {
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** The details of the labware involved. */
  labware: Array<SegmentationLabware>;
};

/** A request to remove samples from particular slots in labware. */
export type CleanOutRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String']['input'];
  /** The addresses of the slots to clean out. */
  addresses: Array<Scalars['Address']['input']>;
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
};

/** A key and value about a region of interest. */
export type SampleMetric = {
  /** The region of interest for this metric. */
  roi: Scalars['String']['input'];
  /** The name of the metric. */
  name: Scalars['String']['input'];
  /** The value of the metric. */
  value: Scalars['String']['input'];
};

/** A request to save metrics. */
export type SampleMetricsRequest = {
  /** The name of the operation to record. */
  operationType: Scalars['String']['input'];
  /** The labware barcode. */
  barcode: Scalars['String']['input'];
  /** The work number to link to the operation. */
  workNumber: Scalars['String']['input'];
  /** The run name to link to the operation. */
  runName?: InputMaybe<Scalars['String']['input']>;
  /** The metrics to save. */
  metrics: Array<SampleMetric>;
};

/** A request to add a tissue type. */
export type AddTissueTypeRequest = {
  /** The name of the tissue type. */
  name: Scalars['String']['input'];
  /** The short code for the tissue type. */
  code: Scalars['String']['input'];
  /** The spatial locations for the new tissue type. */
  spatialLocations: Array<AddTissueTypeSpatialLocation>;
};

/** Request to add spatial locations to an existing tissue type. */
export type AddSpatialLocationsRequest = {
  /** The name of an existing tissue type. */
  name: Scalars['String']['input'];
  /** The new spatial locations. */
  spatialLocations: Array<AddTissueTypeSpatialLocation>;
};

/** A new spatial location for a particular tissue type. */
export type AddTissueTypeSpatialLocation = {
  /** The int code for the spatial location. */
  code: Scalars['Int']['input'];
  /** The name of the spatial location. */
  name: Scalars['String']['input'];
};

/** A request to alter the work linked to existing operations. */
export type OpWorkRequest = {
  /** The work number to link. */
  workNumber: Scalars['String']['input'];
  /** The IDs of the operations to update. */
  opIds: Array<Scalars['Int']['input']>;
};

/** Info about the app version. */
export type VersionInfo = {
  __typename?: 'VersionInfo';
  /** The output of git describe. */
  describe: Scalars['String']['output'];
  /** The latest commit id. */
  commit: Scalars['String']['output'];
  /** The version from the pom file. */
  version?: Maybe<Scalars['String']['output']>;
};

/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type Query = {
  __typename?: 'Query';
  /** Get the current logged in user. */
  user?: Maybe<User>;
  /** Get all the tissue types available. */
  tissueTypes: Array<TissueType>;
  /** Get all the labware types available. */
  labwareTypes: Array<LabwareType>;
  /** Get all the HMDMCs that are enabled, or get all including those that are disabled. */
  hmdmcs: Array<Hmdmc>;
  /** Get all bio risks that are enabled, or get all including those that are disabled. */
  bioRisks: Array<BioRisk>;
  /** Get all cellular classifications that are enabled, or get all including disabled. */
  cellClasses: Array<CellClass>;
  /** Get all the mediums available. */
  mediums: Array<Medium>;
  /** Get all the fixatives that are enabled, or get all including those that are disabled. */
  fixatives: Array<Fixative>;
  /** Get all the species that are enabled, or get all including those that are disabled. */
  species: Array<Species>;
  /** Get all probe panels of a particular type, optionally including the disabled. */
  probePanels: Array<ProbePanel>;
  /** Get the labware with the given barcode. */
  labware: Labware;
  /** Get the labware and check if it is flagged. */
  labwareFlagged: LabwareFlagged;
  /** Get all printers available, or get all printers that support a named label type. */
  printers: Array<Printer>;
  /** Get all enabled comments in a particular category, or all enabled in any category; optionally include disabled. */
  comments: Array<Comment>;
  /** Get all enabled equipments in a particular category, or all enabled in any category; optionally include disabled. */
  equipments: Array<Equipment>;
  /** Get all the release destinations that are enabled, or get all including those that are disabled. */
  releaseDestinations: Array<ReleaseDestination>;
  /** Get all the release recipients that are enabled, or get all including those that are disabled. */
  releaseRecipients: Array<ReleaseRecipient>;
  /** Get the available release file groups. */
  releaseColumnOptions: Array<ReleaseFileOption>;
  /** Get all the destruction reasons that are enabled, or get all including those that are disabled. */
  destructionReasons: Array<DestructionReason>;
  /** Get all the projects that are enabled, or get all including those that are disabled. */
  projects: Array<Project>;
  /** Get all programs that are enabled, or get all including those that are disabled. */
  programs: Array<Program>;
  /** Get all the cost codes that are enabled, or get all including those that are disabled. */
  costCodes: Array<CostCode>;
  /** Get all the DNAP studies that are enabled, or get all including those that are disabled. */
  dnapStudies: Array<DnapStudy>;
  /** Load the study with the given Sequencescape id (if it exists). */
  dnapStudy?: Maybe<DnapStudy>;
  /** Get all the solutions that are enabled, or get all including those that are disabled. */
  solutions: Array<Solution>;
  /** Get all the omero projects that are enabled, or including those that are disabled. */
  omeroProjects: Array<OmeroProject>;
  /** Get all the slot regions, optionally including those that are disabled. */
  slotRegions: Array<SlotRegion>;
  /** Gets the sample positions (if any) specified in a particular item of labware. */
  samplePositions: Array<SamplePosition>;
  /** Get all the work types that are enabled, or get all including those that are disabled. */
  workTypes: Array<WorkType>;
  /** Get all the works, or get all the works in the given specified statuses. */
  works: Array<Work>;
  /** Get the work with the specified work number. */
  work: Work;
  /** Get all work created by the specified user. */
  worksCreatedBy: Array<Work>;
  /** Get all the works with associated comment, or get all the ones in the given statuses. */
  worksWithComments: Array<WorkWithComment>;
  /** Get summary of works. */
  worksSummary: WorkSummaryData;
  /** Get all the users that are enabled, or get all including those that are disabled. */
  users: Array<User>;
  /** Find where labware is stored, given some criteria. */
  find: FindResult;
  /** Get the information about a planned operation previously recorded for a specific labware barcode. */
  planData: PlanData;
  /** Get the available stain types. */
  stainTypes: Array<StainType>;
  /** Get the reagent types for H&E staining. */
  stainReagentTypes: Array<Comment>;
  /** Operation types. */
  opTypes: Array<Scalars['String']['output']>;
  /** Event types. */
  eventTypes: Array<Scalars['String']['output']>;
  /** Get an item of labware and the visium permeabilisation data recorded on it, if any. */
  visiumPermData: VisiumPermData;
  /** Get a previously recorded extract result for a given labware barcode. */
  extractResult: ExtractResult;
  /** Get an operation and the pass/fail result recorded on it, for a given labware barcode and operation type name. */
  passFails: Array<OpPassFail>;
  /** List files linked to work numbers. */
  listFiles: Array<StanFile>;
  /** Get the existing costing (if any) for an item of labware. */
  labwareCosting?: Maybe<SlideCosting>;
  /** Look up the latest operation of some specified type whose destinations included a given labware barcode. */
  findLatestOp?: Maybe<Operation>;
  /** Get addresses of cleaned out slots in the specified labware.. */
  cleanedOutAddresses: Array<Scalars['Address']['output']>;
  /** Get the history containing a given sample id. */
  historyForSampleId: History;
  /** Get the history containing a tissue with the given external name. */
  historyForExternalName: History;
  /** Get the history for a specified donor. */
  historyForDonorName: History;
  /** Get the operation history for a specified work number. */
  historyForWorkNumber: History;
  /** Get the history containing a given labware barcode. */
  historyForLabwareBarcode: History;
  /** Get the history associated with a specified work number, and/or barcode, external name, donor name. */
  history: History;
  /** Get a graph of the indicated history. Zoom and fontSize are optional. */
  historyGraph: GraphSvg;
  /**
   * Get the work progress (some particular timestamps) associated with a specified work number, and/or
   * work types, programs, statuses.
   */
  workProgress: Array<WorkProgress>;
  /** Get a reagent plate, if it exists. May return null. */
  reagentPlate?: Maybe<ReagentPlate>;
  /** Get the next replicate data for the given source labware barcodes. */
  nextReplicateNumbers: Array<NextReplicateData>;
  /** Get operations into a given labware barcode of a given operation type. */
  labwareOperations?: Maybe<Array<Maybe<Operation>>>;
  /** Get suggested work (if any) for labware. By default, only returns active work. */
  suggestedWorkForLabware: SuggestedWorkResponse;
  /** Get suggested labware for work. */
  suggestedLabwareForWork: Array<Labware>;
  /** Get labware flag details applicable to the specified labware. */
  labwareFlagDetails: Array<FlagDetail>;
  /** Get named measurement values for each slot from the indicated labware or its parent labware. */
  measurementValueFromLabwareOrParent: Array<AddressString>;
  /** Get regions of interest in the indicated labware. */
  rois: Array<LabwareRoi>;
  /** Get regions of interest for the indicated labware and run name. */
  runRois: Array<Roi>;
  /** Data shown when scanning in labware for analyser op. */
  analyserScanData: AnalyserScanData;
  /** Run names recorded for the specified labware. */
  runNames: Array<Scalars['String']['output']>;
  /** Bio risk codes for samples in the specified labware. */
  labwareBioRiskCodes: Array<SampleBioRisk>;
  /** Reloads saved slot copy information. */
  reloadSlotCopy?: Maybe<SlotCopyLoad>;
  /** Get the specified storage location. */
  location: Location;
  /** Get the information about stored items with the given barcodes. */
  stored: Array<StoredItem>;
  /** Get the labware contained in a particular location. */
  labwareInLocation: Array<Labware>;
  /** Gets the parent hierarchy, from the root to the specified location. */
  storagePath: Array<LinkedLocation>;
  /** Gets info about the current version of the application. */
  version: VersionInfo;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHmdmcsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryBioRisksArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCellClassesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryFixativesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySpeciesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProbePanelsArgs = {
  type: ProbeType;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
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
export type QueryLabwareFlaggedArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryPrintersArgs = {
  labelType?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCommentsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryEquipmentsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseDestinationsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseRecipientsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDestructionReasonsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProjectsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProgramsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCostCodesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDnapStudiesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
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
export type QuerySolutionsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryOmeroProjectsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySlotRegionsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
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
export type QueryWorkTypesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorksArgs = {
  status?: InputMaybe<Array<WorkStatus>>;
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
export type QueryWorksCreatedByArgs = {
  username: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorksWithCommentsArgs = {
  status?: InputMaybe<Array<WorkStatus>>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryUsersArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
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
export type QueryPlanDataArgs = {
  barcode: Scalars['String']['input'];
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
export type QueryExtractResultArgs = {
  barcode: Scalars['String']['input'];
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
export type QueryListFilesArgs = {
  workNumbers: Array<Scalars['String']['input']>;
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
export type QueryFindLatestOpArgs = {
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
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
export type QueryHistoryForSampleIdArgs = {
  sampleId: Scalars['Int']['input'];
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
export type QueryHistoryForDonorNameArgs = {
  donorName: Scalars['String']['input'];
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
export type QueryHistoryForLabwareBarcodeArgs = {
  barcode: Scalars['String']['input'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryArgs = {
  workNumber?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  externalName?: InputMaybe<Array<Scalars['String']['input']>>;
  donorName?: InputMaybe<Array<Scalars['String']['input']>>;
  eventType?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryGraphArgs = {
  workNumber?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  externalName?: InputMaybe<Array<Scalars['String']['input']>>;
  donorName?: InputMaybe<Array<Scalars['String']['input']>>;
  zoom?: InputMaybe<Scalars['Float']['input']>;
  fontSize?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorkProgressArgs = {
  workNumber?: InputMaybe<Scalars['String']['input']>;
  workTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  programs?: InputMaybe<Array<Scalars['String']['input']>>;
  statuses?: InputMaybe<Array<WorkStatus>>;
  requesters?: InputMaybe<Array<Scalars['String']['input']>>;
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
export type QueryNextReplicateNumbersArgs = {
  barcodes: Array<Scalars['String']['input']>;
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
export type QuerySuggestedWorkForLabwareArgs = {
  barcodes: Array<Scalars['String']['input']>;
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySuggestedLabwareForWorkArgs = {
  workNumber: Scalars['String']['input'];
  forRelease?: InputMaybe<Scalars['Boolean']['input']>;
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
export type QueryMeasurementValueFromLabwareOrParentArgs = {
  barcode: Scalars['String']['input'];
  name: Scalars['String']['input'];
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
export type QueryRunRoisArgs = {
  barcode: Scalars['String']['input'];
  run: Scalars['String']['input'];
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
export type QueryRunNamesArgs = {
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
export type QueryReloadSlotCopyArgs = {
  operationType: Scalars['String']['input'];
  workNumber: Scalars['String']['input'];
  lpNumber: Scalars['String']['input'];
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
export type QueryStoredArgs = {
  barcodes: Array<Scalars['String']['input']>;
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
export type QueryStoragePathArgs = {
  locationBarcode: Scalars['String']['input'];
};

/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type Mutation = {
  __typename?: 'Mutation';
  /** Log in with your Sanger id and create an end user account. */
  registerAsEndUser: LoginResult;
  /** Log in with the given credentials. */
  login: LoginResult;
  /** Log out; end the current login session. */
  logout?: Maybe<Scalars['String']['output']>;
  /** Register blocks of tissue. */
  register: RegisterResult;
  /** Register sections of tissue. */
  registerSections: RegisterResult;
  /** Record planned operations. */
  plan: PlanResult;
  /** Print the specified labware barcodes on the specified printer. */
  printLabware?: Maybe<Scalars['String']['output']>;
  /** Confirm operations previously planned. */
  confirmOperation: ConfirmOperationResult;
  /** Confirm sections previously planned. */
  confirmSection: OperationResult;
  /** Release some labware. */
  release: ReleaseResult;
  /** Record extract operations. */
  extract: OperationResult;
  /** Destroy some labware. */
  destroy: DestroyResult;
  /** Record an operation copying slots from multiple source labware into various slots of one destination labware. */
  slotCopy: OperationResult;
  /** Create a new comment that users can select to link to future operations. */
  addComment: Comment;
  /** Enable or disable a preset comment. */
  setCommentEnabled: Comment;
  /** Create a new piece of equipment that users can record using in future operations. */
  addEquipment: Equipment;
  /** Rename existing equipment. */
  renameEquipment: Equipment;
  /** Enable or disable a piece of equipment. */
  setEquipmentEnabled: Equipment;
  /** Create a new reason that users can record when destroying labware. */
  addDestructionReason: DestructionReason;
  /** Enable or disable a destruction reason. */
  setDestructionReasonEnabled: DestructionReason;
  /** Create a new HMDMC that can be used when registering new tissue. */
  addHmdmc: Hmdmc;
  /** Enable or disable an HMDMC. */
  setHmdmcEnabled: Hmdmc;
  /** Create a new Bio Risk. */
  addBioRisk: BioRisk;
  /** Enable or disable a Bio Risk. */
  setBioRiskEnabled: BioRisk;
  /** Create a new release destination that can be associated with labware releases. */
  addReleaseDestination: ReleaseDestination;
  /** Enable or disable a release destination. */
  setReleaseDestinationEnabled: ReleaseDestination;
  /** Create a new release recipient that can be associated with labware releases. */
  addReleaseRecipient: ReleaseRecipient;
  /** Update a release recipient fullName. */
  updateReleaseRecipientFullName: ReleaseRecipient;
  /** Enable or disable a release recipient. */
  setReleaseRecipientEnabled: ReleaseRecipient;
  /** Create a new species that can be associated with donors in tissue registration. */
  addSpecies: Species;
  /** Enable or disable a species. */
  setSpeciesEnabled: Species;
  /** Create a new project that can be associated with work. */
  addProject: Project;
  /** Enable or disable a project. */
  setProjectEnabled: Project;
  /** Create a new program that can be associated with work. */
  addProgram: Program;
  /** Enable or disable a program. */
  setProgramEnabled: Program;
  /** Create a new cost code that can be associated with work. */
  addCostCode: CostCode;
  /** Enable or disable a cost code. */
  setCostCodeEnabled: CostCode;
  /** Create a new fixative that can be selected when registering tissue. */
  addFixative: Fixative;
  /** Enable or disable a fixative. */
  setFixativeEnabled: Fixative;
  /** Create a new work type. */
  addWorkType: WorkType;
  /** Enable or disable a work type. */
  setWorkTypeEnabled: WorkType;
  /** Add a new solution. */
  addSolution: Solution;
  /** Enable or disable a solution. */
  setSolutionEnabled: Solution;
  /** Add a new omero project. */
  addOmeroProject: OmeroProject;
  /** Enable or disable an omero project. */
  setOmeroProjectEnabled: OmeroProject;
  /** Add a new slot region. */
  addSlotRegion: SlotRegion;
  /** Enable or disable a slot region. */
  setSlotRegionEnabled: SlotRegion;
  /** Add a new probe panel. */
  addProbePanel: ProbePanel;
  /** Enable or disable a probe panel. */
  setProbePanelEnabled: ProbePanel;
  /** Add a new cellular classification. */
  addCellClass: CellClass;
  /** Enable or disable a cellular classification. */
  setCellClassEnabled: CellClass;
  /** Create a new work, which will be allocated a new work number with the given prefix. */
  createWork: Work;
  /** Update the status of an existing work. */
  updateWorkStatus: WorkWithComment;
  /** Update the number of blocks field in a work. */
  updateWorkNumBlocks: Work;
  /** Update the number of slides field in a work. */
  updateWorkNumSlides: Work;
  /** Update the number of original samples field in a work. */
  updateWorkNumOriginalSamples: Work;
  /** Update the priority of a work. */
  updateWorkPriority: Work;
  /** Update the omero project of a work. */
  updateWorkOmeroProject: Work;
  /** Update the DNAP study of a work. */
  updateWorkDnapStudy: Work;
  /** Updates Stan's internal list of Dnap Studies, and returns the enabled ones. */
  updateDnapStudies: Array<DnapStudy>;
  /** Add a new tissue type. */
  addTissueType: TissueType;
  /** Add spatial location to an existing tissue type. */
  addSpatialLocations: TissueType;
  /** Record a new stain with time measurements. */
  stain: OperationResult;
  /** Record an operation in place. */
  recordInPlace: OperationResult;
  /** Unrelease some previously released labware. */
  unrelease: OperationResult;
  /** Record the result of a stain. */
  recordStainResult: OperationResult;
  /** Record the result of an extract. */
  recordExtractResult: OperationResult;
  /** Record permeabilisation. */
  recordPerm: OperationResult;
  /** Record Visium Analysis. */
  visiumAnalysis: OperationResult;
  /** Record RNA Analysis. */
  recordRNAAnalysis: OperationResult;
  /** Record Visium QC. */
  recordVisiumQC: OperationResult;
  /** Record an operation with measurements in slots. */
  recordOpWithSlotMeasurements: OperationResult;
  /** Record a stain operation with plex and bond information. */
  recordComplexStain: OperationResult;
  /** Transfer samples from one labware into multiple labware. */
  aliquot: OperationResult;
  /** Record an operation transferring reagents from a reagent plate to an item of Stan labware. */
  reagentTransfer: OperationResult;
  /** Register original samples. */
  registerOriginalSamples: RegisterResult;
  /** Process tissue into blocks. */
  performTissueBlock: OperationResult;
  /** Process an original sample into pots. */
  performPotProcessing: OperationResult;
  /** Record ops to add sample processing comments. */
  recordSampleProcessingComments: OperationResult;
  /** Add solutions to labware. */
  performSolutionTransfer: OperationResult;
  /** Perform paraffin processing. */
  performParaffinProcessing: OperationResult;
  /** Record an operation adding a external ID to a sample. */
  addExternalID: OperationResult;
  /** Record an operation in-place with comments on slots. */
  recordOpWithSlotComments: OperationResult;
  /** Record an operation involving probe panels. */
  recordProbeOperation: OperationResult;
  /** Record a process being completed. */
  recordCompletion: OperationResult;
  /** Record analyser operation. */
  recordAnalyser: OperationResult;
  /** Flag labware. */
  flagLabware: OperationResult;
  /** Record QC labware request. */
  recordQCLabware: OperationResult;
  /** Record Orientation QC. */
  recordOrientationQC: OperationResult;
  /** Reactivate labware. */
  reactivateLabware: OperationResult;
  /** Perform library prep request. */
  libraryPrep: OperationResult;
  /** Record segmentation. */
  segmentation: OperationResult;
  /** Clean out a slot of a labware. */
  cleanOut: OperationResult;
  /** Record metrics. */
  recordSampleMetrics: OperationResult;
  /** Save slot copy information for a future operation. */
  saveSlotCopy: SlotCopyLoad;
  /** Link a work number to prior operations. */
  setOperationWork: Array<Operation>;
  /** Create a new user for the application. */
  addUser: User;
  /** Set the user role (privileges) for a user. */
  setUserRole: User;
  /** Store an item in a particular location, optionally with an address. */
  storeBarcode: StoredItem;
  /** Store multiple items in a particular location, with optional addresses. */
  store: Location;
  /** Remove a specified item from storage. */
  unstoreBarcode?: Maybe<UnstoredItem>;
  /** Empty a specified location of its stored items. */
  empty: UnstoreResult;
  /** Transfer labware from one storage location to another. */
  transfer: Location;
  /** Set the custom name of a specified location. */
  setLocationCustomName: Location;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterAsEndUserArgs = {
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationLoginArgs = {
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterArgs = {
  request: RegisterRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationRegisterSectionsArgs = {
  request?: InputMaybe<SectionRegisterRequest>;
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
  printer: Scalars['String']['input'];
  barcodes: Array<Scalars['String']['input']>;
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
export type MutationReleaseArgs = {
  request: ReleaseRequest;
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
export type MutationDestroyArgs = {
  request: DestroyRequest;
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
export type MutationAddCommentArgs = {
  category: Scalars['String']['input'];
  text: Scalars['String']['input'];
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
export type MutationAddEquipmentArgs = {
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
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
export type MutationSetEquipmentEnabledArgs = {
  equipmentId: Scalars['Int']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetDestructionReasonEnabledArgs = {
  text: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetHmdmcEnabledArgs = {
  hmdmc: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetBioRiskEnabledArgs = {
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetReleaseDestinationEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddReleaseRecipientArgs = {
  username: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateReleaseRecipientFullNameArgs = {
  username: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetReleaseRecipientEnabledArgs = {
  username: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetSpeciesEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetProjectEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetProgramEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetCostCodeEnabledArgs = {
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetFixativeEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetWorkTypeEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetSolutionEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetOmeroProjectEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetSlotRegionEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProbePanelArgs = {
  type: ProbeType;
  name: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProbePanelEnabledArgs = {
  type: ProbeType;
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
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
export type MutationSetCellClassEnabledArgs = {
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationCreateWorkArgs = {
  prefix: Scalars['String']['input'];
  workType: Scalars['String']['input'];
  workRequester: Scalars['String']['input'];
  project: Scalars['String']['input'];
  program: Scalars['String']['input'];
  costCode: Scalars['String']['input'];
  numBlocks?: InputMaybe<Scalars['Int']['input']>;
  numSlides?: InputMaybe<Scalars['Int']['input']>;
  numOriginalSamples?: InputMaybe<Scalars['Int']['input']>;
  omeroProject?: InputMaybe<Scalars['String']['input']>;
  ssStudyId?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkStatusArgs = {
  workNumber: Scalars['String']['input'];
  status: WorkStatus;
  commentId?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumBlocksArgs = {
  workNumber: Scalars['String']['input'];
  numBlocks?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumSlidesArgs = {
  workNumber: Scalars['String']['input'];
  numSlides?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumOriginalSamplesArgs = {
  workNumber: Scalars['String']['input'];
  numOriginalSamples?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkPriorityArgs = {
  workNumber: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkOmeroProjectArgs = {
  workNumber: Scalars['String']['input'];
  omeroProject?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkDnapStudyArgs = {
  workNumber: Scalars['String']['input'];
  ssStudyId?: InputMaybe<Scalars['Int']['input']>;
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
export type MutationAddSpatialLocationsArgs = {
  request: AddSpatialLocationsRequest;
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
export type MutationRecordInPlaceArgs = {
  request: InPlaceOpRequest;
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
export type MutationRecordStainResultArgs = {
  request: ResultRequest;
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
export type MutationRecordPermArgs = {
  request: RecordPermRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationVisiumAnalysisArgs = {
  request: VisiumAnalysisRequest;
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
export type MutationRecordVisiumQcArgs = {
  request: ResultRequest;
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
export type MutationRecordComplexStainArgs = {
  request: ComplexStainRequest;
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
export type MutationReagentTransferArgs = {
  request: ReagentTransferRequest;
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
export type MutationPerformTissueBlockArgs = {
  request: TissueBlockRequest;
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
export type MutationRecordSampleProcessingCommentsArgs = {
  request: SampleProcessingCommentRequest;
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
export type MutationPerformParaffinProcessingArgs = {
  request: ParaffinProcessingRequest;
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
export type MutationRecordOpWithSlotCommentsArgs = {
  request: OpWithSlotCommentsRequest;
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
export type MutationRecordCompletionArgs = {
  request: CompletionRequest;
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
export type MutationFlagLabwareArgs = {
  request: FlagLabwareRequest;
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
export type MutationRecordOrientationQcArgs = {
  request: OrientationRequest;
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
export type MutationLibraryPrepArgs = {
  request: LibraryPrepRequest;
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
export type MutationCleanOutArgs = {
  request: CleanOutRequest;
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
export type MutationSaveSlotCopyArgs = {
  request: SlotCopySave;
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
export type MutationAddUserArgs = {
  username: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetUserRoleArgs = {
  username: Scalars['String']['input'];
  role: UserRole;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStoreBarcodeArgs = {
  barcode: Scalars['String']['input'];
  locationBarcode: Scalars['String']['input'];
  address?: InputMaybe<Scalars['Address']['input']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStoreArgs = {
  store: Array<StoreInput>;
  locationBarcode: Scalars['String']['input'];
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
export type MutationEmptyArgs = {
  locationBarcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationTransferArgs = {
  sourceBarcode: Scalars['String']['input'];
  destinationBarcode: Scalars['String']['input'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetLocationCustomNameArgs = {
  locationBarcode: Scalars['String']['input'];
  customName?: InputMaybe<Scalars['String']['input']>;
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', username: string, role: UserRole } | null };

export type FindQueryVariables = Exact<{
  request: FindRequest;
}>;


export type FindQuery = { __typename?: 'Query', find: { __typename?: 'FindResult', numRecords: number, entries: Array<{ __typename?: 'FindEntry', labwareId: number, sampleId: number, workNumbers: Array<string | null> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', replicate?: string | null, externalName?: string | null, spatialLocation: { __typename?: 'SpatialLocation', tissueType: { __typename?: 'TissueType', name: string } }, donor: { __typename?: 'Donor', donorName: string }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string } } }>, labware: Array<{ __typename?: 'Labware', id: number, barcode: string, created: string, labwareType: { __typename?: 'LabwareType', name: string } }>, locations: Array<{ __typename?: 'Location', id: number, barcode: string, customName?: string | null, fixedName?: string | null, direction?: GridDirection | null, qualifiedNameWithFirstBarcode?: string | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null }>, labwareLocations: Array<{ __typename?: 'LabwareLocationEntry', labwareId: number, locationId: number, address?: string | null }> } };

export type FindFilesQueryVariables = Exact<{
  workNumbers: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type FindFilesQuery = { __typename?: 'Query', listFiles: Array<{ __typename?: 'StanFile', created: string, name: string, url: string, work: { __typename?: 'Work', workNumber: string } }> };

export type FindHistoryQueryVariables = Exact<{
  workNumber?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  donorName?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  externalName?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  eventType?: InputMaybe<Scalars['String']['input']>;
}>;


export type FindHistoryQuery = { __typename?: 'Query', history: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> } };

export type FindFlaggedLabwareQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindFlaggedLabwareQuery = { __typename?: 'Query', labwareFlagged: { __typename?: 'LabwareFlagged', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority?: FlagPriority | null, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> } };

export type FindHistoryForExternalNameQueryVariables = Exact<{
  externalName: Scalars['String']['input'];
}>;


export type FindHistoryForExternalNameQuery = { __typename?: 'Query', historyForExternalName: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForDonorNameQueryVariables = Exact<{
  donorName: Scalars['String']['input'];
}>;


export type FindHistoryForDonorNameQuery = { __typename?: 'Query', historyForDonorName: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForLabwareBarcodeQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindHistoryForLabwareBarcodeQuery = { __typename?: 'Query', historyForLabwareBarcode: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> } };

export type FindLabwareLocationQueryVariables = Exact<{
  barcodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type FindLabwareLocationQuery = { __typename?: 'Query', stored: Array<{ __typename?: 'StoredItem', location: { __typename?: 'Location', barcode: string } }> };

export type FindLabwareQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindLabwareQuery = { __typename?: 'Query', labware: { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> } };

export type FindHistoryForSampleIdQueryVariables = Exact<{
  sampleId: Scalars['Int']['input'];
}>;


export type FindHistoryForSampleIdQuery = { __typename?: 'Query', historyForSampleId: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> } };

export type FindHistoryForWorkNumberQueryVariables = Exact<{
  workNumber: Scalars['String']['input'];
}>;


export type FindHistoryForWorkNumberQuery = { __typename?: 'Query', historyForWorkNumber: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> } };

export type FindLocationByBarcodeQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindLocationByBarcodeQuery = { __typename?: 'Query', location: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, numStored: number, leaf: boolean, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> } };

export type FindHistoryGraphQueryVariables = Exact<{
  workNumber?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  donorName?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  externalName?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  zoom?: InputMaybe<Scalars['Float']['input']>;
  fontSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FindHistoryGraphQuery = { __typename?: 'Query', historyGraph: { __typename?: 'GraphSVG', svg: string } };

export type ExtractResultQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type ExtractResultQuery = { __typename?: 'Query', extractResult: { __typename?: 'ExtractResult', result?: PassFail | null, concentration?: string | null, labware: { __typename?: 'LabwareFlagged', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority?: FlagPriority | null, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> } } };

export type FindReagentPlateQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindReagentPlateQuery = { __typename?: 'Query', reagentPlate?: { __typename?: 'ReagentPlate', barcode: string, plateType?: string | null, slots: Array<{ __typename?: 'ReagentSlot', address: string, used: boolean }> } | null };

export type FindSamplePositionsQueryVariables = Exact<{
  labwareBarcode: Scalars['String']['input'];
}>;


export type FindSamplePositionsQuery = { __typename?: 'Query', samplePositions: Array<{ __typename?: 'SamplePosition', address: string, region: string, sampleId: number, slotId: number, operationId: number }> };

export type FindMeasurementByBarcodeAndNameQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
  measurementName: Scalars['String']['input'];
}>;


export type FindMeasurementByBarcodeAndNameQuery = { __typename?: 'Query', measurementValueFromLabwareOrParent: Array<{ __typename?: 'AddressString', address: string, string: string }> };

export type FindPlanDataQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindPlanDataQuery = { __typename?: 'Query', planData: { __typename?: 'PlanData', sources: Array<{ __typename?: 'LabwareFlagged', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority?: FlagPriority | null, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, destination: { __typename?: 'LabwareFlagged', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority?: FlagPriority | null, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }, plan: { __typename?: 'PlanOperation', operationType?: { __typename?: 'OperationType', name: string } | null, planActions: Array<{ __typename?: 'PlanAction', newSection?: number | null, sampleThickness?: string | null, sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> } } };

export type FindStoragePathQueryVariables = Exact<{
  locationBarcode: Scalars['String']['input'];
}>;


export type FindStoragePathQuery = { __typename?: 'Query', storagePath: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> };

export type FindWorkNumbersQueryVariables = Exact<{
  status: WorkStatus;
}>;


export type FindWorkNumbersQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string }> };

export type FindLatestOperationQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
}>;


export type FindLatestOperationQuery = { __typename?: 'Query', findLatestOp?: { __typename?: 'Operation', id: number } | null };

export type FindWorkInfoQueryVariables = Exact<{
  status: WorkStatus;
}>;


export type FindWorkInfoQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string, workRequester?: { __typename?: 'ReleaseRecipient', username: string } | null, project: { __typename?: 'Project', name: string } }> };

export type FindWorkProgressQueryVariables = Exact<{
  workNumber?: InputMaybe<Scalars['String']['input']>;
  workTypes?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  programs?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  statuses?: InputMaybe<Array<WorkStatus> | WorkStatus>;
  requesters?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type FindWorkProgressQuery = { __typename?: 'Query', workProgress: Array<{ __typename?: 'WorkProgress', mostRecentOperation?: string | null, workComment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null }, timestamps: Array<{ __typename?: 'WorkProgressTimestamp', type: string, timestamp: string }> }> };

export type FindWorksCreatedByQueryVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type FindWorksCreatedByQuery = { __typename?: 'Query', worksCreatedBy: Array<{ __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null }> };

export type FindPassFailsQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
}>;


export type FindPassFailsQuery = { __typename?: 'Query', passFails: Array<{ __typename?: 'OpPassFail', operation: { __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } }, slotPassFails: Array<{ __typename?: 'SlotPassFail', address: string, result: PassFail, comment?: string | null }> }> };

export type GetAllWorkInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWorkInfoQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string, status: WorkStatus, workRequester?: { __typename?: 'ReleaseRecipient', username: string } | null, project: { __typename?: 'Project', name: string } }> };

export type GetCommentsQueryVariables = Exact<{
  commentCategory?: InputMaybe<Scalars['String']['input']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetBioRisksQueryVariables = Exact<{
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetBioRisksQuery = { __typename?: 'Query', bioRisks: Array<{ __typename?: 'BioRisk', code: string, enabled: boolean }> };

export type GetBlockProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlockProcessingInfoQuery = { __typename?: 'Query', mediums: Array<{ __typename?: 'Medium', name: string }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }> };

export type FindPermDataQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type FindPermDataQuery = { __typename?: 'Query', visiumPermData: { __typename?: 'VisiumPermData', labware: { __typename?: 'LabwareFlagged', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority?: FlagPriority | null, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }, addressPermData: Array<{ __typename?: 'AddressPermData', address: string, controlType?: ControlType | null, seconds?: number | null, selected: boolean }>, samplePositionResults: Array<{ __typename?: 'SamplePosition', address: string, region: string, sampleId: number, slotId: number, operationId: number }> } };

export type GetDestroyInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDestroyInfoQuery = { __typename?: 'Query', destructionReasons: Array<{ __typename?: 'DestructionReason', id: number, text: string, enabled: boolean }> };

export type GetCellClassesQueryVariables = Exact<{
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetCellClassesQuery = { __typename?: 'Query', cellClasses: Array<{ __typename?: 'CellClass', name: string, enabled: boolean }> };

export type GetAnalyserScanDataQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type GetAnalyserScanDataQuery = { __typename?: 'Query', analyserScanData: { __typename?: 'AnalyserScanData', workNumbers: Array<string>, probes: Array<string>, cellSegmentationRecorded: boolean } };

export type GetDestructionReasonsQueryVariables = Exact<{
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetDestructionReasonsQuery = { __typename?: 'Query', destructionReasons: Array<{ __typename?: 'DestructionReason', id: number, text: string, enabled: boolean }> };

export type GetConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigurationQuery = { __typename?: 'Query', destructionReasons: Array<{ __typename?: 'DestructionReason', id: number, text: string, enabled: boolean }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, hmdmcs: Array<{ __typename?: 'Hmdmc', hmdmc: string, enabled: boolean }>, species: Array<{ __typename?: 'Species', name: string, enabled: boolean }>, fixatives: Array<{ __typename?: 'Fixative', name: string, enabled: boolean }>, releaseDestinations: Array<{ __typename?: 'ReleaseDestination', name: string, enabled: boolean }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean }>, projects: Array<{ __typename?: 'Project', name: string, enabled: boolean }>, costCodes: Array<{ __typename?: 'CostCode', code: string, enabled: boolean }>, workTypes: Array<{ __typename?: 'WorkType', name: string, enabled: boolean }>, equipments: Array<{ __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean }>, users: Array<{ __typename?: 'User', username: string, role: UserRole }>, solutions: Array<{ __typename?: 'Solution', name: string, enabled: boolean }>, xeniumProbePanels: Array<{ __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType }>, cytassistProbePanels: Array<{ __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType }>, spikeProbePanels: Array<{ __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType }>, programs: Array<{ __typename?: 'Program', name: string, enabled: boolean }>, omeroProjects: Array<{ __typename?: 'OmeroProject', name: string, enabled: boolean }>, dnapStudies: Array<{ __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean }>, bioRisks: Array<{ __typename?: 'BioRisk', code: string, enabled: boolean }>, tissueTypes: Array<{ __typename?: 'TissueType', name: string, code: string, spatialLocations: Array<{ __typename?: 'SpatialLocation', code: number, name: string }> }>, cellClasses: Array<{ __typename?: 'CellClass', name: string, enabled: boolean }> };

export type GetCleanedOutAddressesQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type GetCleanedOutAddressesQuery = { __typename?: 'Query', cleanedOutAddresses: Array<string> };

export type GetLabwareCostingQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type GetLabwareCostingQuery = { __typename?: 'Query', labwareCosting?: SlideCosting | null };

export type GetEquipmentsQueryVariables = Exact<{
  category?: InputMaybe<Scalars['String']['input']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetEquipmentsQuery = { __typename?: 'Query', equipments: Array<{ __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean }> };

export type GetDnapStudyQueryVariables = Exact<{
  ssId: Scalars['Int']['input'];
}>;


export type GetDnapStudyQuery = { __typename?: 'Query', dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null };

export type GetLabwareInLocationQueryVariables = Exact<{
  locationBarcode: Scalars['String']['input'];
}>;


export type GetLabwareInLocationQuery = { __typename?: 'Query', labwareInLocation: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> };

export type GetParaffinProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetParaffinProcessingInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetLabwareOperationsQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
  operationType: Scalars['String']['input'];
}>;


export type GetLabwareOperationsQuery = { __typename?: 'Query', labwareOperations?: Array<{ __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } } | null> | null };

export type GetEventTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventTypesQuery = { __typename?: 'Query', eventTypes: Array<string> };

export type GetOmeroProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOmeroProjectsQuery = { __typename?: 'Query', omeroProjects: Array<{ __typename?: 'OmeroProject', name: string, enabled: boolean }> };

export type GetNextReplicateNumberQueryVariables = Exact<{
  barcodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetNextReplicateNumberQuery = { __typename?: 'Query', nextReplicateNumbers: Array<{ __typename?: 'NextReplicateData', barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number }> };

export type GetProbePanelsQueryVariables = Exact<{
  type: ProbeType;
}>;


export type GetProbePanelsQuery = { __typename?: 'Query', probePanels: Array<{ __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType }> };

export type GetLabwareBioRiskCodesQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type GetLabwareBioRiskCodesQuery = { __typename?: 'Query', labwareBioRiskCodes: Array<{ __typename?: 'SampleBioRisk', sampleId: number, bioRiskCode: string }> };

export type GetPrintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrintersQuery = { __typename?: 'Query', printers: Array<{ __typename?: 'Printer', name: string, labelTypes: Array<{ __typename?: 'LabelType', name: string }> }> };

export type GetPotProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPotProcessingInfoQuery = { __typename?: 'Query', fixatives: Array<{ __typename?: 'Fixative', name: string }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }> };

export type GetLabwareFlagDetailsQueryVariables = Exact<{
  barcodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetLabwareFlagDetailsQuery = { __typename?: 'Query', labwareFlagDetails: Array<{ __typename?: 'FlagDetail', barcode: string, flags: Array<{ __typename?: 'FlagSummary', barcode: string, priority: FlagPriority, description: string }> }> };

export type GetProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQuery = { __typename?: 'Query', programs: Array<{ __typename?: 'Program', name: string, enabled: boolean }> };

export type GetOperationTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOperationTypesQuery = { __typename?: 'Query', opTypes: Array<string> };

export type GetRecordExtractResultInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecordExtractResultInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetRecordInPlaceInfoQueryVariables = Exact<{
  category?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetRecordInPlaceInfoQuery = { __typename?: 'Query', equipments: Array<{ __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean }> };

export type GetReleaseColumnOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReleaseColumnOptionsQuery = { __typename?: 'Query', releaseColumnOptions: Array<{ __typename?: 'ReleaseFileOption', displayName: string, queryParamName: string }> };

export type GetRegistrationInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegistrationInfoQuery = { __typename?: 'Query', species: Array<{ __typename?: 'Species', name: string }>, hmdmcs: Array<{ __typename?: 'Hmdmc', hmdmc: string }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }>, tissueTypes: Array<{ __typename?: 'TissueType', name: string, spatialLocations: Array<{ __typename?: 'SpatialLocation', name: string, code: number }> }>, fixatives: Array<{ __typename?: 'Fixative', name: string }>, mediums: Array<{ __typename?: 'Medium', name: string }>, solutions: Array<{ __typename?: 'Solution', name: string }>, slotRegions: Array<{ __typename?: 'SlotRegion', name: string }>, bioRisks: Array<{ __typename?: 'BioRisk', code: string }>, cellClasses: Array<{ __typename?: 'CellClass', name: string }> };

export type GetRunNamesQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type GetRunNamesQuery = { __typename?: 'Query', runNames: Array<string> };

export type GetSampleProcessingCommentsInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSampleProcessingCommentsInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetRegionsOfInterestQueryVariables = Exact<{
  barcodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetRegionsOfInterestQuery = { __typename?: 'Query', rois: Array<{ __typename?: 'LabwareRoi', barcode: string, rois: Array<{ __typename?: 'Roi', address: string, roi: string, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }> }> };

export type GetSectioningConfirmInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningConfirmInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, slotRegions: Array<{ __typename?: 'SlotRegion', enabled: boolean, name: string }> };

export type GetReleaseInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReleaseInfoQuery = { __typename?: 'Query', releaseDestinations: Array<{ __typename?: 'ReleaseDestination', name: string, enabled: boolean }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean }>, releaseColumnOptions: Array<{ __typename?: 'ReleaseFileOption', displayName: string, queryParamName: string }> };

export type GetSectioningInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningInfoQuery = { __typename?: 'Query', labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }> };

export type GetSolutionTransferInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSolutionTransferInfoQuery = { __typename?: 'Query', solutions: Array<{ __typename?: 'Solution', name: string }> };

export type GetSlotRegionsQueryVariables = Exact<{
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetSlotRegionsQuery = { __typename?: 'Query', slotRegions: Array<{ __typename?: 'SlotRegion', name: string, enabled: boolean }> };

export type GetStainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainInfoQuery = { __typename?: 'Query', stainTypes: Array<{ __typename?: 'StainType', name: string, measurementTypes: Array<string> }> };

export type GetSuggestedWorkForLabwareQueryVariables = Exact<{
  barcodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetSuggestedWorkForLabwareQuery = { __typename?: 'Query', suggestedWorkForLabware: { __typename?: 'SuggestedWorkResponse', suggestedWorks: Array<{ __typename?: 'SuggestedWork', barcode: string, workNumber?: string | null }> } };

export type GetSuggestedLabwareForWorkQueryVariables = Exact<{
  workNumber: Scalars['String']['input'];
  forRelease?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetSuggestedLabwareForWorkQuery = { __typename?: 'Query', suggestedLabwareForWork: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> };

export type GetStainingQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainingQcInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetRunRoisQueryVariables = Exact<{
  barcode: Scalars['String']['input'];
  run: Scalars['String']['input'];
}>;


export type GetRunRoisQuery = { __typename?: 'Query', runRois: Array<{ __typename?: 'Roi', address: string, roi: string, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }> };

export type GetVisiumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVisiumQcInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetStainReagentTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainReagentTypesQuery = { __typename?: 'Query', stainReagentTypes: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetSearchInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSearchInfoQuery = { __typename?: 'Query', tissueTypes: Array<{ __typename?: 'TissueType', name: string }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string }>, species: Array<{ __typename?: 'Species', name: string }> };

export type GetWorkAllocationInfoQueryVariables = Exact<{
  commentCategory: Scalars['String']['input'];
  workStatuses?: InputMaybe<Array<WorkStatus> | WorkStatus>;
}>;


export type GetWorkAllocationInfoQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', name: string, enabled: boolean }>, programs: Array<{ __typename?: 'Program', name: string, enabled: boolean }>, costCodes: Array<{ __typename?: 'CostCode', code: string, enabled: boolean }>, worksWithComments: Array<{ __typename?: 'WorkWithComment', comment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } }>, workTypes: Array<{ __typename?: 'WorkType', name: string, enabled: boolean }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean }>, omeroProjects: Array<{ __typename?: 'OmeroProject', name: string, enabled: boolean }>, dnapStudies: Array<{ __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean }> };

export type GetWorkNumbersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkNumbersQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string }> };

export type GetWorkTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkTypesQuery = { __typename?: 'Query', workTypes: Array<{ __typename?: 'WorkType', name: string }> };

export type GetWorkSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkSummaryQuery = { __typename?: 'Query', worksSummary: { __typename?: 'WorkSummaryData', workSummaryGroups: Array<{ __typename?: 'WorkSummaryGroup', numWorks: number, status: WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { __typename?: 'WorkType', name: string, enabled: boolean } }>, workTypes: Array<{ __typename?: 'WorkType', name: string }> } };

export type AddBioRiskMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type AddBioRiskMutation = { __typename?: 'Mutation', addBioRisk: { __typename?: 'BioRisk', code: string, enabled: boolean } };

export type GetWorkProgressInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkProgressInputsQuery = { __typename?: 'Query', workTypes: Array<{ __typename?: 'WorkType', name: string }>, programs: Array<{ __typename?: 'Program', name: string }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string }> };

export type ReloadSlotCopyQueryVariables = Exact<{
  operationType: Scalars['String']['input'];
  workNumber: Scalars['String']['input'];
  lpNumber: Scalars['String']['input'];
}>;


export type ReloadSlotCopyQuery = { __typename?: 'Query', reloadSlotCopy?: { __typename?: 'SlotCopyLoad', operationType: string, workNumber: string, lpNumber: string, executionType?: ExecutionType | null, labwareType?: string | null, barcode?: string | null, bioState?: string | null, costing?: SlideCosting | null, lotNumber?: string | null, probeLotNumber?: string | null, preBarcode?: string | null, sources: Array<{ __typename?: 'SlotCopyLoadSource', barcode: string, labwareState: LabwareState }>, contents: Array<{ __typename?: 'SlotCopyLoadContent', sourceBarcode: string, sourceAddress: string, destinationAddress: string }> } | null };

export type AddCommentMutationVariables = Exact<{
  category: Scalars['String']['input'];
  text: Scalars['String']['input'];
}>;


export type AddCommentMutation = { __typename?: 'Mutation', addComment: { __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean } };

export type AddCostCodeMutationVariables = Exact<{
  code: Scalars['String']['input'];
}>;


export type AddCostCodeMutation = { __typename?: 'Mutation', addCostCode: { __typename?: 'CostCode', code: string, enabled: boolean } };

export type GetXeniumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetXeniumQcInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type AddDestructionReasonMutationVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type AddDestructionReasonMutation = { __typename?: 'Mutation', addDestructionReason: { __typename?: 'DestructionReason', id: number, text: string, enabled: boolean } };

export type AddExternalIdMutationVariables = Exact<{
  request: AddExternalIdRequest;
}>;


export type AddExternalIdMutation = { __typename?: 'Mutation', addExternalID: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type AddEquipmentMutationVariables = Exact<{
  category: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type AddEquipmentMutation = { __typename?: 'Mutation', addEquipment: { __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean } };

export type AddHmdmcMutationVariables = Exact<{
  hmdmc: Scalars['String']['input'];
}>;


export type AddHmdmcMutation = { __typename?: 'Mutation', addHmdmc: { __typename?: 'Hmdmc', hmdmc: string, enabled: boolean } };

export type AddFixativeMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddFixativeMutation = { __typename?: 'Mutation', addFixative: { __typename?: 'Fixative', name: string, enabled: boolean } };

export type AddOmeroProjectMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddOmeroProjectMutation = { __typename?: 'Mutation', addOmeroProject: { __typename?: 'OmeroProject', name: string, enabled: boolean } };

export type AddProgramMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddProgramMutation = { __typename?: 'Mutation', addProgram: { __typename?: 'Program', name: string, enabled: boolean } };

export type AddReleaseDestinationMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddReleaseDestinationMutation = { __typename?: 'Mutation', addReleaseDestination: { __typename?: 'ReleaseDestination', name: string, enabled: boolean } };

export type AddSolutionMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddSolutionMutation = { __typename?: 'Mutation', addSolution: { __typename?: 'Solution', name: string, enabled: boolean } };

export type AddProjectMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddProjectMutation = { __typename?: 'Mutation', addProject: { __typename?: 'Project', name: string, enabled: boolean } };

export type AddProbePanelMutationVariables = Exact<{
  type: ProbeType;
  name: Scalars['String']['input'];
}>;


export type AddProbePanelMutation = { __typename?: 'Mutation', addProbePanel: { __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType } };

export type AddSlotRegionMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddSlotRegionMutation = { __typename?: 'Mutation', addSlotRegion: { __typename?: 'SlotRegion', enabled: boolean, name: string } };

export type AddSpeciesMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddSpeciesMutation = { __typename?: 'Mutation', addSpecies: { __typename?: 'Species', name: string, enabled: boolean } };

export type AddUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
}>;


export type AddUserMutation = { __typename?: 'Mutation', addUser: { __typename?: 'User', username: string, role: UserRole } };

export type AddWorkTypeMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddWorkTypeMutation = { __typename?: 'Mutation', addWorkType: { __typename?: 'WorkType', name: string, enabled: boolean } };

export type AliquotMutationVariables = Exact<{
  request: AliquotRequest;
}>;


export type AliquotMutation = { __typename?: 'Mutation', aliquot: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> }> } };

export type AddReleaseRecipientMutationVariables = Exact<{
  username: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
}>;


export type AddReleaseRecipientMutation = { __typename?: 'Mutation', addReleaseRecipient: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } };

export type ConfirmMutationVariables = Exact<{
  request: ConfirmOperationRequest;
}>;


export type ConfirmMutation = { __typename?: 'Mutation', confirmOperation: { __typename?: 'ConfirmOperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type ConfirmSectionMutationVariables = Exact<{
  request: ConfirmSectionRequest;
}>;


export type ConfirmSectionMutation = { __typename?: 'Mutation', confirmSection: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type EmptyLocationMutationVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type EmptyLocationMutation = { __typename?: 'Mutation', empty: { __typename?: 'UnstoreResult', numUnstored: number } };

export type ExtractMutationVariables = Exact<{
  request: ExtractRequest;
}>;


export type ExtractMutation = { __typename?: 'Mutation', extract: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> }> } };

export type AddTissueTypeMutationVariables = Exact<{
  request: AddTissueTypeRequest;
}>;


export type AddTissueTypeMutation = { __typename?: 'Mutation', addTissueType: { __typename?: 'TissueType', name: string, code: string, spatialLocations: Array<{ __typename?: 'SpatialLocation', code: number, name: string }> } };

export type AddSpatialLocationsMutationVariables = Exact<{
  request: AddSpatialLocationsRequest;
}>;


export type AddSpatialLocationsMutation = { __typename?: 'Mutation', addSpatialLocations: { __typename?: 'TissueType', name: string, spatialLocations: Array<{ __typename?: 'SpatialLocation', code: number, name: string }> } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: string | null };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResult', user?: { __typename?: 'User', username: string, role: UserRole } | null } };

export type DestroyMutationVariables = Exact<{
  request: DestroyRequest;
}>;


export type DestroyMutation = { __typename?: 'Mutation', destroy: { __typename?: 'DestroyResult', destructions: Array<{ __typename?: 'Destruction', labware?: { __typename?: 'Labware', barcode: string } | null }> } };

export type PerformTissueBlockMutationVariables = Exact<{
  request: TissueBlockRequest;
}>;


export type PerformTissueBlockMutation = { __typename?: 'Mutation', performTissueBlock: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type PerformSolutionTransferMutationVariables = Exact<{
  request: SolutionTransferRequest;
}>;


export type PerformSolutionTransferMutation = { __typename?: 'Mutation', performSolutionTransfer: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type PerformTissuePotMutationVariables = Exact<{
  request: PotProcessingRequest;
}>;


export type PerformTissuePotMutation = { __typename?: 'Mutation', performPotProcessing: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type PlanMutationVariables = Exact<{
  request: PlanRequest;
}>;


export type PlanMutation = { __typename?: 'Mutation', plan: { __typename?: 'PlanResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'PlanOperation', operationType?: { __typename?: 'OperationType', name: string } | null, planActions: Array<{ __typename?: 'PlanAction', newSection?: number | null, sampleThickness?: string | null, sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> }> } };

export type PrintMutationVariables = Exact<{
  barcodes: Array<Scalars['String']['input']> | Scalars['String']['input'];
  printer: Scalars['String']['input'];
}>;


export type PrintMutation = { __typename?: 'Mutation', printLabware?: string | null };

export type PerformParaffinProcessingMutationVariables = Exact<{
  request: ParaffinProcessingRequest;
}>;


export type PerformParaffinProcessingMutation = { __typename?: 'Mutation', performParaffinProcessing: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type FlagLabwareMutationVariables = Exact<{
  request: FlagLabwareRequest;
}>;


export type FlagLabwareMutation = { __typename?: 'Mutation', flagLabware: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordComplexStainMutationVariables = Exact<{
  request: ComplexStainRequest;
}>;


export type RecordComplexStainMutation = { __typename?: 'Mutation', recordComplexStain: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type CreateWorkMutationVariables = Exact<{
  prefix: Scalars['String']['input'];
  workType: Scalars['String']['input'];
  workRequester: Scalars['String']['input'];
  project: Scalars['String']['input'];
  program: Scalars['String']['input'];
  costCode: Scalars['String']['input'];
  numBlocks?: InputMaybe<Scalars['Int']['input']>;
  numSlides?: InputMaybe<Scalars['Int']['input']>;
  numOriginalSamples?: InputMaybe<Scalars['Int']['input']>;
  omeroProject?: InputMaybe<Scalars['String']['input']>;
  ssStudyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateWorkMutation = { __typename?: 'Mutation', createWork: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type RecordAnalyserMutationVariables = Exact<{
  request: AnalyserRequest;
}>;


export type RecordAnalyserMutation = { __typename?: 'Mutation', recordAnalyser: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordExtractResultMutationVariables = Exact<{
  request: ExtractResultRequest;
}>;


export type RecordExtractResultMutation = { __typename?: 'Mutation', recordExtractResult: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordLibraryPrepMutationVariables = Exact<{
  request: LibraryPrepRequest;
}>;


export type RecordLibraryPrepMutation = { __typename?: 'Mutation', libraryPrep: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }>, labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type ReactivateLabwareMutationVariables = Exact<{
  items: Array<ReactivateLabware> | ReactivateLabware;
}>;


export type ReactivateLabwareMutation = { __typename?: 'Mutation', reactivateLabware: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', barcode: string, state: LabwareState }>, operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordCompletionMutationVariables = Exact<{
  request: CompletionRequest;
}>;


export type RecordCompletionMutation = { __typename?: 'Mutation', recordCompletion: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordInPlaceMutationVariables = Exact<{
  request: InPlaceOpRequest;
}>;


export type RecordInPlaceMutation = { __typename?: 'Mutation', recordInPlace: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type RecordPermMutationVariables = Exact<{
  request: RecordPermRequest;
}>;


export type RecordPermMutation = { __typename?: 'Mutation', recordPerm: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordOpWithSlotMeasurementsMutationVariables = Exact<{
  request: OpWithSlotMeasurementsRequest;
}>;


export type RecordOpWithSlotMeasurementsMutation = { __typename?: 'Mutation', recordOpWithSlotMeasurements: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordOpWithSlotCommentsMutationVariables = Exact<{
  request: OpWithSlotCommentsRequest;
}>;


export type RecordOpWithSlotCommentsMutation = { __typename?: 'Mutation', recordOpWithSlotComments: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordOrientationQcMutationVariables = Exact<{
  request: OrientationRequest;
}>;


export type RecordOrientationQcMutation = { __typename?: 'Mutation', recordOrientationQC: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordProbeOperationMutationVariables = Exact<{
  request: ProbeOperationRequest;
}>;


export type RecordProbeOperationMutation = { __typename?: 'Mutation', recordProbeOperation: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordMetricsMutationVariables = Exact<{
  request: SampleMetricsRequest;
}>;


export type RecordMetricsMutation = { __typename?: 'Mutation', recordSampleMetrics: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordRnaAnalysisMutationVariables = Exact<{
  request: RnaAnalysisRequest;
}>;


export type RecordRnaAnalysisMutation = { __typename?: 'Mutation', recordRNAAnalysis: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordReagentTransferMutationVariables = Exact<{
  request: ReagentTransferRequest;
}>;


export type RecordReagentTransferMutation = { __typename?: 'Mutation', reagentTransfer: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordSampleProcessingCommentsMutationVariables = Exact<{
  request: SampleProcessingCommentRequest;
}>;


export type RecordSampleProcessingCommentsMutation = { __typename?: 'Mutation', recordSampleProcessingComments: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type RecordVisiumQcMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordVisiumQcMutation = { __typename?: 'Mutation', recordVisiumQC: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordStainResultMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordStainResultMutation = { __typename?: 'Mutation', recordStainResult: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordQcLabwareMutationVariables = Exact<{
  request: QcLabwareRequest;
}>;


export type RecordQcLabwareMutation = { __typename?: 'Mutation', recordQCLabware: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type ReleaseLabwareMutationVariables = Exact<{
  releaseRequest: ReleaseRequest;
}>;


export type ReleaseLabwareMutation = { __typename?: 'Mutation', release: { __typename?: 'ReleaseResult', releases: Array<{ __typename?: 'Release', id: number, labware: { __typename?: 'Labware', barcode: string }, destination: { __typename?: 'ReleaseDestination', name: string }, recipient: { __typename?: 'ReleaseRecipient', username: string } }> } };

export type RegisterSectionsMutationVariables = Exact<{
  request: SectionRegisterRequest;
}>;


export type RegisterSectionsMutation = { __typename?: 'Mutation', registerSections: { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type RegisterTissuesMutationVariables = Exact<{
  request: RegisterRequest;
}>;


export type RegisterTissuesMutation = { __typename?: 'Mutation', register: { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, clashes: Array<{ __typename?: 'RegisterClash', tissue: { __typename?: 'Tissue', externalName?: string | null, donor: { __typename?: 'Donor', donorName: string }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } } }, labware: Array<{ __typename?: 'Labware', barcode: string, labwareType: { __typename?: 'LabwareType', name: string } }> }>, labwareSolutions: Array<{ __typename?: 'LabwareSolutionName', barcode: string, solutionName: string } | null> } };

export type RegisterAsEndUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegisterAsEndUserMutation = { __typename?: 'Mutation', registerAsEndUser: { __typename?: 'LoginResult', user?: { __typename?: 'User', username: string, role: UserRole } | null } };

export type SegmentationMutationVariables = Exact<{
  request: SegmentationRequest;
}>;


export type SegmentationMutation = { __typename?: 'Mutation', segmentation: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }>, labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type SetBioRiskEnabledMutationVariables = Exact<{
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetBioRiskEnabledMutation = { __typename?: 'Mutation', setBioRiskEnabled: { __typename?: 'BioRisk', code: string, enabled: boolean } };

export type SaveSlotCopyMutationVariables = Exact<{
  request: SlotCopySave;
}>;


export type SaveSlotCopyMutation = { __typename?: 'Mutation', saveSlotCopy: { __typename?: 'SlotCopyLoad', operationType: string, workNumber: string, lpNumber: string, executionType?: ExecutionType | null, labwareType?: string | null, barcode?: string | null, bioState?: string | null, costing?: SlideCosting | null, lotNumber?: string | null, probeLotNumber?: string | null, preBarcode?: string | null, sources: Array<{ __typename?: 'SlotCopyLoadSource', barcode: string, labwareState: LabwareState }>, contents: Array<{ __typename?: 'SlotCopyLoadContent', sourceBarcode: string, sourceAddress: string, destinationAddress: string }> } };

export type SetCommentEnabledMutationVariables = Exact<{
  commentId: Scalars['Int']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetCommentEnabledMutation = { __typename?: 'Mutation', setCommentEnabled: { __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean } };

export type SetDestructionReasonEnabledMutationVariables = Exact<{
  text: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetDestructionReasonEnabledMutation = { __typename?: 'Mutation', setDestructionReasonEnabled: { __typename?: 'DestructionReason', id: number, text: string, enabled: boolean } };

export type RegisterOriginalSamplesMutationVariables = Exact<{
  request: OriginalSampleRegisterRequest;
}>;


export type RegisterOriginalSamplesMutation = { __typename?: 'Mutation', registerOriginalSamples: { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, clashes: Array<{ __typename?: 'RegisterClash', tissue: { __typename?: 'Tissue', externalName?: string | null, donor: { __typename?: 'Donor', donorName: string }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } } }, labware: Array<{ __typename?: 'Labware', barcode: string, labwareType: { __typename?: 'LabwareType', name: string } }> }>, labwareSolutions: Array<{ __typename?: 'LabwareSolutionName', barcode: string, solutionName: string } | null> } };

export type SetEquipmentEnabledMutationVariables = Exact<{
  equipmentId: Scalars['Int']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetEquipmentEnabledMutation = { __typename?: 'Mutation', setEquipmentEnabled: { __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean } };

export type SetFixativeEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetFixativeEnabledMutation = { __typename?: 'Mutation', setFixativeEnabled: { __typename?: 'Fixative', name: string, enabled: boolean } };

export type SetCostCodeEnabledMutationVariables = Exact<{
  code: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetCostCodeEnabledMutation = { __typename?: 'Mutation', setCostCodeEnabled: { __typename?: 'CostCode', code: string, enabled: boolean } };

export type SetLocationCustomNameMutationVariables = Exact<{
  locationBarcode: Scalars['String']['input'];
  newCustomName: Scalars['String']['input'];
}>;


export type SetLocationCustomNameMutation = { __typename?: 'Mutation', setLocationCustomName: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, numStored: number, leaf: boolean, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> } };

export type SetProgramEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetProgramEnabledMutation = { __typename?: 'Mutation', setProgramEnabled: { __typename?: 'Program', name: string, enabled: boolean } };

export type SetOmeroProjectEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetOmeroProjectEnabledMutation = { __typename?: 'Mutation', setOmeroProjectEnabled: { __typename?: 'OmeroProject', name: string, enabled: boolean } };

export type SetCellClassEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetCellClassEnabledMutation = { __typename?: 'Mutation', setCellClassEnabled: { __typename?: 'CellClass', name: string, enabled: boolean } };

export type SetProbePanelEnabledMutationVariables = Exact<{
  type: ProbeType;
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetProbePanelEnabledMutation = { __typename?: 'Mutation', setProbePanelEnabled: { __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType } };

export type SetReleaseRecipientEnabledMutationVariables = Exact<{
  username: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetReleaseRecipientEnabledMutation = { __typename?: 'Mutation', setReleaseRecipientEnabled: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } };

export type SetHmdmcEnabledMutationVariables = Exact<{
  hmdmc: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetHmdmcEnabledMutation = { __typename?: 'Mutation', setHmdmcEnabled: { __typename?: 'Hmdmc', hmdmc: string, enabled: boolean } };

export type SetReleaseDestinationEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetReleaseDestinationEnabledMutation = { __typename?: 'Mutation', setReleaseDestinationEnabled: { __typename?: 'ReleaseDestination', name: string, enabled: boolean } };

export type SetOpWorkRequestMutationVariables = Exact<{
  request: OpWorkRequest;
}>;


export type SetOpWorkRequestMutation = { __typename?: 'Mutation', setOperationWork: Array<{ __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } }> };

export type SetProjectEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetProjectEnabledMutation = { __typename?: 'Mutation', setProjectEnabled: { __typename?: 'Project', name: string, enabled: boolean } };

export type SetSpeciesEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetSpeciesEnabledMutation = { __typename?: 'Mutation', setSpeciesEnabled: { __typename?: 'Species', name: string, enabled: boolean } };

export type SetSlotRegionEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetSlotRegionEnabledMutation = { __typename?: 'Mutation', setSlotRegionEnabled: { __typename?: 'SlotRegion', enabled: boolean, name: string } };

export type SetWorkTypeEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetWorkTypeEnabledMutation = { __typename?: 'Mutation', setWorkTypeEnabled: { __typename?: 'WorkType', name: string, enabled: boolean } };

export type StainMutationVariables = Exact<{
  request: StainRequest;
}>;


export type StainMutation = { __typename?: 'Mutation', stain: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type SlotCopyMutationVariables = Exact<{
  request: SlotCopyRequest;
}>;


export type SlotCopyMutation = { __typename?: 'Mutation', slotCopy: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type StoreMutationVariables = Exact<{
  store: Array<StoreInput> | StoreInput;
  locationBarcode: Scalars['String']['input'];
}>;


export type StoreMutation = { __typename?: 'Mutation', store: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, numStored: number, leaf: boolean, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> } };

export type SetUserRoleMutationVariables = Exact<{
  username: Scalars['String']['input'];
  role: UserRole;
}>;


export type SetUserRoleMutation = { __typename?: 'Mutation', setUserRole: { __typename?: 'User', username: string, role: UserRole } };

export type SetSolutionEnabledMutationVariables = Exact<{
  name: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
}>;


export type SetSolutionEnabledMutation = { __typename?: 'Mutation', setSolutionEnabled: { __typename?: 'Solution', name: string, enabled: boolean } };

export type UnstoreBarcodeMutationVariables = Exact<{
  barcode: Scalars['String']['input'];
}>;


export type UnstoreBarcodeMutation = { __typename?: 'Mutation', unstoreBarcode?: { __typename?: 'UnstoredItem', barcode: string, address?: string | null } | null };

export type StoreBarcodeMutationVariables = Exact<{
  barcode: Scalars['String']['input'];
  locationBarcode: Scalars['String']['input'];
  address?: InputMaybe<Scalars['Address']['input']>;
}>;


export type StoreBarcodeMutation = { __typename?: 'Mutation', storeBarcode: { __typename?: 'StoredItem', location: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, numStored: number, leaf: boolean, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> } } };

export type TransferLocationItemsMutationVariables = Exact<{
  sourceBarcode: Scalars['String']['input'];
  destinationBarcode: Scalars['String']['input'];
}>;


export type TransferLocationItemsMutation = { __typename?: 'Mutation', transfer: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, numStored: number, leaf: boolean, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> } };

export type UnreleaseMutationVariables = Exact<{
  request: UnreleaseRequest;
}>;


export type UnreleaseMutation = { __typename?: 'Mutation', unrelease: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type UpdateWorkNumOriginalSamplesMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  numOriginalSamples?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateWorkNumOriginalSamplesMutation = { __typename?: 'Mutation', updateWorkNumOriginalSamples: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type UpdateWorkNumSlidesMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  numSlides?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateWorkNumSlidesMutation = { __typename?: 'Mutation', updateWorkNumSlides: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type UpdateWorkNumBlocksMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  numBlocks?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateWorkNumBlocksMutation = { __typename?: 'Mutation', updateWorkNumBlocks: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type UpdateDnapStudiesMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateDnapStudiesMutation = { __typename?: 'Mutation', updateDnapStudies: Array<{ __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean }> };

export type UpdateWorkDnapStudyMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  ssStudyId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateWorkDnapStudyMutation = { __typename?: 'Mutation', updateWorkDnapStudy: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type UpdateWorkOmeroProjectMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  omeroProject?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWorkOmeroProjectMutation = { __typename?: 'Mutation', updateWorkOmeroProject: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type UpdateReleaseRecipientFullNameMutationVariables = Exact<{
  username: Scalars['String']['input'];
  fullName?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateReleaseRecipientFullNameMutation = { __typename?: 'Mutation', updateReleaseRecipientFullName: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } };

export type VisiumAnalysisMutationVariables = Exact<{
  request: VisiumAnalysisRequest;
}>;


export type VisiumAnalysisMutation = { __typename?: 'Mutation', visiumAnalysis: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type UpdateWorkPriorityMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateWorkPriorityMutation = { __typename?: 'Mutation', updateWorkPriority: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

export type UpdateWorkStatusMutationVariables = Exact<{
  workNumber: Scalars['String']['input'];
  status: WorkStatus;
  commentId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateWorkStatusMutation = { __typename?: 'Mutation', updateWorkStatus: { __typename?: 'WorkWithComment', comment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } } };

export type ActionFieldsFragment = { __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } };

export type CleanOutMutationVariables = Exact<{
  request: CleanOutRequest;
}>;


export type CleanOutMutation = { __typename?: 'Mutation', cleanOut: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type CommentFieldsFragment = { __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean };

export type DestructionReasonFieldsFragment = { __typename?: 'DestructionReason', id: number, text: string, enabled: boolean };

export type AddressPermDataFieldsFragment = { __typename?: 'AddressPermData', address: string, controlType?: ControlType | null, seconds?: number | null, selected: boolean };

export type AnalyserScanDataFieldsFragment = { __typename?: 'AnalyserScanData', workNumbers: Array<string>, probes: Array<string>, cellSegmentationRecorded: boolean };

export type CostCodeFieldsFragment = { __typename?: 'CostCode', code: string, enabled: boolean };

export type AddCellClassMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type AddCellClassMutation = { __typename?: 'Mutation', addCellClass: { __typename?: 'CellClass', name: string, enabled: boolean } };

export type EquipmentFieldsFragment = { __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean };

export type FileFieldsFragment = { __typename?: 'StanFile', created: string, name: string, url: string, work: { __typename?: 'Work', workNumber: string } };

export type BioRiskFieldsFragment = { __typename?: 'BioRisk', code: string, enabled: boolean };

export type FixativeFieldsFragment = { __typename?: 'Fixative', name: string, enabled: boolean };

export type DnapStudyFieldsFragment = { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean };

export type GraphSvgFieldsFragment = { __typename?: 'GraphSVG', svg: string };

export type FlagBarcodesFieldsFragment = { __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority };

export type HistoryFieldsFragment = { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }>, flagBarcodes: Array<{ __typename?: 'FlagBarcodes', barcodes: Array<string>, priority: FlagPriority }> };

export type HmdmcFieldsFragment = { __typename?: 'Hmdmc', hmdmc: string, enabled: boolean };

export type CellClassFieldsFragment = { __typename?: 'CellClass', name: string, enabled: boolean };

export type LabwareFieldsFragment = { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> };

export type LabwareFlaggedFieldsFragment = { __typename?: 'LabwareFlagged', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, flagged: boolean, flagPriority?: FlagPriority | null, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> };

export type LabwareTypeFieldsFragment = { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null };

export type NextReplicateDataFieldsFragment = { __typename?: 'NextReplicateData', barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number };

export type HistoryEntryFieldsFragment = { __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null };

export type OperationFieldsFragment = { __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } };

export type LabwareRoiFieldsFragment = { __typename?: 'LabwareRoi', barcode: string, rois: Array<{ __typename?: 'Roi', address: string, roi: string, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }> };

export type LinkedLocationFieldsFragment = { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean };

export type OmeroProjectFieldsFragment = { __typename?: 'OmeroProject', name: string, enabled: boolean };

export type ProjectFieldsFragment = { __typename?: 'Project', name: string, enabled: boolean };

export type ProbePanelFieldsFragment = { __typename?: 'ProbePanel', name: string, enabled: boolean, type: ProbeType };

export type LocationFieldsFragment = { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, numStored: number, leaf: boolean, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, numStored: number, leaf: boolean }> };

export type ReagentSlotFieldsFragment = { __typename?: 'ReagentSlot', address: string, used: boolean };

export type PrinterFieldsFragment = { __typename?: 'Printer', name: string, labelTypes: Array<{ __typename?: 'LabelType', name: string }> };

export type RegisterResultFieldsFragment = { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, clashes: Array<{ __typename?: 'RegisterClash', tissue: { __typename?: 'Tissue', externalName?: string | null, donor: { __typename?: 'Donor', donorName: string }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } } }, labware: Array<{ __typename?: 'Labware', barcode: string, labwareType: { __typename?: 'LabwareType', name: string } }> }>, labwareSolutions: Array<{ __typename?: 'LabwareSolutionName', barcode: string, solutionName: string } | null> };

export type ReleaseFileOptionFieldsFragment = { __typename?: 'ReleaseFileOption', displayName: string, queryParamName: string };

export type ReleaseRecipientFieldsFragment = { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean };

export type ReagentPlateFieldsFragment = { __typename?: 'ReagentPlate', barcode: string, plateType?: string | null, slots: Array<{ __typename?: 'ReagentSlot', address: string, used: boolean }> };

export type PlanActionFieldsFragment = { __typename?: 'PlanAction', newSection?: number | null, sampleThickness?: string | null, sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } };

export type ProgramFieldsFragment = { __typename?: 'Program', name: string, enabled: boolean };

export type SampleBioRiskFieldsFragment = { __typename?: 'SampleBioRisk', sampleId: number, bioRiskCode: string };

export type ReleaseDestinationFieldsFragment = { __typename?: 'ReleaseDestination', name: string, enabled: boolean };

export type SlotPassFailFieldsFragment = { __typename?: 'SlotPassFail', address: string, result: PassFail, comment?: string | null };

export type RoiFieldsFragment = { __typename?: 'Roi', address: string, roi: string, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } };

export type SamplePositionFieldsFragment = { __typename?: 'SamplePosition', address: string, region: string, sampleId: number, slotId: number, operationId: number };

export type SlotFieldsFragment = { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> };

export type SampleFieldsFragment = { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage?: LifeStage | null }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } }, hmdmc?: { __typename?: 'Hmdmc', hmdmc: string } | null, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } };

export type SlotRegionFieldsFragment = { __typename?: 'SlotRegion', enabled: boolean, name: string };

export type SpeciesFieldsFragment = { __typename?: 'Species', name: string, enabled: boolean };

export type SlotCopyLoadFieldsFragment = { __typename?: 'SlotCopyLoad', operationType: string, workNumber: string, lpNumber: string, executionType?: ExecutionType | null, labwareType?: string | null, barcode?: string | null, bioState?: string | null, costing?: SlideCosting | null, lotNumber?: string | null, probeLotNumber?: string | null, preBarcode?: string | null, sources: Array<{ __typename?: 'SlotCopyLoadSource', barcode: string, labwareState: LabwareState }>, contents: Array<{ __typename?: 'SlotCopyLoadContent', sourceBarcode: string, sourceAddress: string, destinationAddress: string }> };

export type SolutionFieldsFragment = { __typename?: 'Solution', name: string, enabled: boolean };

export type UserFieldsFragment = { __typename?: 'User', username: string, role: UserRole };

export type TissueTypeFieldsFragment = { __typename?: 'TissueType', name: string, code: string, spatialLocations: Array<{ __typename?: 'SpatialLocation', code: number, name: string }> };

export type SuggestedWorkFieldsFragment = { __typename?: 'SuggestedWork', barcode: string, workNumber?: string | null };

export type StainTypeFieldsFragment = { __typename?: 'StainType', name: string, measurementTypes: Array<string> };

export type WorkFieldsFragment = { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null };

export type WorkProgressTimeStampFieldFragment = { __typename?: 'WorkProgressTimestamp', type: string, timestamp: string };

export type WorkProgressFieldsFragment = { __typename?: 'WorkProgress', mostRecentOperation?: string | null, workComment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null }, timestamps: Array<{ __typename?: 'WorkProgressTimestamp', type: string, timestamp: string }> };

export type WorkTypeFieldsFragment = { __typename?: 'WorkType', name: string, enabled: boolean };

export type WorkSummaryGroupFieldsFragment = { __typename?: 'WorkSummaryGroup', numWorks: number, status: WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { __typename?: 'WorkType', name: string, enabled: boolean } };

export type WorkWithCommentFieldsFragment = { __typename?: 'WorkWithComment', comment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', ssId: number, name: string, enabled: boolean } | null } };

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
  workNumbers
  probes
  cellSegmentationRecorded
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
export const BioRiskFieldsFragmentDoc = gql`
    fragment BioRiskFields on BioRisk {
  code
  enabled
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
export const SampleFieldsFragmentDoc = gql`
    fragment SampleFields on Sample {
  id
  section
  tissue {
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
  bioState {
    name
  }
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
  blockHighestSection
  block
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
  created
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
export const CellClassFieldsFragmentDoc = gql`
    fragment CellClassFields on CellClass {
  name
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
  created
  labwareType {
    ...LabwareTypeFields
  }
  slots {
    ...SlotFields
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
export const ProbePanelFieldsFragmentDoc = gql`
    fragment ProbePanelFields on ProbePanel {
  name
  enabled
  type
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
export const PrinterFieldsFragmentDoc = gql`
    fragment PrinterFields on Printer {
  name
  labelTypes {
    name
  }
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
  plateType
}
    `;
export const PlanActionFieldsFragmentDoc = gql`
    fragment PlanActionFields on PlanAction {
  newSection
  sampleThickness
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
    `;
export const SampleBioRiskFieldsFragmentDoc = gql`
    fragment SampleBioRiskFields on SampleBioRisk {
  sampleId
  bioRiskCode
}
    `;
export const ReleaseDestinationFieldsFragmentDoc = gql`
    fragment ReleaseDestinationFields on ReleaseDestination {
  name
  enabled
}
    `;
export const SlotPassFailFieldsFragmentDoc = gql`
    fragment SlotPassFailFields on SlotPassFail {
  address
  result
  comment
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
export const SlotRegionFieldsFragmentDoc = gql`
    fragment SlotRegionFields on SlotRegion {
  enabled
  name
}
    `;
export const SpeciesFieldsFragmentDoc = gql`
    fragment SpeciesFields on Species {
  name
  enabled
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
  contents {
    sourceBarcode
    sourceAddress
    destinationAddress
  }
}
    `;
export const SolutionFieldsFragmentDoc = gql`
    fragment SolutionFields on Solution {
  name
  enabled
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
export const SuggestedWorkFieldsFragmentDoc = gql`
    fragment SuggestedWorkFields on SuggestedWork {
  barcode
  workNumber
}
    `;
export const StainTypeFieldsFragmentDoc = gql`
    fragment StainTypeFields on StainType {
  name
  measurementTypes
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
  workType {
    ...WorkTypeFields
  }
  omeroProject {
    ...OmeroProjectFields
  }
  dnapStudy {
    ...DnapStudyFields
  }
  numBlocks
  numSlides
  numOriginalSamples
  priority
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
export const CurrentUserDocument = gql`
    query CurrentUser {
  user {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindFlaggedLabwareDocument = gql`
    query FindFlaggedLabware($barcode: String!) {
  labwareFlagged(barcode: $barcode) {
    ...LabwareFlaggedFields
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindLabwareLocationDocument = gql`
    query FindLabwareLocation($barcodes: [String!]!) {
  stored(barcodes: $barcodes) {
    location {
      barcode
    }
  }
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
${SampleFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}
${FlagBarcodesFieldsFragmentDoc}`;
export const FindLocationByBarcodeDocument = gql`
    query FindLocationByBarcode($barcode: String!) {
  location(locationBarcode: $barcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
export const FindReagentPlateDocument = gql`
    query FindReagentPlate($barcode: String!) {
  reagentPlate(barcode: $barcode) {
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
export const FindMeasurementByBarcodeAndNameDocument = gql`
    query FindMeasurementByBarcodeAndName($barcode: String!, $measurementName: String!) {
  measurementValueFromLabwareOrParent(barcode: $barcode, name: $measurementName) {
    address
    string
  }
}
    `;
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
  }
}
    ${LabwareFlaggedFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${PlanActionFieldsFragmentDoc}`;
export const FindStoragePathDocument = gql`
    query FindStoragePath($locationBarcode: String!) {
  storagePath(locationBarcode: $locationBarcode) {
    ...LinkedLocationFields
  }
}
    ${LinkedLocationFieldsFragmentDoc}`;
export const FindWorkNumbersDocument = gql`
    query FindWorkNumbers($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
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
${DnapStudyFieldsFragmentDoc}`;
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
${UserFieldsFragmentDoc}
${SlotPassFailFieldsFragmentDoc}`;
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
export const GetCommentsDocument = gql`
    query GetComments($commentCategory: String, $includeDisabled: Boolean) {
  comments(category: $commentCategory, includeDisabled: $includeDisabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
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
${SamplePositionFieldsFragmentDoc}`;
export const GetDestroyInfoDocument = gql`
    query GetDestroyInfo {
  destructionReasons {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const GetCellClassesDocument = gql`
    query GetCellClasses($includeDisabled: Boolean) {
  cellClasses(includeDisabled: $includeDisabled) {
    ...CellClassFields
  }
}
    ${CellClassFieldsFragmentDoc}`;
export const GetAnalyserScanDataDocument = gql`
    query GetAnalyserScanData($barcode: String!) {
  analyserScanData(barcode: $barcode) {
    ...AnalyserScanDataFields
  }
}
    ${AnalyserScanDataFieldsFragmentDoc}`;
export const GetDestructionReasonsDocument = gql`
    query GetDestructionReasons($includeDisabled: Boolean) {
  destructionReasons(includeDisabled: $includeDisabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
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
  xeniumProbePanels: probePanels(type: xenium, includeDisabled: true) {
    ...ProbePanelFields
  }
  cytassistProbePanels: probePanels(type: cytassist, includeDisabled: true) {
    ...ProbePanelFields
  }
  spikeProbePanels: probePanels(type: spike, includeDisabled: true) {
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
${CellClassFieldsFragmentDoc}`;
export const GetCleanedOutAddressesDocument = gql`
    query GetCleanedOutAddresses($barcode: String!) {
  cleanedOutAddresses(barcode: $barcode)
}
    `;
export const GetLabwareCostingDocument = gql`
    query GetLabwareCosting($barcode: String!) {
  labwareCosting(barcode: $barcode)
}
    `;
export const GetEquipmentsDocument = gql`
    query GetEquipments($category: String, $includeDisabled: Boolean) {
  equipments(category: $category, includeDisabled: $includeDisabled) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
export const GetDnapStudyDocument = gql`
    query GetDnapStudy($ssId: Int!) {
  dnapStudy(ssId: $ssId) {
    ...DnapStudyFields
  }
}
    ${DnapStudyFieldsFragmentDoc}`;
export const GetLabwareInLocationDocument = gql`
    query GetLabwareInLocation($locationBarcode: String!) {
  labwareInLocation(locationBarcode: $locationBarcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
export const GetParaffinProcessingInfoDocument = gql`
    query GetParaffinProcessingInfo {
  comments(includeDisabled: false, category: "Paraffin processing program") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
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
${UserFieldsFragmentDoc}`;
export const GetEventTypesDocument = gql`
    query GetEventTypes {
  eventTypes
}
    `;
export const GetOmeroProjectsDocument = gql`
    query GetOmeroProjects {
  omeroProjects {
    name
    enabled
  }
}
    `;
export const GetNextReplicateNumberDocument = gql`
    query GetNextReplicateNumber($barcodes: [String!]!) {
  nextReplicateNumbers(barcodes: $barcodes) {
    ...NextReplicateDataFields
  }
}
    ${NextReplicateDataFieldsFragmentDoc}`;
export const GetProbePanelsDocument = gql`
    query GetProbePanels($type: ProbeType!) {
  probePanels(type: $type) {
    name
    enabled
    type
  }
}
    `;
export const GetLabwareBioRiskCodesDocument = gql`
    query GetLabwareBioRiskCodes($barcode: String!) {
  labwareBioRiskCodes(barcode: $barcode) {
    ...SampleBioRiskFields
  }
}
    ${SampleBioRiskFieldsFragmentDoc}`;
export const GetPrintersDocument = gql`
    query GetPrinters {
  printers {
    ...PrinterFields
  }
}
    ${PrinterFieldsFragmentDoc}`;
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
export const GetProgramsDocument = gql`
    query GetPrograms {
  programs {
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
export const GetReleaseColumnOptionsDocument = gql`
    query GetReleaseColumnOptions {
  releaseColumnOptions {
    ...ReleaseFileOptionFields
  }
}
    ${ReleaseFileOptionFieldsFragmentDoc}`;
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
export const GetRunNamesDocument = gql`
    query GetRunNames($barcode: String!) {
  runNames(barcode: $barcode)
}
    `;
export const GetSampleProcessingCommentsInfoDocument = gql`
    query GetSampleProcessingCommentsInfo {
  comments: comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetRegionsOfInterestDocument = gql`
    query GetRegionsOfInterest($barcodes: [String!]!) {
  rois(barcodes: $barcodes) {
    ...LabwareRoiFields
  }
}
    ${LabwareRoiFieldsFragmentDoc}
${RoiFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
export const GetSectioningConfirmInfoDocument = gql`
    query GetSectioningConfirmInfo {
  comments(category: "section") {
    ...CommentFields
  }
  slotRegions(includeDisabled: false) {
    ...SlotRegionFields
  }
}
    ${CommentFieldsFragmentDoc}
${SlotRegionFieldsFragmentDoc}`;
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
export const GetSectioningInfoDocument = gql`
    query GetSectioningInfo {
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${LabwareTypeFieldsFragmentDoc}`;
export const GetSolutionTransferInfoDocument = gql`
    query GetSolutionTransferInfo {
  solutions {
    name
  }
}
    `;
export const GetSlotRegionsDocument = gql`
    query GetSlotRegions($includeDisabled: Boolean) {
  slotRegions(includeDisabled: $includeDisabled) {
    name
    enabled
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
export const GetSuggestedWorkForLabwareDocument = gql`
    query GetSuggestedWorkForLabware($barcodes: [String!]!, $includeInactive: Boolean) {
  suggestedWorkForLabware(barcodes: $barcodes, includeInactive: $includeInactive) {
    suggestedWorks {
      ...SuggestedWorkFields
    }
  }
}
    ${SuggestedWorkFieldsFragmentDoc}`;
export const GetSuggestedLabwareForWorkDocument = gql`
    query GetSuggestedLabwareForWork($workNumber: String!, $forRelease: Boolean) {
  suggestedLabwareForWork(workNumber: $workNumber, forRelease: $forRelease) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
export const GetStainingQcInfoDocument = gql`
    query GetStainingQCInfo {
  comments(includeDisabled: false, category: "stain QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetRunRoisDocument = gql`
    query GetRunRois($barcode: String!, $run: String!) {
  runRois(barcode: $barcode, run: $run) {
    ...RoiFields
  }
}
    ${RoiFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
export const GetVisiumQcInfoDocument = gql`
    query GetVisiumQCInfo {
  comments(includeDisabled: false, category: "Visium QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetStainReagentTypesDocument = gql`
    query GetStainReagentTypes {
  stainReagentTypes {
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
${CommentFieldsFragmentDoc}`;
export const GetWorkNumbersDocument = gql`
    query GetWorkNumbers {
  works {
    workNumber
  }
}
    `;
export const GetWorkTypesDocument = gql`
    query GetWorkTypes {
  workTypes(includeDisabled: true) {
    name
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
export const AddBioRiskDocument = gql`
    mutation AddBioRisk($code: String!) {
  addBioRisk(code: $code) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`;
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
export const GetXeniumQcInfoDocument = gql`
    query GetXeniumQCInfo {
  comments(includeDisabled: false, category: "Xenium analyser QC") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const AddDestructionReasonDocument = gql`
    mutation AddDestructionReason($text: String!) {
  addDestructionReason(text: $text) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
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
export const AddEquipmentDocument = gql`
    mutation AddEquipment($category: String!, $name: String!) {
  addEquipment(category: $category, name: $name) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
export const AddHmdmcDocument = gql`
    mutation AddHmdmc($hmdmc: String!) {
  addHmdmc(hmdmc: $hmdmc) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`;
export const AddFixativeDocument = gql`
    mutation AddFixative($name: String!) {
  addFixative(name: $name) {
    ...FixativeFields
  }
}
    ${FixativeFieldsFragmentDoc}`;
export const AddOmeroProjectDocument = gql`
    mutation AddOmeroProject($name: String!) {
  addOmeroProject(name: $name) {
    ...OmeroProjectFields
  }
}
    ${OmeroProjectFieldsFragmentDoc}`;
export const AddProgramDocument = gql`
    mutation AddProgram($name: String!) {
  addProgram(name: $name) {
    ...ProgramFields
  }
}
    ${ProgramFieldsFragmentDoc}`;
export const AddReleaseDestinationDocument = gql`
    mutation AddReleaseDestination($name: String!) {
  addReleaseDestination(name: $name) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`;
export const AddSolutionDocument = gql`
    mutation AddSolution($name: String!) {
  addSolution(name: $name) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`;
export const AddProjectDocument = gql`
    mutation AddProject($name: String!) {
  addProject(name: $name) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const AddProbePanelDocument = gql`
    mutation AddProbePanel($type: ProbeType!, $name: String!) {
  addProbePanel(type: $type, name: $name) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`;
export const AddSlotRegionDocument = gql`
    mutation AddSlotRegion($name: String!) {
  addSlotRegion(name: $name) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`;
export const AddSpeciesDocument = gql`
    mutation AddSpecies($name: String!) {
  addSpecies(name: $name) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
export const AddReleaseRecipientDocument = gql`
    mutation AddReleaseRecipient($username: String!, $fullName: String) {
  addReleaseRecipient(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
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
export const LogoutDocument = gql`
    mutation Logout {
  logout
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
${SampleFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
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
${PlanActionFieldsFragmentDoc}`;
export const PrintDocument = gql`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
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
${SampleFieldsFragmentDoc}`;
export const FlagLabwareDocument = gql`
    mutation FlagLabware($request: FlagLabwareRequest!) {
  flagLabware(request: $request) {
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
export const CreateWorkDocument = gql`
    mutation CreateWork($prefix: String!, $workType: String!, $workRequester: String!, $project: String!, $program: String!, $costCode: String!, $numBlocks: Int, $numSlides: Int, $numOriginalSamples: Int, $omeroProject: String, $ssStudyId: Int) {
  createWork(
    prefix: $prefix
    workType: $workType
    workRequester: $workRequester
    project: $project
    program: $program
    costCode: $costCode
    numBlocks: $numBlocks
    numSlides: $numSlides
    numOriginalSamples: $numOriginalSamples
    omeroProject: $omeroProject
    ssStudyId: $ssStudyId
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
${DnapStudyFieldsFragmentDoc}`;
export const RecordAnalyserDocument = gql`
    mutation RecordAnalyser($request: AnalyserRequest!) {
  recordAnalyser(request: $request) {
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
${SampleFieldsFragmentDoc}`;
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
export const RecordCompletionDocument = gql`
    mutation RecordCompletion($request: CompletionRequest!) {
  recordCompletion(request: $request) {
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
${SampleFieldsFragmentDoc}`;
export const RecordPermDocument = gql`
    mutation RecordPerm($request: RecordPermRequest!) {
  recordPerm(request: $request) {
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
export const RecordOpWithSlotCommentsDocument = gql`
    mutation RecordOpWithSlotComments($request: OpWithSlotCommentsRequest!) {
  recordOpWithSlotComments(request: $request) {
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
export const RecordProbeOperationDocument = gql`
    mutation RecordProbeOperation($request: ProbeOperationRequest!) {
  recordProbeOperation(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordMetricsDocument = gql`
    mutation RecordMetrics($request: SampleMetricsRequest!) {
  recordSampleMetrics(request: $request) {
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
export const RecordReagentTransferDocument = gql`
    mutation RecordReagentTransfer($request: ReagentTransferRequest!) {
  reagentTransfer(request: $request) {
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
${SampleFieldsFragmentDoc}`;
export const RecordVisiumQcDocument = gql`
    mutation RecordVisiumQC($request: ResultRequest!) {
  recordVisiumQC(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const RecordStainResultDocument = gql`
    mutation RecordStainResult($request: ResultRequest!) {
  recordStainResult(request: $request) {
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
${SampleFieldsFragmentDoc}`;
export const RegisterTissuesDocument = gql`
    mutation RegisterTissues($request: RegisterRequest!) {
  register(request: $request) {
    ...RegisterResultFields
  }
}
    ${RegisterResultFieldsFragmentDoc}
${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
export const RegisterAsEndUserDocument = gql`
    mutation RegisterAsEndUser($username: String!, $password: String!) {
  registerAsEndUser(username: $username, password: $password) {
    user {
      ...UserFields
    }
  }
}
    ${UserFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
export const SetBioRiskEnabledDocument = gql`
    mutation SetBioRiskEnabled($code: String!, $enabled: Boolean!) {
  setBioRiskEnabled(code: $code, enabled: $enabled) {
    ...BioRiskFields
  }
}
    ${BioRiskFieldsFragmentDoc}`;
export const SaveSlotCopyDocument = gql`
    mutation SaveSlotCopy($request: SlotCopySave!) {
  saveSlotCopy(request: $request) {
    ...SlotCopyLoadFields
  }
}
    ${SlotCopyLoadFieldsFragmentDoc}`;
export const SetCommentEnabledDocument = gql`
    mutation SetCommentEnabled($commentId: Int!, $enabled: Boolean!) {
  setCommentEnabled(commentId: $commentId, enabled: $enabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const SetDestructionReasonEnabledDocument = gql`
    mutation SetDestructionReasonEnabled($text: String!, $enabled: Boolean!) {
  setDestructionReasonEnabled(text: $text, enabled: $enabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
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
${SampleFieldsFragmentDoc}`;
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
export const SetCostCodeEnabledDocument = gql`
    mutation SetCostCodeEnabled($code: String!, $enabled: Boolean!) {
  setCostCodeEnabled(code: $code, enabled: $enabled) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`;
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
export const SetProgramEnabledDocument = gql`
    mutation SetProgramEnabled($name: String!, $enabled: Boolean!) {
  setProgramEnabled(name: $name, enabled: $enabled) {
    ...ProgramFields
  }
}
    ${ProgramFieldsFragmentDoc}`;
export const SetOmeroProjectEnabledDocument = gql`
    mutation SetOmeroProjectEnabled($name: String!, $enabled: Boolean!) {
  setOmeroProjectEnabled(name: $name, enabled: $enabled) {
    ...OmeroProjectFields
  }
}
    ${OmeroProjectFieldsFragmentDoc}`;
export const SetCellClassEnabledDocument = gql`
    mutation SetCellClassEnabled($name: String!, $enabled: Boolean!) {
  setCellClassEnabled(name: $name, enabled: $enabled) {
    ...CellClassFields
  }
}
    ${CellClassFieldsFragmentDoc}`;
export const SetProbePanelEnabledDocument = gql`
    mutation SetProbePanelEnabled($type: ProbeType!, $name: String!, $enabled: Boolean!) {
  setProbePanelEnabled(type: $type, name: $name, enabled: $enabled) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`;
export const SetReleaseRecipientEnabledDocument = gql`
    mutation SetReleaseRecipientEnabled($username: String!, $enabled: Boolean!) {
  setReleaseRecipientEnabled(username: $username, enabled: $enabled) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const SetHmdmcEnabledDocument = gql`
    mutation SetHmdmcEnabled($hmdmc: String!, $enabled: Boolean!) {
  setHmdmcEnabled(hmdmc: $hmdmc, enabled: $enabled) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`;
export const SetReleaseDestinationEnabledDocument = gql`
    mutation SetReleaseDestinationEnabled($name: String!, $enabled: Boolean!) {
  setReleaseDestinationEnabled(name: $name, enabled: $enabled) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`;
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
${UserFieldsFragmentDoc}`;
export const SetProjectEnabledDocument = gql`
    mutation SetProjectEnabled($name: String!, $enabled: Boolean!) {
  setProjectEnabled(name: $name, enabled: $enabled) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const SetSpeciesEnabledDocument = gql`
    mutation SetSpeciesEnabled($name: String!, $enabled: Boolean!) {
  setSpeciesEnabled(name: $name, enabled: $enabled) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
export const SetSlotRegionEnabledDocument = gql`
    mutation SetSlotRegionEnabled($name: String!, $enabled: Boolean!) {
  setSlotRegionEnabled(name: $name, enabled: $enabled) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`;
export const SetWorkTypeEnabledDocument = gql`
    mutation SetWorkTypeEnabled($name: String!, $enabled: Boolean!) {
  setWorkTypeEnabled(name: $name, enabled: $enabled) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`;
export const StainDocument = gql`
    mutation Stain($request: StainRequest!) {
  stain(request: $request) {
    operations {
      id
    }
  }
}
    `;
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
${SampleFieldsFragmentDoc}`;
export const StoreDocument = gql`
    mutation Store($store: [StoreInput!]!, $locationBarcode: String!) {
  store(store: $store, locationBarcode: $locationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}
${LinkedLocationFieldsFragmentDoc}`;
export const SetUserRoleDocument = gql`
    mutation SetUserRole($username: String!, $role: UserRole!) {
  setUserRole(username: $username, role: $role) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const SetSolutionEnabledDocument = gql`
    mutation SetSolutionEnabled($name: String!, $enabled: Boolean!) {
  setSolutionEnabled(name: $name, enabled: $enabled) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`;
export const UnstoreBarcodeDocument = gql`
    mutation UnstoreBarcode($barcode: String!) {
  unstoreBarcode(barcode: $barcode) {
    barcode
    address
  }
}
    `;
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
${DnapStudyFieldsFragmentDoc}`;
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
${DnapStudyFieldsFragmentDoc}`;
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
${DnapStudyFieldsFragmentDoc}`;
export const UpdateDnapStudiesDocument = gql`
    mutation UpdateDnapStudies {
  updateDnapStudies {
    ssId
    name
    enabled
  }
}
    `;
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
${DnapStudyFieldsFragmentDoc}`;
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
${DnapStudyFieldsFragmentDoc}`;
export const UpdateReleaseRecipientFullNameDocument = gql`
    mutation UpdateReleaseRecipientFullName($username: String!, $fullName: String) {
  updateReleaseRecipientFullName(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const VisiumAnalysisDocument = gql`
    mutation VisiumAnalysis($request: VisiumAnalysisRequest!) {
  visiumAnalysis(request: $request) {
    operations {
      id
    }
  }
}
    `;
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
${DnapStudyFieldsFragmentDoc}`;
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
${DnapStudyFieldsFragmentDoc}`;
export const CleanOutDocument = gql`
    mutation CleanOut($request: CleanOutRequest!) {
  cleanOut(request: $request) {
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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    CurrentUser(variables?: CurrentUserQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CurrentUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CurrentUserQuery>(CurrentUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CurrentUser', 'query', variables);
    },
    Find(variables: FindQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindQuery>(FindDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Find', 'query', variables);
    },
    FindFiles(variables: FindFilesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindFilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindFilesQuery>(FindFilesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindFiles', 'query', variables);
    },
    FindHistory(variables?: FindHistoryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryQuery>(FindHistoryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistory', 'query', variables);
    },
    FindFlaggedLabware(variables: FindFlaggedLabwareQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindFlaggedLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindFlaggedLabwareQuery>(FindFlaggedLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindFlaggedLabware', 'query', variables);
    },
    FindHistoryForExternalName(variables: FindHistoryForExternalNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryForExternalNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForExternalNameQuery>(FindHistoryForExternalNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForExternalName', 'query', variables);
    },
    FindHistoryForDonorName(variables: FindHistoryForDonorNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryForDonorNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForDonorNameQuery>(FindHistoryForDonorNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForDonorName', 'query', variables);
    },
    FindHistoryForLabwareBarcode(variables: FindHistoryForLabwareBarcodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryForLabwareBarcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForLabwareBarcodeQuery>(FindHistoryForLabwareBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForLabwareBarcode', 'query', variables);
    },
    FindLabwareLocation(variables: FindLabwareLocationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindLabwareLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLabwareLocationQuery>(FindLabwareLocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLabwareLocation', 'query', variables);
    },
    FindLabware(variables: FindLabwareQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLabwareQuery>(FindLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLabware', 'query', variables);
    },
    FindHistoryForSampleId(variables: FindHistoryForSampleIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryForSampleIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForSampleIdQuery>(FindHistoryForSampleIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForSampleId', 'query', variables);
    },
    FindHistoryForWorkNumber(variables: FindHistoryForWorkNumberQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryForWorkNumberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForWorkNumberQuery>(FindHistoryForWorkNumberDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForWorkNumber', 'query', variables);
    },
    FindLocationByBarcode(variables: FindLocationByBarcodeQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindLocationByBarcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLocationByBarcodeQuery>(FindLocationByBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLocationByBarcode', 'query', variables);
    },
    FindHistoryGraph(variables?: FindHistoryGraphQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindHistoryGraphQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryGraphQuery>(FindHistoryGraphDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryGraph', 'query', variables);
    },
    ExtractResult(variables: ExtractResultQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ExtractResultQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExtractResultQuery>(ExtractResultDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ExtractResult', 'query', variables);
    },
    FindReagentPlate(variables: FindReagentPlateQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindReagentPlateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindReagentPlateQuery>(FindReagentPlateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindReagentPlate', 'query', variables);
    },
    FindSamplePositions(variables: FindSamplePositionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindSamplePositionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindSamplePositionsQuery>(FindSamplePositionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindSamplePositions', 'query', variables);
    },
    FindMeasurementByBarcodeAndName(variables: FindMeasurementByBarcodeAndNameQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindMeasurementByBarcodeAndNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindMeasurementByBarcodeAndNameQuery>(FindMeasurementByBarcodeAndNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindMeasurementByBarcodeAndName', 'query', variables);
    },
    FindPlanData(variables: FindPlanDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindPlanDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPlanDataQuery>(FindPlanDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindPlanData', 'query', variables);
    },
    FindStoragePath(variables: FindStoragePathQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindStoragePathQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindStoragePathQuery>(FindStoragePathDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindStoragePath', 'query', variables);
    },
    FindWorkNumbers(variables: FindWorkNumbersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindWorkNumbersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkNumbersQuery>(FindWorkNumbersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorkNumbers', 'query', variables);
    },
    FindLatestOperation(variables: FindLatestOperationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindLatestOperationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLatestOperationQuery>(FindLatestOperationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLatestOperation', 'query', variables);
    },
    FindWorkInfo(variables: FindWorkInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindWorkInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkInfoQuery>(FindWorkInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorkInfo', 'query', variables);
    },
    FindWorkProgress(variables?: FindWorkProgressQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindWorkProgressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkProgressQuery>(FindWorkProgressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorkProgress', 'query', variables);
    },
    FindWorksCreatedBy(variables: FindWorksCreatedByQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindWorksCreatedByQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorksCreatedByQuery>(FindWorksCreatedByDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorksCreatedBy', 'query', variables);
    },
    FindPassFails(variables: FindPassFailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindPassFailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPassFailsQuery>(FindPassFailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindPassFails', 'query', variables);
    },
    GetAllWorkInfo(variables?: GetAllWorkInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAllWorkInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllWorkInfoQuery>(GetAllWorkInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetAllWorkInfo', 'query', variables);
    },
    GetComments(variables?: GetCommentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCommentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCommentsQuery>(GetCommentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetComments', 'query', variables);
    },
    GetBioRisks(variables?: GetBioRisksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetBioRisksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBioRisksQuery>(GetBioRisksDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetBioRisks', 'query', variables);
    },
    GetBlockProcessingInfo(variables?: GetBlockProcessingInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetBlockProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlockProcessingInfoQuery>(GetBlockProcessingInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetBlockProcessingInfo', 'query', variables);
    },
    FindPermData(variables: FindPermDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FindPermDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPermDataQuery>(FindPermDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindPermData', 'query', variables);
    },
    GetDestroyInfo(variables?: GetDestroyInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDestroyInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDestroyInfoQuery>(GetDestroyInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDestroyInfo', 'query', variables);
    },
    GetCellClasses(variables?: GetCellClassesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCellClassesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCellClassesQuery>(GetCellClassesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCellClasses', 'query', variables);
    },
    GetAnalyserScanData(variables: GetAnalyserScanDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetAnalyserScanDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAnalyserScanDataQuery>(GetAnalyserScanDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetAnalyserScanData', 'query', variables);
    },
    GetDestructionReasons(variables?: GetDestructionReasonsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDestructionReasonsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDestructionReasonsQuery>(GetDestructionReasonsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDestructionReasons', 'query', variables);
    },
    GetConfiguration(variables?: GetConfigurationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetConfigurationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConfigurationQuery>(GetConfigurationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetConfiguration', 'query', variables);
    },
    GetCleanedOutAddresses(variables: GetCleanedOutAddressesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetCleanedOutAddressesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCleanedOutAddressesQuery>(GetCleanedOutAddressesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetCleanedOutAddresses', 'query', variables);
    },
    GetLabwareCosting(variables: GetLabwareCostingQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetLabwareCostingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareCostingQuery>(GetLabwareCostingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareCosting', 'query', variables);
    },
    GetEquipments(variables?: GetEquipmentsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetEquipmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEquipmentsQuery>(GetEquipmentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetEquipments', 'query', variables);
    },
    GetDnapStudy(variables: GetDnapStudyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetDnapStudyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDnapStudyQuery>(GetDnapStudyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDnapStudy', 'query', variables);
    },
    GetLabwareInLocation(variables: GetLabwareInLocationQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetLabwareInLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareInLocationQuery>(GetLabwareInLocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareInLocation', 'query', variables);
    },
    GetParaffinProcessingInfo(variables?: GetParaffinProcessingInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetParaffinProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetParaffinProcessingInfoQuery>(GetParaffinProcessingInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetParaffinProcessingInfo', 'query', variables);
    },
    GetLabwareOperations(variables: GetLabwareOperationsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetLabwareOperationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareOperationsQuery>(GetLabwareOperationsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareOperations', 'query', variables);
    },
    GetEventTypes(variables?: GetEventTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetEventTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEventTypesQuery>(GetEventTypesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetEventTypes', 'query', variables);
    },
    GetOmeroProjects(variables?: GetOmeroProjectsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetOmeroProjectsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOmeroProjectsQuery>(GetOmeroProjectsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetOmeroProjects', 'query', variables);
    },
    GetNextReplicateNumber(variables: GetNextReplicateNumberQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetNextReplicateNumberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNextReplicateNumberQuery>(GetNextReplicateNumberDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetNextReplicateNumber', 'query', variables);
    },
    GetProbePanels(variables: GetProbePanelsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetProbePanelsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProbePanelsQuery>(GetProbePanelsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetProbePanels', 'query', variables);
    },
    GetLabwareBioRiskCodes(variables: GetLabwareBioRiskCodesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetLabwareBioRiskCodesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareBioRiskCodesQuery>(GetLabwareBioRiskCodesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareBioRiskCodes', 'query', variables);
    },
    GetPrinters(variables?: GetPrintersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPrintersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPrintersQuery>(GetPrintersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPrinters', 'query', variables);
    },
    GetPotProcessingInfo(variables?: GetPotProcessingInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetPotProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPotProcessingInfoQuery>(GetPotProcessingInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPotProcessingInfo', 'query', variables);
    },
    GetLabwareFlagDetails(variables: GetLabwareFlagDetailsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetLabwareFlagDetailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareFlagDetailsQuery>(GetLabwareFlagDetailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareFlagDetails', 'query', variables);
    },
    GetPrograms(variables?: GetProgramsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetProgramsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProgramsQuery>(GetProgramsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPrograms', 'query', variables);
    },
    GetOperationTypes(variables?: GetOperationTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetOperationTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOperationTypesQuery>(GetOperationTypesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetOperationTypes', 'query', variables);
    },
    GetRecordExtractResultInfo(variables?: GetRecordExtractResultInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRecordExtractResultInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordExtractResultInfoQuery>(GetRecordExtractResultInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRecordExtractResultInfo', 'query', variables);
    },
    GetRecordInPlaceInfo(variables?: GetRecordInPlaceInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRecordInPlaceInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordInPlaceInfoQuery>(GetRecordInPlaceInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRecordInPlaceInfo', 'query', variables);
    },
    GetReleaseColumnOptions(variables?: GetReleaseColumnOptionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetReleaseColumnOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReleaseColumnOptionsQuery>(GetReleaseColumnOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetReleaseColumnOptions', 'query', variables);
    },
    GetRegistrationInfo(variables?: GetRegistrationInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRegistrationInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRegistrationInfoQuery>(GetRegistrationInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRegistrationInfo', 'query', variables);
    },
    GetRunNames(variables: GetRunNamesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRunNamesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRunNamesQuery>(GetRunNamesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRunNames', 'query', variables);
    },
    GetSampleProcessingCommentsInfo(variables?: GetSampleProcessingCommentsInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSampleProcessingCommentsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSampleProcessingCommentsInfoQuery>(GetSampleProcessingCommentsInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSampleProcessingCommentsInfo', 'query', variables);
    },
    GetRegionsOfInterest(variables: GetRegionsOfInterestQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRegionsOfInterestQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRegionsOfInterestQuery>(GetRegionsOfInterestDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRegionsOfInterest', 'query', variables);
    },
    GetSectioningConfirmInfo(variables?: GetSectioningConfirmInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSectioningConfirmInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSectioningConfirmInfoQuery>(GetSectioningConfirmInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSectioningConfirmInfo', 'query', variables);
    },
    GetReleaseInfo(variables?: GetReleaseInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetReleaseInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReleaseInfoQuery>(GetReleaseInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetReleaseInfo', 'query', variables);
    },
    GetSectioningInfo(variables?: GetSectioningInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSectioningInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSectioningInfoQuery>(GetSectioningInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSectioningInfo', 'query', variables);
    },
    GetSolutionTransferInfo(variables?: GetSolutionTransferInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSolutionTransferInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSolutionTransferInfoQuery>(GetSolutionTransferInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSolutionTransferInfo', 'query', variables);
    },
    GetSlotRegions(variables?: GetSlotRegionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSlotRegionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSlotRegionsQuery>(GetSlotRegionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSlotRegions', 'query', variables);
    },
    GetStainInfo(variables?: GetStainInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetStainInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainInfoQuery>(GetStainInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetStainInfo', 'query', variables);
    },
    GetSuggestedWorkForLabware(variables: GetSuggestedWorkForLabwareQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSuggestedWorkForLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSuggestedWorkForLabwareQuery>(GetSuggestedWorkForLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSuggestedWorkForLabware', 'query', variables);
    },
    GetSuggestedLabwareForWork(variables: GetSuggestedLabwareForWorkQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSuggestedLabwareForWorkQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSuggestedLabwareForWorkQuery>(GetSuggestedLabwareForWorkDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSuggestedLabwareForWork', 'query', variables);
    },
    GetStainingQCInfo(variables?: GetStainingQcInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetStainingQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainingQcInfoQuery>(GetStainingQcInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetStainingQCInfo', 'query', variables);
    },
    GetRunRois(variables: GetRunRoisQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetRunRoisQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRunRoisQuery>(GetRunRoisDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRunRois', 'query', variables);
    },
    GetVisiumQCInfo(variables?: GetVisiumQcInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetVisiumQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVisiumQcInfoQuery>(GetVisiumQcInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetVisiumQCInfo', 'query', variables);
    },
    GetStainReagentTypes(variables?: GetStainReagentTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetStainReagentTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainReagentTypesQuery>(GetStainReagentTypesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetStainReagentTypes', 'query', variables);
    },
    GetSearchInfo(variables?: GetSearchInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetSearchInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSearchInfoQuery>(GetSearchInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSearchInfo', 'query', variables);
    },
    GetWorkAllocationInfo(variables: GetWorkAllocationInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetWorkAllocationInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkAllocationInfoQuery>(GetWorkAllocationInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkAllocationInfo', 'query', variables);
    },
    GetWorkNumbers(variables?: GetWorkNumbersQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetWorkNumbersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkNumbersQuery>(GetWorkNumbersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkNumbers', 'query', variables);
    },
    GetWorkTypes(variables?: GetWorkTypesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetWorkTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkTypesQuery>(GetWorkTypesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkTypes', 'query', variables);
    },
    GetWorkSummary(variables?: GetWorkSummaryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetWorkSummaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkSummaryQuery>(GetWorkSummaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkSummary', 'query', variables);
    },
    AddBioRisk(variables: AddBioRiskMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddBioRiskMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddBioRiskMutation>(AddBioRiskDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddBioRisk', 'mutation', variables);
    },
    GetWorkProgressInputs(variables?: GetWorkProgressInputsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetWorkProgressInputsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkProgressInputsQuery>(GetWorkProgressInputsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkProgressInputs', 'query', variables);
    },
    ReloadSlotCopy(variables: ReloadSlotCopyQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ReloadSlotCopyQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReloadSlotCopyQuery>(ReloadSlotCopyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ReloadSlotCopy', 'query', variables);
    },
    AddComment(variables: AddCommentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCommentMutation>(AddCommentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddComment', 'mutation', variables);
    },
    AddCostCode(variables: AddCostCodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddCostCodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCostCodeMutation>(AddCostCodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddCostCode', 'mutation', variables);
    },
    GetXeniumQCInfo(variables?: GetXeniumQcInfoQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<GetXeniumQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetXeniumQcInfoQuery>(GetXeniumQcInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetXeniumQCInfo', 'query', variables);
    },
    AddDestructionReason(variables: AddDestructionReasonMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddDestructionReasonMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddDestructionReasonMutation>(AddDestructionReasonDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddDestructionReason', 'mutation', variables);
    },
    AddExternalID(variables: AddExternalIdMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddExternalIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddExternalIdMutation>(AddExternalIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddExternalID', 'mutation', variables);
    },
    AddEquipment(variables: AddEquipmentMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddEquipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddEquipmentMutation>(AddEquipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddEquipment', 'mutation', variables);
    },
    AddHmdmc(variables: AddHmdmcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddHmdmcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddHmdmcMutation>(AddHmdmcDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddHmdmc', 'mutation', variables);
    },
    AddFixative(variables: AddFixativeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddFixativeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFixativeMutation>(AddFixativeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddFixative', 'mutation', variables);
    },
    AddOmeroProject(variables: AddOmeroProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddOmeroProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddOmeroProjectMutation>(AddOmeroProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddOmeroProject', 'mutation', variables);
    },
    AddProgram(variables: AddProgramMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddProgramMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProgramMutation>(AddProgramDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddProgram', 'mutation', variables);
    },
    AddReleaseDestination(variables: AddReleaseDestinationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddReleaseDestinationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReleaseDestinationMutation>(AddReleaseDestinationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddReleaseDestination', 'mutation', variables);
    },
    AddSolution(variables: AddSolutionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddSolutionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSolutionMutation>(AddSolutionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSolution', 'mutation', variables);
    },
    AddProject(variables: AddProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProjectMutation>(AddProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddProject', 'mutation', variables);
    },
    AddProbePanel(variables: AddProbePanelMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddProbePanelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProbePanelMutation>(AddProbePanelDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddProbePanel', 'mutation', variables);
    },
    AddSlotRegion(variables: AddSlotRegionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddSlotRegionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSlotRegionMutation>(AddSlotRegionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSlotRegion', 'mutation', variables);
    },
    AddSpecies(variables: AddSpeciesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddSpeciesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSpeciesMutation>(AddSpeciesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSpecies', 'mutation', variables);
    },
    AddUser(variables: AddUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddUserMutation>(AddUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddUser', 'mutation', variables);
    },
    AddWorkType(variables: AddWorkTypeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddWorkTypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddWorkTypeMutation>(AddWorkTypeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddWorkType', 'mutation', variables);
    },
    Aliquot(variables: AliquotMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AliquotMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AliquotMutation>(AliquotDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Aliquot', 'mutation', variables);
    },
    AddReleaseRecipient(variables: AddReleaseRecipientMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddReleaseRecipientMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReleaseRecipientMutation>(AddReleaseRecipientDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddReleaseRecipient', 'mutation', variables);
    },
    Confirm(variables: ConfirmMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ConfirmMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ConfirmMutation>(ConfirmDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Confirm', 'mutation', variables);
    },
    ConfirmSection(variables: ConfirmSectionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ConfirmSectionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ConfirmSectionMutation>(ConfirmSectionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ConfirmSection', 'mutation', variables);
    },
    EmptyLocation(variables: EmptyLocationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<EmptyLocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EmptyLocationMutation>(EmptyLocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'EmptyLocation', 'mutation', variables);
    },
    Extract(variables: ExtractMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ExtractMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExtractMutation>(ExtractDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Extract', 'mutation', variables);
    },
    AddTissueType(variables: AddTissueTypeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddTissueTypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddTissueTypeMutation>(AddTissueTypeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddTissueType', 'mutation', variables);
    },
    AddSpatialLocations(variables: AddSpatialLocationsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddSpatialLocationsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSpatialLocationsMutation>(AddSpatialLocationsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSpatialLocations', 'mutation', variables);
    },
    Logout(variables?: LogoutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<LogoutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LogoutMutation>(LogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Logout', 'mutation', variables);
    },
    Login(variables: LoginMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<LoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Login', 'mutation', variables);
    },
    Destroy(variables: DestroyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<DestroyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DestroyMutation>(DestroyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Destroy', 'mutation', variables);
    },
    PerformTissueBlock(variables: PerformTissueBlockMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PerformTissueBlockMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformTissueBlockMutation>(PerformTissueBlockDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformTissueBlock', 'mutation', variables);
    },
    PerformSolutionTransfer(variables: PerformSolutionTransferMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PerformSolutionTransferMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformSolutionTransferMutation>(PerformSolutionTransferDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformSolutionTransfer', 'mutation', variables);
    },
    PerformTissuePot(variables: PerformTissuePotMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PerformTissuePotMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformTissuePotMutation>(PerformTissuePotDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformTissuePot', 'mutation', variables);
    },
    Plan(variables: PlanMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlanMutation>(PlanDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Plan', 'mutation', variables);
    },
    Print(variables: PrintMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PrintMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PrintMutation>(PrintDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Print', 'mutation', variables);
    },
    PerformParaffinProcessing(variables: PerformParaffinProcessingMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<PerformParaffinProcessingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformParaffinProcessingMutation>(PerformParaffinProcessingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformParaffinProcessing', 'mutation', variables);
    },
    FlagLabware(variables: FlagLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<FlagLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<FlagLabwareMutation>(FlagLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FlagLabware', 'mutation', variables);
    },
    RecordComplexStain(variables: RecordComplexStainMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordComplexStainMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordComplexStainMutation>(RecordComplexStainDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordComplexStain', 'mutation', variables);
    },
    CreateWork(variables: CreateWorkMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CreateWorkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWorkMutation>(CreateWorkDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateWork', 'mutation', variables);
    },
    RecordAnalyser(variables: RecordAnalyserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordAnalyserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordAnalyserMutation>(RecordAnalyserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordAnalyser', 'mutation', variables);
    },
    RecordExtractResult(variables: RecordExtractResultMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordExtractResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordExtractResultMutation>(RecordExtractResultDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordExtractResult', 'mutation', variables);
    },
    RecordLibraryPrep(variables: RecordLibraryPrepMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordLibraryPrepMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordLibraryPrepMutation>(RecordLibraryPrepDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordLibraryPrep', 'mutation', variables);
    },
    ReactivateLabware(variables: ReactivateLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ReactivateLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReactivateLabwareMutation>(ReactivateLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ReactivateLabware', 'mutation', variables);
    },
    RecordCompletion(variables: RecordCompletionMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordCompletionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordCompletionMutation>(RecordCompletionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordCompletion', 'mutation', variables);
    },
    RecordInPlace(variables: RecordInPlaceMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordInPlaceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordInPlaceMutation>(RecordInPlaceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordInPlace', 'mutation', variables);
    },
    RecordPerm(variables: RecordPermMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordPermMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordPermMutation>(RecordPermDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordPerm', 'mutation', variables);
    },
    RecordOpWithSlotMeasurements(variables: RecordOpWithSlotMeasurementsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordOpWithSlotMeasurementsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOpWithSlotMeasurementsMutation>(RecordOpWithSlotMeasurementsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordOpWithSlotMeasurements', 'mutation', variables);
    },
    RecordOpWithSlotComments(variables: RecordOpWithSlotCommentsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordOpWithSlotCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOpWithSlotCommentsMutation>(RecordOpWithSlotCommentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordOpWithSlotComments', 'mutation', variables);
    },
    RecordOrientationQC(variables: RecordOrientationQcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordOrientationQcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOrientationQcMutation>(RecordOrientationQcDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordOrientationQC', 'mutation', variables);
    },
    RecordProbeOperation(variables: RecordProbeOperationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordProbeOperationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordProbeOperationMutation>(RecordProbeOperationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordProbeOperation', 'mutation', variables);
    },
    RecordMetrics(variables: RecordMetricsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordMetricsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordMetricsMutation>(RecordMetricsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordMetrics', 'mutation', variables);
    },
    RecordRNAAnalysis(variables: RecordRnaAnalysisMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordRnaAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordRnaAnalysisMutation>(RecordRnaAnalysisDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordRNAAnalysis', 'mutation', variables);
    },
    RecordReagentTransfer(variables: RecordReagentTransferMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordReagentTransferMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordReagentTransferMutation>(RecordReagentTransferDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordReagentTransfer', 'mutation', variables);
    },
    RecordSampleProcessingComments(variables: RecordSampleProcessingCommentsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordSampleProcessingCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordSampleProcessingCommentsMutation>(RecordSampleProcessingCommentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordSampleProcessingComments', 'mutation', variables);
    },
    RecordVisiumQC(variables: RecordVisiumQcMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordVisiumQcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordVisiumQcMutation>(RecordVisiumQcDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordVisiumQC', 'mutation', variables);
    },
    RecordStainResult(variables: RecordStainResultMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordStainResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordStainResultMutation>(RecordStainResultDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordStainResult', 'mutation', variables);
    },
    RecordQCLabware(variables: RecordQcLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RecordQcLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordQcLabwareMutation>(RecordQcLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordQCLabware', 'mutation', variables);
    },
    ReleaseLabware(variables: ReleaseLabwareMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<ReleaseLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReleaseLabwareMutation>(ReleaseLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ReleaseLabware', 'mutation', variables);
    },
    RegisterSections(variables: RegisterSectionsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RegisterSectionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterSectionsMutation>(RegisterSectionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterSections', 'mutation', variables);
    },
    RegisterTissues(variables: RegisterTissuesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RegisterTissuesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterTissuesMutation>(RegisterTissuesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterTissues', 'mutation', variables);
    },
    RegisterAsEndUser(variables: RegisterAsEndUserMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RegisterAsEndUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterAsEndUserMutation>(RegisterAsEndUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterAsEndUser', 'mutation', variables);
    },
    Segmentation(variables: SegmentationMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SegmentationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SegmentationMutation>(SegmentationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Segmentation', 'mutation', variables);
    },
    SetBioRiskEnabled(variables: SetBioRiskEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetBioRiskEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetBioRiskEnabledMutation>(SetBioRiskEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetBioRiskEnabled', 'mutation', variables);
    },
    SaveSlotCopy(variables: SaveSlotCopyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SaveSlotCopyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SaveSlotCopyMutation>(SaveSlotCopyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SaveSlotCopy', 'mutation', variables);
    },
    SetCommentEnabled(variables: SetCommentEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetCommentEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCommentEnabledMutation>(SetCommentEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetCommentEnabled', 'mutation', variables);
    },
    SetDestructionReasonEnabled(variables: SetDestructionReasonEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetDestructionReasonEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetDestructionReasonEnabledMutation>(SetDestructionReasonEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetDestructionReasonEnabled', 'mutation', variables);
    },
    RegisterOriginalSamples(variables: RegisterOriginalSamplesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<RegisterOriginalSamplesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterOriginalSamplesMutation>(RegisterOriginalSamplesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterOriginalSamples', 'mutation', variables);
    },
    SetEquipmentEnabled(variables: SetEquipmentEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetEquipmentEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetEquipmentEnabledMutation>(SetEquipmentEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetEquipmentEnabled', 'mutation', variables);
    },
    SetFixativeEnabled(variables: SetFixativeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetFixativeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetFixativeEnabledMutation>(SetFixativeEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetFixativeEnabled', 'mutation', variables);
    },
    SetCostCodeEnabled(variables: SetCostCodeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetCostCodeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCostCodeEnabledMutation>(SetCostCodeEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetCostCodeEnabled', 'mutation', variables);
    },
    SetLocationCustomName(variables: SetLocationCustomNameMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetLocationCustomNameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetLocationCustomNameMutation>(SetLocationCustomNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetLocationCustomName', 'mutation', variables);
    },
    SetProgramEnabled(variables: SetProgramEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetProgramEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProgramEnabledMutation>(SetProgramEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetProgramEnabled', 'mutation', variables);
    },
    SetOmeroProjectEnabled(variables: SetOmeroProjectEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetOmeroProjectEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOmeroProjectEnabledMutation>(SetOmeroProjectEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetOmeroProjectEnabled', 'mutation', variables);
    },
    SetCellClassEnabled(variables: SetCellClassEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetCellClassEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCellClassEnabledMutation>(SetCellClassEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetCellClassEnabled', 'mutation', variables);
    },
    SetProbePanelEnabled(variables: SetProbePanelEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetProbePanelEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProbePanelEnabledMutation>(SetProbePanelEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetProbePanelEnabled', 'mutation', variables);
    },
    SetReleaseRecipientEnabled(variables: SetReleaseRecipientEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetReleaseRecipientEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetReleaseRecipientEnabledMutation>(SetReleaseRecipientEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetReleaseRecipientEnabled', 'mutation', variables);
    },
    SetHmdmcEnabled(variables: SetHmdmcEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetHmdmcEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetHmdmcEnabledMutation>(SetHmdmcEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetHmdmcEnabled', 'mutation', variables);
    },
    SetReleaseDestinationEnabled(variables: SetReleaseDestinationEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetReleaseDestinationEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetReleaseDestinationEnabledMutation>(SetReleaseDestinationEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetReleaseDestinationEnabled', 'mutation', variables);
    },
    SetOpWorkRequest(variables: SetOpWorkRequestMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetOpWorkRequestMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOpWorkRequestMutation>(SetOpWorkRequestDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetOpWorkRequest', 'mutation', variables);
    },
    SetProjectEnabled(variables: SetProjectEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetProjectEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProjectEnabledMutation>(SetProjectEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetProjectEnabled', 'mutation', variables);
    },
    SetSpeciesEnabled(variables: SetSpeciesEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetSpeciesEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSpeciesEnabledMutation>(SetSpeciesEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetSpeciesEnabled', 'mutation', variables);
    },
    SetSlotRegionEnabled(variables: SetSlotRegionEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetSlotRegionEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSlotRegionEnabledMutation>(SetSlotRegionEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetSlotRegionEnabled', 'mutation', variables);
    },
    SetWorkTypeEnabled(variables: SetWorkTypeEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetWorkTypeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetWorkTypeEnabledMutation>(SetWorkTypeEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetWorkTypeEnabled', 'mutation', variables);
    },
    Stain(variables: StainMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<StainMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StainMutation>(StainDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Stain', 'mutation', variables);
    },
    SlotCopy(variables: SlotCopyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SlotCopyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SlotCopyMutation>(SlotCopyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SlotCopy', 'mutation', variables);
    },
    Store(variables: StoreMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<StoreMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StoreMutation>(StoreDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Store', 'mutation', variables);
    },
    SetUserRole(variables: SetUserRoleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetUserRoleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetUserRoleMutation>(SetUserRoleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetUserRole', 'mutation', variables);
    },
    SetSolutionEnabled(variables: SetSolutionEnabledMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<SetSolutionEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSolutionEnabledMutation>(SetSolutionEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetSolutionEnabled', 'mutation', variables);
    },
    UnstoreBarcode(variables: UnstoreBarcodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UnstoreBarcodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnstoreBarcodeMutation>(UnstoreBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UnstoreBarcode', 'mutation', variables);
    },
    StoreBarcode(variables: StoreBarcodeMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<StoreBarcodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StoreBarcodeMutation>(StoreBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'StoreBarcode', 'mutation', variables);
    },
    TransferLocationItems(variables: TransferLocationItemsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<TransferLocationItemsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<TransferLocationItemsMutation>(TransferLocationItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'TransferLocationItems', 'mutation', variables);
    },
    Unrelease(variables: UnreleaseMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UnreleaseMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnreleaseMutation>(UnreleaseDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Unrelease', 'mutation', variables);
    },
    UpdateWorkNumOriginalSamples(variables: UpdateWorkNumOriginalSamplesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkNumOriginalSamplesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumOriginalSamplesMutation>(UpdateWorkNumOriginalSamplesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkNumOriginalSamples', 'mutation', variables);
    },
    UpdateWorkNumSlides(variables: UpdateWorkNumSlidesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkNumSlidesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumSlidesMutation>(UpdateWorkNumSlidesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkNumSlides', 'mutation', variables);
    },
    UpdateWorkNumBlocks(variables: UpdateWorkNumBlocksMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkNumBlocksMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumBlocksMutation>(UpdateWorkNumBlocksDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkNumBlocks', 'mutation', variables);
    },
    UpdateDnapStudies(variables?: UpdateDnapStudiesMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateDnapStudiesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateDnapStudiesMutation>(UpdateDnapStudiesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateDnapStudies', 'mutation', variables);
    },
    UpdateWorkDnapStudy(variables: UpdateWorkDnapStudyMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkDnapStudyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkDnapStudyMutation>(UpdateWorkDnapStudyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkDnapStudy', 'mutation', variables);
    },
    UpdateWorkOmeroProject(variables: UpdateWorkOmeroProjectMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkOmeroProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkOmeroProjectMutation>(UpdateWorkOmeroProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkOmeroProject', 'mutation', variables);
    },
    UpdateReleaseRecipientFullName(variables: UpdateReleaseRecipientFullNameMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateReleaseRecipientFullNameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateReleaseRecipientFullNameMutation>(UpdateReleaseRecipientFullNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateReleaseRecipientFullName', 'mutation', variables);
    },
    VisiumAnalysis(variables: VisiumAnalysisMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<VisiumAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VisiumAnalysisMutation>(VisiumAnalysisDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'VisiumAnalysis', 'mutation', variables);
    },
    UpdateWorkPriority(variables: UpdateWorkPriorityMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkPriorityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkPriorityMutation>(UpdateWorkPriorityDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkPriority', 'mutation', variables);
    },
    UpdateWorkStatus(variables: UpdateWorkStatusMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<UpdateWorkStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkStatusMutation>(UpdateWorkStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkStatus', 'mutation', variables);
    },
    CleanOut(variables: CleanOutMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<CleanOutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CleanOutMutation>(CleanOutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CleanOut', 'mutation', variables);
    },
    AddCellClass(variables: AddCellClassMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<AddCellClassMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCellClassMutation>(AddCellClassDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddCellClass', 'mutation', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;