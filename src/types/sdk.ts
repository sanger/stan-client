import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import { gql } from 'graphql-request';
export type Maybe<T> = T | null;
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
  Address: string;
  Timestamp: string;
  Date: string;
};




export enum UserRole {
  Disabled = 'disabled',
  Normal = 'normal',
  Admin = 'admin'
}

export enum LabwareState {
  Empty = 'empty',
  Active = 'active',
  Discarded = 'discarded',
  Released = 'released',
  Destroyed = 'destroyed'
}

export enum PassFail {
  Pass = 'pass',
  Fail = 'fail'
}

export type User = {
  __typename?: 'User';
  username: Scalars['String'];
  role: UserRole;
};

export type LoginResult = {
  __typename?: 'LoginResult';
  message?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type Medium = {
  __typename?: 'Medium';
  name: Scalars['String'];
};

export type Fixative = {
  __typename?: 'Fixative';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type MouldSize = {
  __typename?: 'MouldSize';
  name: Scalars['String'];
};

export type TissueType = {
  __typename?: 'TissueType';
  name: Scalars['String'];
  spatialLocations: Array<SpatialLocation>;
};

export type SpatialLocation = {
  __typename?: 'SpatialLocation';
  name: Scalars['String'];
  code: Scalars['Int'];
  tissueType: TissueType;
};

export type Hmdmc = {
  __typename?: 'Hmdmc';
  hmdmc: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type LabelType = {
  __typename?: 'LabelType';
  name: Scalars['String'];
};

export type LabwareType = {
  __typename?: 'LabwareType';
  name: Scalars['String'];
  numRows: Scalars['Int'];
  numColumns: Scalars['Int'];
  labelType?: Maybe<LabelType>;
};

export type Species = {
  __typename?: 'Species';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type Donor = {
  __typename?: 'Donor';
  donorName: Scalars['String'];
  lifeStage: LifeStage;
  species: Species;
};

export type BioState = {
  __typename?: 'BioState';
  name: Scalars['String'];
};

export type Tissue = {
  __typename?: 'Tissue';
  externalName: Scalars['String'];
  replicate: Scalars['Int'];
  spatialLocation: SpatialLocation;
  donor: Donor;
  hmdmc?: Maybe<Hmdmc>;
  mouldSize: MouldSize;
  medium: Medium;
  fixative: Fixative;
};

export type Sample = {
  __typename?: 'Sample';
  id: Scalars['Int'];
  section?: Maybe<Scalars['Int']>;
  tissue: Tissue;
  bioState: BioState;
};

export type Slot = {
  __typename?: 'Slot';
  address: Scalars['Address'];
  labwareId: Scalars['Int'];
  samples: Array<Sample>;
  block: Scalars['Boolean'];
  blockHighestSection?: Maybe<Scalars['Int']>;
};

export type Labware = {
  __typename?: 'Labware';
  id: Scalars['Int'];
  barcode: Scalars['String'];
  labwareType: LabwareType;
  slots: Array<Slot>;
  released: Scalars['Boolean'];
  destroyed: Scalars['Boolean'];
  discarded: Scalars['Boolean'];
  state: LabwareState;
  created: Scalars['Timestamp'];
};

export enum LifeStage {
  Adult = 'adult',
  Paediatric = 'paediatric',
  Fetal = 'fetal'
}

export type BlockRegisterRequest = {
  donorIdentifier: Scalars['String'];
  lifeStage: LifeStage;
  hmdmc?: Maybe<Scalars['String']>;
  tissueType: Scalars['String'];
  spatialLocation: Scalars['Int'];
  replicateNumber: Scalars['Int'];
  externalIdentifier: Scalars['String'];
  highestSection: Scalars['Int'];
  labwareType: Scalars['String'];
  medium: Scalars['String'];
  fixative: Scalars['String'];
  mouldSize: Scalars['String'];
  species: Scalars['String'];
  existingTissue?: Maybe<Scalars['Boolean']>;
};

export type RegisterRequest = {
  blocks: Array<BlockRegisterRequest>;
};

export type SectionRegisterContent = {
  address: Scalars['Address'];
  species: Scalars['String'];
  hmdmc?: Maybe<Scalars['String']>;
  donorIdentifier: Scalars['String'];
  lifeStage: LifeStage;
  externalIdentifier: Scalars['String'];
  tissueType: Scalars['String'];
  spatialLocation: Scalars['Int'];
  replicateNumber: Scalars['Int'];
  fixative: Scalars['String'];
  medium: Scalars['String'];
  sectionNumber: Scalars['Int'];
  sectionThickness?: Maybe<Scalars['Int']>;
};

export type SectionRegisterLabware = {
  labwareType: Scalars['String'];
  externalBarcode: Scalars['String'];
  contents: Array<SectionRegisterContent>;
};

export type SectionRegisterRequest = {
  labware: Array<SectionRegisterLabware>;
};

export type RegisterClash = {
  __typename?: 'RegisterClash';
  tissue: Tissue;
  labware: Array<Labware>;
};

export type RegisterResult = {
  __typename?: 'RegisterResult';
  labware: Array<Labware>;
  clashes: Array<RegisterClash>;
};

export type PlanRequestSource = {
  barcode: Scalars['String'];
  address?: Maybe<Scalars['Address']>;
};

export type OperationType = {
  __typename?: 'OperationType';
  name: Scalars['String'];
};

export type PlanAction = {
  __typename?: 'PlanAction';
  source: Slot;
  destination: Slot;
  sample: Sample;
  newSection?: Maybe<Scalars['Int']>;
};

export type PlanOperation = {
  __typename?: 'PlanOperation';
  operationType?: Maybe<OperationType>;
  planActions: Array<PlanAction>;
};

export type PlanRequestAction = {
  address: Scalars['Address'];
  sampleId: Scalars['Int'];
  sampleThickness?: Maybe<Scalars['Int']>;
  source: PlanRequestSource;
};

export type PlanRequestLabware = {
  labwareType: Scalars['String'];
  barcode?: Maybe<Scalars['String']>;
  actions: Array<PlanRequestAction>;
};

export type PlanRequest = {
  operationType: Scalars['String'];
  labware: Array<PlanRequestLabware>;
};

export type AddressCommentInput = {
  address: Scalars['Address'];
  commentId: Scalars['Int'];
};

export type CancelPlanAction = {
  destinationAddress: Scalars['Address'];
  sampleId: Scalars['Int'];
  newSection?: Maybe<Scalars['Int']>;
};

export type ConfirmOperationLabware = {
  barcode: Scalars['String'];
  cancelled?: Maybe<Scalars['Boolean']>;
  cancelledActions?: Maybe<Array<CancelPlanAction>>;
  addressComments?: Maybe<Array<AddressCommentInput>>;
};

export type ConfirmOperationRequest = {
  labware: Array<ConfirmOperationLabware>;
};

export type ConfirmSection = {
  destinationAddress: Scalars['Address'];
  sampleId: Scalars['Int'];
  newSection: Scalars['Int'];
};

export type ConfirmSectionLabware = {
  barcode: Scalars['String'];
  cancelled?: Maybe<Scalars['Boolean']>;
  confirmSections?: Maybe<Array<ConfirmSection>>;
  addressComments?: Maybe<Array<AddressCommentInput>>;
};

export type ConfirmSectionRequest = {
  labware: Array<ConfirmSectionLabware>;
  workNumber?: Maybe<Scalars['String']>;
};

export type SlotCopyContent = {
  sourceBarcode: Scalars['String'];
  sourceAddress: Scalars['Address'];
  destinationAddress: Scalars['Address'];
};

export type SlotCopyRequest = {
  labwareType: Scalars['String'];
  operationType: Scalars['String'];
  contents: Array<SlotCopyContent>;
  workNumber?: Maybe<Scalars['String']>;
};

export type InPlaceOpRequest = {
  operationType: Scalars['String'];
  barcodes: Array<Scalars['String']>;
  equipmentId?: Maybe<Scalars['Int']>;
  workNumber?: Maybe<Scalars['String']>;
};

export type Action = {
  __typename?: 'Action';
  source: Slot;
  destination: Slot;
  operationId: Scalars['Int'];
  sample: Sample;
};

export type Operation = {
  __typename?: 'Operation';
  id: Scalars['Int'];
  operationType: OperationType;
  actions: Array<Action>;
  user: User;
  performed: Scalars['Timestamp'];
};

export type ConfirmOperationResult = {
  __typename?: 'ConfirmOperationResult';
  labware: Array<Labware>;
  operations: Array<Operation>;
};

export type PlanResult = {
  __typename?: 'PlanResult';
  labware: Array<Labware>;
  operations: Array<PlanOperation>;
};

export type Printer = {
  __typename?: 'Printer';
  name: Scalars['String'];
  labelTypes: Array<LabelType>;
};

export type Comment = {
  __typename?: 'Comment';
  id: Scalars['Int'];
  text: Scalars['String'];
  category: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type Equipment = {
  __typename?: 'Equipment';
  id: Scalars['Int'];
  name: Scalars['String'];
  category: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type ReleaseDestination = {
  __typename?: 'ReleaseDestination';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type ReleaseRecipient = {
  __typename?: 'ReleaseRecipient';
  username: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type Release = {
  __typename?: 'Release';
  id: Scalars['Int'];
  labware: Labware;
  destination: ReleaseDestination;
  recipient: ReleaseRecipient;
};

export type ReleaseResult = {
  __typename?: 'ReleaseResult';
  releases: Array<Release>;
};

export type ReleaseRequest = {
  barcodes: Array<Scalars['String']>;
  destination: Scalars['String'];
  recipient: Scalars['String'];
};

export type ExtractRequest = {
  barcodes: Array<Scalars['String']>;
  labwareType: Scalars['String'];
  workNumber?: Maybe<Scalars['String']>;
};

export type OperationResult = {
  __typename?: 'OperationResult';
  labware: Array<Labware>;
  operations: Array<Operation>;
};

export type DestructionReason = {
  __typename?: 'DestructionReason';
  id: Scalars['Int'];
  text: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type Destruction = {
  __typename?: 'Destruction';
  labware?: Maybe<Labware>;
  user?: Maybe<User>;
  destroyed?: Maybe<Scalars['Timestamp']>;
  reason?: Maybe<DestructionReason>;
};

export type DestroyResult = {
  __typename?: 'DestroyResult';
  destructions: Array<Destruction>;
};

export type DestroyRequest = {
  barcodes: Array<Scalars['String']>;
  reasonId: Scalars['Int'];
};

export type StoredItem = {
  __typename?: 'StoredItem';
  barcode: Scalars['String'];
  location: Location;
  address?: Maybe<Scalars['Address']>;
};

export type UnstoredItem = {
  __typename?: 'UnstoredItem';
  barcode: Scalars['String'];
  address?: Maybe<Scalars['Address']>;
};

export type Size = {
  __typename?: 'Size';
  numRows: Scalars['Int'];
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

export type Location = {
  __typename?: 'Location';
  id: Scalars['Int'];
  barcode: Scalars['String'];
  fixedName?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Address']>;
  size?: Maybe<Size>;
  parent?: Maybe<LinkedLocation>;
  stored: Array<StoredItem>;
  children: Array<LinkedLocation>;
  direction?: Maybe<GridDirection>;
  qualifiedNameWithFirstBarcode?: Maybe<Scalars['String']>;
};

export type LinkedLocation = {
  __typename?: 'LinkedLocation';
  barcode: Scalars['String'];
  fixedName?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Address']>;
};

export type UnstoreResult = {
  __typename?: 'UnstoreResult';
  numUnstored: Scalars['Int'];
  unstored: Array<UnstoredItem>;
};

export type FindEntry = {
  __typename?: 'FindEntry';
  sampleId: Scalars['Int'];
  labwareId: Scalars['Int'];
};

export type LabwareLocationEntry = {
  __typename?: 'LabwareLocationEntry';
  labwareId: Scalars['Int'];
  locationId: Scalars['Int'];
  address?: Maybe<Scalars['Address']>;
};

export type FindResult = {
  __typename?: 'FindResult';
  entries: Array<FindEntry>;
  samples: Array<Sample>;
  labware: Array<Labware>;
  locations: Array<Location>;
  labwareLocations: Array<LabwareLocationEntry>;
  numRecords: Scalars['Int'];
};

export type FindRequest = {
  labwareBarcode?: Maybe<Scalars['String']>;
  donorName?: Maybe<Scalars['String']>;
  tissueExternalName?: Maybe<Scalars['String']>;
  tissueTypeName?: Maybe<Scalars['String']>;
  maxRecords?: Maybe<Scalars['Int']>;
  createdMin?: Maybe<Scalars['Date']>;
  createdMax?: Maybe<Scalars['Date']>;
};

export type HistoryEntry = {
  __typename?: 'HistoryEntry';
  eventId: Scalars['Int'];
  type: Scalars['String'];
  time: Scalars['Timestamp'];
  sourceLabwareId: Scalars['Int'];
  destinationLabwareId: Scalars['Int'];
  sampleId?: Maybe<Scalars['Int']>;
  username: Scalars['String'];
  workNumber?: Maybe<Scalars['String']>;
  details: Array<Scalars['String']>;
};

export type History = {
  __typename?: 'History';
  entries: Array<HistoryEntry>;
  labware: Array<Labware>;
  samples: Array<Sample>;
};

export type PlanData = {
  __typename?: 'PlanData';
  sources: Array<Labware>;
  plan: PlanOperation;
  destination: Labware;
};

export type Project = {
  __typename?: 'Project';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type CostCode = {
  __typename?: 'CostCode';
  code: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type WorkType = {
  __typename?: 'WorkType';
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export enum WorkStatus {
  Active = 'active',
  Paused = 'paused',
  Completed = 'completed',
  Failed = 'failed'
}

export type Work = {
  __typename?: 'Work';
  workType: WorkType;
  project: Project;
  costCode: CostCode;
  workNumber: Scalars['String'];
  status: WorkStatus;
};

export type StainType = {
  __typename?: 'StainType';
  name: Scalars['String'];
  measurementTypes: Array<Scalars['String']>;
};

export type TimeMeasurement = {
  name: Scalars['String'];
  seconds: Scalars['Int'];
};

export type StainRequest = {
  stainType: Scalars['String'];
  barcodes: Array<Scalars['String']>;
  timeMeasurements?: Maybe<Array<TimeMeasurement>>;
  workNumber?: Maybe<Scalars['String']>;
};

export type SampleResult = {
  address: Scalars['Address'];
  sampleId: Scalars['Int'];
  result: PassFail;
  commentId?: Maybe<Scalars['Int']>;
};

export type LabwareResult = {
  barcode: Scalars['String'];
  sampleResults: Array<SampleResult>;
};

export type ResultRequest = {
  labwareResults: Array<LabwareResult>;
  workNumber?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  tissueTypes: Array<TissueType>;
  labwareTypes: Array<LabwareType>;
  hmdmcs: Array<Hmdmc>;
  mediums: Array<Medium>;
  fixatives: Array<Fixative>;
  mouldSizes: Array<MouldSize>;
  species: Array<Species>;
  labware: Labware;
  printers: Array<Printer>;
  comments: Array<Comment>;
  equipments: Array<Equipment>;
  releaseDestinations: Array<ReleaseDestination>;
  releaseRecipients: Array<ReleaseRecipient>;
  destructionReasons: Array<DestructionReason>;
  projects: Array<Project>;
  costCodes: Array<CostCode>;
  workTypes: Array<WorkType>;
  works: Array<Work>;
  work: Work;
  users: Array<User>;
  find: FindResult;
  planData: PlanData;
  stainTypes: Array<StainType>;
  historyForSampleId: History;
  historyForExternalName: History;
  historyForDonorName: History;
  historyForLabwareBarcode: History;
  location: Location;
  stored: Array<StoredItem>;
};


export type QueryHmdmcsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryFixativesArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QuerySpeciesArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryLabwareArgs = {
  barcode: Scalars['String'];
};


export type QueryPrintersArgs = {
  labelType?: Maybe<Scalars['String']>;
};


export type QueryCommentsArgs = {
  category?: Maybe<Scalars['String']>;
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryEquipmentsArgs = {
  category?: Maybe<Scalars['String']>;
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryReleaseDestinationsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryReleaseRecipientsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryDestructionReasonsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryProjectsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryCostCodesArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryWorkTypesArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryWorksArgs = {
  status?: Maybe<Array<WorkStatus>>;
};


export type QueryWorkArgs = {
  workNumber: Scalars['String'];
};


export type QueryUsersArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryFindArgs = {
  request: FindRequest;
};


export type QueryPlanDataArgs = {
  barcode: Scalars['String'];
};


export type QueryHistoryForSampleIdArgs = {
  sampleId: Scalars['Int'];
};


export type QueryHistoryForExternalNameArgs = {
  externalName: Scalars['String'];
};


export type QueryHistoryForDonorNameArgs = {
  donorName: Scalars['String'];
};


export type QueryHistoryForLabwareBarcodeArgs = {
  barcode: Scalars['String'];
};


export type QueryLocationArgs = {
  locationBarcode: Scalars['String'];
};


export type QueryStoredArgs = {
  barcodes: Array<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  login: LoginResult;
  logout?: Maybe<Scalars['String']>;
  register: RegisterResult;
  registerSections: RegisterResult;
  plan: PlanResult;
  printLabware?: Maybe<Scalars['String']>;
  confirmOperation: ConfirmOperationResult;
  confirmSection: OperationResult;
  release: ReleaseResult;
  extract: OperationResult;
  destroy: DestroyResult;
  slotCopy: OperationResult;
  addComment: Comment;
  setCommentEnabled: Comment;
  addEquipment: Equipment;
  setEquipmentEnabled: Equipment;
  addDestructionReason: DestructionReason;
  setDestructionReasonEnabled: DestructionReason;
  addHmdmc: Hmdmc;
  setHmdmcEnabled: Hmdmc;
  addReleaseDestination: ReleaseDestination;
  setReleaseDestinationEnabled: ReleaseDestination;
  addReleaseRecipient: ReleaseRecipient;
  setReleaseRecipientEnabled: ReleaseRecipient;
  addSpecies: Species;
  setSpeciesEnabled: Species;
  addProject: Project;
  setProjectEnabled: Project;
  addCostCode: CostCode;
  setCostCodeEnabled: CostCode;
  addFixative: Fixative;
  setFixativeEnabled: Fixative;
  addWorkType: WorkType;
  setWorkTypeEnabled: WorkType;
  createWork: Work;
  updateWorkStatus: Work;
  stain: OperationResult;
  recordInPlace: OperationResult;
  recordStainResult: OperationResult;
  addUser: User;
  setUserRole: User;
  storeBarcode: StoredItem;
  unstoreBarcode?: Maybe<UnstoredItem>;
  empty: UnstoreResult;
  setLocationCustomName: Location;
};


export type MutationLoginArgs = {
  username: Scalars['String'];
  password: Scalars['String'];
};


export type MutationRegisterArgs = {
  request: RegisterRequest;
};


export type MutationRegisterSectionsArgs = {
  request?: Maybe<SectionRegisterRequest>;
};


export type MutationPlanArgs = {
  request: PlanRequest;
};


export type MutationPrintLabwareArgs = {
  printer: Scalars['String'];
  barcodes: Array<Scalars['String']>;
};


export type MutationConfirmOperationArgs = {
  request: ConfirmOperationRequest;
};


export type MutationConfirmSectionArgs = {
  request: ConfirmSectionRequest;
};


export type MutationReleaseArgs = {
  request: ReleaseRequest;
};


export type MutationExtractArgs = {
  request: ExtractRequest;
};


export type MutationDestroyArgs = {
  request: DestroyRequest;
};


export type MutationSlotCopyArgs = {
  request: SlotCopyRequest;
};


export type MutationAddCommentArgs = {
  category: Scalars['String'];
  text: Scalars['String'];
};


export type MutationSetCommentEnabledArgs = {
  commentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
};


export type MutationAddEquipmentArgs = {
  category: Scalars['String'];
  name: Scalars['String'];
};


export type MutationSetEquipmentEnabledArgs = {
  equipmentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
};


export type MutationAddDestructionReasonArgs = {
  text: Scalars['String'];
};


export type MutationSetDestructionReasonEnabledArgs = {
  text: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddHmdmcArgs = {
  hmdmc: Scalars['String'];
};


export type MutationSetHmdmcEnabledArgs = {
  hmdmc: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddReleaseDestinationArgs = {
  name: Scalars['String'];
};


export type MutationSetReleaseDestinationEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddReleaseRecipientArgs = {
  username: Scalars['String'];
};


export type MutationSetReleaseRecipientEnabledArgs = {
  username: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddSpeciesArgs = {
  name: Scalars['String'];
};


export type MutationSetSpeciesEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddProjectArgs = {
  name: Scalars['String'];
};


export type MutationSetProjectEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddCostCodeArgs = {
  code: Scalars['String'];
};


export type MutationSetCostCodeEnabledArgs = {
  code: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddFixativeArgs = {
  name: Scalars['String'];
};


export type MutationSetFixativeEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationAddWorkTypeArgs = {
  name: Scalars['String'];
};


export type MutationSetWorkTypeEnabledArgs = {
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
};


export type MutationCreateWorkArgs = {
  prefix: Scalars['String'];
  workType: Scalars['String'];
  project: Scalars['String'];
  costCode: Scalars['String'];
};


export type MutationUpdateWorkStatusArgs = {
  workNumber: Scalars['String'];
  status: WorkStatus;
  commentId?: Maybe<Scalars['Int']>;
};


export type MutationStainArgs = {
  request: StainRequest;
};


export type MutationRecordInPlaceArgs = {
  request: InPlaceOpRequest;
};


export type MutationRecordStainResultArgs = {
  request: ResultRequest;
};


export type MutationAddUserArgs = {
  username: Scalars['String'];
};


export type MutationSetUserRoleArgs = {
  username: Scalars['String'];
  role: UserRole;
};


export type MutationStoreBarcodeArgs = {
  barcode: Scalars['String'];
  locationBarcode: Scalars['String'];
  address?: Maybe<Scalars['Address']>;
};


export type MutationUnstoreBarcodeArgs = {
  barcode: Scalars['String'];
};


export type MutationEmptyArgs = {
  locationBarcode: Scalars['String'];
};


export type MutationSetLocationCustomNameArgs = {
  locationBarcode: Scalars['String'];
  customName?: Maybe<Scalars['String']>;
};

export type CommentFieldsFragment = (
  { __typename?: 'Comment' }
  & Pick<Comment, 'id' | 'text' | 'category' | 'enabled'>
);

export type CostCodeFieldsFragment = (
  { __typename?: 'CostCode' }
  & Pick<CostCode, 'code' | 'enabled'>
);

export type DestructionReasonFieldsFragment = (
  { __typename?: 'DestructionReason' }
  & Pick<DestructionReason, 'id' | 'text' | 'enabled'>
);

export type EquipmentFieldsFragment = (
  { __typename?: 'Equipment' }
  & Pick<Equipment, 'id' | 'name' | 'category' | 'enabled'>
);

export type FixativeFieldsFragment = (
  { __typename?: 'Fixative' }
  & Pick<Fixative, 'name' | 'enabled'>
);

export type HistoryEntryFieldsFragment = (
  { __typename?: 'HistoryEntry' }
  & Pick<HistoryEntry, 'destinationLabwareId' | 'details' | 'eventId' | 'sampleId' | 'sourceLabwareId' | 'time' | 'username' | 'type' | 'workNumber'>
);

export type HistoryFieldsFragment = (
  { __typename?: 'History' }
  & { labware: Array<(
    { __typename?: 'Labware' }
    & LabwareFieldsFragment
  )>, samples: Array<(
    { __typename?: 'Sample' }
    & SampleFieldsFragment
  )>, entries: Array<(
    { __typename?: 'HistoryEntry' }
    & HistoryEntryFieldsFragment
  )> }
);

export type HmdmcFieldsFragment = (
  { __typename?: 'Hmdmc' }
  & Pick<Hmdmc, 'hmdmc' | 'enabled'>
);

export type LabwareFieldsFragment = (
  { __typename?: 'Labware' }
  & Pick<Labware, 'id' | 'barcode' | 'destroyed' | 'discarded' | 'released' | 'state' | 'created'>
  & { labwareType: (
    { __typename?: 'LabwareType' }
    & LabwareTypeFieldsFragment
  ), slots: Array<(
    { __typename?: 'Slot' }
    & SlotFieldsFragment
  )> }
);

export type LabwareTypeFieldsFragment = (
  { __typename?: 'LabwareType' }
  & Pick<LabwareType, 'name' | 'numRows' | 'numColumns'>
  & { labelType?: Maybe<(
    { __typename?: 'LabelType' }
    & Pick<LabelType, 'name'>
  )> }
);

export type LocationFieldsFragment = (
  { __typename?: 'Location' }
  & Pick<Location, 'barcode' | 'fixedName' | 'customName' | 'address' | 'direction'>
  & { parent?: Maybe<(
    { __typename?: 'LinkedLocation' }
    & Pick<LinkedLocation, 'barcode' | 'fixedName' | 'customName'>
  )>, size?: Maybe<(
    { __typename?: 'Size' }
    & Pick<Size, 'numRows' | 'numColumns'>
  )>, stored: Array<(
    { __typename?: 'StoredItem' }
    & Pick<StoredItem, 'barcode' | 'address'>
  )>, children: Array<(
    { __typename?: 'LinkedLocation' }
    & Pick<LinkedLocation, 'barcode' | 'fixedName' | 'customName' | 'address'>
  )> }
);

export type PlanActionFieldsFragment = (
  { __typename?: 'PlanAction' }
  & Pick<PlanAction, 'newSection'>
  & { sample: (
    { __typename?: 'Sample' }
    & Pick<Sample, 'id'>
  ), source: (
    { __typename?: 'Slot' }
    & Pick<Slot, 'address' | 'labwareId'>
    & { samples: Array<(
      { __typename?: 'Sample' }
      & Pick<Sample, 'id'>
    )> }
  ), destination: (
    { __typename?: 'Slot' }
    & Pick<Slot, 'address' | 'labwareId'>
  ) }
);

export type PrinterFieldsFragment = (
  { __typename?: 'Printer' }
  & Pick<Printer, 'name'>
  & { labelTypes: Array<(
    { __typename?: 'LabelType' }
    & Pick<LabelType, 'name'>
  )> }
);

export type ProjectFieldsFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'name' | 'enabled'>
);

export type ReleaseDestinationFieldsFragment = (
  { __typename?: 'ReleaseDestination' }
  & Pick<ReleaseDestination, 'name' | 'enabled'>
);

export type ReleaseRecipientFieldsFragment = (
  { __typename?: 'ReleaseRecipient' }
  & Pick<ReleaseRecipient, 'username' | 'enabled'>
);

export type SampleFieldsFragment = (
  { __typename?: 'Sample' }
  & Pick<Sample, 'id' | 'section'>
  & { tissue: (
    { __typename?: 'Tissue' }
    & Pick<Tissue, 'externalName' | 'replicate'>
    & { donor: (
      { __typename?: 'Donor' }
      & Pick<Donor, 'donorName' | 'lifeStage'>
    ), spatialLocation: (
      { __typename?: 'SpatialLocation' }
      & Pick<SpatialLocation, 'code'>
      & { tissueType: (
        { __typename?: 'TissueType' }
        & Pick<TissueType, 'name'>
      ) }
    ) }
  ), bioState: (
    { __typename?: 'BioState' }
    & Pick<BioState, 'name'>
  ) }
);

export type SlotFieldsFragment = (
  { __typename?: 'Slot' }
  & Pick<Slot, 'address' | 'labwareId' | 'blockHighestSection'>
  & { samples: Array<(
    { __typename?: 'Sample' }
    & SampleFieldsFragment
  )> }
);

export type SpeciesFieldsFragment = (
  { __typename?: 'Species' }
  & Pick<Species, 'name' | 'enabled'>
);

export type StainTypeFieldsFragment = (
  { __typename?: 'StainType' }
  & Pick<StainType, 'name' | 'measurementTypes'>
);

export type UserFieldsFragment = (
  { __typename?: 'User' }
  & Pick<User, 'username' | 'role'>
);

export type WorkFieldsFragment = (
  { __typename?: 'Work' }
  & Pick<Work, 'workNumber' | 'status'>
  & { project: (
    { __typename?: 'Project' }
    & ProjectFieldsFragment
  ), costCode: (
    { __typename?: 'CostCode' }
    & CostCodeFieldsFragment
  ), workType: (
    { __typename?: 'WorkType' }
    & WorkTypeFieldsFragment
  ) }
);

export type WorkTypeFieldsFragment = (
  { __typename?: 'WorkType' }
  & Pick<WorkType, 'name' | 'enabled'>
);

export type AddCommentMutationVariables = Exact<{
  category: Scalars['String'];
  text: Scalars['String'];
}>;


export type AddCommentMutation = (
  { __typename?: 'Mutation' }
  & { addComment: (
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  ) }
);

export type AddCostCodeMutationVariables = Exact<{
  code: Scalars['String'];
}>;


export type AddCostCodeMutation = (
  { __typename?: 'Mutation' }
  & { addCostCode: (
    { __typename?: 'CostCode' }
    & CostCodeFieldsFragment
  ) }
);

export type AddDestructionReasonMutationVariables = Exact<{
  text: Scalars['String'];
}>;


export type AddDestructionReasonMutation = (
  { __typename?: 'Mutation' }
  & { addDestructionReason: (
    { __typename?: 'DestructionReason' }
    & DestructionReasonFieldsFragment
  ) }
);

export type AddEquipmentMutationVariables = Exact<{
  category: Scalars['String'];
  name: Scalars['String'];
}>;


export type AddEquipmentMutation = (
  { __typename?: 'Mutation' }
  & { addEquipment: (
    { __typename?: 'Equipment' }
    & EquipmentFieldsFragment
  ) }
);

export type AddFixativeMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddFixativeMutation = (
  { __typename?: 'Mutation' }
  & { addFixative: (
    { __typename?: 'Fixative' }
    & FixativeFieldsFragment
  ) }
);

export type AddHmdmcMutationVariables = Exact<{
  hmdmc: Scalars['String'];
}>;


export type AddHmdmcMutation = (
  { __typename?: 'Mutation' }
  & { addHmdmc: (
    { __typename?: 'Hmdmc' }
    & HmdmcFieldsFragment
  ) }
);

export type AddProjectMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddProjectMutation = (
  { __typename?: 'Mutation' }
  & { addProject: (
    { __typename?: 'Project' }
    & ProjectFieldsFragment
  ) }
);

export type AddReleaseDestinationMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddReleaseDestinationMutation = (
  { __typename?: 'Mutation' }
  & { addReleaseDestination: (
    { __typename?: 'ReleaseDestination' }
    & ReleaseDestinationFieldsFragment
  ) }
);

export type AddReleaseRecipientMutationVariables = Exact<{
  username: Scalars['String'];
}>;


export type AddReleaseRecipientMutation = (
  { __typename?: 'Mutation' }
  & { addReleaseRecipient: (
    { __typename?: 'ReleaseRecipient' }
    & ReleaseRecipientFieldsFragment
  ) }
);

export type AddSpeciesMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddSpeciesMutation = (
  { __typename?: 'Mutation' }
  & { addSpecies: (
    { __typename?: 'Species' }
    & SpeciesFieldsFragment
  ) }
);

export type AddWorkTypeMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type AddWorkTypeMutation = (
  { __typename?: 'Mutation' }
  & { addWorkType: (
    { __typename?: 'WorkType' }
    & WorkTypeFieldsFragment
  ) }
);

export type ConfirmMutationVariables = Exact<{
  request: ConfirmOperationRequest;
}>;


export type ConfirmMutation = (
  { __typename?: 'Mutation' }
  & { confirmOperation: (
    { __typename?: 'ConfirmOperationResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )>, operations: Array<(
      { __typename?: 'Operation' }
      & Pick<Operation, 'performed'>
      & { operationType: (
        { __typename?: 'OperationType' }
        & Pick<OperationType, 'name'>
      ), user: (
        { __typename?: 'User' }
        & Pick<User, 'username'>
      ) }
    )> }
  ) }
);

export type ConfirmSectionMutationVariables = Exact<{
  request: ConfirmSectionRequest;
}>;


export type ConfirmSectionMutation = (
  { __typename?: 'Mutation' }
  & { confirmSection: (
    { __typename?: 'OperationResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )>, operations: Array<(
      { __typename?: 'Operation' }
      & Pick<Operation, 'performed'>
      & { operationType: (
        { __typename?: 'OperationType' }
        & Pick<OperationType, 'name'>
      ), user: (
        { __typename?: 'User' }
        & Pick<User, 'username'>
      ) }
    )> }
  ) }
);

export type CreateWorkMutationVariables = Exact<{
  prefix: Scalars['String'];
  workType: Scalars['String'];
  project: Scalars['String'];
  costCode: Scalars['String'];
}>;


export type CreateWorkMutation = (
  { __typename?: 'Mutation' }
  & { createWork: (
    { __typename?: 'Work' }
    & WorkFieldsFragment
  ) }
);

export type DestroyMutationVariables = Exact<{
  request: DestroyRequest;
}>;


export type DestroyMutation = (
  { __typename?: 'Mutation' }
  & { destroy: (
    { __typename?: 'DestroyResult' }
    & { destructions: Array<(
      { __typename?: 'Destruction' }
      & { labware?: Maybe<(
        { __typename?: 'Labware' }
        & Pick<Labware, 'barcode'>
      )> }
    )> }
  ) }
);

export type EmptyLocationMutationVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type EmptyLocationMutation = (
  { __typename?: 'Mutation' }
  & { empty: (
    { __typename?: 'UnstoreResult' }
    & Pick<UnstoreResult, 'numUnstored'>
  ) }
);

export type ExtractMutationVariables = Exact<{
  request: ExtractRequest;
}>;


export type ExtractMutation = (
  { __typename?: 'Mutation' }
  & { extract: (
    { __typename?: 'OperationResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )>, operations: Array<(
      { __typename?: 'Operation' }
      & { operationType: (
        { __typename?: 'OperationType' }
        & Pick<OperationType, 'name'>
      ), actions: Array<(
        { __typename?: 'Action' }
        & { sample: (
          { __typename?: 'Sample' }
          & Pick<Sample, 'id'>
        ), source: (
          { __typename?: 'Slot' }
          & Pick<Slot, 'address' | 'labwareId'>
          & { samples: Array<(
            { __typename?: 'Sample' }
            & Pick<Sample, 'id'>
          )> }
        ), destination: (
          { __typename?: 'Slot' }
          & Pick<Slot, 'address' | 'labwareId'>
        ) }
      )> }
    )> }
  ) }
);

export type LoginMutationVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'LoginResult' }
    & { user?: Maybe<(
      { __typename?: 'User' }
      & UserFieldsFragment
    )> }
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type PlanMutationVariables = Exact<{
  request: PlanRequest;
}>;


export type PlanMutation = (
  { __typename?: 'Mutation' }
  & { plan: (
    { __typename?: 'PlanResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )>, operations: Array<(
      { __typename?: 'PlanOperation' }
      & { operationType?: Maybe<(
        { __typename?: 'OperationType' }
        & Pick<OperationType, 'name'>
      )>, planActions: Array<(
        { __typename?: 'PlanAction' }
        & PlanActionFieldsFragment
      )> }
    )> }
  ) }
);

export type PrintMutationVariables = Exact<{
  barcodes: Array<Scalars['String']> | Scalars['String'];
  printer: Scalars['String'];
}>;


export type PrintMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'printLabware'>
);

export type RecordInPlaceMutationVariables = Exact<{
  request: InPlaceOpRequest;
}>;


export type RecordInPlaceMutation = (
  { __typename?: 'Mutation' }
  & { recordInPlace: (
    { __typename?: 'OperationResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )> }
  ) }
);

export type RecordStainResultMutationVariables = Exact<{
  request: ResultRequest;
}>;


export type RecordStainResultMutation = (
  { __typename?: 'Mutation' }
  & { recordStainResult: (
    { __typename?: 'OperationResult' }
    & { operations: Array<(
      { __typename?: 'Operation' }
      & Pick<Operation, 'id'>
    )> }
  ) }
);

export type RegisterSectionsMutationVariables = Exact<{
  request: SectionRegisterRequest;
}>;


export type RegisterSectionsMutation = (
  { __typename?: 'Mutation' }
  & { registerSections: (
    { __typename?: 'RegisterResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )> }
  ) }
);

export type RegisterTissuesMutationVariables = Exact<{
  request: RegisterRequest;
}>;


export type RegisterTissuesMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'RegisterResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )>, clashes: Array<(
      { __typename?: 'RegisterClash' }
      & { tissue: (
        { __typename?: 'Tissue' }
        & Pick<Tissue, 'externalName'>
      ), labware: Array<(
        { __typename?: 'Labware' }
        & Pick<Labware, 'barcode'>
        & { labwareType: (
          { __typename?: 'LabwareType' }
          & Pick<LabwareType, 'name'>
        ) }
      )> }
    )> }
  ) }
);

export type ReleaseLabwareMutationVariables = Exact<{
  releaseRequest: ReleaseRequest;
}>;


export type ReleaseLabwareMutation = (
  { __typename?: 'Mutation' }
  & { release: (
    { __typename?: 'ReleaseResult' }
    & { releases: Array<(
      { __typename?: 'Release' }
      & Pick<Release, 'id'>
      & { labware: (
        { __typename?: 'Labware' }
        & Pick<Labware, 'barcode'>
      ), destination: (
        { __typename?: 'ReleaseDestination' }
        & Pick<ReleaseDestination, 'name'>
      ), recipient: (
        { __typename?: 'ReleaseRecipient' }
        & Pick<ReleaseRecipient, 'username'>
      ) }
    )> }
  ) }
);

export type SetCommentEnabledMutationVariables = Exact<{
  commentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
}>;


export type SetCommentEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setCommentEnabled: (
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  ) }
);

export type SetCostCodeEnabledMutationVariables = Exact<{
  code: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetCostCodeEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setCostCodeEnabled: (
    { __typename?: 'CostCode' }
    & CostCodeFieldsFragment
  ) }
);

export type SetDestructionReasonEnabledMutationVariables = Exact<{
  text: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetDestructionReasonEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setDestructionReasonEnabled: (
    { __typename?: 'DestructionReason' }
    & DestructionReasonFieldsFragment
  ) }
);

export type SetEquipmentEnabledMutationVariables = Exact<{
  equipmentId: Scalars['Int'];
  enabled: Scalars['Boolean'];
}>;


export type SetEquipmentEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setEquipmentEnabled: (
    { __typename?: 'Equipment' }
    & EquipmentFieldsFragment
  ) }
);

export type SetFixativeEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetFixativeEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setFixativeEnabled: (
    { __typename?: 'Fixative' }
    & FixativeFieldsFragment
  ) }
);

export type SetHmdmcEnabledMutationVariables = Exact<{
  hmdmc: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetHmdmcEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setHmdmcEnabled: (
    { __typename?: 'Hmdmc' }
    & HmdmcFieldsFragment
  ) }
);

