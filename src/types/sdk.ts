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
};



export enum UserRole {
  Disabled = 'disabled',
  Normal = 'normal',
  Admin = 'admin'
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
  highestSection?: Maybe<Scalars['Int']>;
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

export type SlotCopyContent = {
  sourceBarcode: Scalars['String'];
  sourceAddress: Scalars['Address'];
  destinationAddress: Scalars['Address'];
};

export type SlotCopyRequest = {
  labwareType: Scalars['String'];
  operationType: Scalars['String'];
  contents: Array<SlotCopyContent>;
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
  DownRight = 'DownRight'
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
  tissueType?: Maybe<Scalars['String']>;
  maxRecords?: Maybe<Scalars['Int']>;
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
  releaseDestinations: Array<ReleaseDestination>;
  releaseRecipients: Array<ReleaseRecipient>;
  destructionReasons: Array<DestructionReason>;
  users: Array<User>;
  find: FindResult;
  location: Location;
  stored: Array<StoredItem>;
};


export type QueryHmdmcsArgs = {
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


export type QueryReleaseDestinationsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryReleaseRecipientsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryDestructionReasonsArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryUsersArgs = {
  includeDisabled?: Maybe<Scalars['Boolean']>;
};


export type QueryFindArgs = {
  request: FindRequest;
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
  release: ReleaseResult;
  extract: OperationResult;
  destroy: DestroyResult;
  slotCopy: OperationResult;
  addComment: Comment;
  setCommentEnabled: Comment;
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

export type DestructionReasonFieldsFragment = (
  { __typename?: 'DestructionReason' }
  & Pick<DestructionReason, 'id' | 'text' | 'enabled'>
);

export type HmdmcFieldsFragment = (
  { __typename?: 'Hmdmc' }
  & Pick<Hmdmc, 'hmdmc' | 'enabled'>
);

export type LabwareFieldsFragment = (
  { __typename?: 'Labware' }
  & Pick<Labware, 'id' | 'barcode' | 'destroyed' | 'discarded' | 'released'>
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

export type PrinterFieldsFragment = (
  { __typename?: 'Printer' }
  & Pick<Printer, 'name'>
  & { labelTypes: Array<(
    { __typename?: 'LabelType' }
    & Pick<LabelType, 'name'>
  )> }
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
  & Pick<Sample, 'id'>
  & { tissue: (
    { __typename?: 'Tissue' }
    & Pick<Tissue, 'externalName' | 'replicate'>
    & { donor: (
      { __typename?: 'Donor' }
      & Pick<Donor, 'donorName'>
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
  & Pick<Slot, 'address' | 'labwareId'>
  & { samples: Array<(
    { __typename?: 'Sample' }
    & SampleFieldsFragment
  )> }
);

export type SpeciesFieldsFragment = (
  { __typename?: 'Species' }
  & Pick<Species, 'name' | 'enabled'>
);

export type UserFieldsFragment = (
  { __typename?: 'User' }
  & Pick<User, 'username' | 'role'>
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
        ) }
      ) }
    )>, labware: Array<(
      { __typename?: 'Labware' }
      & Pick<Labware, 'id' | 'barcode'>
      & { labwareType: (
        { __typename?: 'LabwareType' }
        & Pick<LabwareType, 'name'>
      ) }
    )>, locations: Array<(
      { __typename?: 'Location' }
      & Pick<Location, 'id' | 'barcode' | 'customName' | 'fixedName' | 'direction'>
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
  )>, releaseDestinations: Array<(
    { __typename?: 'ReleaseDestination' }
    & ReleaseDestinationFieldsFragment
  )>, releaseRecipients: Array<(
    { __typename?: 'ReleaseRecipient' }
    & ReleaseRecipientFieldsFragment
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

export type GetSectioningInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningInfoQuery = (
  { __typename?: 'Query' }
  & { comments: Array<(
    { __typename?: 'Comment' }
    & CommentFieldsFragment
  )>, labwareTypes: Array<(
    { __typename?: 'LabwareType' }
    & LabwareTypeFieldsFragment
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
  tissue {
    donor {
      donorName
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
}
    ${SampleFieldsFragmentDoc}`;
export const LabwareFieldsFragmentDoc = gql`
    fragment LabwareFields on Labware {
  id
  barcode
  destroyed
  discarded
  released
  labwareType {
    ...LabwareTypeFields
  }
  slots {
    ...SlotFields
  }
}
    ${LabwareTypeFieldsFragmentDoc}
${SlotFieldsFragmentDoc}`;
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
export const UserFieldsFragmentDoc = gql`
    fragment UserFields on User {
  username
  role
}
    `;
export const AddCommentDocument = gql`
    mutation AddComment($category: String!, $text: String!) {
  addComment(category: $category, text: $text) {
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
export const AddHmdmcDocument = gql`
    mutation AddHmdmc($hmdmc: String!) {
  addHmdmc(hmdmc: $hmdmc) {
    ...HmdmcFields
  }
}
    ${HmdmcFieldsFragmentDoc}`;
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
    }
  }
}
    ${LabwareFieldsFragmentDoc}`;
export const PrintDocument = gql`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
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
export const SlotCopyDocument = gql`
    mutation SlotCopy($request: SlotCopyRequest!) {
  slotCopy(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}`;
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
      }
    }
    labware {
      id
      barcode
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
    }
    labwareLocations {
      labwareId
      locationId
      address
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
  releaseDestinations(includeDisabled: true) {
    ...ReleaseDestinationFields
  }
  releaseRecipients(includeDisabled: true) {
    ...ReleaseRecipientFields
  }
}
    ${DestructionReasonFieldsFragmentDoc}
${CommentFieldsFragmentDoc}
${HmdmcFieldsFragmentDoc}
${SpeciesFieldsFragmentDoc}
${ReleaseDestinationFieldsFragmentDoc}
${ReleaseRecipientFieldsFragmentDoc}`;
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
export const GetSectioningInfoDocument = gql`
    query GetSectioningInfo {
  comments(category: "section") {
    ...CommentFields
  }
  labwareTypes {
    ...LabwareTypeFields
  }
}
    ${CommentFieldsFragmentDoc}
${LabwareTypeFieldsFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    AddComment(variables: AddCommentMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddCommentMutation> {
      return withWrapper(() => client.request<AddCommentMutation>(AddCommentDocument, variables, requestHeaders));
    },
    AddDestructionReason(variables: AddDestructionReasonMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddDestructionReasonMutation> {
      return withWrapper(() => client.request<AddDestructionReasonMutation>(AddDestructionReasonDocument, variables, requestHeaders));
    },
    AddHmdmc(variables: AddHmdmcMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddHmdmcMutation> {
      return withWrapper(() => client.request<AddHmdmcMutation>(AddHmdmcDocument, variables, requestHeaders));
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
    Confirm(variables: ConfirmMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ConfirmMutation> {
      return withWrapper(() => client.request<ConfirmMutation>(ConfirmDocument, variables, requestHeaders));
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
    SetDestructionReasonEnabled(variables: SetDestructionReasonEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetDestructionReasonEnabledMutation> {
      return withWrapper(() => client.request<SetDestructionReasonEnabledMutation>(SetDestructionReasonEnabledDocument, variables, requestHeaders));
    },
    SetHmdmcEnabled(variables: SetHmdmcEnabledMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetHmdmcEnabledMutation> {
      return withWrapper(() => client.request<SetHmdmcEnabledMutation>(SetHmdmcEnabledDocument, variables, requestHeaders));
    },
    SetLocationCustomName(variables: SetLocationCustomNameMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SetLocationCustomNameMutation> {
      return withWrapper(() => client.request<SetLocationCustomNameMutation>(SetLocationCustomNameDocument, variables, requestHeaders));
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
    SlotCopy(variables: SlotCopyMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SlotCopyMutation> {
      return withWrapper(() => client.request<SlotCopyMutation>(SlotCopyDocument, variables, requestHeaders));
    },
    StoreBarcode(variables: StoreBarcodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<StoreBarcodeMutation> {
      return withWrapper(() => client.request<StoreBarcodeMutation>(StoreBarcodeDocument, variables, requestHeaders));
    },
    UnstoreBarcode(variables: UnstoreBarcodeMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UnstoreBarcodeMutation> {
      return withWrapper(() => client.request<UnstoreBarcodeMutation>(UnstoreBarcodeDocument, variables, requestHeaders));
    },
    CurrentUser(variables?: CurrentUserQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CurrentUserQuery> {
      return withWrapper(() => client.request<CurrentUserQuery>(CurrentUserDocument, variables, requestHeaders));
    },
    Find(variables: FindQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<FindQuery> {
      return withWrapper(() => client.request<FindQuery>(FindDocument, variables, requestHeaders));
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
    GetRegistrationInfo(variables?: GetRegistrationInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetRegistrationInfoQuery> {
      return withWrapper(() => client.request<GetRegistrationInfoQuery>(GetRegistrationInfoDocument, variables, requestHeaders));
    },
    GetReleaseInfo(variables?: GetReleaseInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetReleaseInfoQuery> {
      return withWrapper(() => client.request<GetReleaseInfoQuery>(GetReleaseInfoDocument, variables, requestHeaders));
    },
    GetSearchInfo(variables?: GetSearchInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSearchInfoQuery> {
      return withWrapper(() => client.request<GetSearchInfoQuery>(GetSearchInfoDocument, variables, requestHeaders));
    },
    GetSectioningInfo(variables?: GetSectioningInfoQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetSectioningInfoQuery> {
      return withWrapper(() => client.request<GetSectioningInfoQuery>(GetSectioningInfoDocument, variables, requestHeaders));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;