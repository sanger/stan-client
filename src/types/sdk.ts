import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import { gql } from 'graphql-request';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A row/column combination, either in the form "B5" (row 2, column 5), or "32,15" (row 32, column 15) */
  Address: string;
  /** A point in time, typically in the format yyyy-mm-dd HH:MM:SS. */
  Timestamp: string;
  /** A date, typically in the format yyyy-mm-dd. */
  Date: string;
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
  Sgp = 'SGP'
}

/** Position of a cassette in an analyser. */
export enum CassettePosition {
  Left = 'left',
  Right = 'right'
}

/** A user, who is associated with performing actions in the application. */
export type User = {
  __typename?: 'User';
  username: Scalars['String'];
  role: UserRole;
};

/** The result of an attempt to log in. */
export type LoginResult = {
  __typename?: 'LoginResult';
  /** The message describing the result of the login, if any. */
  message?: Maybe<Scalars['String']>;
  /** The authenticated user, if any. */
  user?: Maybe<User>;
};

/** A chemical a sample is put in. */
export type Medium = {
  __typename?: 'Medium';
  name: Scalars['String'];
};

/** A chemical used to fix a sample. */
export type Fixative = {
  __typename?: 'Fixative';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** The type of tissue, typically an organ. */
export type TissueType = {
  __typename?: 'TissueType';
  name: Scalars['String'];
  /** The possible spatial locations for tissue of this type. */
  spatialLocations: Array<SpatialLocation>;
};

/** A location in an organ that tissue was taken from. */
export type SpatialLocation = {
  __typename?: 'SpatialLocation';
  name: Scalars['String'];
  /** The int code used to identify this spatial location in the particular tissue type. */
  code: Scalars['Int'];
  /** The tissue type (organ) to which this location belongs. */
  tissueType: TissueType;
};

/** A permission number that can be linked to tissue. */
export type Hmdmc = {
  __typename?: 'Hmdmc';
  /** The HMDMC code for this permission. */
  hmdmc: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A type of label that can be printed, typically including a barcode and some other information. */
export type LabelType = {
  __typename?: 'LabelType';
  name: Scalars['String'];
};

/** A type of labware, such as slides and tubes. */
export type LabwareType = {
  __typename?: 'LabwareType';
  name: Scalars['String'];
  /** The number of rows in an item of this labware type. */
  numRows: Scalars['Int'];
  /** The number of columns in an item of this labware type. */
  numColumns: Scalars['Int'];
  /** The type of label that should be used for this labware type. */
  labelType?: Maybe<LabelType>;
};

/** A species, such as human, to which tissue may belong. */
export type Species = {
  __typename?: 'Species';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A particular individual from which one or more instances of tissue may be taken. */
export type Donor = {
  __typename?: 'Donor';
  donorName: Scalars['String'];
  /** The stage of life of this donor at the point the tissue was collected. */
  lifeStage: LifeStage;
  species: Species;
};

/** The state of a particular sample. As samples are created in new labware by different operations, it is associated with new bio states. */
export type BioState = {
  __typename?: 'BioState';
  name: Scalars['String'];
};

/** A piece of tissue from which multiple samples may originate. */
export type Tissue = {
  __typename?: 'Tissue';
  externalName?: Maybe<Scalars['String']>;
  /** A number (optionall followed by a letter) that helps to distinguish this tissue from other similar tissues. */
  replicate?: Maybe<Scalars['String']>;
  /** The location in a particular organ from which this tissue was taken. */
  spatialLocation: SpatialLocation;
  /** The individual from whom this tissue was taken. */
  donor: Donor;
  hmdmc?: Maybe<Hmdmc>;
  /** The medium used on this tissue. */
  medium: Medium;
  /** The fixative used on this tissue. */
  fixative: Fixative;
  /** The date the original sample was collected, if known. */
  collectionDate?: Maybe<Scalars['Date']>;
};

/** A particular sample of tissue, in a particular state. */
export type Sample = {
  __typename?: 'Sample';
  id: Scalars['Int'];
  /** An optional number describing the particular slice through the block of tissue that this sample came from. */
  section?: Maybe<Scalars['Int']>;
  /** The tissue this sample is derived from. */
  tissue: Tissue;
  /** The state of this particular sample. */
  bioState: BioState;
};

/** A slot in a piece of labware, which may contain samples. */
export type Slot = {
  __typename?: 'Slot';
  /** The unique id of this slot. */
  id: Scalars['Int'];
  /** The address of this slot inside its labware. No two slots in the same item of labware have the same address. */
  address: Scalars['Address'];
  /** The id of the labware to which the slot belongs. */
  labwareId: Scalars['Int'];
  /** The list of samples contained in this slot. May be empty. */
  samples: Array<Sample>;
  /** Is this slot a block of tissue? Blocks have different properties from sections. */
  block: Scalars['Boolean'];
  /** For blocks, what is the highest section number already taken from this block? */
  blockHighestSection?: Maybe<Scalars['Int']>;
};

export type Labware = {
  __typename?: 'Labware';
  /** The unique id of this labware. */
  id: Scalars['Int'];
  /** The unique barcode of this labware. */
  barcode: Scalars['String'];
  /** The external barcode of this labware, as input by the user. */
  externalBarcode?: Maybe<Scalars['String']>;
  /** The type of labware. */
  labwareType: LabwareType;
  /** The slots in this labware. The number of slots and their addresses are determined by the labware type. */
  slots: Array<Slot>;
  /** Has this labware been released? */
  released: Scalars['Boolean'];
  /** Has this labware been destroyed? */
  destroyed: Scalars['Boolean'];
  /** Has this labware been discarded? */
  discarded: Scalars['Boolean'];
  /** Has this labware been marked as used? */
  used: Scalars['Boolean'];
  /** The state, derived from the contents and other fields on the labware. */
  state: LabwareState;
  /** The time when this labware was created in the application. */
  created: Scalars['Timestamp'];
};

/** A solution used in an operation. */
export type Solution = {
  __typename?: 'Solution';
  /** The unique name of the solution. */
  name: Scalars['String'];
  /** Whether the solution is available for use. */
  enabled: Scalars['Boolean'];
};

/** A project in Omero. */
export type OmeroProject = {
  __typename?: 'OmeroProject';
  /** The name of the Omero project. */
  name: Scalars['String'];
  /** Whether the Omero project is available for use in Stan. */
  enabled: Scalars['Boolean'];
};

/** A probe panel. */
export type ProbePanel = {
  __typename?: 'ProbePanel';
  /** The name of the probe panel. */
  name: Scalars['String'];
  /** Whether the probe panel is available for use. */
  enabled: Scalars['Boolean'];
};

/** A request to register a new block of tissue. */
export type BlockRegisterRequest = {
  /** The string to use as the donor name. */
  donorIdentifier: Scalars['String'];
  /** The life stage of the donor. */
  lifeStage: LifeStage;
  /** The HMDMC to use for the tissue. */
  hmdmc?: InputMaybe<Scalars['String']>;
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: Scalars['String'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int'];
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: Scalars['String'];
  /** The external identifier used to identify the tissue. */
  externalIdentifier: Scalars['String'];
  /** The highest section already taken from the tissue block. */
  highestSection: Scalars['Int'];
  /** The name of the type of labware containing the block. */
  labwareType: Scalars['String'];
  /** The medium used for the tissue. */
  medium: Scalars['String'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String'];
  /** The species of the donor. */
  species: Scalars['String'];
  /** Is this a new block of tissue already in the application's database? */
  existingTissue?: InputMaybe<Scalars['Boolean']>;
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: InputMaybe<Scalars['Date']>;
};

/** A request to register one or more blocks of tissue. */
export type RegisterRequest = {
  blocks: Array<BlockRegisterRequest>;
  workNumbers: Array<Scalars['String']>;
};

/** Information about a section of tissue (already taken from some a block tracked elsewhere) to register. */
export type SectionRegisterContent = {
  /** The address of the slot in the labware where this section should be created. */
  address: Scalars['Address'];
  /** The species from which this section originates. */
  species: Scalars['String'];
  /** A HMDMC number, if any, to associate with this sample. */
  hmdmc?: InputMaybe<Scalars['String']>;
  /** A name for the donor. */
  donorIdentifier: Scalars['String'];
  /** The life stage of the donor. */
  lifeStage: LifeStage;
  /** The external name for the tissue from which this section was taken. */
  externalIdentifier: Scalars['String'];
  /** The name of the tissue type (organ) for the tissue. */
  tissueType: Scalars['String'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int'];
  /** The string to use for the replicate number of the tissue. */
  replicateNumber: Scalars['String'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String'];
  /** The medium used for the tissue. */
  medium: Scalars['String'];
  /** The section number of this particular section from its original tissue block. */
  sectionNumber: Scalars['Int'];
  /** The thickness, if known, of this section. */
  sectionThickness?: InputMaybe<Scalars['Int']>;
  /** The region of this sample in this slot, if any. */
  region?: InputMaybe<Scalars['String']>;
};

/** A request to register one or more sections into one piece of labware. */
export type SectionRegisterLabware = {
  /** The name of the type of labware. */
  labwareType: Scalars['String'];
  /** The external barcode of this labware. */
  externalBarcode: Scalars['String'];
  /** The prebarcode of this labware, if any. */
  preBarcode?: InputMaybe<Scalars['String']>;
  /** The contents of the labware (new sections). */
  contents: Array<SectionRegisterContent>;
};

/** A request to register one or more labware containing new sections. */
export type SectionRegisterRequest = {
  /** The details of the labware being registered. */
  labware: Array<SectionRegisterLabware>;
  /** The work number to associate with the registration. */
  workNumber: Scalars['String'];
};

/** Data about registering a new original sample. */
export type OriginalSampleData = {
  /** The string to use as the donor name. */
  donorIdentifier: Scalars['String'];
  /** The life stage of the donor. */
  lifeStage: LifeStage;
  /** The HMDMC to use for the tissue. */
  hmdmc?: InputMaybe<Scalars['String']>;
  /** The name of the tissue type (the organ from which the tissue is taken). */
  tissueType: Scalars['String'];
  /** The code for the spatial location from which the tissue is taken. */
  spatialLocation: Scalars['Int'];
  /** The string to use for the replicate number of the tissue (optional). */
  replicateNumber?: InputMaybe<Scalars['String']>;
  /** The external identifier used to identify the tissue. */
  externalIdentifier?: InputMaybe<Scalars['String']>;
  /** The name of the type of labware containing the sample. */
  labwareType: Scalars['String'];
  /** The solution used for the tissue. */
  solution: Scalars['String'];
  /** The fixative used for the tissue. */
  fixative: Scalars['String'];
  /** The species of the donor. */
  species: Scalars['String'];
  /** The date the original sample was collected, if known. */
  sampleCollectionDate?: InputMaybe<Scalars['Date']>;
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
  barcode: Scalars['String'];
  /** The name of a solution. */
  solutionName: Scalars['String'];
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
  barcode: Scalars['String'];
  /** The address of the source slot in its labware. May be assumed to be A1 if omitted. */
  address?: InputMaybe<Scalars['Address']>;
};

/** A type of operation that may be recorded. */
export type OperationType = {
  __typename?: 'OperationType';
  name: Scalars['String'];
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
  newSection?: Maybe<Scalars['Int']>;
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
  address: Scalars['Address'];
  /** The id of the existing sample. */
  sampleId: Scalars['Int'];
  /** The thickness (if specified) of the new sample. */
  sampleThickness?: InputMaybe<Scalars['Int']>;
  /** The source of the sample (describing a slot in some existing labware). */
  source: PlanRequestSource;
};

/** A specification of new labware to be created for a plan request. */
export type PlanRequestLabware = {
  /** The name of the type of labware. */
  labwareType: Scalars['String'];
  /** The barcode of the new labware, if the user needs to specify it. */
  barcode?: InputMaybe<Scalars['String']>;
  /** The lot number of the new labware, if any. */
  lotNumber?: InputMaybe<Scalars['String']>;
  /** The costing of the labware, if any. */
  costing?: InputMaybe<SlideCosting>;
  /** The actions, specifying which samples are transferred between which slots. */
  actions: Array<PlanRequestAction>;
};

/** A request to create a plan operation. */
export type PlanRequest = {
  /** The name of the type of operation we are planning. */
  operationType: Scalars['String'];
  /** The specification of the labware created for the plan. */
  labware: Array<PlanRequestLabware>;
};

/** A combination of an address and a comment id, used to record comments in particular slots of labware. */
export type AddressCommentInput = {
  /** The address of a slot. */
  address: Scalars['Address'];
  /** The id of a comment in the database. */
  commentId: Scalars['Int'];
};

/** A request to cancel a particular planned action in a planned operation. */
export type CancelPlanAction = {
  /** The destination address of the planned action to cancel. */
  destinationAddress: Scalars['Address'];
  /** The sample id of the planned action to cancel. */
  sampleId: Scalars['Int'];
  /** The new section number (if any) of the planned action to cancel. */
  newSection?: InputMaybe<Scalars['Int']>;
};

/** A specification of a particular piece of labware in a confirm request. */
export type ConfirmOperationLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: InputMaybe<Scalars['Boolean']>;
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
  destinationAddress: Scalars['Address'];
  /** The original sample id of the source. */
  sampleId: Scalars['Int'];
  /** The section number of the new section. */
  newSection?: InputMaybe<Scalars['Int']>;
  /** The comment ids to record against this sample in this slot. */
  commentIds?: InputMaybe<Array<Scalars['Int']>>;
  /** The region of this sample in this slot, if any. */
  region?: InputMaybe<Scalars['String']>;
};

/** A specification of a particular piece of labware to confirm or cancel planned sectioning into. */
export type ConfirmSectionLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** Should the whole labware be cancelled? Default false. */
  cancelled?: InputMaybe<Scalars['Boolean']>;
  /** What individual sections, if any, should be created in the labware? */
  confirmSections?: InputMaybe<Array<ConfirmSection>>;
  /** What comments, if any, should be recorded on slots of the labware? */
  addressComments?: InputMaybe<Array<AddressCommentInput>>;
};

/** A request to confirm (or cancel) planned sectioning operations. */
export type ConfirmSectionRequest = {
  /** The specification of what to confirm or cancel in each labware. */
  labware: Array<ConfirmSectionLabware>;
  /** An optional work number to associate with the operations. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** A specification that the contents of one slot should be copied to a particular address in new labware. */
export type SlotCopyContent = {
  /** The barcode of the source labware. */
  sourceBarcode: Scalars['String'];
  /** The address of the source slot in its labware. */
  sourceAddress: Scalars['Address'];
  /** The address of the destination slot. */
  destinationAddress: Scalars['Address'];
};

/** A destination for slot copy. */
export type SlotCopyDestination = {
  /** The name of the type of the new destination labware. */
  labwareType: Scalars['String'];
  /** The bio state for samples in the destination (if specified). */
  bioState?: InputMaybe<Scalars['String']>;
  /** The costing of the slide, if specified. */
  costing?: InputMaybe<SlideCosting>;
  /** The lot number of the slide, if specified. */
  lotNumber?: InputMaybe<Scalars['String']>;
  /** The probe lot number of the slide, if specified. */
  probeLotNumber?: InputMaybe<Scalars['String']>;
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']>;
  /** The specifications of which source slots are being copied into what addresses in the destination labware. */
  contents: Array<SlotCopyContent>;
};

/** A source for slot copy, if a new labware state is specified. */
export type SlotCopySource = {
  /** The barcode of the source. */
  barcode: Scalars['String'];
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
  operationType: Scalars['String'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** A request to record an operation in place. */
export type InPlaceOpRequest = {
  /** The name of the type of operation being recorded. */
  operationType: Scalars['String'];
  /** The barcodes of the labware. */
  barcodes: Array<Scalars['String']>;
  /** The id of the equipment (if any) being used in this operation. */
  equipmentId?: InputMaybe<Scalars['Int']>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** A record of material being transferred from one slot to another as part of an operation. */
export type Action = {
  __typename?: 'Action';
  /** The source slot, where the sample already was before the operation. */
  source: Slot;
  /** The destination slot, where the sample is after the operation. */
  destination: Slot;
  /** The id of the operation to which this action belongs. */
  operationId: Scalars['Int'];
  /** The sample as it was created or copied in its destination slot. */
  sample: Sample;
};

/** A record of a particular operation being done involving labware and samples. */
export type Operation = {
  __typename?: 'Operation';
  /** The unique id of the operation. */
  id: Scalars['Int'];
  /** The type of operation. */
  operationType: OperationType;
  /** The specific samples and slots and how they were used in this operation. */
  actions: Array<Action>;
  /** The user responsible for this operation. */
  user: User;
  /** The time at which this operation is regarded to have been performed (typically the time it was recorded). */
  performed: Scalars['Timestamp'];
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
  name: Scalars['String'];
  /** The types of labels this printer is set up to print. */
  labelTypes: Array<LabelType>;
};

/** A preset comment that users may select to link to parts of operations they record. */
export type Comment = {
  __typename?: 'Comment';
  /** The unique id of this comment. */
  id: Scalars['Int'];
  /** The text content of the comment: What comment is it? */
  text: Scalars['String'];
  /** The category of the comment: Where is it applicable? */
  category: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A description of a region in a slot. */
export type SlotRegion = {
  __typename?: 'SlotRegion';
  /** The name of this region. */
  name: Scalars['String'];
  /** Whether this region is enabled. */
  enabled: Scalars['Boolean'];
};

/** The region of a sample in a particular slot. */
export type SamplePosition = {
  __typename?: 'SamplePosition';
  /** The ID of the slot. */
  slotId: Scalars['Int'];
  /** The address of the slot. */
  address: Scalars['Address'];
  /** The ID of the sample. */
  sampleId: Scalars['Int'];
  /** The name of the region of the sample in the slot. */
  region: Scalars['String'];
  /** The operation id related to this sample position */
  operationId: Scalars['Int'];
};

/** A piece of equipment that may be associated with certain operations. */
export type Equipment = {
  __typename?: 'Equipment';
  /** The unique id of this equipment. */
  id: Scalars['Int'];
  name: Scalars['String'];
  /** The category of equipment: What kind of thing is it or what is it used for? */
  category: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A description of a place to which labware may be released. */
export type ReleaseDestination = {
  __typename?: 'ReleaseDestination';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A username for someone responsible for receiving released labware. */
export type ReleaseRecipient = {
  __typename?: 'ReleaseRecipient';
  username: Scalars['String'];
  fullName?: Maybe<Scalars['String']>;
  enabled: Scalars['Boolean'];
};

/** A record that labware was sent out or given away. */
export type Release = {
  __typename?: 'Release';
  /** The unique id of this release. */
  id: Scalars['Int'];
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
  barcode: Scalars['String'];
  /** The work number (optional) to associate with the release. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** A request to record releases for one or more labware. */
export type ReleaseRequest = {
  /** The details of the labware being released. */
  releaseLabware: Array<ReleaseLabware>;
  /** The name of the release destination. */
  destination: Scalars['String'];
  /** The name of the release recipient. */
  recipient: Scalars['String'];
  /** Additional recipients. */
  otherRecipients?: InputMaybe<Array<Scalars['String']>>;
  /** Release column groups for the release file. */
  columnOptions?: InputMaybe<Array<Scalars['String']>>;
};

/** An option for customising the columns in a release file. */
export type ReleaseFileOption = {
  __typename?: 'ReleaseFileOption';
  /** The name that is displayed to the user. */
  displayName: Scalars['String'];
  /** The option name that is used as a query parameter. */
  queryParamName: Scalars['String'];
};

/** A request to record an extract operation. */
export type ExtractRequest = {
  /** The barcodes of the source labware. */
  barcodes: Array<Scalars['String']>;
  /** The name of the labware type for the new destination labware. */
  labwareType: Scalars['String'];
  /** An optional work number to associate with these operations. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The id of the equipment being used in the extraction. If manual equipmentId is undefined */
  equipmentId?: InputMaybe<Scalars['Int']>;
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
  id: Scalars['Int'];
  /** The text of this reason: What reason is it? */
  text: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A record that some piece of labware was destroyed for some particular reason. */
export type Destruction = {
  __typename?: 'Destruction';
  /** The labware destroyed. */
  labware?: Maybe<Labware>;
  /** The user responsible for the destruction. */
  user?: Maybe<User>;
  /** The time the destruction was carried out (or at least when it was recorded). */
  destroyed?: Maybe<Scalars['Timestamp']>;
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
  barcodes: Array<Scalars['String']>;
  /** The id of a destruction reason. */
  reasonId: Scalars['Int'];
};

/** An item in storage. */
export type StoredItem = {
  __typename?: 'StoredItem';
  /** The barcode of the item. */
  barcode: Scalars['String'];
  /** The location of the item. */
  location: Location;
  /** The row/column address (if any) of the item in its location. */
  address?: Maybe<Scalars['Address']>;
  /** The index of the address (if any) in the location. */
  addressIndex?: Maybe<Scalars['Int']>;
};

/** An item no longer in storage. */
export type UnstoredItem = {
  __typename?: 'UnstoredItem';
  /** The barcode of the item. */
  barcode: Scalars['String'];
  /** The row/column address (if any) where the item was stored. */
  address?: Maybe<Scalars['Address']>;
};

/** The size of a 2D grid. */
export type Size = {
  __typename?: 'Size';
  /** The number of rows in this layout. */
  numRows: Scalars['Int'];
  /** The number of columns in this layout. */
  numColumns: Scalars['Int'];
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
  id: Scalars['Int'];
  /** The unique barcode of this location. */
  barcode: Scalars['String'];
  /** The fixed name (if any) of this location, not changeable through this API. */
  fixedName?: Maybe<Scalars['String']>;
  /** The custom name (if any) of this location, that may be changed through this API. */
  customName?: Maybe<Scalars['String']>;
  /** The row/column address (if any) of this location in its parent location. */
  address?: Maybe<Scalars['Address']>;
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
  qualifiedNameWithFirstBarcode?: Maybe<Scalars['String']>;
};

/** Information about a storage location, without links to other locations and items. */
export type LinkedLocation = {
  __typename?: 'LinkedLocation';
  /** The barcode of this location. */
  barcode: Scalars['String'];
  /** The fixed name of this location, not changeable through this API. */
  fixedName?: Maybe<Scalars['String']>;
  /** The custom name (if any) of this location, that may be changed through this API. */
  customName?: Maybe<Scalars['String']>;
  /** The row/column address (if any) of this location in its parent location. */
  address?: Maybe<Scalars['Address']>;
};

/** The result of a request to empty a location. */
export type UnstoreResult = {
  __typename?: 'UnstoreResult';
  /** The number of items unstored. */
  numUnstored: Scalars['Int'];
  /** The details of the item unstored. */
  unstored: Array<UnstoredItem>;
};

/** Information that a particular sample was found in a particular labware. */
export type FindEntry = {
  __typename?: 'FindEntry';
  /** The id of the sample found. */
  sampleId: Scalars['Int'];
  /** The id of the labware where the sample was found. */
  labwareId: Scalars['Int'];
  /** The list of work numbers associated with the entry. */
  workNumbers: Array<Maybe<Scalars['String']>>;
};

/** Information that a particular labware was found in a particular location. */
export type LabwareLocationEntry = {
  __typename?: 'LabwareLocationEntry';
  /** The id of the labware found. */
  labwareId: Scalars['Int'];
  /** The id of the location where the labware was found. */
  locationId: Scalars['Int'];
  /** The row/column address (if any) of the labware inside the location. */
  address?: Maybe<Scalars['Address']>;
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
  numRecords: Scalars['Int'];
};

/** A request to find some stored labware. Some, any or all fields may be filled. Each one refines the search results. */
export type FindRequest = {
  /** The barcode of a specific piece of labware to find. */
  labwareBarcode?: InputMaybe<Scalars['String']>;
  /** The names of donors to find stored samples of. */
  donorNames?: InputMaybe<Array<Scalars['String']>>;
  /** The names of tissues to find stored samples of. Maybe include * wildcards. */
  tissueExternalNames?: InputMaybe<Array<Scalars['String']>>;
  /** The name of a tissue type to find stored samples of. */
  tissueTypeName?: InputMaybe<Scalars['String']>;
  /** The maximum number of records to return. Use a negative value to indicate no limit. */
  maxRecords?: InputMaybe<Scalars['Int']>;
  /** The work number associated with the labware. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The minimum creation date for the labware. */
  createdMin?: InputMaybe<Scalars['Date']>;
  /** The maximum creation date for the labware. */
  createdMax?: InputMaybe<Scalars['Date']>;
};

/** An entry in the history: the IDs refer to objects that should also be included in the History. */
export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  /** The id of the operation or other event to which this entry refers. */
  eventId: Scalars['Int'];
  /** The operation type of type of event to which this entry refers. */
  type: Scalars['String'];
  /** The time the event took place (or was recorded). */
  time: Scalars['Timestamp'];
  /** The id of the source labware of this event. */
  sourceLabwareId: Scalars['Int'];
  /** The id of the destination labware of this event. */
  destinationLabwareId: Scalars['Int'];
  /** The id of the sample involved in this event. */
  sampleId?: Maybe<Scalars['Int']>;
  /** The username of the user responsible for this event. */
  username: Scalars['String'];
  /** The work number (if any) associated with this event. */
  workNumber?: Maybe<Scalars['String']>;
  /** Extra details (such as measurements and comments) included in this entry. */
  details: Array<Scalars['String']>;
  /** The address of the destination slot involved in the event. */
  address?: Maybe<Scalars['String']>;
  /** The region of the destination slot involved in the event. */
  region?: Maybe<Scalars['String']>;
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
};

/** Information about a plan previously recorded, now being looked up. */
export type PlanData = {
  __typename?: 'PlanData';
  /** One or more items of source labware for the plan. */
  sources: Array<Labware>;
  /** The planned operation. */
  plan: PlanOperation;
  /** The single item of destination labware for the plan. */
  destination: Labware;
};

/** A project that work can be associated with. */
export type Project = {
  __typename?: 'Project';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A program that work can be associated with. */
export type Program = {
  __typename?: 'Program';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A cost code that work can be associated with. */
export type CostCode = {
  __typename?: 'CostCode';
  code: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A DNAP study. */
export type DnapStudy = {
  __typename?: 'DnapStudy';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

/** A type of work, describing what kind of work it is (its purpose or activity). */
export type WorkType = {
  __typename?: 'WorkType';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
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
  workNumber: Scalars['String'];
  /** The name of the person requesting the work.(Note sure how to deal with this as the existing work will all be null but future work we want it mandatory?) */
  workRequester?: Maybe<ReleaseRecipient>;
  /** The current status of the work. */
  status: WorkStatus;
  /**
   * The number of blocks that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numBlocks?: Maybe<Scalars['Int']>;
  /**
   * The number of slides that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numSlides?: Maybe<Scalars['Int']>;
  /**
   * The number of original samples that this work still needs to be done on.
   * This is set and updated by users during the course of the work.
   */
  numOriginalSamples?: Maybe<Scalars['Int']>;
  /**
   * A string describing the priority of this work.
   * This is set and updated by users during the course of the work.
   */
  priority?: Maybe<Scalars['String']>;
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
  comment?: Maybe<Scalars['String']>;
};

/** An indication that something happened at some particular time. */
export type WorkProgressTimestamp = {
  __typename?: 'WorkProgressTimestamp';
  /** The name of the thing that happened. */
  type: Scalars['String'];
  /** The timestamp when the thing happened. */
  timestamp: Scalars['Timestamp'];
};

/** The things that have happened for a particular work, as requested by a user. */
export type WorkProgress = {
  __typename?: 'WorkProgress';
  /** The work under consideration. */
  work: Work;
  /** The comment associated with the work status. */
  workComment?: Maybe<Scalars['String']>;
  /** The things that happened for that work, and when they happened. */
  timestamps: Array<WorkProgressTimestamp>;
  /** The most recent operation for a given piece of work */
  mostRecentOperation?: Maybe<Scalars['String']>;
};

/** A measurement given as a number of seconds for some particular named measure. */
export type TimeMeasurement = {
  name: Scalars['String'];
  seconds: Scalars['Int'];
};

/** A type of stain that may be performed. */
export type StainType = {
  __typename?: 'StainType';
  name: Scalars['String'];
  /** The types of measurements we may expect to be recorded as part of a stain of this type. */
  measurementTypes: Array<Scalars['String']>;
};

/** A request to record stains on some labware. */
export type StainRequest = {
  /** The name of a stain type to record. */
  stainType: Scalars['String'];
  /** The barcodes of the labware being stained. */
  barcodes: Array<Scalars['String']>;
  /** The times of particular measurements for the stains. */
  timeMeasurements: Array<TimeMeasurement>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
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
  barcode: Scalars['String'];
  /** The bond barcode for the stain. */
  bondBarcode: Scalars['String'];
  /** The bond run number. */
  bondRun: Scalars['Int'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The plex for RNAscope if that is being recorded. */
  plexRNAscope?: InputMaybe<Scalars['Int']>;
  /** The plex for IHC if that is being recorded. */
  plexIHC?: InputMaybe<Scalars['Int']>;
  /** The experiment panel. */
  panel: StainPanel;
};

/** A request for a stain including bond barcodes and such. */
export type ComplexStainRequest = {
  /** The names of the types of stain being recorded. */
  stainTypes: Array<Scalars['String']>;
  /** The details of the labware being stained. */
  labware: Array<ComplexStainLabware>;
};

/** The details of a previously released item of labware to receive back into the application. */
export type UnreleaseLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The highest section number taken from the block, if it is a block. */
  highestSection?: InputMaybe<Scalars['Int']>;
  /** The work number associated with the unrelease of this labware. */
  workNumber: Scalars['String'];
};

/** A request to receive back some previously released labware. */
export type UnreleaseRequest = {
  labware: Array<UnreleaseLabware>;
};

/** A request to record a comment against a particular sample. */
export type SampleIdCommentId = {
  /** The id of the sample to comment upon. */
  sampleId: Scalars['Int'];
  /** The id of the comment to record. */
  commentId: Scalars['Int'];
};

/** Specification of a result being recording. */
export type SampleResult = {
  /** The slot address that the result refers to. */
  address: Scalars['Address'];
  /** The result. */
  result: PassFail;
  /** The id of a comment, if any, linked to the result. */
  commentId?: InputMaybe<Scalars['Int']>;
  /** List of comments to be recorded against particular samples. */
  sampleComments?: InputMaybe<Array<SampleIdCommentId>>;
};

/** Specification of results being recorded in an item of labware. */
export type LabwareResult = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The individual results. */
  sampleResults?: InputMaybe<Array<SampleResult>>;
  /** Measurements to record in this labware. */
  slotMeasurements?: InputMaybe<Array<SlotMeasurementRequest>>;
  /** An optional costing for the labware. */
  costing?: InputMaybe<SlideCosting>;
  /** A reagent lot number to associate with the labware. */
  reagentLot?: InputMaybe<Scalars['String']>;
};

/** A request to record results. */
export type ResultRequest = {
  /** The name of the operation that will record the results. */
  operationType?: InputMaybe<Scalars['String']>;
  /** The results for each item of labware. */
  labwareResults: Array<LabwareResult>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** A comment against a particular sample at an address (in some particular labware). */
export type SampleAddressComment = {
  /** The id of the sample for the comment. */
  sampleId: Scalars['Int'];
  /** The address of the slot for the comment. */
  address: Scalars['Address'];
  /** The id of the comment to record. */
  commentId: Scalars['Int'];
};

/** The comments against samples in a particular piece of labware. */
export type LabwareSampleComments = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The comments to record against particular samples in this labware. */
  comments: Array<SampleAddressComment>;
  /** The (optional) completion time of the process for this labware. */
  completion?: InputMaybe<Scalars['Timestamp']>;
};

/** A request to record the completion of a process. */
export type CompletionRequest = {
  /** The name of the type operations being recorded. */
  operationType: Scalars['String'];
  /** The work number associated with these operations. */
  workNumber: Scalars['String'];
  /** The details of the labware involved in this operation. */
  labware: Array<LabwareSampleComments>;
};

/** Specification of extract results in a piece of labware. */
export type ExtractResultLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The result. */
  result: PassFail;
  /** The concentration measurement, if any. */
  concentration?: InputMaybe<Scalars['String']>;
  /** The id of a comment, if any, linked to the result. */
  commentId?: InputMaybe<Scalars['Int']>;
};

/** A request to record extract results. */
export type ExtractResultRequest = {
  /** The details of the results in each item of labware. */
  labware: Array<ExtractResultLabware>;
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** The permeabilisation data for a particular slot address. */
export type PermData = {
  /** The address of a slot in its labware. */
  address: Scalars['Address'];
  /** The number of seconds, if specified. */
  seconds?: InputMaybe<Scalars['Int']>;
  /** The control type, if this is a control. */
  controlType?: InputMaybe<ControlType>;
  /** The barcode of the labware being put into this slot as a control, if there is one. */
  controlBarcode?: InputMaybe<Scalars['String']>;
};

/** A request to record permeabilisation data. */
export type RecordPermRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The data for each slot in the labware. */
  permData: Array<PermData>;
};

/** Permeabilisation data about a particular slot address. */
export type AddressPermData = {
  __typename?: 'AddressPermData';
  /** The slot address. */
  address: Scalars['Address'];
  /** The number of seconds, if any. */
  seconds?: Maybe<Scalars['Int']>;
  /** The control type, if this is a control. */
  controlType?: Maybe<ControlType>;
  /** Whether this result has been selected. */
  selected: Scalars['Boolean'];
};

/** The permeabilisation data recorded for a particular piece of labware. */
export type VisiumPermData = {
  __typename?: 'VisiumPermData';
  /** The labware in question. */
  labware: Labware;
  /** The permeabilisation data for each slot. */
  addressPermData: Array<AddressPermData>;
  /** The region of a sample in a particular slot referenced by the entries */
  samplePositionResults: Array<SamplePosition>;
};

/** Request to record visium analysis, selecting a permeabilisation time. */
export type VisiumAnalysisRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The address where the selected permeabilisation was recorded. */
  selectedAddress: Scalars['Address'];
  /** The permeabilisation time that we want to select. */
  selectedTime: Scalars['Int'];
};

/** A pass/fail result in a particular slot of some labware. */
export type SlotPassFail = {
  __typename?: 'SlotPassFail';
  /** The address of the slot in its labware. */
  address: Scalars['Address'];
  /** The result. */
  result: PassFail;
  /** The comment, if any, recorded with the result. */
  comment?: Maybe<Scalars['String']>;
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
  labware: Labware;
  /** The result, if any. */
  result?: Maybe<PassFail>;
  /** The concentration recorded, if any. */
  concentration?: Maybe<Scalars['String']>;
};

/** A specification for recording a measurement. */
export type StringMeasurement = {
  /** The thing being measured. */
  name: Scalars['String'];
  /** The value of the measurement. */
  value: Scalars['String'];
};

/** An item of labware that RNA Analysis is being requested on. */
export type RnaAnalysisLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The id of a preset comment, if any, to associate with the analysis. */
  commentId?: InputMaybe<Scalars['Int']>;
  /** The measurements to record for this operation. */
  measurements: Array<StringMeasurement>;
};

/** A request to record an RNA analysis operation. */
export type RnaAnalysisRequest = {
  /** The name of the type of operation (a type RNA analsis). */
  operationType: Scalars['String'];
  /** The details of what to record on one or more labware. */
  labware: Array<RnaAnalysisLabware>;
  /** The id of the equipment used in this operation. */
  equipmentId: Scalars['Int'];
};

/** A measurement to be recorded in a particular slot of some item of labware. */
export type SlotMeasurementRequest = {
  /** The address of the slot. */
  address: Scalars['Address'];
  /** The name of the measurement. */
  name: Scalars['String'];
  /** The value of the measurement. */
  value: Scalars['String'];
  /** An optional comment id. */
  commentId?: InputMaybe<Scalars['Int']>;
};

/** A request to record an operation in place with measurements in slots. */
export type OpWithSlotMeasurementsRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The name of the type of operation to record. */
  operationType: Scalars['String'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The measurements to record in individual slots. */
  slotMeasurements: Array<SlotMeasurementRequest>;
};

/** A specification of an item to be put into storage. */
export type StoreInput = {
  /** The barcode of the item to be stored. */
  barcode: Scalars['String'];
  /** The address, if any, in a location where the item should be stored. */
  address?: InputMaybe<Scalars['Address']>;
};

/** A request to transfer material from one source labware into multiple new destination labware (first slot). */
export type AliquotRequest = {
  /** The name of the operation to record. */
  operationType: Scalars['String'];
  /** The barcode of the source labware. */
  barcode: Scalars['String'];
  /** The name of the labware type for the destination labware. */
  labwareType: Scalars['String'];
  /** The number of destination labware to create. */
  numLabware: Scalars['Int'];
  /** An optional work number to associate with this operation. */
  workNumber?: InputMaybe<Scalars['String']>;
};

/** A slot in a reagent plate. */
export type ReagentSlot = {
  __typename?: 'ReagentSlot';
  address: Scalars['Address'];
  used: Scalars['Boolean'];
};

/** A plate of reagents. */
export type ReagentPlate = {
  __typename?: 'ReagentPlate';
  barcode: Scalars['String'];
  slots: Array<ReagentSlot>;
  plateType?: Maybe<Scalars['String']>;
};

/** The data about original tissues and their next replicate numbers. */
export type NextReplicateData = {
  __typename?: 'NextReplicateData';
  /** The source barcodes for the new replicates. */
  barcodes: Array<Scalars['String']>;
  /** The id of the donor. */
  donorId: Scalars['Int'];
  /** The id of the spatial location. */
  spatialLocationId: Scalars['Int'];
  /** The next replicate number for this group. */
  nextReplicateNumber: Scalars['Int'];
};

/** A group in a work summary. */
export type WorkSummaryGroup = {
  __typename?: 'WorkSummaryGroup';
  /** The work type of this group. */
  workType: WorkType;
  /** The work status of this group. */
  status: WorkStatus;
  /** The number of works in this group. */
  numWorks: Scalars['Int'];
  /** The total number of blocks required as specified in these works. */
  totalNumBlocks: Scalars['Int'];
  /** The total number of slides required as specified in these works. */
  totalNumSlides: Scalars['Int'];
  /** The total number of original samples required as specified in these works. */
  totalNumOriginalSamples: Scalars['Int'];
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
  created: Scalars['Timestamp'];
  /** The work with which this file is associated. */
  work: Work;
  /** The user who uploaded the file. */
  user: User;
  /** The name of the file. */
  name: Scalars['String'];
  /** The url to download the file. */
  url: Scalars['String'];
};

/** A link between a labware barcode and a work number. */
export type SuggestedWork = {
  __typename?: 'SuggestedWork';
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The work number of the suggested work, or null. */
  workNumber?: Maybe<Scalars['String']>;
};

/** The response to a suggested work query. */
export type SuggestedWorkResponse = {
  __typename?: 'SuggestedWorkResponse';
  /** The work numbers for each barcode. Barcodes without suggested work will be omitted. */
  suggestedWorks: Array<SuggestedWork>;
  /** The works indicated. */
  works: Array<Work>;
};

/** A specification that a particular reagent slot should be transferred to an address. */
export type ReagentTransfer = {
  /** The barcode of a reagent plate. */
  reagentPlateBarcode: Scalars['String'];
  /** The address of a slot in the reagent plate. */
  reagentSlotAddress: Scalars['Address'];
  /** The address if a slot in the destination labware. */
  destinationAddress: Scalars['Address'];
};

/** A request to transfer reagents from reagent plates to a STAN labware. */
export type ReagentTransferRequest = {
  /** The name of the operation being performed. */
  operationType: Scalars['String'];
  /** The work number to associate with the operation. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The barcode of the destination labware. */
  destinationBarcode: Scalars['String'];
  /** The transfers from aliquot slots to destination slots. */
  transfers: Array<ReagentTransfer>;
  /** The type of reagent plate involved. */
  plateType: Scalars['String'];
};

/** A request to process original tissue into blocks. */
export type TissueBlockRequest = {
  /** The work number associated with this request. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The labware (blocks) being created by this request. */
  labware: Array<TissueBlockLabware>;
  /** Which source barcodes (if any) to discard as part of this request. */
  discardSourceBarcodes?: InputMaybe<Array<Scalars['String']>>;
};

/** The input about a new block being created. */
export type TissueBlockLabware = {
  /** The original tissue barcode. */
  sourceBarcode: Scalars['String'];
  /** The labware type for the new labware. */
  labwareType: Scalars['String'];
  /** The barcode of the new labware, if it is prebarcoded. */
  preBarcode?: InputMaybe<Scalars['String']>;
  /** The comment (if any) associated with this operation. */
  commentId?: InputMaybe<Scalars['Int']>;
  /** The replicate number for the new block. */
  replicate: Scalars['String'];
  /** The medium for the new block. */
  medium: Scalars['String'];
};

/** A request to transfer original sample into pots. */
export type PotProcessingRequest = {
  /** The source barcode. */
  sourceBarcode: Scalars['String'];
  /** The work number. */
  workNumber: Scalars['String'];
  /** The destinations that will be created. */
  destinations: Array<PotProcessingDestination>;
  /** Is the source labware discarded? */
  sourceDiscarded?: InputMaybe<Scalars['Boolean']>;
};

/** A destination for pot processing. */
export type PotProcessingDestination = {
  /** The name of the type of labware. */
  labwareType: Scalars['String'];
  /** The fixative. */
  fixative: Scalars['String'];
  /** Comment to record, if any. */
  commentId?: InputMaybe<Scalars['Int']>;
};

/** A labware barcode and a comment id to add. */
export type SampleProcessingComment = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The id of the comment. */
  commentId: Scalars['Int'];
};

/** Request to record operations and add comments to labware. */
export type SampleProcessingCommentRequest = {
  /** The comments to add for each labware. */
  labware: Array<SampleProcessingComment>;
};

export type AddExternalIdRequest = {
  /** The external identifier used to identify the tissue. */
  externalName: Scalars['String'];
  /** The existing labware containing the tissue */
  labwareBarcode: Scalars['String'];
};

/** A request to perform solution transfer. */
export type SolutionTransferRequest = {
  /** The work number for the operations. */
  workNumber: Scalars['String'];
  /** The details of the labware in the request. */
  labware: Array<SolutionTransferLabware>;
};

/** A labware in a solution transfer request. */
export type SolutionTransferLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The name solution. */
  solution: Scalars['String'];
};

/** A request to record FFPE processing. */
export type FfpeProcessingRequest = {
  /** The work number. */
  workNumber: Scalars['String'];
  /** The labware barcodes. */
  barcodes: Array<Scalars['String']>;
  /** The comment ID. */
  commentId: Scalars['Int'];
};

/** Request to record an operation on multiple labware in-place with comments on some slots. */
export type OpWithSlotCommentsRequest = {
  /** The name of the operation type to record. */
  operationType: Scalars['String'];
  /** The work number. */
  workNumber?: InputMaybe<Scalars['String']>;
  /** The details of the labware. */
  labware: Array<LabwareWithSlotCommentsRequest>;
};

/** Specification of comments in slots of a piece of labware. */
export type LabwareWithSlotCommentsRequest = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The comments in slots of this labware. */
  addressComments: Array<AddressCommentInput>;
};

/** Request to record an operation with probe panels. */
export type ProbeOperationRequest = {
  /** The name of the type of operation. */
  operationType: Scalars['String'];
  /** The time when the operation was performed, if specified. */
  performed?: InputMaybe<Scalars['Timestamp']>;
  /** The labware involved in the operation. */
  labware: Array<ProbeOperationLabware>;
};

/** Labware in a probe operation request. */
export type ProbeOperationLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The work number of the operation on this labware. */
  workNumber: Scalars['String'];
  /** The probes used on this labware. */
  probes: Array<ProbeLot>;
};

/** The probe used on a piece of labware in an operation. */
export type ProbeLot = {
  /** The name of the probe panel. */
  name: Scalars['String'];
  /** The lot number of the probe. */
  lot: Scalars['String'];
  /** The plex number. */
  plex: Scalars['Int'];
  /** The costing of the probe panel. */
  costing: SlideCosting;
};

/** Specifies a region of interest for a sample in a slot address. */
export type SampleRoi = {
  /** The address of the slot. */
  address: Scalars['Address'];
  /** The id of the sample. */
  sampleId: Scalars['Int'];
  /** The region of interest of the sample. */
  roi: Scalars['String'];
};

/** The information about a particular item of labware in an analyser request. */
export type AnalyserLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The work number for the labware. */
  workNumber: Scalars['String'];
  /** The cassette position for the labware. */
  position: CassettePosition;
  /** The sample regions of interest in this labware. */
  samples: Array<SampleRoi>;
};

/** A request to record an analyser operation. */
export type AnalyserRequest = {
  /** The name of the operation type to record. */
  operationType: Scalars['String'];
  /** The lot number for the decoding reagents A. */
  lotNumberA: Scalars['String'];
  /** The lot number for the decoding reagents B. */
  lotNumberB: Scalars['String'];
  /** The run name. */
  runName: Scalars['String'];
  /** The time at which this operation was performed. */
  performed?: InputMaybe<Scalars['Timestamp']>;
  /** The labware involved in this request. */
  labware: Array<AnalyserLabware>;
};

/** Labware to be QC'd with comments and a completion time. */
export type QcLabware = {
  /** The barcode of the labware. */
  barcode: Scalars['String'];
  /** The work number to link to the operation. */
  workNumber: Scalars['String'];
  /** The time at which the process was completed. */
  completion?: InputMaybe<Scalars['Timestamp']>;
  /** Zero or more comments applied to this labware in this operation. */
  comments: Array<Scalars['Int']>;
};

/** Request to record QC and completion time for one or more labware. */
export type QcLabwareRequest = {
  /** The name of the operation to record. */
  operationType: Scalars['String'];
  /** The specifications of labware to QC. */
  labware: Array<QcLabware>;
};

/** Info about the app version. */
export type VersionInfo = {
  __typename?: 'VersionInfo';
  /** The output of git describe. */
  describe: Scalars['String'];
  /** The latest commit id. */
  commit: Scalars['String'];
  /** The version from the pom file. */
  version?: Maybe<Scalars['String']>;
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
  /** Get all the mediums available. */
  mediums: Array<Medium>;
  /** Get all the fixatives that are enabled, or get all including those that are disabled. */
  fixatives: Array<Fixative>;
  /** Get all the species that are enabled, or get all including those that are disabled. */
  species: Array<Species>;
  /** Get all probe panels, optionally including the disabled. */
  probePanels: Array<ProbePanel>;
  /** Get the labware with the given barcode. */
  labware: Labware;
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
  /** Event types. */
  eventTypes: Array<Scalars['String']>;
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
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryFixativesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySpeciesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProbePanelsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareArgs = {
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryPrintersArgs = {
  labelType?: InputMaybe<Scalars['String']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCommentsArgs = {
  category?: InputMaybe<Scalars['String']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryEquipmentsArgs = {
  category?: InputMaybe<Scalars['String']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseDestinationsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReleaseRecipientsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDestructionReasonsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProjectsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryProgramsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryCostCodesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryDnapStudiesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySolutionsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryOmeroProjectsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySlotRegionsArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySamplePositionsArgs = {
  labwareBarcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorkTypesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
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
  workNumber: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorksCreatedByArgs = {
  username: Scalars['String'];
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
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
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
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryVisiumPermDataArgs = {
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryExtractResultArgs = {
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryPassFailsArgs = {
  barcode: Scalars['String'];
  operationType: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryListFilesArgs = {
  workNumbers: Array<Scalars['String']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareCostingArgs = {
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryFindLatestOpArgs = {
  barcode: Scalars['String'];
  operationType: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForSampleIdArgs = {
  sampleId: Scalars['Int'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForExternalNameArgs = {
  externalName: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForDonorNameArgs = {
  donorName: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForWorkNumberArgs = {
  workNumber: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryForLabwareBarcodeArgs = {
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryHistoryArgs = {
  workNumber?: InputMaybe<Scalars['String']>;
  barcode?: InputMaybe<Scalars['String']>;
  externalName?: InputMaybe<Array<Scalars['String']>>;
  donorName?: InputMaybe<Array<Scalars['String']>>;
  eventType?: InputMaybe<Scalars['String']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryWorkProgressArgs = {
  workNumber?: InputMaybe<Scalars['String']>;
  workTypes?: InputMaybe<Array<Scalars['String']>>;
  programs?: InputMaybe<Array<Scalars['String']>>;
  statuses?: InputMaybe<Array<WorkStatus>>;
  requesters?: InputMaybe<Array<Scalars['String']>>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryReagentPlateArgs = {
  barcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryNextReplicateNumbersArgs = {
  barcodes: Array<Scalars['String']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareOperationsArgs = {
  barcode: Scalars['String'];
  operationType: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySuggestedWorkForLabwareArgs = {
  barcodes: Array<Scalars['String']>;
  includeInactive?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QuerySuggestedLabwareForWorkArgs = {
  workNumber: Scalars['String'];
  forRelease?: InputMaybe<Scalars['Boolean']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLocationArgs = {
  locationBarcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryStoredArgs = {
  barcodes: Array<Scalars['String']>;
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryLabwareInLocationArgs = {
  locationBarcode: Scalars['String'];
};


/**
 * Get information from the application.
 * These typically require no user privilege.
 */
export type QueryStoragePathArgs = {
  locationBarcode: Scalars['String'];
};

/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type Mutation = {
  __typename?: 'Mutation';
  /** Log in with the given credentials. */
  login: LoginResult;
  /** Log out; end the current login session. */
  logout?: Maybe<Scalars['String']>;
  /** Register blocks of tissue. */
  register: RegisterResult;
  /** Register sections of tissue. */
  registerSections: RegisterResult;
  /** Record planned operations. */
  plan: PlanResult;
  /** Print the specified labware barcodes on the specified printer. */
  printLabware?: Maybe<Scalars['String']>;
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
  /** Create a new study. */
  addDnapStudy: DnapStudy;
  /** Enable or disable a study. */
  setDnapStudyEnabled: DnapStudy;
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
  updateWorkDnapProject: Work;
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
  /** Perform FFPE processing. */
  performFFPEProcessing: OperationResult;
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
  /** Record QC labware request. */
  recordQCLabware: OperationResult;
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
export type MutationLoginArgs = {
  username: Scalars['String'];
  password: Scalars['String'];
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
  printer: Scalars['String'];
  barcodes: Array<Scalars['String']>;
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
  category: Scalars['String'];
  text: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetCommentEnabledArgs = {
  commentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddEquipmentArgs = {
  category: Scalars['String'];
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetEquipmentEnabledArgs = {
  equipmentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddDestructionReasonArgs = {
  text: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetDestructionReasonEnabledArgs = {
  text: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddHmdmcArgs = {
  hmdmc: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetHmdmcEnabledArgs = {
  hmdmc: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddReleaseDestinationArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetReleaseDestinationEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddReleaseRecipientArgs = {
  username: Scalars['String'];
  fullName?: InputMaybe<Scalars['String']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateReleaseRecipientFullNameArgs = {
  username: Scalars['String'];
  fullName?: InputMaybe<Scalars['String']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetReleaseRecipientEnabledArgs = {
  username: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSpeciesArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetSpeciesEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProjectArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProjectEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProgramArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProgramEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddCostCodeArgs = {
  code: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetCostCodeEnabledArgs = {
  code: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddDnapStudyArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetDnapStudyEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddFixativeArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetFixativeEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddWorkTypeArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetWorkTypeEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSolutionArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetSolutionEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddOmeroProjectArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetOmeroProjectEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddSlotRegionArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetSlotRegionEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddProbePanelArgs = {
  name: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetProbePanelEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationCreateWorkArgs = {
  prefix: Scalars['String'];
  workType: Scalars['String'];
  workRequester: Scalars['String'];
  project: Scalars['String'];
  program: Scalars['String'];
  costCode: Scalars['String'];
  numBlocks?: InputMaybe<Scalars['Int']>;
  numSlides?: InputMaybe<Scalars['Int']>;
  numOriginalSamples?: InputMaybe<Scalars['Int']>;
  omeroProject?: InputMaybe<Scalars['String']>;
  dnapStudy?: InputMaybe<Scalars['String']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkStatusArgs = {
  workNumber: Scalars['String'];
  status: WorkStatus;
  commentId?: InputMaybe<Scalars['Int']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumBlocksArgs = {
  workNumber: Scalars['String'];
  numBlocks?: InputMaybe<Scalars['Int']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumSlidesArgs = {
  workNumber: Scalars['String'];
  numSlides?: InputMaybe<Scalars['Int']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkNumOriginalSamplesArgs = {
  workNumber: Scalars['String'];
  numOriginalSamples?: InputMaybe<Scalars['Int']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkPriorityArgs = {
  workNumber: Scalars['String'];
  priority?: InputMaybe<Scalars['String']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkOmeroProjectArgs = {
  workNumber: Scalars['String'];
  omeroProject?: InputMaybe<Scalars['String']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUpdateWorkDnapProjectArgs = {
  workNumber: Scalars['String'];
  dnapStudy?: InputMaybe<Scalars['String']>;
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
export type MutationPerformFfpeProcessingArgs = {
  request: FfpeProcessingRequest;
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
export type MutationRecordQcLabwareArgs = {
  request: QcLabwareRequest;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationAddUserArgs = {
  username: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetUserRoleArgs = {
  username: Scalars['String'];
  role: UserRole;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStoreBarcodeArgs = {
  barcode: Scalars['String'];
  locationBarcode: Scalars['String'];
  address?: InputMaybe<Scalars['Address']>;
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationStoreArgs = {
  store: Array<StoreInput>;
  locationBarcode: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationUnstoreBarcodeArgs = {
  barcode: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationEmptyArgs = {
  locationBarcode: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationTransferArgs = {
  sourceBarcode: Scalars['String'];
  destinationBarcode: Scalars['String'];
};


/**
 * Send information to the application.
 * These typically require a user with the suitable permission for the particular request.
 */
export type MutationSetLocationCustomNameArgs = {
  locationBarcode: Scalars['String'];
  customName?: InputMaybe<Scalars['String']>;
};

export type CommentFieldsFragment = { __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean };

export type CostCodeFieldsFragment = { __typename?: 'CostCode', code: string, enabled: boolean };

export type DnapStudyFieldsFragment = { __typename?: 'DnapStudy', name: string, enabled: boolean };

export type ActionFieldsFragment = { __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } };

export type DestructionReasonFieldsFragment = { __typename?: 'DestructionReason', id: number, text: string, enabled: boolean };

export type FileFieldsFragment = { __typename?: 'StanFile', created: string, name: string, url: string, work: { __typename?: 'Work', workNumber: string } };

export type EquipmentFieldsFragment = { __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean };

export type AddressPermDataFieldsFragment = { __typename?: 'AddressPermData', address: string, controlType?: ControlType | null, seconds?: number | null, selected: boolean };

export type FixativeFieldsFragment = { __typename?: 'Fixative', name: string, enabled: boolean };

export type LabwareFieldsFragment = { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> };

export type HistoryEntryFieldsFragment = { __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null };

export type HmdmcFieldsFragment = { __typename?: 'Hmdmc', hmdmc: string, enabled: boolean };

export type HistoryFieldsFragment = { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> };

export type LocationFieldsFragment = { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> };

export type LinkedLocationFieldsFragment = { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null };

export type LabwareTypeFieldsFragment = { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null };

export type NextReplicateDataFieldsFragment = { __typename?: 'NextReplicateData', barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number };

export type OmeroProjectFieldsFragment = { __typename?: 'OmeroProject', name: string, enabled: boolean };

export type PlanActionFieldsFragment = { __typename?: 'PlanAction', newSection?: number | null, sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } };

export type OperationFieldsFragment = { __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } };

export type PrinterFieldsFragment = { __typename?: 'Printer', name: string, labelTypes: Array<{ __typename?: 'LabelType', name: string }> };

export type ProgramFieldsFragment = { __typename?: 'Program', name: string, enabled: boolean };

export type ProjectFieldsFragment = { __typename?: 'Project', name: string, enabled: boolean };

export type ProbePanelFieldsFragment = { __typename?: 'ProbePanel', name: string, enabled: boolean };

export type ReagentPlateFieldsFragment = { __typename?: 'ReagentPlate', barcode: string, plateType?: string | null, slots: Array<{ __typename?: 'ReagentSlot', address: string, used: boolean }> };

export type ReagentSlotFieldsFragment = { __typename?: 'ReagentSlot', address: string, used: boolean };

export type ReleaseDestinationFieldsFragment = { __typename?: 'ReleaseDestination', name: string, enabled: boolean };

export type SampleFieldsFragment = { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } };

export type RegisterResultFieldsFragment = { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, clashes: Array<{ __typename?: 'RegisterClash', tissue: { __typename?: 'Tissue', externalName?: string | null, donor: { __typename?: 'Donor', donorName: string }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } } }, labware: Array<{ __typename?: 'Labware', barcode: string, labwareType: { __typename?: 'LabwareType', name: string } }> }>, labwareSolutions: Array<{ __typename?: 'LabwareSolutionName', barcode: string, solutionName: string } | null> };

export type ReleaseFileOptionFieldsFragment = { __typename?: 'ReleaseFileOption', displayName: string, queryParamName: string };

export type SlotRegionFieldsFragment = { __typename?: 'SlotRegion', enabled: boolean, name: string };

export type SlotPassFailFieldsFragment = { __typename?: 'SlotPassFail', address: string, result: PassFail, comment?: string | null };

export type SpeciesFieldsFragment = { __typename?: 'Species', name: string, enabled: boolean };

export type StainTypeFieldsFragment = { __typename?: 'StainType', name: string, measurementTypes: Array<string> };

export type SuggestedWorkFieldsFragment = { __typename?: 'SuggestedWork', barcode: string, workNumber?: string | null };

export type SolutionFieldsFragment = { __typename?: 'Solution', name: string, enabled: boolean };

export type UserFieldsFragment = { __typename?: 'User', username: string, role: UserRole };

export type SlotFieldsFragment = { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> };

export type ReleaseRecipientFieldsFragment = { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean };

export type SamplePositionFieldsFragment = { __typename?: 'SamplePosition', address: string, region: string, sampleId: number, slotId: number, operationId: number };

export type WorkFieldsFragment = { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null };

export type WorkProgressFieldsFragment = { __typename?: 'WorkProgress', mostRecentOperation?: string | null, workComment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null }, timestamps: Array<{ __typename?: 'WorkProgressTimestamp', type: string, timestamp: string }> };

export type WorkSummaryGroupFieldsFragment = { __typename?: 'WorkSummaryGroup', numWorks: number, status: WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { __typename?: 'WorkType', name: string, enabled: boolean } };

export type WorkTypeFieldsFragment = { __typename?: 'WorkType', name: string, enabled: boolean };

export type WorkProgressTimeStampFieldFragment = { __typename?: 'WorkProgressTimestamp', type: string, timestamp: string };

export type WorkWithCommentFieldsFragment = { __typename?: 'WorkWithComment', comment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type ExtractResultQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type ExtractResultQuery = { __typename?: 'Query', extractResult: { __typename?: 'ExtractResult', result?: PassFail | null, concentration?: string | null, labware: { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> } } };

export type FindFilesQueryVariables = Exact<{
  workNumbers: Array<Scalars['String']> | Scalars['String'];
}>;


export type FindFilesQuery = { __typename?: 'Query', listFiles: Array<{ __typename?: 'StanFile', created: string, name: string, url: string, work: { __typename?: 'Work', workNumber: string } }> };

export type FindHistoryForDonorNameQueryVariables = Exact<{
  donorName: Scalars['String'];
}>;


export type FindHistoryForDonorNameQuery = { __typename?: 'Query', historyForDonorName: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> } };

export type FindQueryVariables = Exact<{
  request: FindRequest;
}>;


export type FindQuery = { __typename?: 'Query', find: { __typename?: 'FindResult', numRecords: number, entries: Array<{ __typename?: 'FindEntry', labwareId: number, sampleId: number, workNumbers: Array<string | null> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', replicate?: string | null, externalName?: string | null, spatialLocation: { __typename?: 'SpatialLocation', tissueType: { __typename?: 'TissueType', name: string } }, donor: { __typename?: 'Donor', donorName: string }, medium: { __typename?: 'Medium', name: string } } }>, labware: Array<{ __typename?: 'Labware', id: number, barcode: string, created: string, labwareType: { __typename?: 'LabwareType', name: string } }>, locations: Array<{ __typename?: 'Location', id: number, barcode: string, customName?: string | null, fixedName?: string | null, direction?: GridDirection | null, qualifiedNameWithFirstBarcode?: string | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null }>, labwareLocations: Array<{ __typename?: 'LabwareLocationEntry', labwareId: number, locationId: number, address?: string | null }> } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', username: string, role: UserRole } | null };

export type FindHistoryForExternalNameQueryVariables = Exact<{
  externalName: Scalars['String'];
}>;


export type FindHistoryForExternalNameQuery = { __typename?: 'Query', historyForExternalName: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> } };

export type FindHistoryForWorkNumberQueryVariables = Exact<{
  workNumber: Scalars['String'];
}>;


export type FindHistoryForWorkNumberQuery = { __typename?: 'Query', historyForWorkNumber: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> } };

export type FindHistoryForLabwareBarcodeQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindHistoryForLabwareBarcodeQuery = { __typename?: 'Query', historyForLabwareBarcode: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> } };

export type FindHistoryForSampleIdQueryVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type FindHistoryForSampleIdQuery = { __typename?: 'Query', historyForSampleId: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> } };

export type FindLocationByBarcodeQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindLocationByBarcodeQuery = { __typename?: 'Query', location: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> } };

export type FindLabwareLocationQueryVariables = Exact<{
  barcodes: Array<Scalars['String']> | Scalars['String'];
}>;


export type FindLabwareLocationQuery = { __typename?: 'Query', stored: Array<{ __typename?: 'StoredItem', location: { __typename?: 'Location', barcode: string } }> };

export type FindLabwareQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindLabwareQuery = { __typename?: 'Query', labware: { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> } };

export type FindPassFailsQueryVariables = Exact<{
  barcode: Scalars['String'];
  operationType: Scalars['String'];
}>;


export type FindPassFailsQuery = { __typename?: 'Query', passFails: Array<{ __typename?: 'OpPassFail', operation: { __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } }, slotPassFails: Array<{ __typename?: 'SlotPassFail', address: string, result: PassFail, comment?: string | null }> }> };

export type FindReagentPlateQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindReagentPlateQuery = { __typename?: 'Query', reagentPlate?: { __typename?: 'ReagentPlate', barcode: string, plateType?: string | null, slots: Array<{ __typename?: 'ReagentSlot', address: string, used: boolean }> } | null };

export type FindPermDataQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindPermDataQuery = { __typename?: 'Query', visiumPermData: { __typename?: 'VisiumPermData', labware: { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }, addressPermData: Array<{ __typename?: 'AddressPermData', address: string, controlType?: ControlType | null, seconds?: number | null, selected: boolean }>, samplePositionResults: Array<{ __typename?: 'SamplePosition', address: string, region: string, sampleId: number, slotId: number, operationId: number }> } };

export type FindWorkInfoQueryVariables = Exact<{
  status: WorkStatus;
}>;


export type FindWorkInfoQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string, workRequester?: { __typename?: 'ReleaseRecipient', username: string } | null, project: { __typename?: 'Project', name: string } }> };

export type FindSamplePositionsQueryVariables = Exact<{
  labwareBarcode: Scalars['String'];
}>;


export type FindSamplePositionsQuery = { __typename?: 'Query', samplePositions: Array<{ __typename?: 'SamplePosition', address: string, region: string, sampleId: number, slotId: number, operationId: number }> };

export type FindPlanDataQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindPlanDataQuery = { __typename?: 'Query', planData: { __typename?: 'PlanData', sources: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, destination: { __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }, plan: { __typename?: 'PlanOperation', operationType?: { __typename?: 'OperationType', name: string } | null, planActions: Array<{ __typename?: 'PlanAction', newSection?: number | null, sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> } } };

export type FindWorkProgressQueryVariables = Exact<{
  workNumber?: InputMaybe<Scalars['String']>;
  workTypes?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  programs?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  statuses?: InputMaybe<Array<WorkStatus> | WorkStatus>;
  requesters?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
}>;


export type FindWorkProgressQuery = { __typename?: 'Query', workProgress: Array<{ __typename?: 'WorkProgress', mostRecentOperation?: string | null, workComment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null }, timestamps: Array<{ __typename?: 'WorkProgressTimestamp', type: string, timestamp: string }> }> };

export type FindWorkNumbersQueryVariables = Exact<{
  status: WorkStatus;
}>;


export type FindWorkNumbersQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string }> };

export type FindWorksCreatedByQueryVariables = Exact<{
  username: Scalars['String'];
}>;


export type FindWorksCreatedByQuery = { __typename?: 'Query', worksCreatedBy: Array<{ __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null }> };

export type FindHistoryQueryVariables = Exact<{
  workNumber?: InputMaybe<Scalars['String']>;
  barcode?: InputMaybe<Scalars['String']>;
  donorName?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  externalName?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  eventType?: InputMaybe<Scalars['String']>;
}>;


export type FindHistoryQuery = { __typename?: 'Query', history: { __typename?: 'History', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }>, entries: Array<{ __typename?: 'HistoryEntry', destinationLabwareId: number, details: Array<string>, eventId: number, sampleId?: number | null, sourceLabwareId: number, time: string, username: string, type: string, workNumber?: string | null, address?: string | null, region?: string | null }> } };

export type FindStoragePathQueryVariables = Exact<{
  locationBarcode: Scalars['String'];
}>;


export type FindStoragePathQuery = { __typename?: 'Query', storagePath: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> };

export type GetAllWorkInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllWorkInfoQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string, status: WorkStatus, workRequester?: { __typename?: 'ReleaseRecipient', username: string } | null, project: { __typename?: 'Project', name: string } }> };

export type GetBlockProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBlockProcessingInfoQuery = { __typename?: 'Query', mediums: Array<{ __typename?: 'Medium', name: string }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }> };

export type FindLatestOperationQueryVariables = Exact<{
  barcode: Scalars['String'];
  operationType: Scalars['String'];
}>;


export type FindLatestOperationQuery = { __typename?: 'Query', findLatestOp?: { __typename?: 'Operation', id: number } | null };

export type GetCommentsQueryVariables = Exact<{
  commentCategory?: InputMaybe<Scalars['String']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetCommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigurationQuery = { __typename?: 'Query', destructionReasons: Array<{ __typename?: 'DestructionReason', id: number, text: string, enabled: boolean }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, hmdmcs: Array<{ __typename?: 'Hmdmc', hmdmc: string, enabled: boolean }>, species: Array<{ __typename?: 'Species', name: string, enabled: boolean }>, fixatives: Array<{ __typename?: 'Fixative', name: string, enabled: boolean }>, releaseDestinations: Array<{ __typename?: 'ReleaseDestination', name: string, enabled: boolean }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean }>, projects: Array<{ __typename?: 'Project', name: string, enabled: boolean }>, costCodes: Array<{ __typename?: 'CostCode', code: string, enabled: boolean }>, workTypes: Array<{ __typename?: 'WorkType', name: string, enabled: boolean }>, equipments: Array<{ __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean }>, users: Array<{ __typename?: 'User', username: string, role: UserRole }>, solutions: Array<{ __typename?: 'Solution', name: string, enabled: boolean }>, probePanels: Array<{ __typename?: 'ProbePanel', name: string, enabled: boolean }>, programs: Array<{ __typename?: 'Program', name: string, enabled: boolean }>, omeroProjects: Array<{ __typename?: 'OmeroProject', name: string, enabled: boolean }>, dnapStudies: Array<{ __typename?: 'DnapStudy', name: string, enabled: boolean }> };

export type GetFfpeProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFfpeProcessingInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetDestroyInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDestroyInfoQuery = { __typename?: 'Query', destructionReasons: Array<{ __typename?: 'DestructionReason', id: number, text: string, enabled: boolean }> };

export type GetDestructionReasonsQueryVariables = Exact<{
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetDestructionReasonsQuery = { __typename?: 'Query', destructionReasons: Array<{ __typename?: 'DestructionReason', id: number, text: string, enabled: boolean }> };

export type GetLabwareCostingQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type GetLabwareCostingQuery = { __typename?: 'Query', labwareCosting?: SlideCosting | null };

export type GetLabwareInLocationQueryVariables = Exact<{
  locationBarcode: Scalars['String'];
}>;


export type GetLabwareInLocationQuery = { __typename?: 'Query', labwareInLocation: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> };

export type GetNextReplicateNumberQueryVariables = Exact<{
  barcodes: Array<Scalars['String']> | Scalars['String'];
}>;


export type GetNextReplicateNumberQuery = { __typename?: 'Query', nextReplicateNumbers: Array<{ __typename?: 'NextReplicateData', barcodes: Array<string>, donorId: number, nextReplicateNumber: number, spatialLocationId: number }> };

export type GetLabwareOperationsQueryVariables = Exact<{
  barcode: Scalars['String'];
  operationType: Scalars['String'];
}>;


export type GetLabwareOperationsQuery = { __typename?: 'Query', labwareOperations?: Array<{ __typename?: 'Operation', id: number, performed: string, operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', operationId: number, source: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, destination: { __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }, sample: { __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } } }>, user: { __typename?: 'User', username: string, role: UserRole } } | null> | null };

export type GetPotProcessingInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPotProcessingInfoQuery = { __typename?: 'Query', fixatives: Array<{ __typename?: 'Fixative', name: string }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }> };

export type GetPrintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrintersQuery = { __typename?: 'Query', printers: Array<{ __typename?: 'Printer', name: string, labelTypes: Array<{ __typename?: 'LabelType', name: string }> }> };

export type GetRecordExtractResultInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRecordExtractResultInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetProgramsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProgramsQuery = { __typename?: 'Query', programs: Array<{ __typename?: 'Program', name: string, enabled: boolean }> };

export type GetProbePanelsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProbePanelsQuery = { __typename?: 'Query', probePanels: Array<{ __typename?: 'ProbePanel', name: string, enabled: boolean }> };

export type GetRecordInPlaceInfoQueryVariables = Exact<{
  category?: InputMaybe<Scalars['String']>;
}>;


export type GetRecordInPlaceInfoQuery = { __typename?: 'Query', equipments: Array<{ __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean }> };

export type GetRegistrationInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegistrationInfoQuery = { __typename?: 'Query', species: Array<{ __typename?: 'Species', name: string }>, hmdmcs: Array<{ __typename?: 'Hmdmc', hmdmc: string }>, labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }>, tissueTypes: Array<{ __typename?: 'TissueType', name: string, spatialLocations: Array<{ __typename?: 'SpatialLocation', name: string, code: number }> }>, fixatives: Array<{ __typename?: 'Fixative', name: string }>, mediums: Array<{ __typename?: 'Medium', name: string }>, solutions: Array<{ __typename?: 'Solution', name: string }>, slotRegions: Array<{ __typename?: 'SlotRegion', name: string }> };

export type GetEquipmentsQueryVariables = Exact<{
  category?: InputMaybe<Scalars['String']>;
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetEquipmentsQuery = { __typename?: 'Query', equipments: Array<{ __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean }> };

export type GetReleaseInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReleaseInfoQuery = { __typename?: 'Query', releaseDestinations: Array<{ __typename?: 'ReleaseDestination', name: string, enabled: boolean }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean }>, releaseColumnOptions: Array<{ __typename?: 'ReleaseFileOption', displayName: string, queryParamName: string }> };

export type GetSampleProcessingCommentsInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSampleProcessingCommentsInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetEventTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEventTypesQuery = { __typename?: 'Query', eventTypes: Array<string> };

export type GetSearchInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSearchInfoQuery = { __typename?: 'Query', tissueTypes: Array<{ __typename?: 'TissueType', name: string }> };

export type GetSectioningConfirmInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningConfirmInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, slotRegions: Array<{ __typename?: 'SlotRegion', enabled: boolean, name: string }> };

export type GetSectioningInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningInfoQuery = { __typename?: 'Query', labwareTypes: Array<{ __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }> };

export type GetSlotRegionsQueryVariables = Exact<{
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetSlotRegionsQuery = { __typename?: 'Query', slotRegions: Array<{ __typename?: 'SlotRegion', name: string, enabled: boolean }> };

export type GetSolutionTransferInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSolutionTransferInfoQuery = { __typename?: 'Query', solutions: Array<{ __typename?: 'Solution', name: string }> };

export type GetSuggestedLabwareForWorkQueryVariables = Exact<{
  workNumber: Scalars['String'];
  forRelease?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetSuggestedLabwareForWorkQuery = { __typename?: 'Query', suggestedLabwareForWork: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> };

export type GetStainingQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainingQcInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetStainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainInfoQuery = { __typename?: 'Query', stainTypes: Array<{ __typename?: 'StainType', name: string, measurementTypes: Array<string> }> };

export type GetSuggestedWorkForLabwareQueryVariables = Exact<{
  barcodes: Array<Scalars['String']> | Scalars['String'];
  includeInactive?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetSuggestedWorkForLabwareQuery = { __typename?: 'Query', suggestedWorkForLabware: { __typename?: 'SuggestedWorkResponse', suggestedWorks: Array<{ __typename?: 'SuggestedWork', barcode: string, workNumber?: string | null }> } };

export type GetVisiumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVisiumQcInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetWorkAllocationInfoQueryVariables = Exact<{
  commentCategory: Scalars['String'];
  workStatuses?: InputMaybe<Array<WorkStatus> | WorkStatus>;
}>;


export type GetWorkAllocationInfoQuery = { __typename?: 'Query', projects: Array<{ __typename?: 'Project', name: string, enabled: boolean }>, programs: Array<{ __typename?: 'Program', name: string, enabled: boolean }>, costCodes: Array<{ __typename?: 'CostCode', code: string, enabled: boolean }>, worksWithComments: Array<{ __typename?: 'WorkWithComment', comment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } }>, workTypes: Array<{ __typename?: 'WorkType', name: string, enabled: boolean }>, comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean }>, omeroProjects: Array<{ __typename?: 'OmeroProject', name: string, enabled: boolean }>, dnapStudies: Array<{ __typename?: 'DnapStudy', name: string, enabled: boolean }> };

export type GetWorkNumbersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkNumbersQuery = { __typename?: 'Query', works: Array<{ __typename?: 'Work', workNumber: string }> };

export type GetWorkProgressInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkProgressInputsQuery = { __typename?: 'Query', workTypes: Array<{ __typename?: 'WorkType', name: string }>, programs: Array<{ __typename?: 'Program', name: string }>, releaseRecipients: Array<{ __typename?: 'ReleaseRecipient', username: string }> };

export type GetWorkSummaryQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkSummaryQuery = { __typename?: 'Query', worksSummary: { __typename?: 'WorkSummaryData', workSummaryGroups: Array<{ __typename?: 'WorkSummaryGroup', numWorks: number, status: WorkStatus, totalNumBlocks: number, totalNumSlides: number, totalNumOriginalSamples: number, workType: { __typename?: 'WorkType', name: string, enabled: boolean } }>, workTypes: Array<{ __typename?: 'WorkType', name: string }> } };

export type GetXeniumQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetXeniumQcInfoQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean }> };

export type GetWorkTypesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWorkTypesQuery = { __typename?: 'Query', workTypes: Array<{ __typename?: 'WorkType', name: string }> };

export type AddCommentMutationVariables = Exact<{
  category: Scalars['String'];
  text: Scalars['String'];
}>;


export type AddCommentMutation = { __typename?: 'Mutation', addComment: { __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean } };

export type AddDnapStudyMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddDnapStudyMutation = { __typename?: 'Mutation', addDnapStudy: { __typename?: 'DnapStudy', name: string, enabled: boolean } };

export type AddDestructionReasonMutationVariables = Exact<{
  text: Scalars['String'];
}>;


export type AddDestructionReasonMutation = { __typename?: 'Mutation', addDestructionReason: { __typename?: 'DestructionReason', id: number, text: string, enabled: boolean } };

export type AddCostCodeMutationVariables = Exact<{
  code: Scalars['String'];
}>;


export type AddCostCodeMutation = { __typename?: 'Mutation', addCostCode: { __typename?: 'CostCode', code: string, enabled: boolean } };

export type AddEquipmentMutationVariables = Exact<{
  category: Scalars['String'];
  name: Scalars['String'];
}>;


export type AddEquipmentMutation = { __typename?: 'Mutation', addEquipment: { __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean } };

export type AddExternalIdMutationVariables = Exact<{
  request: AddExternalIdRequest;
}>;


export type AddExternalIdMutation = { __typename?: 'Mutation', addExternalID: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type AddHmdmcMutationVariables = Exact<{
  hmdmc: Scalars['String'];
}>;


export type AddHmdmcMutation = { __typename?: 'Mutation', addHmdmc: { __typename?: 'Hmdmc', hmdmc: string, enabled: boolean } };

export type AddFixativeMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddFixativeMutation = { __typename?: 'Mutation', addFixative: { __typename?: 'Fixative', name: string, enabled: boolean } };

export type AddOmeroProjectMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddOmeroProjectMutation = { __typename?: 'Mutation', addOmeroProject: { __typename?: 'OmeroProject', name: string, enabled: boolean } };

export type GetOmeroProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOmeroProjectsQuery = { __typename?: 'Query', omeroProjects: Array<{ __typename?: 'OmeroProject', name: string, enabled: boolean }> };

export type AddProgramMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddProgramMutation = { __typename?: 'Mutation', addProgram: { __typename?: 'Program', name: string, enabled: boolean } };

export type AddReleaseDestinationMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddReleaseDestinationMutation = { __typename?: 'Mutation', addReleaseDestination: { __typename?: 'ReleaseDestination', name: string, enabled: boolean } };

export type AddProjectMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddProjectMutation = { __typename?: 'Mutation', addProject: { __typename?: 'Project', name: string, enabled: boolean } };

export type AddSlotRegionMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddSlotRegionMutation = { __typename?: 'Mutation', addSlotRegion: { __typename?: 'SlotRegion', enabled: boolean, name: string } };

export type AddSpeciesMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddSpeciesMutation = { __typename?: 'Mutation', addSpecies: { __typename?: 'Species', name: string, enabled: boolean } };

export type AddSolutionMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddSolutionMutation = { __typename?: 'Mutation', addSolution: { __typename?: 'Solution', name: string, enabled: boolean } };

export type AddProbePanelMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddProbePanelMutation = { __typename?: 'Mutation', addProbePanel: { __typename?: 'ProbePanel', name: string, enabled: boolean } };

export type AddUserMutationVariables = Exact<{
  username: Scalars['String'];
}>;


export type AddUserMutation = { __typename?: 'Mutation', addUser: { __typename?: 'User', username: string, role: UserRole } };

export type AddWorkTypeMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddWorkTypeMutation = { __typename?: 'Mutation', addWorkType: { __typename?: 'WorkType', name: string, enabled: boolean } };

export type AliquotMutationVariables = Exact<{
  request: AliquotRequest;
}>;


export type AliquotMutation = { __typename?: 'Mutation', aliquot: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> }> } };

export type AddReleaseRecipientMutationVariables = Exact<{
  username: Scalars['String'];
  fullName?: InputMaybe<Scalars['String']>;
}>;


export type AddReleaseRecipientMutation = { __typename?: 'Mutation', addReleaseRecipient: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } };

export type ConfirmSectionMutationVariables = Exact<{
  request: ConfirmSectionRequest;
}>;


export type ConfirmSectionMutation = { __typename?: 'Mutation', confirmSection: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type ConfirmMutationVariables = Exact<{
  request: ConfirmOperationRequest;
}>;


export type ConfirmMutation = { __typename?: 'Mutation', confirmOperation: { __typename?: 'ConfirmOperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type CreateWorkMutationVariables = Exact<{
  prefix: Scalars['String'];
  workType: Scalars['String'];
  workRequester: Scalars['String'];
  project: Scalars['String'];
  program: Scalars['String'];
  costCode: Scalars['String'];
  numBlocks?: InputMaybe<Scalars['Int']>;
  numSlides?: InputMaybe<Scalars['Int']>;
  numOriginalSamples?: InputMaybe<Scalars['Int']>;
  omeroProject?: InputMaybe<Scalars['String']>;
  dnapStudy?: InputMaybe<Scalars['String']>;
}>;


export type CreateWorkMutation = { __typename?: 'Mutation', createWork: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type ExtractMutationVariables = Exact<{
  request: ExtractRequest;
}>;


export type ExtractMutation = { __typename?: 'Mutation', extract: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', operationType: { __typename?: 'OperationType', name: string }, actions: Array<{ __typename?: 'Action', sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> }> } };

export type EmptyLocationMutationVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type EmptyLocationMutation = { __typename?: 'Mutation', empty: { __typename?: 'UnstoreResult', numUnstored: number } };

export type LoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResult', user?: { __typename?: 'User', username: string, role: UserRole } | null } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: string | null };

export type PerformFfpeProcessingMutationVariables = Exact<{
  request: FfpeProcessingRequest;
}>;


export type PerformFfpeProcessingMutation = { __typename?: 'Mutation', performFFPEProcessing: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type DestroyMutationVariables = Exact<{
  request: DestroyRequest;
}>;


export type DestroyMutation = { __typename?: 'Mutation', destroy: { __typename?: 'DestroyResult', destructions: Array<{ __typename?: 'Destruction', labware?: { __typename?: 'Labware', barcode: string } | null }> } };

export type PerformTissueBlockMutationVariables = Exact<{
  request: TissueBlockRequest;
}>;


export type PerformTissueBlockMutation = { __typename?: 'Mutation', performTissueBlock: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type PerformSolutionTransferMutationVariables = Exact<{
  request: SolutionTransferRequest;
}>;


export type PerformSolutionTransferMutation = { __typename?: 'Mutation', performSolutionTransfer: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type PrintMutationVariables = Exact<{
  barcodes: Array<Scalars['String']> | Scalars['String'];
  printer: Scalars['String'];
}>;


export type PrintMutation = { __typename?: 'Mutation', printLabware?: string | null };

export type PerformTissuePotMutationVariables = Exact<{
  request: PotProcessingRequest;
}>;


export type PerformTissuePotMutation = { __typename?: 'Mutation', performPotProcessing: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type RecordComplexStainMutationVariables = Exact<{
  request: ComplexStainRequest;
}>;


export type RecordComplexStainMutation = { __typename?: 'Mutation', recordComplexStain: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordExtractResultMutationVariables = Exact<{
  request: ExtractResultRequest;
}>;


export type RecordExtractResultMutation = { __typename?: 'Mutation', recordExtractResult: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordAnalyserMutationVariables = Exact<{
  request: AnalyserRequest;
}>;


export type RecordAnalyserMutation = { __typename?: 'Mutation', recordAnalyser: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordOpWithSlotCommentsMutationVariables = Exact<{
  request: OpWithSlotCommentsRequest;
}>;


export type RecordOpWithSlotCommentsMutation = { __typename?: 'Mutation', recordOpWithSlotComments: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type PlanMutationVariables = Exact<{
  request: PlanRequest;
}>;


export type PlanMutation = { __typename?: 'Mutation', plan: { __typename?: 'PlanResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'PlanOperation', operationType?: { __typename?: 'OperationType', name: string } | null, planActions: Array<{ __typename?: 'PlanAction', newSection?: number | null, sample: { __typename?: 'Sample', id: number }, source: { __typename?: 'Slot', address: string, labwareId: number, samples: Array<{ __typename?: 'Sample', id: number }> }, destination: { __typename?: 'Slot', address: string, labwareId: number } }> }> } };

export type GetReleaseColumnOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReleaseColumnOptionsQuery = { __typename?: 'Query', releaseColumnOptions: Array<{ __typename?: 'ReleaseFileOption', displayName: string, queryParamName: string }> };

export type RecordCompletionMutationVariables = Exact<{
  request: CompletionRequest;
}>;


export type RecordCompletionMutation = { __typename?: 'Mutation', recordCompletion: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordInPlaceMutationVariables = Exact<{
  request: InPlaceOpRequest;
}>;


export type RecordInPlaceMutation = { __typename?: 'Mutation', recordInPlace: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type RecordOpWithSlotMeasurementsMutationVariables = Exact<{
  request: OpWithSlotMeasurementsRequest;
}>;


export type RecordOpWithSlotMeasurementsMutation = { __typename?: 'Mutation', recordOpWithSlotMeasurements: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordReagentTransferMutationVariables = Exact<{
  request: ReagentTransferRequest;
}>;


export type RecordReagentTransferMutation = { __typename?: 'Mutation', reagentTransfer: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordPermMutationVariables = Exact<{
  request: RecordPermRequest;
}>;


export type RecordPermMutation = { __typename?: 'Mutation', recordPerm: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordSampleProcessingCommentsMutationVariables = Exact<{
  request: SampleProcessingCommentRequest;
}>;


export type RecordSampleProcessingCommentsMutation = { __typename?: 'Mutation', recordSampleProcessingComments: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, operations: Array<{ __typename?: 'Operation', performed: string, operationType: { __typename?: 'OperationType', name: string }, user: { __typename?: 'User', username: string } }> } };

export type RecordRnaAnalysisMutationVariables = Exact<{
  request: RnaAnalysisRequest;
}>;


export type RecordRnaAnalysisMutation = { __typename?: 'Mutation', recordRNAAnalysis: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordQcLabwareMutationVariables = Exact<{
  request: QcLabwareRequest;
}>;


export type RecordQcLabwareMutation = { __typename?: 'Mutation', recordQCLabware: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordVisiumQcMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordVisiumQcMutation = { __typename?: 'Mutation', recordVisiumQC: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordStainResultMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordStainResultMutation = { __typename?: 'Mutation', recordStainResult: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RecordProbeOperationMutationVariables = Exact<{
  request: ProbeOperationRequest;
}>;


export type RecordProbeOperationMutation = { __typename?: 'Mutation', recordProbeOperation: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type RegisterSectionsMutationVariables = Exact<{
  request: SectionRegisterRequest;
}>;


export type RegisterSectionsMutation = { __typename?: 'Mutation', registerSections: { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type RegisterTissuesMutationVariables = Exact<{
  request: RegisterRequest;
}>;


export type RegisterTissuesMutation = { __typename?: 'Mutation', register: { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, clashes: Array<{ __typename?: 'RegisterClash', tissue: { __typename?: 'Tissue', externalName?: string | null, donor: { __typename?: 'Donor', donorName: string }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } } }, labware: Array<{ __typename?: 'Labware', barcode: string, labwareType: { __typename?: 'LabwareType', name: string } }> }>, labwareSolutions: Array<{ __typename?: 'LabwareSolutionName', barcode: string, solutionName: string } | null> } };

export type RegisterOriginalSamplesMutationVariables = Exact<{
  request: OriginalSampleRegisterRequest;
}>;


export type RegisterOriginalSamplesMutation = { __typename?: 'Mutation', registerOriginalSamples: { __typename?: 'RegisterResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }>, clashes: Array<{ __typename?: 'RegisterClash', tissue: { __typename?: 'Tissue', externalName?: string | null, donor: { __typename?: 'Donor', donorName: string }, spatialLocation: { __typename?: 'SpatialLocation', code: number, name: string, tissueType: { __typename?: 'TissueType', name: string } } }, labware: Array<{ __typename?: 'Labware', barcode: string, labwareType: { __typename?: 'LabwareType', name: string } }> }>, labwareSolutions: Array<{ __typename?: 'LabwareSolutionName', barcode: string, solutionName: string } | null> } };

export type SetCommentEnabledMutationVariables = Exact<{
  commentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
}>;


export type SetCommentEnabledMutation = { __typename?: 'Mutation', setCommentEnabled: { __typename?: 'Comment', id: number, text: string, category: string, enabled: boolean } };

export type ReleaseLabwareMutationVariables = Exact<{
  releaseRequest: ReleaseRequest;
}>;


export type ReleaseLabwareMutation = { __typename?: 'Mutation', release: { __typename?: 'ReleaseResult', releases: Array<{ __typename?: 'Release', id: number, labware: { __typename?: 'Labware', barcode: string }, destination: { __typename?: 'ReleaseDestination', name: string }, recipient: { __typename?: 'ReleaseRecipient', username: string } }> } };

export type SetDestructionReasonEnabledMutationVariables = Exact<{
  text: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetDestructionReasonEnabledMutation = { __typename?: 'Mutation', setDestructionReasonEnabled: { __typename?: 'DestructionReason', id: number, text: string, enabled: boolean } };

export type SetHmdmcEnabledMutationVariables = Exact<{
  hmdmc: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetHmdmcEnabledMutation = { __typename?: 'Mutation', setHmdmcEnabled: { __typename?: 'Hmdmc', hmdmc: string, enabled: boolean } };

export type SetDnapStudyEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetDnapStudyEnabledMutation = { __typename?: 'Mutation', setDnapStudyEnabled: { __typename?: 'DnapStudy', name: string, enabled: boolean } };

export type SetCostCodeEnabledMutationVariables = Exact<{
  code: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetCostCodeEnabledMutation = { __typename?: 'Mutation', setCostCodeEnabled: { __typename?: 'CostCode', code: string, enabled: boolean } };

export type SetEquipmentEnabledMutationVariables = Exact<{
  equipmentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
}>;


export type SetEquipmentEnabledMutation = { __typename?: 'Mutation', setEquipmentEnabled: { __typename?: 'Equipment', id: number, name: string, category: string, enabled: boolean } };

export type SetFixativeEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetFixativeEnabledMutation = { __typename?: 'Mutation', setFixativeEnabled: { __typename?: 'Fixative', name: string, enabled: boolean } };

export type SetLocationCustomNameMutationVariables = Exact<{
  locationBarcode: Scalars['String'];
  newCustomName: Scalars['String'];
}>;


export type SetLocationCustomNameMutation = { __typename?: 'Mutation', setLocationCustomName: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> } };

export type SetProgramEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetProgramEnabledMutation = { __typename?: 'Mutation', setProgramEnabled: { __typename?: 'Program', name: string, enabled: boolean } };

export type SetOmeroProjectEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetOmeroProjectEnabledMutation = { __typename?: 'Mutation', setOmeroProjectEnabled: { __typename?: 'OmeroProject', name: string, enabled: boolean } };

export type SetProjectEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetProjectEnabledMutation = { __typename?: 'Mutation', setProjectEnabled: { __typename?: 'Project', name: string, enabled: boolean } };

export type SetSolutionEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetSolutionEnabledMutation = { __typename?: 'Mutation', setSolutionEnabled: { __typename?: 'Solution', name: string, enabled: boolean } };

export type SetReleaseRecipientEnabledMutationVariables = Exact<{
  username: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetReleaseRecipientEnabledMutation = { __typename?: 'Mutation', setReleaseRecipientEnabled: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } };

export type SetReleaseDestinationEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetReleaseDestinationEnabledMutation = { __typename?: 'Mutation', setReleaseDestinationEnabled: { __typename?: 'ReleaseDestination', name: string, enabled: boolean } };

export type SetSlotRegionEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetSlotRegionEnabledMutation = { __typename?: 'Mutation', setSlotRegionEnabled: { __typename?: 'SlotRegion', enabled: boolean, name: string } };

export type SetUserRoleMutationVariables = Exact<{
  username: Scalars['String'];
  role: UserRole;
}>;


export type SetUserRoleMutation = { __typename?: 'Mutation', setUserRole: { __typename?: 'User', username: string, role: UserRole } };

export type SetProbePanelEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetProbePanelEnabledMutation = { __typename?: 'Mutation', setProbePanelEnabled: { __typename?: 'ProbePanel', name: string, enabled: boolean } };

export type SetSpeciesEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetSpeciesEnabledMutation = { __typename?: 'Mutation', setSpeciesEnabled: { __typename?: 'Species', name: string, enabled: boolean } };

export type StainMutationVariables = Exact<{
  request: StainRequest;
}>;


export type StainMutation = { __typename?: 'Mutation', stain: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type SetWorkTypeEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetWorkTypeEnabledMutation = { __typename?: 'Mutation', setWorkTypeEnabled: { __typename?: 'WorkType', name: string, enabled: boolean } };

export type StoreBarcodeMutationVariables = Exact<{
  barcode: Scalars['String'];
  locationBarcode: Scalars['String'];
  address?: InputMaybe<Scalars['Address']>;
}>;


export type StoreBarcodeMutation = { __typename?: 'Mutation', storeBarcode: { __typename?: 'StoredItem', location: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> } } };

export type TransferLocationItemsMutationVariables = Exact<{
  sourceBarcode: Scalars['String'];
  destinationBarcode: Scalars['String'];
}>;


export type TransferLocationItemsMutation = { __typename?: 'Mutation', transfer: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> } };

export type StoreMutationVariables = Exact<{
  store: Array<StoreInput> | StoreInput;
  locationBarcode: Scalars['String'];
}>;


export type StoreMutation = { __typename?: 'Mutation', store: { __typename?: 'Location', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null, direction?: GridDirection | null, parent?: { __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null } | null, size?: { __typename?: 'Size', numRows: number, numColumns: number } | null, stored: Array<{ __typename?: 'StoredItem', barcode: string, address?: string | null }>, children: Array<{ __typename?: 'LinkedLocation', barcode: string, fixedName?: string | null, customName?: string | null, address?: string | null }> } };

export type SlotCopyMutationVariables = Exact<{
  request: SlotCopyRequest;
}>;


export type SlotCopyMutation = { __typename?: 'Mutation', slotCopy: { __typename?: 'OperationResult', labware: Array<{ __typename?: 'Labware', id: number, barcode: string, externalBarcode?: string | null, destroyed: boolean, discarded: boolean, released: boolean, state: LabwareState, created: string, labwareType: { __typename?: 'LabwareType', name: string, numRows: number, numColumns: number, labelType?: { __typename?: 'LabelType', name: string } | null }, slots: Array<{ __typename?: 'Slot', id: number, address: string, labwareId: number, blockHighestSection?: number | null, block: boolean, samples: Array<{ __typename?: 'Sample', id: number, section?: number | null, tissue: { __typename?: 'Tissue', externalName?: string | null, replicate?: string | null, collectionDate?: string | null, donor: { __typename?: 'Donor', donorName: string, lifeStage: LifeStage }, spatialLocation: { __typename?: 'SpatialLocation', code: number, tissueType: { __typename?: 'TissueType', name: string } }, medium: { __typename?: 'Medium', name: string }, fixative: { __typename?: 'Fixative', name: string, enabled: boolean } }, bioState: { __typename?: 'BioState', name: string } }> }> }> } };

export type UnstoreBarcodeMutationVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type UnstoreBarcodeMutation = { __typename?: 'Mutation', unstoreBarcode?: { __typename?: 'UnstoredItem', barcode: string, address?: string | null } | null };

export type UpdateWorkDnapProjectMutationVariables = Exact<{
  workNumber: Scalars['String'];
  dnapStudy?: InputMaybe<Scalars['String']>;
}>;


export type UpdateWorkDnapProjectMutation = { __typename?: 'Mutation', updateWorkDnapProject: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type UnreleaseMutationVariables = Exact<{
  request: UnreleaseRequest;
}>;


export type UnreleaseMutation = { __typename?: 'Mutation', unrelease: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

export type UpdateWorkNumBlocksMutationVariables = Exact<{
  workNumber: Scalars['String'];
  numBlocks?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateWorkNumBlocksMutation = { __typename?: 'Mutation', updateWorkNumBlocks: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type UpdateReleaseRecipientFullNameMutationVariables = Exact<{
  username: Scalars['String'];
  fullName?: InputMaybe<Scalars['String']>;
}>;


export type UpdateReleaseRecipientFullNameMutation = { __typename?: 'Mutation', updateReleaseRecipientFullName: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } };

export type UpdateWorkNumOriginalSamplesMutationVariables = Exact<{
  workNumber: Scalars['String'];
  numOriginalSamples?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateWorkNumOriginalSamplesMutation = { __typename?: 'Mutation', updateWorkNumOriginalSamples: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type UpdateWorkNumSlidesMutationVariables = Exact<{
  workNumber: Scalars['String'];
  numSlides?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateWorkNumSlidesMutation = { __typename?: 'Mutation', updateWorkNumSlides: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type UpdateWorkOmeroProjectMutationVariables = Exact<{
  workNumber: Scalars['String'];
  omeroProject?: InputMaybe<Scalars['String']>;
}>;


export type UpdateWorkOmeroProjectMutation = { __typename?: 'Mutation', updateWorkOmeroProject: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type UpdateWorkPriorityMutationVariables = Exact<{
  workNumber: Scalars['String'];
  priority?: InputMaybe<Scalars['String']>;
}>;


export type UpdateWorkPriorityMutation = { __typename?: 'Mutation', updateWorkPriority: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } };

export type UpdateWorkStatusMutationVariables = Exact<{
  workNumber: Scalars['String'];
  status: WorkStatus;
  commentId?: InputMaybe<Scalars['Int']>;
}>;


export type UpdateWorkStatusMutation = { __typename?: 'Mutation', updateWorkStatus: { __typename?: 'WorkWithComment', comment?: string | null, work: { __typename?: 'Work', workNumber: string, status: WorkStatus, numBlocks?: number | null, numSlides?: number | null, numOriginalSamples?: number | null, priority?: string | null, workRequester?: { __typename?: 'ReleaseRecipient', username: string, fullName?: string | null, enabled: boolean } | null, project: { __typename?: 'Project', name: string, enabled: boolean }, program: { __typename?: 'Program', name: string, enabled: boolean }, costCode: { __typename?: 'CostCode', code: string, enabled: boolean }, workType: { __typename?: 'WorkType', name: string, enabled: boolean }, omeroProject?: { __typename?: 'OmeroProject', name: string, enabled: boolean } | null, dnapStudy?: { __typename?: 'DnapStudy', name: string, enabled: boolean } | null } } };

export type VisiumAnalysisMutationVariables = Exact<{
  request: VisiumAnalysisRequest;
}>;


export type VisiumAnalysisMutation = { __typename?: 'Mutation', visiumAnalysis: { __typename?: 'OperationResult', operations: Array<{ __typename?: 'Operation', id: number }> } };

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
export const EquipmentFieldsFragmentDoc = gql`
    fragment EquipmentFields on Equipment {
  id
  name
  category
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
export const FixativeFieldsFragmentDoc = gql`
    fragment FixativeFields on Fixative {
  name
  enabled
}
    `;
export const HmdmcFieldsFragmentDoc = gql`
    fragment HmdmcFields on Hmdmc {
  hmdmc
  enabled
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
}
    `;
export const LocationFieldsFragmentDoc = gql`
    fragment LocationFields on Location {
  barcode
  fixedName
  customName
  address
  direction
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
    barcode
    fixedName
    customName
    address
  }
}
    `;
export const LinkedLocationFieldsFragmentDoc = gql`
    fragment LinkedLocationFields on LinkedLocation {
  barcode
  fixedName
  customName
  address
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
export const PlanActionFieldsFragmentDoc = gql`
    fragment PlanActionFields on PlanAction {
  newSection
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
export const ReleaseDestinationFieldsFragmentDoc = gql`
    fragment ReleaseDestinationFields on ReleaseDestination {
  name
  enabled
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
export const SlotRegionFieldsFragmentDoc = gql`
    fragment SlotRegionFields on SlotRegion {
  enabled
  name
}
    `;
export const SlotPassFailFieldsFragmentDoc = gql`
    fragment SlotPassFailFields on SlotPassFail {
  address
  result
  comment
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
export const SolutionFieldsFragmentDoc = gql`
    fragment SolutionFields on Solution {
  name
  enabled
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
export const ExtractResultDocument = gql`
    query ExtractResult($barcode: String!) {
  extractResult(barcode: $barcode) {
    result
    concentration
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}`;
export const FindFilesDocument = gql`
    query FindFiles($workNumbers: [String!]!) {
  listFiles(workNumbers: $workNumbers) {
    ...FileFields
  }
}
    ${FileFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}`;
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
export const CurrentUserDocument = gql`
    query CurrentUser {
  user {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}`;
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
${HistoryEntryFieldsFragmentDoc}`;
export const FindLocationByBarcodeDocument = gql`
    query FindLocationByBarcode($barcode: String!) {
  location(locationBarcode: $barcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}`;
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
export const FindPermDataDocument = gql`
    query FindPermData($barcode: String!) {
  visiumPermData(barcode: $barcode) {
    labware {
      ...LabwareFields
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
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${SamplePositionFieldsFragmentDoc}`;
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
export const FindSamplePositionsDocument = gql`
    query FindSamplePositions($labwareBarcode: String!) {
  samplePositions(labwareBarcode: $labwareBarcode) {
    ...SamplePositionFields
  }
}
    ${SamplePositionFieldsFragmentDoc}`;
export const FindPlanDataDocument = gql`
    query FindPlanData($barcode: String!) {
  planData(barcode: $barcode) {
    sources {
      ...LabwareFields
    }
    destination {
      ...LabwareFields
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
    ${LabwareFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${PlanActionFieldsFragmentDoc}`;
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
export const FindWorkNumbersDocument = gql`
    query FindWorkNumbers($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
  }
}
    `;
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
${HistoryEntryFieldsFragmentDoc}`;
export const FindStoragePathDocument = gql`
    query FindStoragePath($locationBarcode: String!) {
  storagePath(locationBarcode: $locationBarcode) {
    ...LinkedLocationFields
  }
}
    ${LinkedLocationFieldsFragmentDoc}`;
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
export const FindLatestOperationDocument = gql`
    query FindLatestOperation($barcode: String!, $operationType: String!) {
  findLatestOp(barcode: $barcode, operationType: $operationType) {
    id
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
  probePanels(includeDisabled: true) {
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
${DnapStudyFieldsFragmentDoc}`;
export const GetFfpeProcessingInfoDocument = gql`
    query GetFFPEProcessingInfo {
  comments(includeDisabled: false, category: "FFPE processing program") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
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
export const GetLabwareCostingDocument = gql`
    query GetLabwareCosting($barcode: String!) {
  labwareCosting(barcode: $barcode)
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
${SampleFieldsFragmentDoc}`;
export const GetNextReplicateNumberDocument = gql`
    query GetNextReplicateNumber($barcodes: [String!]!) {
  nextReplicateNumbers(barcodes: $barcodes) {
    ...NextReplicateDataFields
  }
}
    ${NextReplicateDataFieldsFragmentDoc}`;
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
export const GetRecordExtractResultInfoDocument = gql`
    query GetRecordExtractResultInfo {
  comments(category: "extract result", includeDisabled: false) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetProgramsDocument = gql`
    query GetPrograms {
  programs {
    name
    enabled
  }
}
    `;
export const GetProbePanelsDocument = gql`
    query GetProbePanels {
  probePanels {
    name
    enabled
  }
}
    `;
export const GetRecordInPlaceInfoDocument = gql`
    query GetRecordInPlaceInfo($category: String) {
  equipments(includeDisabled: false, category: $category) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
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
}
    ${LabwareTypeFieldsFragmentDoc}`;
export const GetEquipmentsDocument = gql`
    query GetEquipments($category: String, $includeDisabled: Boolean) {
  equipments(category: $category, includeDisabled: $includeDisabled) {
    ...EquipmentFields
  }
}
    ${EquipmentFieldsFragmentDoc}`;
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
export const GetSampleProcessingCommentsInfoDocument = gql`
    query GetSampleProcessingCommentsInfo {
  comments: comments(includeDisabled: false, category: "Sample Processing") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetEventTypesDocument = gql`
    query GetEventTypes {
  eventTypes
}
    `;
export const GetSearchInfoDocument = gql`
    query GetSearchInfo {
  tissueTypes {
    name
  }
}
    `;
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
export const GetXeniumQcInfoDocument = gql`
    query GetXeniumQCInfo {
  comments(includeDisabled: false, category: "QC labware") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetWorkTypesDocument = gql`
    query GetWorkTypes {
  workTypes(includeDisabled: true) {
    name
  }
}
    `;
export const AddCommentDocument = gql`
    mutation AddComment($category: String!, $text: String!) {
  addComment(category: $category, text: $text) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const AddDnapStudyDocument = gql`
    mutation AddDnapStudy($name: String!) {
  addDnapStudy(name: $name) {
    ...DnapStudyFields
  }
}
    ${DnapStudyFieldsFragmentDoc}`;
export const AddDestructionReasonDocument = gql`
    mutation AddDestructionReason($text: String!) {
  addDestructionReason(text: $text) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const AddCostCodeDocument = gql`
    mutation AddCostCode($code: String!) {
  addCostCode(code: $code) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`;
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
export const GetOmeroProjectsDocument = gql`
    query GetOmeroProjects {
  omeroProjects {
    name
    enabled
  }
}
    `;
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
export const AddProjectDocument = gql`
    mutation AddProject($name: String!) {
  addProject(name: $name) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
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
export const AddSolutionDocument = gql`
    mutation AddSolution($name: String!) {
  addSolution(name: $name) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`;
export const AddProbePanelDocument = gql`
    mutation AddProbePanel($name: String!) {
  addProbePanel(name: $name) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`;
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
export const CreateWorkDocument = gql`
    mutation CreateWork($prefix: String!, $workType: String!, $workRequester: String!, $project: String!, $program: String!, $costCode: String!, $numBlocks: Int, $numSlides: Int, $numOriginalSamples: Int, $omeroProject: String, $dnapStudy: String) {
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
    dnapStudy: $dnapStudy
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
export const EmptyLocationDocument = gql`
    mutation EmptyLocation($barcode: String!) {
  empty(locationBarcode: $barcode) {
    numUnstored
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
export const PerformFfpeProcessingDocument = gql`
    mutation PerformFFPEProcessing($request: FFPEProcessingRequest!) {
  performFFPEProcessing(request: $request) {
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
export const PrintDocument = gql`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
}
    `;
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
export const RecordAnalyserDocument = gql`
    mutation RecordAnalyser($request: AnalyserRequest!) {
  recordAnalyser(request: $request) {
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
export const GetReleaseColumnOptionsDocument = gql`
    query GetReleaseColumnOptions {
  releaseColumnOptions {
    ...ReleaseFileOptionFields
  }
}
    ${ReleaseFileOptionFieldsFragmentDoc}`;
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
export const RecordOpWithSlotMeasurementsDocument = gql`
    mutation RecordOpWithSlotMeasurements($request: OpWithSlotMeasurementsRequest!) {
  recordOpWithSlotMeasurements(request: $request) {
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
export const RecordPermDocument = gql`
    mutation RecordPerm($request: RecordPermRequest!) {
  recordPerm(request: $request) {
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
export const RecordRnaAnalysisDocument = gql`
    mutation RecordRNAAnalysis($request: RNAAnalysisRequest!) {
  recordRNAAnalysis(request: $request) {
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
export const RecordProbeOperationDocument = gql`
    mutation RecordProbeOperation($request: ProbeOperationRequest!) {
  recordProbeOperation(request: $request) {
    operations {
      id
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
export const SetCommentEnabledDocument = gql`
    mutation SetCommentEnabled($commentId: Int!, $enabled: Boolean!) {
  setCommentEnabled(commentId: $commentId, enabled: $enabled) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
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
export const SetDestructionReasonEnabledDocument = gql`
    mutation SetDestructionReasonEnabled($text: String!, $enabled: Boolean!) {
  setDestructionReasonEnabled(text: $text, enabled: $enabled) {
    ...DestructionReasonFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}`;
export const SetHmdmcEnabledDocument = gql`
    mutation SetHmdmcEnabled($hmdmc: String!, $enabled: Boolean!) {
  setHmdmcEnabled(hmdmc: $hmdmc, enabled: $enabled) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`;
export const SetDnapStudyEnabledDocument = gql`
    mutation SetDnapStudyEnabled($name: String!, $enabled: Boolean!) {
  setDnapStudyEnabled(name: $name, enabled: $enabled) {
    ...DnapStudyFields
  }
}
    ${DnapStudyFieldsFragmentDoc}`;
export const SetCostCodeEnabledDocument = gql`
    mutation SetCostCodeEnabled($code: String!, $enabled: Boolean!) {
  setCostCodeEnabled(code: $code, enabled: $enabled) {
    ...CostCodeFields
  }
}
    ${CostCodeFieldsFragmentDoc}`;
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
export const SetLocationCustomNameDocument = gql`
    mutation SetLocationCustomName($locationBarcode: String!, $newCustomName: String!) {
  setLocationCustomName(
    locationBarcode: $locationBarcode
    customName: $newCustomName
  ) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}`;
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
export const SetProjectEnabledDocument = gql`
    mutation SetProjectEnabled($name: String!, $enabled: Boolean!) {
  setProjectEnabled(name: $name, enabled: $enabled) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const SetSolutionEnabledDocument = gql`
    mutation SetSolutionEnabled($name: String!, $enabled: Boolean!) {
  setSolutionEnabled(name: $name, enabled: $enabled) {
    ...SolutionFields
  }
}
    ${SolutionFieldsFragmentDoc}`;
export const SetReleaseRecipientEnabledDocument = gql`
    mutation SetReleaseRecipientEnabled($username: String!, $enabled: Boolean!) {
  setReleaseRecipientEnabled(username: $username, enabled: $enabled) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const SetReleaseDestinationEnabledDocument = gql`
    mutation SetReleaseDestinationEnabled($name: String!, $enabled: Boolean!) {
  setReleaseDestinationEnabled(name: $name, enabled: $enabled) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`;
export const SetSlotRegionEnabledDocument = gql`
    mutation SetSlotRegionEnabled($name: String!, $enabled: Boolean!) {
  setSlotRegionEnabled(name: $name, enabled: $enabled) {
    ...SlotRegionFields
  }
}
    ${SlotRegionFieldsFragmentDoc}`;
export const SetUserRoleDocument = gql`
    mutation SetUserRole($username: String!, $role: UserRole!) {
  setUserRole(username: $username, role: $role) {
    ...UserFields
  }
}
    ${UserFieldsFragmentDoc}`;
export const SetProbePanelEnabledDocument = gql`
    mutation SetProbePanelEnabled($name: String!, $enabled: Boolean!) {
  setProbePanelEnabled(name: $name, enabled: $enabled) {
    ...ProbePanelFields
  }
}
    ${ProbePanelFieldsFragmentDoc}`;
export const SetSpeciesEnabledDocument = gql`
    mutation SetSpeciesEnabled($name: String!, $enabled: Boolean!) {
  setSpeciesEnabled(name: $name, enabled: $enabled) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
export const StainDocument = gql`
    mutation Stain($request: StainRequest!) {
  stain(request: $request) {
    operations {
      id
    }
  }
}
    `;
export const SetWorkTypeEnabledDocument = gql`
    mutation SetWorkTypeEnabled($name: String!, $enabled: Boolean!) {
  setWorkTypeEnabled(name: $name, enabled: $enabled) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`;
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
    ${LocationFieldsFragmentDoc}`;
export const TransferLocationItemsDocument = gql`
    mutation TransferLocationItems($sourceBarcode: String!, $destinationBarcode: String!) {
  transfer(sourceBarcode: $sourceBarcode, destinationBarcode: $destinationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}`;
export const StoreDocument = gql`
    mutation Store($store: [StoreInput!]!, $locationBarcode: String!) {
  store(store: $store, locationBarcode: $locationBarcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}`;
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
export const UnstoreBarcodeDocument = gql`
    mutation UnstoreBarcode($barcode: String!) {
  unstoreBarcode(barcode: $barcode) {
    barcode
    address
  }
}
    `;
export const UpdateWorkDnapProjectDocument = gql`
    mutation UpdateWorkDnapProject($workNumber: String!, $dnapStudy: String) {
  updateWorkDnapProject(workNumber: $workNumber, dnapStudy: $dnapStudy) {
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
export const UnreleaseDocument = gql`
    mutation Unrelease($request: UnreleaseRequest!) {
  unrelease(request: $request) {
    operations {
      id
    }
  }
}
    `;
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
export const UpdateReleaseRecipientFullNameDocument = gql`
    mutation UpdateReleaseRecipientFullName($username: String!, $fullName: String) {
  updateReleaseRecipientFullName(username: $username, fullName: $fullName) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
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
export const VisiumAnalysisDocument = gql`
    mutation VisiumAnalysis($request: VisiumAnalysisRequest!) {
  visiumAnalysis(request: $request) {
    operations {
      id
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    ExtractResult(variables: ExtractResultQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ExtractResultQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExtractResultQuery>(ExtractResultDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ExtractResult', 'query');
    },
    FindFiles(variables: FindFilesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindFilesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindFilesQuery>(FindFilesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindFiles', 'query');
    },
    FindHistoryForDonorName(variables: FindHistoryForDonorNameQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForDonorNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForDonorNameQuery>(FindHistoryForDonorNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForDonorName', 'query');
    },
    Find(variables: FindQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindQuery>(FindDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Find', 'query');
    },
    CurrentUser(variables?: CurrentUserQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CurrentUserQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<CurrentUserQuery>(CurrentUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CurrentUser', 'query');
    },
    FindHistoryForExternalName(variables: FindHistoryForExternalNameQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForExternalNameQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForExternalNameQuery>(FindHistoryForExternalNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForExternalName', 'query');
    },
    FindHistoryForWorkNumber(variables: FindHistoryForWorkNumberQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForWorkNumberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForWorkNumberQuery>(FindHistoryForWorkNumberDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForWorkNumber', 'query');
    },
    FindHistoryForLabwareBarcode(variables: FindHistoryForLabwareBarcodeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForLabwareBarcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForLabwareBarcodeQuery>(FindHistoryForLabwareBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForLabwareBarcode', 'query');
    },
    FindHistoryForSampleId(variables: FindHistoryForSampleIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForSampleIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryForSampleIdQuery>(FindHistoryForSampleIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistoryForSampleId', 'query');
    },
    FindLocationByBarcode(variables: FindLocationByBarcodeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLocationByBarcodeQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLocationByBarcodeQuery>(FindLocationByBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLocationByBarcode', 'query');
    },
    FindLabwareLocation(variables: FindLabwareLocationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLabwareLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLabwareLocationQuery>(FindLabwareLocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLabwareLocation', 'query');
    },
    FindLabware(variables: FindLabwareQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLabwareQuery>(FindLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLabware', 'query');
    },
    FindPassFails(variables: FindPassFailsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindPassFailsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPassFailsQuery>(FindPassFailsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindPassFails', 'query');
    },
    FindReagentPlate(variables: FindReagentPlateQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindReagentPlateQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindReagentPlateQuery>(FindReagentPlateDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindReagentPlate', 'query');
    },
    FindPermData(variables: FindPermDataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindPermDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPermDataQuery>(FindPermDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindPermData', 'query');
    },
    FindWorkInfo(variables: FindWorkInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindWorkInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkInfoQuery>(FindWorkInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorkInfo', 'query');
    },
    FindSamplePositions(variables: FindSamplePositionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindSamplePositionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindSamplePositionsQuery>(FindSamplePositionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindSamplePositions', 'query');
    },
    FindPlanData(variables: FindPlanDataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindPlanDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindPlanDataQuery>(FindPlanDataDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindPlanData', 'query');
    },
    FindWorkProgress(variables?: FindWorkProgressQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindWorkProgressQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkProgressQuery>(FindWorkProgressDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorkProgress', 'query');
    },
    FindWorkNumbers(variables: FindWorkNumbersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindWorkNumbersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorkNumbersQuery>(FindWorkNumbersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorkNumbers', 'query');
    },
    FindWorksCreatedBy(variables: FindWorksCreatedByQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindWorksCreatedByQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindWorksCreatedByQuery>(FindWorksCreatedByDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindWorksCreatedBy', 'query');
    },
    FindHistory(variables?: FindHistoryQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindHistoryQuery>(FindHistoryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindHistory', 'query');
    },
    FindStoragePath(variables: FindStoragePathQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindStoragePathQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindStoragePathQuery>(FindStoragePathDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindStoragePath', 'query');
    },
    GetAllWorkInfo(variables?: GetAllWorkInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetAllWorkInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAllWorkInfoQuery>(GetAllWorkInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetAllWorkInfo', 'query');
    },
    GetBlockProcessingInfo(variables?: GetBlockProcessingInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetBlockProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBlockProcessingInfoQuery>(GetBlockProcessingInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetBlockProcessingInfo', 'query');
    },
    FindLatestOperation(variables: FindLatestOperationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLatestOperationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<FindLatestOperationQuery>(FindLatestOperationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'FindLatestOperation', 'query');
    },
    GetComments(variables?: GetCommentsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCommentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetCommentsQuery>(GetCommentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetComments', 'query');
    },
    GetConfiguration(variables?: GetConfigurationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetConfigurationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetConfigurationQuery>(GetConfigurationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetConfiguration', 'query');
    },
    GetFFPEProcessingInfo(variables?: GetFfpeProcessingInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetFfpeProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetFfpeProcessingInfoQuery>(GetFfpeProcessingInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetFFPEProcessingInfo', 'query');
    },
    GetDestroyInfo(variables?: GetDestroyInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetDestroyInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDestroyInfoQuery>(GetDestroyInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDestroyInfo', 'query');
    },
    GetDestructionReasons(variables?: GetDestructionReasonsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetDestructionReasonsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDestructionReasonsQuery>(GetDestructionReasonsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetDestructionReasons', 'query');
    },
    GetLabwareCosting(variables: GetLabwareCostingQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetLabwareCostingQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareCostingQuery>(GetLabwareCostingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareCosting', 'query');
    },
    GetLabwareInLocation(variables: GetLabwareInLocationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetLabwareInLocationQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareInLocationQuery>(GetLabwareInLocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareInLocation', 'query');
    },
    GetNextReplicateNumber(variables: GetNextReplicateNumberQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetNextReplicateNumberQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetNextReplicateNumberQuery>(GetNextReplicateNumberDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetNextReplicateNumber', 'query');
    },
    GetLabwareOperations(variables: GetLabwareOperationsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetLabwareOperationsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLabwareOperationsQuery>(GetLabwareOperationsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetLabwareOperations', 'query');
    },
    GetPotProcessingInfo(variables?: GetPotProcessingInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPotProcessingInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPotProcessingInfoQuery>(GetPotProcessingInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPotProcessingInfo', 'query');
    },
    GetPrinters(variables?: GetPrintersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPrintersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPrintersQuery>(GetPrintersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPrinters', 'query');
    },
    GetRecordExtractResultInfo(variables?: GetRecordExtractResultInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRecordExtractResultInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordExtractResultInfoQuery>(GetRecordExtractResultInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRecordExtractResultInfo', 'query');
    },
    GetPrograms(variables?: GetProgramsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProgramsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProgramsQuery>(GetProgramsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetPrograms', 'query');
    },
    GetProbePanels(variables?: GetProbePanelsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetProbePanelsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetProbePanelsQuery>(GetProbePanelsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetProbePanels', 'query');
    },
    GetRecordInPlaceInfo(variables?: GetRecordInPlaceInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRecordInPlaceInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRecordInPlaceInfoQuery>(GetRecordInPlaceInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRecordInPlaceInfo', 'query');
    },
    GetRegistrationInfo(variables?: GetRegistrationInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRegistrationInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetRegistrationInfoQuery>(GetRegistrationInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetRegistrationInfo', 'query');
    },
    GetEquipments(variables?: GetEquipmentsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetEquipmentsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEquipmentsQuery>(GetEquipmentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetEquipments', 'query');
    },
    GetReleaseInfo(variables?: GetReleaseInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetReleaseInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReleaseInfoQuery>(GetReleaseInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetReleaseInfo', 'query');
    },
    GetSampleProcessingCommentsInfo(variables?: GetSampleProcessingCommentsInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSampleProcessingCommentsInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSampleProcessingCommentsInfoQuery>(GetSampleProcessingCommentsInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSampleProcessingCommentsInfo', 'query');
    },
    GetEventTypes(variables?: GetEventTypesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetEventTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetEventTypesQuery>(GetEventTypesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetEventTypes', 'query');
    },
    GetSearchInfo(variables?: GetSearchInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSearchInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSearchInfoQuery>(GetSearchInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSearchInfo', 'query');
    },
    GetSectioningConfirmInfo(variables?: GetSectioningConfirmInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSectioningConfirmInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSectioningConfirmInfoQuery>(GetSectioningConfirmInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSectioningConfirmInfo', 'query');
    },
    GetSectioningInfo(variables?: GetSectioningInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSectioningInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSectioningInfoQuery>(GetSectioningInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSectioningInfo', 'query');
    },
    GetSlotRegions(variables?: GetSlotRegionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSlotRegionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSlotRegionsQuery>(GetSlotRegionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSlotRegions', 'query');
    },
    GetSolutionTransferInfo(variables?: GetSolutionTransferInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSolutionTransferInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSolutionTransferInfoQuery>(GetSolutionTransferInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSolutionTransferInfo', 'query');
    },
    GetSuggestedLabwareForWork(variables: GetSuggestedLabwareForWorkQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSuggestedLabwareForWorkQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSuggestedLabwareForWorkQuery>(GetSuggestedLabwareForWorkDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSuggestedLabwareForWork', 'query');
    },
    GetStainingQCInfo(variables?: GetStainingQcInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetStainingQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainingQcInfoQuery>(GetStainingQcInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetStainingQCInfo', 'query');
    },
    GetStainInfo(variables?: GetStainInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetStainInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetStainInfoQuery>(GetStainInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetStainInfo', 'query');
    },
    GetSuggestedWorkForLabware(variables: GetSuggestedWorkForLabwareQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSuggestedWorkForLabwareQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetSuggestedWorkForLabwareQuery>(GetSuggestedWorkForLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetSuggestedWorkForLabware', 'query');
    },
    GetVisiumQCInfo(variables?: GetVisiumQcInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetVisiumQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetVisiumQcInfoQuery>(GetVisiumQcInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetVisiumQCInfo', 'query');
    },
    GetWorkAllocationInfo(variables: GetWorkAllocationInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetWorkAllocationInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkAllocationInfoQuery>(GetWorkAllocationInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkAllocationInfo', 'query');
    },
    GetWorkNumbers(variables?: GetWorkNumbersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetWorkNumbersQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkNumbersQuery>(GetWorkNumbersDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkNumbers', 'query');
    },
    GetWorkProgressInputs(variables?: GetWorkProgressInputsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetWorkProgressInputsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkProgressInputsQuery>(GetWorkProgressInputsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkProgressInputs', 'query');
    },
    GetWorkSummary(variables?: GetWorkSummaryQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetWorkSummaryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkSummaryQuery>(GetWorkSummaryDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkSummary', 'query');
    },
    GetXeniumQCInfo(variables?: GetXeniumQcInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetXeniumQcInfoQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetXeniumQcInfoQuery>(GetXeniumQcInfoDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetXeniumQCInfo', 'query');
    },
    GetWorkTypes(variables?: GetWorkTypesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetWorkTypesQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetWorkTypesQuery>(GetWorkTypesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetWorkTypes', 'query');
    },
    AddComment(variables: AddCommentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddCommentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCommentMutation>(AddCommentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddComment', 'mutation');
    },
    AddDnapStudy(variables: AddDnapStudyMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddDnapStudyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddDnapStudyMutation>(AddDnapStudyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddDnapStudy', 'mutation');
    },
    AddDestructionReason(variables: AddDestructionReasonMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddDestructionReasonMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddDestructionReasonMutation>(AddDestructionReasonDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddDestructionReason', 'mutation');
    },
    AddCostCode(variables: AddCostCodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddCostCodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCostCodeMutation>(AddCostCodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddCostCode', 'mutation');
    },
    AddEquipment(variables: AddEquipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddEquipmentMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddEquipmentMutation>(AddEquipmentDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddEquipment', 'mutation');
    },
    AddExternalID(variables: AddExternalIdMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddExternalIdMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddExternalIdMutation>(AddExternalIdDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddExternalID', 'mutation');
    },
    AddHmdmc(variables: AddHmdmcMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddHmdmcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddHmdmcMutation>(AddHmdmcDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddHmdmc', 'mutation');
    },
    AddFixative(variables: AddFixativeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddFixativeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddFixativeMutation>(AddFixativeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddFixative', 'mutation');
    },
    AddOmeroProject(variables: AddOmeroProjectMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddOmeroProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddOmeroProjectMutation>(AddOmeroProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddOmeroProject', 'mutation');
    },
    GetOmeroProjects(variables?: GetOmeroProjectsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetOmeroProjectsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetOmeroProjectsQuery>(GetOmeroProjectsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetOmeroProjects', 'query');
    },
    AddProgram(variables: AddProgramMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddProgramMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProgramMutation>(AddProgramDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddProgram', 'mutation');
    },
    AddReleaseDestination(variables: AddReleaseDestinationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddReleaseDestinationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReleaseDestinationMutation>(AddReleaseDestinationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddReleaseDestination', 'mutation');
    },
    AddProject(variables: AddProjectMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProjectMutation>(AddProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddProject', 'mutation');
    },
    AddSlotRegion(variables: AddSlotRegionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSlotRegionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSlotRegionMutation>(AddSlotRegionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSlotRegion', 'mutation');
    },
    AddSpecies(variables: AddSpeciesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSpeciesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSpeciesMutation>(AddSpeciesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSpecies', 'mutation');
    },
    AddSolution(variables: AddSolutionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSolutionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddSolutionMutation>(AddSolutionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddSolution', 'mutation');
    },
    AddProbePanel(variables: AddProbePanelMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddProbePanelMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddProbePanelMutation>(AddProbePanelDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddProbePanel', 'mutation');
    },
    AddUser(variables: AddUserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddUserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddUserMutation>(AddUserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddUser', 'mutation');
    },
    AddWorkType(variables: AddWorkTypeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddWorkTypeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddWorkTypeMutation>(AddWorkTypeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddWorkType', 'mutation');
    },
    Aliquot(variables: AliquotMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AliquotMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AliquotMutation>(AliquotDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Aliquot', 'mutation');
    },
    AddReleaseRecipient(variables: AddReleaseRecipientMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddReleaseRecipientMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddReleaseRecipientMutation>(AddReleaseRecipientDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'AddReleaseRecipient', 'mutation');
    },
    ConfirmSection(variables: ConfirmSectionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ConfirmSectionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ConfirmSectionMutation>(ConfirmSectionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ConfirmSection', 'mutation');
    },
    Confirm(variables: ConfirmMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ConfirmMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ConfirmMutation>(ConfirmDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Confirm', 'mutation');
    },
    CreateWork(variables: CreateWorkMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateWorkMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateWorkMutation>(CreateWorkDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'CreateWork', 'mutation');
    },
    Extract(variables: ExtractMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ExtractMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ExtractMutation>(ExtractDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Extract', 'mutation');
    },
    EmptyLocation(variables: EmptyLocationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<EmptyLocationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<EmptyLocationMutation>(EmptyLocationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'EmptyLocation', 'mutation');
    },
    Login(variables: LoginMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LoginMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LoginMutation>(LoginDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Login', 'mutation');
    },
    Logout(variables?: LogoutMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LogoutMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<LogoutMutation>(LogoutDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Logout', 'mutation');
    },
    PerformFFPEProcessing(variables: PerformFfpeProcessingMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PerformFfpeProcessingMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformFfpeProcessingMutation>(PerformFfpeProcessingDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformFFPEProcessing', 'mutation');
    },
    Destroy(variables: DestroyMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DestroyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<DestroyMutation>(DestroyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Destroy', 'mutation');
    },
    PerformTissueBlock(variables: PerformTissueBlockMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PerformTissueBlockMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformTissueBlockMutation>(PerformTissueBlockDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformTissueBlock', 'mutation');
    },
    PerformSolutionTransfer(variables: PerformSolutionTransferMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PerformSolutionTransferMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformSolutionTransferMutation>(PerformSolutionTransferDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformSolutionTransfer', 'mutation');
    },
    Print(variables: PrintMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PrintMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PrintMutation>(PrintDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Print', 'mutation');
    },
    PerformTissuePot(variables: PerformTissuePotMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PerformTissuePotMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PerformTissuePotMutation>(PerformTissuePotDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'PerformTissuePot', 'mutation');
    },
    RecordComplexStain(variables: RecordComplexStainMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordComplexStainMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordComplexStainMutation>(RecordComplexStainDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordComplexStain', 'mutation');
    },
    RecordExtractResult(variables: RecordExtractResultMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordExtractResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordExtractResultMutation>(RecordExtractResultDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordExtractResult', 'mutation');
    },
    RecordAnalyser(variables: RecordAnalyserMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordAnalyserMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordAnalyserMutation>(RecordAnalyserDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordAnalyser', 'mutation');
    },
    RecordOpWithSlotComments(variables: RecordOpWithSlotCommentsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordOpWithSlotCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOpWithSlotCommentsMutation>(RecordOpWithSlotCommentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordOpWithSlotComments', 'mutation');
    },
    Plan(variables: PlanMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PlanMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<PlanMutation>(PlanDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Plan', 'mutation');
    },
    GetReleaseColumnOptions(variables?: GetReleaseColumnOptionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetReleaseColumnOptionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetReleaseColumnOptionsQuery>(GetReleaseColumnOptionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'GetReleaseColumnOptions', 'query');
    },
    RecordCompletion(variables: RecordCompletionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordCompletionMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordCompletionMutation>(RecordCompletionDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordCompletion', 'mutation');
    },
    RecordInPlace(variables: RecordInPlaceMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordInPlaceMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordInPlaceMutation>(RecordInPlaceDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordInPlace', 'mutation');
    },
    RecordOpWithSlotMeasurements(variables: RecordOpWithSlotMeasurementsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordOpWithSlotMeasurementsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordOpWithSlotMeasurementsMutation>(RecordOpWithSlotMeasurementsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordOpWithSlotMeasurements', 'mutation');
    },
    RecordReagentTransfer(variables: RecordReagentTransferMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordReagentTransferMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordReagentTransferMutation>(RecordReagentTransferDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordReagentTransfer', 'mutation');
    },
    RecordPerm(variables: RecordPermMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordPermMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordPermMutation>(RecordPermDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordPerm', 'mutation');
    },
    RecordSampleProcessingComments(variables: RecordSampleProcessingCommentsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordSampleProcessingCommentsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordSampleProcessingCommentsMutation>(RecordSampleProcessingCommentsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordSampleProcessingComments', 'mutation');
    },
    RecordRNAAnalysis(variables: RecordRnaAnalysisMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordRnaAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordRnaAnalysisMutation>(RecordRnaAnalysisDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordRNAAnalysis', 'mutation');
    },
    RecordQCLabware(variables: RecordQcLabwareMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordQcLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordQcLabwareMutation>(RecordQcLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordQCLabware', 'mutation');
    },
    RecordVisiumQC(variables: RecordVisiumQcMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordVisiumQcMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordVisiumQcMutation>(RecordVisiumQcDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordVisiumQC', 'mutation');
    },
    RecordStainResult(variables: RecordStainResultMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordStainResultMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordStainResultMutation>(RecordStainResultDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordStainResult', 'mutation');
    },
    RecordProbeOperation(variables: RecordProbeOperationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordProbeOperationMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RecordProbeOperationMutation>(RecordProbeOperationDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RecordProbeOperation', 'mutation');
    },
    RegisterSections(variables: RegisterSectionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterSectionsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterSectionsMutation>(RegisterSectionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterSections', 'mutation');
    },
    RegisterTissues(variables: RegisterTissuesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterTissuesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterTissuesMutation>(RegisterTissuesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterTissues', 'mutation');
    },
    RegisterOriginalSamples(variables: RegisterOriginalSamplesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterOriginalSamplesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<RegisterOriginalSamplesMutation>(RegisterOriginalSamplesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'RegisterOriginalSamples', 'mutation');
    },
    SetCommentEnabled(variables: SetCommentEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetCommentEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCommentEnabledMutation>(SetCommentEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetCommentEnabled', 'mutation');
    },
    ReleaseLabware(variables: ReleaseLabwareMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ReleaseLabwareMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<ReleaseLabwareMutation>(ReleaseLabwareDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'ReleaseLabware', 'mutation');
    },
    SetDestructionReasonEnabled(variables: SetDestructionReasonEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetDestructionReasonEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetDestructionReasonEnabledMutation>(SetDestructionReasonEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetDestructionReasonEnabled', 'mutation');
    },
    SetHmdmcEnabled(variables: SetHmdmcEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetHmdmcEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetHmdmcEnabledMutation>(SetHmdmcEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetHmdmcEnabled', 'mutation');
    },
    SetDnapStudyEnabled(variables: SetDnapStudyEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetDnapStudyEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetDnapStudyEnabledMutation>(SetDnapStudyEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetDnapStudyEnabled', 'mutation');
    },
    SetCostCodeEnabled(variables: SetCostCodeEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetCostCodeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetCostCodeEnabledMutation>(SetCostCodeEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetCostCodeEnabled', 'mutation');
    },
    SetEquipmentEnabled(variables: SetEquipmentEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetEquipmentEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetEquipmentEnabledMutation>(SetEquipmentEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetEquipmentEnabled', 'mutation');
    },
    SetFixativeEnabled(variables: SetFixativeEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetFixativeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetFixativeEnabledMutation>(SetFixativeEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetFixativeEnabled', 'mutation');
    },
    SetLocationCustomName(variables: SetLocationCustomNameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetLocationCustomNameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetLocationCustomNameMutation>(SetLocationCustomNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetLocationCustomName', 'mutation');
    },
    SetProgramEnabled(variables: SetProgramEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetProgramEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProgramEnabledMutation>(SetProgramEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetProgramEnabled', 'mutation');
    },
    SetOmeroProjectEnabled(variables: SetOmeroProjectEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetOmeroProjectEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetOmeroProjectEnabledMutation>(SetOmeroProjectEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetOmeroProjectEnabled', 'mutation');
    },
    SetProjectEnabled(variables: SetProjectEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetProjectEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProjectEnabledMutation>(SetProjectEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetProjectEnabled', 'mutation');
    },
    SetSolutionEnabled(variables: SetSolutionEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetSolutionEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSolutionEnabledMutation>(SetSolutionEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetSolutionEnabled', 'mutation');
    },
    SetReleaseRecipientEnabled(variables: SetReleaseRecipientEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetReleaseRecipientEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetReleaseRecipientEnabledMutation>(SetReleaseRecipientEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetReleaseRecipientEnabled', 'mutation');
    },
    SetReleaseDestinationEnabled(variables: SetReleaseDestinationEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetReleaseDestinationEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetReleaseDestinationEnabledMutation>(SetReleaseDestinationEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetReleaseDestinationEnabled', 'mutation');
    },
    SetSlotRegionEnabled(variables: SetSlotRegionEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetSlotRegionEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSlotRegionEnabledMutation>(SetSlotRegionEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetSlotRegionEnabled', 'mutation');
    },
    SetUserRole(variables: SetUserRoleMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetUserRoleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetUserRoleMutation>(SetUserRoleDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetUserRole', 'mutation');
    },
    SetProbePanelEnabled(variables: SetProbePanelEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetProbePanelEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetProbePanelEnabledMutation>(SetProbePanelEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetProbePanelEnabled', 'mutation');
    },
    SetSpeciesEnabled(variables: SetSpeciesEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetSpeciesEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetSpeciesEnabledMutation>(SetSpeciesEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetSpeciesEnabled', 'mutation');
    },
    Stain(variables: StainMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<StainMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StainMutation>(StainDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Stain', 'mutation');
    },
    SetWorkTypeEnabled(variables: SetWorkTypeEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetWorkTypeEnabledMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SetWorkTypeEnabledMutation>(SetWorkTypeEnabledDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SetWorkTypeEnabled', 'mutation');
    },
    StoreBarcode(variables: StoreBarcodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<StoreBarcodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StoreBarcodeMutation>(StoreBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'StoreBarcode', 'mutation');
    },
    TransferLocationItems(variables: TransferLocationItemsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<TransferLocationItemsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<TransferLocationItemsMutation>(TransferLocationItemsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'TransferLocationItems', 'mutation');
    },
    Store(variables: StoreMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<StoreMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<StoreMutation>(StoreDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Store', 'mutation');
    },
    SlotCopy(variables: SlotCopyMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SlotCopyMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SlotCopyMutation>(SlotCopyDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'SlotCopy', 'mutation');
    },
    UnstoreBarcode(variables: UnstoreBarcodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UnstoreBarcodeMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnstoreBarcodeMutation>(UnstoreBarcodeDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UnstoreBarcode', 'mutation');
    },
    UpdateWorkDnapProject(variables: UpdateWorkDnapProjectMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkDnapProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkDnapProjectMutation>(UpdateWorkDnapProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkDnapProject', 'mutation');
    },
    Unrelease(variables: UnreleaseMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UnreleaseMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UnreleaseMutation>(UnreleaseDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Unrelease', 'mutation');
    },
    UpdateWorkNumBlocks(variables: UpdateWorkNumBlocksMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkNumBlocksMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumBlocksMutation>(UpdateWorkNumBlocksDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkNumBlocks', 'mutation');
    },
    UpdateReleaseRecipientFullName(variables: UpdateReleaseRecipientFullNameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateReleaseRecipientFullNameMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateReleaseRecipientFullNameMutation>(UpdateReleaseRecipientFullNameDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateReleaseRecipientFullName', 'mutation');
    },
    UpdateWorkNumOriginalSamples(variables: UpdateWorkNumOriginalSamplesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkNumOriginalSamplesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumOriginalSamplesMutation>(UpdateWorkNumOriginalSamplesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkNumOriginalSamples', 'mutation');
    },
    UpdateWorkNumSlides(variables: UpdateWorkNumSlidesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkNumSlidesMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkNumSlidesMutation>(UpdateWorkNumSlidesDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkNumSlides', 'mutation');
    },
    UpdateWorkOmeroProject(variables: UpdateWorkOmeroProjectMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkOmeroProjectMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkOmeroProjectMutation>(UpdateWorkOmeroProjectDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkOmeroProject', 'mutation');
    },
    UpdateWorkPriority(variables: UpdateWorkPriorityMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkPriorityMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkPriorityMutation>(UpdateWorkPriorityDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkPriority', 'mutation');
    },
    UpdateWorkStatus(variables: UpdateWorkStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkStatusMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateWorkStatusMutation>(UpdateWorkStatusDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'UpdateWorkStatus', 'mutation');
    },
    VisiumAnalysis(variables: VisiumAnalysisMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<VisiumAnalysisMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<VisiumAnalysisMutation>(VisiumAnalysisDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'VisiumAnalysis', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;