export type SetLocationCustomNameMutationVariables = Exact<{
  locationBarcode: Scalars['String'];
  newCustomName: Scalars['String'];
}>;


export type SetLocationCustomNameMutation = (
  { __typename?: 'Mutation' }
  & { setLocationCustomName: (
    { __typename?: 'Location' }
    & LocationFieldsFragment
  ) }
);

export type SetProjectEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetProjectEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setProjectEnabled: (
    { __typename?: 'Project' }
    & ProjectFieldsFragment
  ) }
);

export type SetReleaseDestinationEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetReleaseDestinationEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setReleaseDestinationEnabled: (
    { __typename?: 'ReleaseDestination' }
    & ReleaseDestinationFieldsFragment
  ) }
);

export type SetReleaseRecipientEnabledMutationVariables = Exact<{
  username: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetReleaseRecipientEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setReleaseRecipientEnabled: (
    { __typename?: 'ReleaseRecipient' }
    & ReleaseRecipientFieldsFragment
  ) }
);

export type SetSpeciesEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetSpeciesEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setSpeciesEnabled: (
    { __typename?: 'Species' }
    & SpeciesFieldsFragment
  ) }
);

export type SetWorkTypeEnabledMutationVariables = Exact<{
  name: Scalars['String'];
  enabled: Scalars['Boolean'];
}>;


export type SetWorkTypeEnabledMutation = (
  { __typename?: 'Mutation' }
  & { setWorkTypeEnabled: (
    { __typename?: 'WorkType' }
    & WorkTypeFieldsFragment
  ) }
);

export type SlotCopyMutationVariables = Exact<{
  request: SlotCopyRequest;
}>;


export type SlotCopyMutation = (
  { __typename?: 'Mutation' }
  & { slotCopy: (
    { __typename?: 'OperationResult' }
    & { labware: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )> }
  ) }
);

export type StainMutationVariables = Exact<{
  request: StainRequest;
}>;


export type StainMutation = (
  { __typename?: 'Mutation' }
  & { stain: (
    { __typename?: 'OperationResult' }
    & { operations: Array<(
      { __typename?: 'Operation' }
      & Pick<Operation, 'id'>
    )> }
  ) }
);

export type StoreBarcodeMutationVariables = Exact<{
  barcode: Scalars['String'];
  locationBarcode: Scalars['String'];
  address?: Maybe<Scalars['Address']>;
}>;


export type StoreBarcodeMutation = (
  { __typename?: 'Mutation' }
  & { storeBarcode: (
    { __typename?: 'StoredItem' }
    & { location: (
      { __typename?: 'Location' }
      & LocationFieldsFragment
    ) }
  ) }
);

export type UnstoreBarcodeMutationVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type UnstoreBarcodeMutation = (
  { __typename?: 'Mutation' }
  & { unstoreBarcode?: Maybe<(
    { __typename?: 'UnstoredItem' }
    & Pick<UnstoredItem, 'barcode' | 'address'>
  )> }
);

export type UpdateWorkStatusMutationVariables = Exact<{
  workNumber: Scalars['String'];
  status: WorkStatus;
  commentId?: Maybe<Scalars['Int']>;
}>;


export type UpdateWorkStatusMutation = (
  { __typename?: 'Mutation' }
  & { updateWorkStatus: (
    { __typename?: 'Work' }
    & WorkFieldsFragment
  ) }
);

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = (
  { __typename?: 'Query' }
  & { user?: Maybe<(
    { __typename?: 'User' }
    & UserFieldsFragment
  )> }
);

export type FindQueryVariables = Exact<{
  request: FindRequest;
}>;


export type FindQuery = (
  { __typename?: 'Query' }
  & { find: (
    { __typename?: 'FindResult' }
    & Pick<FindResult, 'numRecords'>
    & { entries: Array<(
      { __typename?: 'FindEntry' }
      & Pick<FindEntry, 'labwareId' | 'sampleId'>
    )>, samples: Array<(
      { __typename?: 'Sample' }
      & Pick<Sample, 'id' | 'section'>
      & { tissue: (
        { __typename?: 'Tissue' }
        & Pick<Tissue, 'replicate' | 'externalName'>
        & { spatialLocation: (
          { __typename?: 'SpatialLocation' }
          & { tissueType: (
            { __typename?: 'TissueType' }
            & Pick<TissueType, 'name'>
          ) }
        ), donor: (
          { __typename?: 'Donor' }
          & Pick<Donor, 'donorName'>
        ), medium: (
          { __typename?: 'Medium' }
          & Pick<Medium, 'name'>
        ) }
      ) }
    )>, labware: Array<(
      { __typename?: 'Labware' }
      & Pick<Labware, 'id' | 'barcode' | 'created'>
      & { labwareType: (
        { __typename?: 'LabwareType' }
        & Pick<LabwareType, 'name'>
      ) }
    )>, locations: Array<(
      { __typename?: 'Location' }
      & Pick<Location, 'id' | 'barcode' | 'customName' | 'fixedName' | 'direction' | 'qualifiedNameWithFirstBarcode'>
      & { size?: Maybe<(
        { __typename?: 'Size' }
        & Pick<Size, 'numRows' | 'numColumns'>
      )> }
    )>, labwareLocations: Array<(
      { __typename?: 'LabwareLocationEntry' }
      & Pick<LabwareLocationEntry, 'labwareId' | 'locationId' | 'address'>
    )> }
  ) }
);

export type FindHistoryForDonorNameQueryVariables = Exact<{
  donorName: Scalars['String'];
}>;


export type FindHistoryForDonorNameQuery = (
  { __typename?: 'Query' }
  & { historyForDonorName: (
    { __typename?: 'History' }
    & HistoryFieldsFragment
  ) }
);

export type FindHistoryForExternalNameQueryVariables = Exact<{
  externalName: Scalars['String'];
}>;


export type FindHistoryForExternalNameQuery = (
  { __typename?: 'Query' }
  & { historyForExternalName: (
    { __typename?: 'History' }
    & HistoryFieldsFragment
  ) }
);

export type FindHistoryForLabwareBarcodeQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindHistoryForLabwareBarcodeQuery = (
  { __typename?: 'Query' }
  & { historyForLabwareBarcode: (
    { __typename?: 'History' }
    & HistoryFieldsFragment
  ) }
);

export type FindHistoryForSampleIdQueryVariables = Exact<{
  sampleId: Scalars['Int'];
}>;


export type FindHistoryForSampleIdQuery = (
  { __typename?: 'Query' }
  & { historyForSampleId: (
    { __typename?: 'History' }
    & HistoryFieldsFragment
  ) }
);

export type FindLabwareQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindLabwareQuery = (
  { __typename?: 'Query' }
  & { labware: (
    { __typename?: 'Labware' }
    & LabwareFieldsFragment
  ) }
);

export type FindLabwareLocationQueryVariables = Exact<{
  barcodes: Array<Scalars['String']> | Scalars['String'];
}>;


export type FindLabwareLocationQuery = (
  { __typename?: 'Query' }
  & { stored: Array<(
    { __typename?: 'StoredItem' }
    & { location: (
      { __typename?: 'Location' }
      & Pick<Location, 'barcode'>
    ) }
  )> }
);

export type FindLocationByBarcodeQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindLocationByBarcodeQuery = (
  { __typename?: 'Query' }
  & { location: (
    { __typename?: 'Location' }
    & LocationFieldsFragment
  ) }
);

export type FindPlanDataQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindPlanDataQuery = (
  { __typename?: 'Query' }
  & { planData: (
    { __typename?: 'PlanData' }
    & { sources: Array<(
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    )>, destination: (
      { __typename?: 'Labware' }
      & LabwareFieldsFragment
    ), plan: (
      { __typename?: 'PlanOperation' }
      & { operationType?: Maybe<(
        { __typename?: 'OperationType' }
        & Pick<OperationType, 'name'>
      )>, planActions: Array<(
        { __typename?: 'PlanAction' }
        & PlanActionFieldsFragment
      )> }
    ) }
  ) }
);

export type FindWorkNumbersQueryVariables = Exact<{
  status: WorkStatus;
}>;


export type FindWorkNumbersQuery = (
  { __typename?: 'Query' }
  & { works: Array<(
    { __typename?: 'Work' }
    & Pick<Work, 'workNumber'>
  )> }
);

export type GetConfigurationQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConfigurationQuery = (
  { __typename?: 'Query' }
  & { destructionReasons: Array<(
    { __typename?: 'DestructionReason' }
    & DestructionReasonFieldsFragment
  )>, comments: Array<(
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  )>, hmdmcs: Array<(
    { __typename?: 'Hmdmc' }
    & HmdmcFieldsFragment
  )>, species: Array<(
    { __typename?: 'Species' }
    & SpeciesFieldsFragment
  )>, fixatives: Array<(
    { __typename?: 'Fixative' }
    & FixativeFieldsFragment
  )>, releaseDestinations: Array<(
    { __typename?: 'ReleaseDestination' }
    & ReleaseDestinationFieldsFragment
  )>, releaseRecipients: Array<(
    { __typename?: 'ReleaseRecipient' }
    & ReleaseRecipientFieldsFragment
  )>, projects: Array<(
    { __typename?: 'Project' }
    & ProjectFieldsFragment
  )>, costCodes: Array<(
    { __typename?: 'CostCode' }
    & CostCodeFieldsFragment
  )>, workTypes: Array<(
    { __typename?: 'WorkType' }
    & WorkTypeFieldsFragment
  )>, equipments: Array<(
    { __typename?: 'Equipment' }
    & EquipmentFieldsFragment
  )> }
);

export type GetDestroyInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDestroyInfoQuery = (
  { __typename?: 'Query' }
  & { destructionReasons: Array<(
    { __typename?: 'DestructionReason' }
    & DestructionReasonFieldsFragment
  )> }
);

export type GetDestructionReasonsQueryVariables = Exact<{
  includeDisabled?: Maybe<Scalars['Boolean']>;
}>;


export type GetDestructionReasonsQuery = (
  { __typename?: 'Query' }
  & { destructionReasons: Array<(
    { __typename?: 'DestructionReason' }
    & DestructionReasonFieldsFragment
  )> }
);

export type GetPrintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrintersQuery = (
  { __typename?: 'Query' }
  & { printers: Array<(
    { __typename?: 'Printer' }
    & PrinterFieldsFragment
  )> }
);

export type GetRecordInPlaceInfoQueryVariables = Exact<{
  category?: Maybe<Scalars['String']>;
}>;


export type GetRecordInPlaceInfoQuery = (
  { __typename?: 'Query' }
  & { equipments: Array<(
    { __typename?: 'Equipment' }
    & EquipmentFieldsFragment
  )> }
);

export type GetRegistrationInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegistrationInfoQuery = (
  { __typename?: 'Query' }
  & { species: Array<(
    { __typename?: 'Species' }
    & Pick<Species, 'name'>
  )>, hmdmcs: Array<(
    { __typename?: 'Hmdmc' }
    & Pick<Hmdmc, 'hmdmc'>
  )>, labwareTypes: Array<(
    { __typename?: 'LabwareType' }
    & LabwareTypeFieldsFragment
  )>, tissueTypes: Array<(
    { __typename?: 'TissueType' }
    & Pick<TissueType, 'name'>
    & { spatialLocations: Array<(
      { __typename?: 'SpatialLocation' }
      & Pick<SpatialLocation, 'name' | 'code'>
    )> }
  )>, fixatives: Array<(
    { __typename?: 'Fixative' }
    & Pick<Fixative, 'name'>
  )>, mediums: Array<(
    { __typename?: 'Medium' }
    & Pick<Medium, 'name'>
  )>, mouldSizes: Array<(
    { __typename?: 'MouldSize' }
    & Pick<MouldSize, 'name'>
  )> }
);

export type GetReleaseInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReleaseInfoQuery = (
  { __typename?: 'Query' }
  & { releaseDestinations: Array<(
    { __typename?: 'ReleaseDestination' }
    & ReleaseDestinationFieldsFragment
  )>, releaseRecipients: Array<(
    { __typename?: 'ReleaseRecipient' }
    & ReleaseRecipientFieldsFragment
  )> }
);

export type GetSearchInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSearchInfoQuery = (
  { __typename?: 'Query' }
  & { tissueTypes: Array<(
    { __typename?: 'TissueType' }
    & Pick<TissueType, 'name'>
  )> }
);

export type GetSectioningConfirmInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningConfirmInfoQuery = (
  { __typename?: 'Query' }
  & { comments: Array<(
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  )> }
);

export type GetSectioningInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningInfoQuery = (
  { __typename?: 'Query' }
  & { labwareTypes: Array<(
    { __typename?: 'LabwareType' }
    & LabwareTypeFieldsFragment
  )> }
);

export type GetStainInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainInfoQuery = (
  { __typename?: 'Query' }
  & { stainTypes: Array<(
    { __typename?: 'StainType' }
    & StainTypeFieldsFragment
  )> }
);

export type GetStainingQcInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStainingQcInfoQuery = (
  { __typename?: 'Query' }
  & { comments: Array<(
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  )> }
);

export type GetWorkAllocationInfoQueryVariables = Exact<{
  commentCategory: Scalars['String'];
}>;


export type GetWorkAllocationInfoQuery = (
  { __typename?: 'Query' }
  & { projects: Array<(
    { __typename?: 'Project' }
    & ProjectFieldsFragment
  )>, costCodes: Array<(
    { __typename?: 'CostCode' }
    & CostCodeFieldsFragment
  )>, works: Array<(
    { __typename?: 'Work' }
    & WorkFieldsFragment
  )>, workTypes: Array<(
    { __typename?: 'WorkType' }
    & WorkTypeFieldsFragment
  )>, comments: Array<(
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  )> }
);

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
export const FixativeFieldsFragmentDoc = gql`
    fragment FixativeFields on Fixative {
  name
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
  }
  bioState {
    name
  }
}
    `;
export const SlotFieldsFragmentDoc = gql`
    fragment SlotFields on Slot {
  address
  labwareId
  samples {
    ...SampleFields
  }
  blockHighestSection
}
    ${SampleFieldsFragmentDoc}`;
export const LabwareFieldsFragmentDoc = gql`
    fragment LabwareFields on Labware {
  id
  barcode
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
    ${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}`;
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
    ${LabwareFieldsFragmentDoc}
${SampleFieldsFragmentDoc}
${HistoryEntryFieldsFragmentDoc}`;
export const HmdmcFieldsFragmentDoc = gql`
    fragment HmdmcFields on Hmdmc {
  hmdmc
  enabled
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
export const PrinterFieldsFragmentDoc = gql`
    fragment PrinterFields on Printer {
  name
  labelTypes {
    name
  }
}
    `;
export const ReleaseDestinationFieldsFragmentDoc = gql`
    fragment ReleaseDestinationFields on ReleaseDestination {
  name
  enabled
}
    `;
export const ReleaseRecipientFieldsFragmentDoc = gql`
    fragment ReleaseRecipientFields on ReleaseRecipient {
  username
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
export const UserFieldsFragmentDoc = gql`
    fragment UserFields on User {
  username
  role
}
    `;
export const ProjectFieldsFragmentDoc = gql`
    fragment ProjectFields on Project {
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
export const WorkFieldsFragmentDoc = gql`
    fragment WorkFields on Work {
  workNumber
  status
  project {
    ...ProjectFields
  }
  costCode {
    ...CostCodeFields
  }
  workType {
    ...WorkTypeFields
  }
}
    ${ProjectFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}`;
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
export const AddProjectDocument = gql`
    mutation AddProject($name: String!) {
  addProject(name: $name) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
export const AddReleaseDestinationDocument = gql`
    mutation AddReleaseDestination($name: String!) {
  addReleaseDestination(name: $name) {
    ...ReleaseDestinationFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}`;
export const AddReleaseRecipientDocument = gql`
    mutation AddReleaseRecipient($username: String!) {
  addReleaseRecipient(username: $username) {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseRecipientFieldsFragmentDoc}`;
export const AddSpeciesDocument = gql`
    mutation AddSpecies($name: String!) {
  addSpecies(name: $name) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
export const AddWorkTypeDocument = gql`
    mutation AddWorkType($name: String!) {
  addWorkType(name: $name) {
    ...WorkTypeFields
  }
}
    ${WorkTypeFieldsFragmentDoc}`;
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
    ${LabwareFieldsFragmentDoc}`;
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
    ${LabwareFieldsFragmentDoc}`;
export const CreateWorkDocument = gql`
    mutation CreateWork($prefix: String!, $workType: String!, $project: String!, $costCode: String!) {
  createWork(
    prefix: $prefix
    workType: $workType
    project: $project
    costCode: $costCode
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}`;
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
    ${LabwareFieldsFragmentDoc}`;
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
${PlanActionFieldsFragmentDoc}`;
export const PrintDocument = gql`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
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
    ${LabwareFieldsFragmentDoc}`;
export const RecordStainResultDocument = gql`
    mutation RecordStainResult($request: ResultRequest!) {
  recordStainResult(request: $request) {
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
    ${LabwareFieldsFragmentDoc}`;
export const RegisterTissuesDocument = gql`
    mutation RegisterTissues($request: RegisterRequest!) {
  register(request: $request) {
    labware {
      ...LabwareFields
    }
    clashes {
      tissue {
        externalName
      }
      labware {
        barcode
        labwareType {
          name
        }
      }
    }
  }
}
    ${LabwareFieldsFragmentDoc}`;
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
    ${LocationFieldsFragmentDoc}`;
export const SetProjectEnabledDocument = gql`
    mutation SetProjectEnabled($name: String!, $enabled: Boolean!) {
  setProjectEnabled(name: $name, enabled: $enabled) {
    ...ProjectFields
  }
}
    ${ProjectFieldsFragmentDoc}`;
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
export const SetSpeciesEnabledDocument = gql`
    mutation SetSpeciesEnabled($name: String!, $enabled: Boolean!) {
  setSpeciesEnabled(name: $name, enabled: $enabled) {
    ...SpeciesFields
  }
}
    ${SpeciesFieldsFragmentDoc}`;
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
    ${LabwareFieldsFragmentDoc}`;
export const StainDocument = gql`
    mutation Stain($request: StainRequest!) {
  stain(request: $request) {
    operations {
      id
    }
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
    ${LocationFieldsFragmentDoc}`;
export const UnstoreBarcodeDocument = gql`
    mutation UnstoreBarcode($barcode: String!) {
  unstoreBarcode(barcode: $barcode) {
    barcode
    address
  }
}
    `;
export const UpdateWorkStatusDocument = gql`
    mutation UpdateWorkStatus($workNumber: String!, $status: WorkStatus!, $commentId: Int) {
  updateWorkStatus(
    workNumber: $workNumber
    status: $status
    commentId: $commentId
  ) {
    ...WorkFields
  }
}
    ${WorkFieldsFragmentDoc}`;
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
export const FindHistoryForDonorNameDocument = gql`
    query FindHistoryForDonorName($donorName: String!) {
  historyForDonorName(donorName: $donorName) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}`;
export const FindHistoryForExternalNameDocument = gql`
    query FindHistoryForExternalName($externalName: String!) {
  historyForExternalName(externalName: $externalName) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}`;
export const FindHistoryForLabwareBarcodeDocument = gql`
    query FindHistoryForLabwareBarcode($barcode: String!) {
  historyForLabwareBarcode(barcode: $barcode) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}`;
export const FindHistoryForSampleIdDocument = gql`
    query FindHistoryForSampleId($sampleId: Int!) {
  historyForSampleId(sampleId: $sampleId) {
    ...HistoryFields
  }
}
    ${HistoryFieldsFragmentDoc}`;
export const FindLabwareDocument = gql`
    query FindLabware($barcode: String!) {
  labware(barcode: $barcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}`;
export const FindLabwareLocationDocument = gql`
    query FindLabwareLocation($barcodes: [String!]!) {
  stored(barcodes: $barcodes) {
    location {
      barcode
    }
  }
}
    `;
export const FindLocationByBarcodeDocument = gql`
    query FindLocationByBarcode($barcode: String!) {
  location(locationBarcode: $barcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}`;
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
${PlanActionFieldsFragmentDoc}`;
export const FindWorkNumbersDocument = gql`
    query FindWorkNumbers($status: WorkStatus!) {
  works(status: [$status]) {
    workNumber
  }
}
    `;
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
${EquipmentFieldsFragmentDoc}`;
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
export const GetPrintersDocument = gql`
    query GetPrinters {
  printers {
    ...PrinterFields
  }
}
    ${PrinterFieldsFragmentDoc}`;
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
  mouldSizes {
    name
  }
}
    ${LabwareTypeFieldsFragmentDoc}`;
export const GetReleaseInfoDocument = gql`
    query GetReleaseInfo {
  releaseDestinations {
    ...ReleaseDestinationFields
  }
  releaseRecipients {
    ...ReleaseRecipientFields
  }
}
    ${ReleaseDestinationFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}`;
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
}
    ${CommentFieldsFragmentDoc}`;
export const GetSectioningInfoDocument = gql`
    query GetSectioningInfo {
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${LabwareTypeFieldsFragmentDoc}`;
export const GetStainInfoDocument = gql`
    query GetStainInfo {
  stainTypes {
    ...StainTypeFields
  }
}
    ${StainTypeFieldsFragmentDoc}`;
export const GetStainingQcInfoDocument = gql`
    query GetStainingQCInfo {
  comments(includeDisabled: false, category: "result") {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export const GetWorkAllocationInfoDocument = gql`
    query GetWorkAllocationInfo($commentCategory: String!) {
  projects(includeDisabled: false) {
    ...ProjectFields
  }
  costCodes(includeDisabled: false) {
    ...CostCodeFields
  }
  works {
    ...WorkFields
  }
  workTypes {
    ...WorkTypeFields
  }
  comments(category: $commentCategory, includeDisabled: false) {
    ...CommentFields
  }
}
    ${ProjectFieldsFragmentDoc}
${CostCodeFieldsFragmentDoc}
${WorkFieldsFragmentDoc}
${WorkTypeFieldsFragmentDoc}
${CommentFieldsFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AddComment(variables: AddCommentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddCommentMutation> {
      return withWrapper(() => client.request<AddCommentMutation>(AddCommentDocument, variables, requestHeaders));
    },
    AddCostCode(variables: AddCostCodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddCostCodeMutation> {
      return withWrapper(() => client.request<AddCostCodeMutation>(AddCostCodeDocument, variables, requestHeaders));
    },
    AddDestructionReason(variables: AddDestructionReasonMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddDestructionReasonMutation> {
      return withWrapper(() => client.request<AddDestructionReasonMutation>(AddDestructionReasonDocument, variables, requestHeaders));
    },
    AddEquipment(variables: AddEquipmentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddEquipmentMutation> {
      return withWrapper(() => client.request<AddEquipmentMutation>(AddEquipmentDocument, variables, requestHeaders));
    },
    AddFixative(variables: AddFixativeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddFixativeMutation> {
      return withWrapper(() => client.request<AddFixativeMutation>(AddFixativeDocument, variables, requestHeaders));
    },
    AddHmdmc(variables: AddHmdmcMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddHmdmcMutation> {
      return withWrapper(() => client.request<AddHmdmcMutation>(AddHmdmcDocument, variables, requestHeaders));
    },
    AddProject(variables: AddProjectMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddProjectMutation> {
      return withWrapper(() => client.request<AddProjectMutation>(AddProjectDocument, variables, requestHeaders));
    },
    AddReleaseDestination(variables: AddReleaseDestinationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddReleaseDestinationMutation> {
      return withWrapper(() => client.request<AddReleaseDestinationMutation>(AddReleaseDestinationDocument, variables, requestHeaders));
    },
    AddReleaseRecipient(variables: AddReleaseRecipientMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddReleaseRecipientMutation> {
      return withWrapper(() => client.request<AddReleaseRecipientMutation>(AddReleaseRecipientDocument, variables, requestHeaders));
    },
    AddSpecies(variables: AddSpeciesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddSpeciesMutation> {
      return withWrapper(() => client.request<AddSpeciesMutation>(AddSpeciesDocument, variables, requestHeaders));
    },
    AddWorkType(variables: AddWorkTypeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddWorkTypeMutation> {
      return withWrapper(() => client.request<AddWorkTypeMutation>(AddWorkTypeDocument, variables, requestHeaders));
    },
    Confirm(variables: ConfirmMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ConfirmMutation> {
      return withWrapper(() => client.request<ConfirmMutation>(ConfirmDocument, variables, requestHeaders));
    },
    ConfirmSection(variables: ConfirmSectionMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ConfirmSectionMutation> {
      return withWrapper(() => client.request<ConfirmSectionMutation>(ConfirmSectionDocument, variables, requestHeaders));
    },
    CreateWork(variables: CreateWorkMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateWorkMutation> {
      return withWrapper(() => client.request<CreateWorkMutation>(CreateWorkDocument, variables, requestHeaders));
    },
    Destroy(variables: DestroyMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<DestroyMutation> {
      return withWrapper(() => client.request<DestroyMutation>(DestroyDocument, variables, requestHeaders));
    },
    EmptyLocation(variables: EmptyLocationMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<EmptyLocationMutation> {
      return withWrapper(() => client.request<EmptyLocationMutation>(EmptyLocationDocument, variables, requestHeaders));
    },
    Extract(variables: ExtractMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ExtractMutation> {
      return withWrapper(() => client.request<ExtractMutation>(ExtractDocument, variables, requestHeaders));
    },
    Login(variables: LoginMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LoginMutation> {
      return withWrapper(() => client.request<LoginMutation>(LoginDocument, variables, requestHeaders));
    },
    Logout(variables?: LogoutMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<LogoutMutation> {
      return withWrapper(() => client.request<LogoutMutation>(LogoutDocument, variables, requestHeaders));
    },
    Plan(variables: PlanMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PlanMutation> {
      return withWrapper(() => client.request<PlanMutation>(PlanDocument, variables, requestHeaders));
    },
    Print(variables: PrintMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<PrintMutation> {
      return withWrapper(() => client.request<PrintMutation>(PrintDocument, variables, requestHeaders));
    },
    RecordInPlace(variables: RecordInPlaceMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordInPlaceMutation> {
      return withWrapper(() => client.request<RecordInPlaceMutation>(RecordInPlaceDocument, variables, requestHeaders));
    },
    RecordStainResult(variables: RecordStainResultMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RecordStainResultMutation> {
      return withWrapper(() => client.request<RecordStainResultMutation>(RecordStainResultDocument, variables, requestHeaders));
    },
    RegisterSections(variables: RegisterSectionsMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterSectionsMutation> {
      return withWrapper(() => client.request<RegisterSectionsMutation>(RegisterSectionsDocument, variables, requestHeaders));
    },
    RegisterTissues(variables: RegisterTissuesMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RegisterTissuesMutation> {
      return withWrapper(() => client.request<RegisterTissuesMutation>(RegisterTissuesDocument, variables, requestHeaders));
    },
    ReleaseLabware(variables: ReleaseLabwareMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ReleaseLabwareMutation> {
      return withWrapper(() => client.request<ReleaseLabwareMutation>(ReleaseLabwareDocument, variables, requestHeaders));
    },
    SetCommentEnabled(variables: SetCommentEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetCommentEnabledMutation> {
      return withWrapper(() => client.request<SetCommentEnabledMutation>(SetCommentEnabledDocument, variables, requestHeaders));
    },
    SetCostCodeEnabled(variables: SetCostCodeEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetCostCodeEnabledMutation> {
      return withWrapper(() => client.request<SetCostCodeEnabledMutation>(SetCostCodeEnabledDocument, variables, requestHeaders));
    },
    SetDestructionReasonEnabled(variables: SetDestructionReasonEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetDestructionReasonEnabledMutation> {
      return withWrapper(() => client.request<SetDestructionReasonEnabledMutation>(SetDestructionReasonEnabledDocument, variables, requestHeaders));
    },
    SetEquipmentEnabled(variables: SetEquipmentEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetEquipmentEnabledMutation> {
      return withWrapper(() => client.request<SetEquipmentEnabledMutation>(SetEquipmentEnabledDocument, variables, requestHeaders));
    },
    SetFixativeEnabled(variables: SetFixativeEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetFixativeEnabledMutation> {
      return withWrapper(() => client.request<SetFixativeEnabledMutation>(SetFixativeEnabledDocument, variables, requestHeaders));
    },
    SetHmdmcEnabled(variables: SetHmdmcEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetHmdmcEnabledMutation> {
      return withWrapper(() => client.request<SetHmdmcEnabledMutation>(SetHmdmcEnabledDocument, variables, requestHeaders));
    },
    SetLocationCustomName(variables: SetLocationCustomNameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetLocationCustomNameMutation> {
      return withWrapper(() => client.request<SetLocationCustomNameMutation>(SetLocationCustomNameDocument, variables, requestHeaders));
    },
    SetProjectEnabled(variables: SetProjectEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetProjectEnabledMutation> {
      return withWrapper(() => client.request<SetProjectEnabledMutation>(SetProjectEnabledDocument, variables, requestHeaders));
    },
    SetReleaseDestinationEnabled(variables: SetReleaseDestinationEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetReleaseDestinationEnabledMutation> {
      return withWrapper(() => client.request<SetReleaseDestinationEnabledMutation>(SetReleaseDestinationEnabledDocument, variables, requestHeaders));
    },
    SetReleaseRecipientEnabled(variables: SetReleaseRecipientEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetReleaseRecipientEnabledMutation> {
      return withWrapper(() => client.request<SetReleaseRecipientEnabledMutation>(SetReleaseRecipientEnabledDocument, variables, requestHeaders));
    },
    SetSpeciesEnabled(variables: SetSpeciesEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetSpeciesEnabledMutation> {
      return withWrapper(() => client.request<SetSpeciesEnabledMutation>(SetSpeciesEnabledDocument, variables, requestHeaders));
    },
    SetWorkTypeEnabled(variables: SetWorkTypeEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetWorkTypeEnabledMutation> {
      return withWrapper(() => client.request<SetWorkTypeEnabledMutation>(SetWorkTypeEnabledDocument, variables, requestHeaders));
    },
    SlotCopy(variables: SlotCopyMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SlotCopyMutation> {
      return withWrapper(() => client.request<SlotCopyMutation>(SlotCopyDocument, variables, requestHeaders));
    },
    Stain(variables: StainMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<StainMutation> {
      return withWrapper(() => client.request<StainMutation>(StainDocument, variables, requestHeaders));
    },
    StoreBarcode(variables: StoreBarcodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<StoreBarcodeMutation> {
      return withWrapper(() => client.request<StoreBarcodeMutation>(StoreBarcodeDocument, variables, requestHeaders));
    },
    UnstoreBarcode(variables: UnstoreBarcodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UnstoreBarcodeMutation> {
      return withWrapper(() => client.request<UnstoreBarcodeMutation>(UnstoreBarcodeDocument, variables, requestHeaders));
    },
    UpdateWorkStatus(variables: UpdateWorkStatusMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateWorkStatusMutation> {
      return withWrapper(() => client.request<UpdateWorkStatusMutation>(UpdateWorkStatusDocument, variables, requestHeaders));
    },
    CurrentUser(variables?: CurrentUserQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CurrentUserQuery> {
      return withWrapper(() => client.request<CurrentUserQuery>(CurrentUserDocument, variables, requestHeaders));
    },
    Find(variables: FindQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindQuery> {
      return withWrapper(() => client.request<FindQuery>(FindDocument, variables, requestHeaders));
    },
    FindHistoryForDonorName(variables: FindHistoryForDonorNameQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForDonorNameQuery> {
      return withWrapper(() => client.request<FindHistoryForDonorNameQuery>(FindHistoryForDonorNameDocument, variables, requestHeaders));
    },
    FindHistoryForExternalName(variables: FindHistoryForExternalNameQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForExternalNameQuery> {
      return withWrapper(() => client.request<FindHistoryForExternalNameQuery>(FindHistoryForExternalNameDocument, variables, requestHeaders));
    },
    FindHistoryForLabwareBarcode(variables: FindHistoryForLabwareBarcodeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForLabwareBarcodeQuery> {
      return withWrapper(() => client.request<FindHistoryForLabwareBarcodeQuery>(FindHistoryForLabwareBarcodeDocument, variables, requestHeaders));
    },
    FindHistoryForSampleId(variables: FindHistoryForSampleIdQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindHistoryForSampleIdQuery> {
      return withWrapper(() => client.request<FindHistoryForSampleIdQuery>(FindHistoryForSampleIdDocument, variables, requestHeaders));
    },
    FindLabware(variables: FindLabwareQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLabwareQuery> {
      return withWrapper(() => client.request<FindLabwareQuery>(FindLabwareDocument, variables, requestHeaders));
    },
    FindLabwareLocation(variables: FindLabwareLocationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLabwareLocationQuery> {
      return withWrapper(() => client.request<FindLabwareLocationQuery>(FindLabwareLocationDocument, variables, requestHeaders));
    },
    FindLocationByBarcode(variables: FindLocationByBarcodeQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindLocationByBarcodeQuery> {
      return withWrapper(() => client.request<FindLocationByBarcodeQuery>(FindLocationByBarcodeDocument, variables, requestHeaders));
    },
    FindPlanData(variables: FindPlanDataQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindPlanDataQuery> {
      return withWrapper(() => client.request<FindPlanDataQuery>(FindPlanDataDocument, variables, requestHeaders));
    },
    FindWorkNumbers(variables: FindWorkNumbersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindWorkNumbersQuery> {
      return withWrapper(() => client.request<FindWorkNumbersQuery>(FindWorkNumbersDocument, variables, requestHeaders));
    },
    GetConfiguration(variables?: GetConfigurationQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetConfigurationQuery> {
      return withWrapper(() => client.request<GetConfigurationQuery>(GetConfigurationDocument, variables, requestHeaders));
    },
    GetDestroyInfo(variables?: GetDestroyInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetDestroyInfoQuery> {
      return withWrapper(() => client.request<GetDestroyInfoQuery>(GetDestroyInfoDocument, variables, requestHeaders));
    },
    GetDestructionReasons(variables?: GetDestructionReasonsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetDestructionReasonsQuery> {
      return withWrapper(() => client.request<GetDestructionReasonsQuery>(GetDestructionReasonsDocument, variables, requestHeaders));
    },
    GetPrinters(variables?: GetPrintersQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetPrintersQuery> {
      return withWrapper(() => client.request<GetPrintersQuery>(GetPrintersDocument, variables, requestHeaders));
    },
    GetRecordInPlaceInfo(variables?: GetRecordInPlaceInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRecordInPlaceInfoQuery> {
      return withWrapper(() => client.request<GetRecordInPlaceInfoQuery>(GetRecordInPlaceInfoDocument, variables, requestHeaders));
    },
    GetRegistrationInfo(variables?: GetRegistrationInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRegistrationInfoQuery> {
      return withWrapper(() => client.request<GetRegistrationInfoQuery>(GetRegistrationInfoDocument, variables, requestHeaders));
    },
    GetReleaseInfo(variables?: GetReleaseInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetReleaseInfoQuery> {
      return withWrapper(() => client.request<GetReleaseInfoQuery>(GetReleaseInfoDocument, variables, requestHeaders));
    },
    GetSearchInfo(variables?: GetSearchInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSearchInfoQuery> {
      return withWrapper(() => client.request<GetSearchInfoQuery>(GetSearchInfoDocument, variables, requestHeaders));
    },
    GetSectioningConfirmInfo(variables?: GetSectioningConfirmInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSectioningConfirmInfoQuery> {
      return withWrapper(() => client.request<GetSectioningConfirmInfoQuery>(GetSectioningConfirmInfoDocument, variables, requestHeaders));
    },
    GetSectioningInfo(variables?: GetSectioningInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSectioningInfoQuery> {
      return withWrapper(() => client.request<GetSectioningInfoQuery>(GetSectioningInfoDocument, variables, requestHeaders));
    },
    GetStainInfo(variables?: GetStainInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetStainInfoQuery> {
      return withWrapper(() => client.request<GetStainInfoQuery>(GetStainInfoDocument, variables, requestHeaders));
    },
    GetStainingQCInfo(variables?: GetStainingQcInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetStainingQcInfoQuery> {
      return withWrapper(() => client.request<GetStainingQcInfoQuery>(GetStainingQcInfoDocument, variables, requestHeaders));
    },
    GetWorkAllocationInfo(variables: GetWorkAllocationInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetWorkAllocationInfoQuery> {
      return withWrapper(() => client.request<GetWorkAllocationInfoQuery>(GetWorkAllocationInfoDocument, variables, requestHeaders));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;