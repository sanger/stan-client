import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
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



export type User = {
  __typename?: 'User';
  username: Scalars['String'];
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

export type ConfirmOperationLabware = {
  barcode: Scalars['String'];
  cancelled?: Maybe<Scalars['Boolean']>;
  cancelledAddresses?: Maybe<Array<Scalars['Address']>>;
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
};

export type ReleaseDestination = {
  __typename?: 'ReleaseDestination';
  name: Scalars['String'];
};

export type ReleaseRecipient = {
  __typename?: 'ReleaseRecipient';
  username: Scalars['String'];
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
  find: FindResult;
  location: Location;
  stored: Array<StoredItem>;
};


export type QueryLabwareArgs = {
  barcode: Scalars['String'];
};


export type QueryPrintersArgs = {
  labelType?: Maybe<Scalars['String']>;
};


export type QueryCommentsArgs = {
  category?: Maybe<Scalars['String']>;
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
      & Pick<User, 'username'>
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
    & Pick<User, 'username'>
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

export type GetDestroyInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDestroyInfoQuery = (
  { __typename?: 'Query' }
  & { destructionReasons: Array<(
    { __typename?: 'DestructionReason' }
    & Pick<DestructionReason, 'id' | 'text'>
  )> }
);

export type GetPrintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrintersQuery = (
  { __typename?: 'Query' }
  & { printers: Array<(
    { __typename?: 'Printer' }
    & Pick<Printer, 'name'>
    & { labelTypes: Array<(
      { __typename?: 'LabelType' }
      & Pick<LabelType, 'name'>
    )> }
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
    & Pick<LabwareType, 'name'>
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
    & Pick<ReleaseDestination, 'name'>
  )>, releaseRecipients: Array<(
    { __typename?: 'ReleaseRecipient' }
    & Pick<ReleaseRecipient, 'username'>
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
    & Pick<Comment, 'id' | 'text' | 'category'>
  )>, labwareTypes: Array<(
    { __typename?: 'LabwareType' }
    & Pick<LabwareType, 'name' | 'numRows' | 'numColumns'>
  )> }
);

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
export type ConfirmMutationFn = Apollo.MutationFunction<ConfirmMutation, ConfirmMutationVariables>;

/**
 * __useConfirmMutation__
 *
 * To run a mutation, you first call `useConfirmMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useConfirmMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [confirmMutation, { data, loading, error }] = useConfirmMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useConfirmMutation(baseOptions?: Apollo.MutationHookOptions<ConfirmMutation, ConfirmMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ConfirmMutation, ConfirmMutationVariables>(ConfirmDocument, options);
      }
export type ConfirmMutationHookResult = ReturnType<typeof useConfirmMutation>;
export type ConfirmMutationResult = Apollo.MutationResult<ConfirmMutation>;
export type ConfirmMutationOptions = Apollo.BaseMutationOptions<ConfirmMutation, ConfirmMutationVariables>;
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
export type DestroyMutationFn = Apollo.MutationFunction<DestroyMutation, DestroyMutationVariables>;

/**
 * __useDestroyMutation__
 *
 * To run a mutation, you first call `useDestroyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDestroyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [destroyMutation, { data, loading, error }] = useDestroyMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useDestroyMutation(baseOptions?: Apollo.MutationHookOptions<DestroyMutation, DestroyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DestroyMutation, DestroyMutationVariables>(DestroyDocument, options);
      }
export type DestroyMutationHookResult = ReturnType<typeof useDestroyMutation>;
export type DestroyMutationResult = Apollo.MutationResult<DestroyMutation>;
export type DestroyMutationOptions = Apollo.BaseMutationOptions<DestroyMutation, DestroyMutationVariables>;
export const EmptyLocationDocument = gql`
    mutation EmptyLocation($barcode: String!) {
  empty(locationBarcode: $barcode) {
    numUnstored
  }
}
    `;
export type EmptyLocationMutationFn = Apollo.MutationFunction<EmptyLocationMutation, EmptyLocationMutationVariables>;

/**
 * __useEmptyLocationMutation__
 *
 * To run a mutation, you first call `useEmptyLocationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEmptyLocationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [emptyLocationMutation, { data, loading, error }] = useEmptyLocationMutation({
 *   variables: {
 *      barcode: // value for 'barcode'
 *   },
 * });
 */
export function useEmptyLocationMutation(baseOptions?: Apollo.MutationHookOptions<EmptyLocationMutation, EmptyLocationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EmptyLocationMutation, EmptyLocationMutationVariables>(EmptyLocationDocument, options);
      }
export type EmptyLocationMutationHookResult = ReturnType<typeof useEmptyLocationMutation>;
export type EmptyLocationMutationResult = Apollo.MutationResult<EmptyLocationMutation>;
export type EmptyLocationMutationOptions = Apollo.BaseMutationOptions<EmptyLocationMutation, EmptyLocationMutationVariables>;
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
export type ExtractMutationFn = Apollo.MutationFunction<ExtractMutation, ExtractMutationVariables>;

/**
 * __useExtractMutation__
 *
 * To run a mutation, you first call `useExtractMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useExtractMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [extractMutation, { data, loading, error }] = useExtractMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useExtractMutation(baseOptions?: Apollo.MutationHookOptions<ExtractMutation, ExtractMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ExtractMutation, ExtractMutationVariables>(ExtractDocument, options);
      }
export type ExtractMutationHookResult = ReturnType<typeof useExtractMutation>;
export type ExtractMutationResult = Apollo.MutationResult<ExtractMutation>;
export type ExtractMutationOptions = Apollo.BaseMutationOptions<ExtractMutation, ExtractMutationVariables>;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    user {
      username
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
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
export type PlanMutationFn = Apollo.MutationFunction<PlanMutation, PlanMutationVariables>;

/**
 * __usePlanMutation__
 *
 * To run a mutation, you first call `usePlanMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePlanMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [planMutation, { data, loading, error }] = usePlanMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function usePlanMutation(baseOptions?: Apollo.MutationHookOptions<PlanMutation, PlanMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PlanMutation, PlanMutationVariables>(PlanDocument, options);
      }
export type PlanMutationHookResult = ReturnType<typeof usePlanMutation>;
export type PlanMutationResult = Apollo.MutationResult<PlanMutation>;
export type PlanMutationOptions = Apollo.BaseMutationOptions<PlanMutation, PlanMutationVariables>;
export const PrintDocument = gql`
    mutation Print($barcodes: [String!]!, $printer: String!) {
  printLabware(barcodes: $barcodes, printer: $printer)
}
    `;
export type PrintMutationFn = Apollo.MutationFunction<PrintMutation, PrintMutationVariables>;

/**
 * __usePrintMutation__
 *
 * To run a mutation, you first call `usePrintMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePrintMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [printMutation, { data, loading, error }] = usePrintMutation({
 *   variables: {
 *      barcodes: // value for 'barcodes'
 *      printer: // value for 'printer'
 *   },
 * });
 */
export function usePrintMutation(baseOptions?: Apollo.MutationHookOptions<PrintMutation, PrintMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PrintMutation, PrintMutationVariables>(PrintDocument, options);
      }
export type PrintMutationHookResult = ReturnType<typeof usePrintMutation>;
export type PrintMutationResult = Apollo.MutationResult<PrintMutation>;
export type PrintMutationOptions = Apollo.BaseMutationOptions<PrintMutation, PrintMutationVariables>;
export const RegisterSectionsDocument = gql`
    mutation RegisterSections($request: SectionRegisterRequest!) {
  registerSections(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}`;
export type RegisterSectionsMutationFn = Apollo.MutationFunction<RegisterSectionsMutation, RegisterSectionsMutationVariables>;

/**
 * __useRegisterSectionsMutation__
 *
 * To run a mutation, you first call `useRegisterSectionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterSectionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerSectionsMutation, { data, loading, error }] = useRegisterSectionsMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useRegisterSectionsMutation(baseOptions?: Apollo.MutationHookOptions<RegisterSectionsMutation, RegisterSectionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterSectionsMutation, RegisterSectionsMutationVariables>(RegisterSectionsDocument, options);
      }
export type RegisterSectionsMutationHookResult = ReturnType<typeof useRegisterSectionsMutation>;
export type RegisterSectionsMutationResult = Apollo.MutationResult<RegisterSectionsMutation>;
export type RegisterSectionsMutationOptions = Apollo.BaseMutationOptions<RegisterSectionsMutation, RegisterSectionsMutationVariables>;
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
export type RegisterTissuesMutationFn = Apollo.MutationFunction<RegisterTissuesMutation, RegisterTissuesMutationVariables>;

/**
 * __useRegisterTissuesMutation__
 *
 * To run a mutation, you first call `useRegisterTissuesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterTissuesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerTissuesMutation, { data, loading, error }] = useRegisterTissuesMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useRegisterTissuesMutation(baseOptions?: Apollo.MutationHookOptions<RegisterTissuesMutation, RegisterTissuesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>(RegisterTissuesDocument, options);
      }
export type RegisterTissuesMutationHookResult = ReturnType<typeof useRegisterTissuesMutation>;
export type RegisterTissuesMutationResult = Apollo.MutationResult<RegisterTissuesMutation>;
export type RegisterTissuesMutationOptions = Apollo.BaseMutationOptions<RegisterTissuesMutation, RegisterTissuesMutationVariables>;
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
export type ReleaseLabwareMutationFn = Apollo.MutationFunction<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>;

/**
 * __useReleaseLabwareMutation__
 *
 * To run a mutation, you first call `useReleaseLabwareMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReleaseLabwareMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [releaseLabwareMutation, { data, loading, error }] = useReleaseLabwareMutation({
 *   variables: {
 *      releaseRequest: // value for 'releaseRequest'
 *   },
 * });
 */
export function useReleaseLabwareMutation(baseOptions?: Apollo.MutationHookOptions<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>(ReleaseLabwareDocument, options);
      }
export type ReleaseLabwareMutationHookResult = ReturnType<typeof useReleaseLabwareMutation>;
export type ReleaseLabwareMutationResult = Apollo.MutationResult<ReleaseLabwareMutation>;
export type ReleaseLabwareMutationOptions = Apollo.BaseMutationOptions<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>;
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
export type SetLocationCustomNameMutationFn = Apollo.MutationFunction<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>;

/**
 * __useSetLocationCustomNameMutation__
 *
 * To run a mutation, you first call `useSetLocationCustomNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetLocationCustomNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setLocationCustomNameMutation, { data, loading, error }] = useSetLocationCustomNameMutation({
 *   variables: {
 *      locationBarcode: // value for 'locationBarcode'
 *      newCustomName: // value for 'newCustomName'
 *   },
 * });
 */
export function useSetLocationCustomNameMutation(baseOptions?: Apollo.MutationHookOptions<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>(SetLocationCustomNameDocument, options);
      }
export type SetLocationCustomNameMutationHookResult = ReturnType<typeof useSetLocationCustomNameMutation>;
export type SetLocationCustomNameMutationResult = Apollo.MutationResult<SetLocationCustomNameMutation>;
export type SetLocationCustomNameMutationOptions = Apollo.BaseMutationOptions<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>;
export const SlotCopyDocument = gql`
    mutation SlotCopy($request: SlotCopyRequest!) {
  slotCopy(request: $request) {
    labware {
      ...LabwareFields
    }
  }
}
    ${LabwareFieldsFragmentDoc}`;
export type SlotCopyMutationFn = Apollo.MutationFunction<SlotCopyMutation, SlotCopyMutationVariables>;

/**
 * __useSlotCopyMutation__
 *
 * To run a mutation, you first call `useSlotCopyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSlotCopyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [slotCopyMutation, { data, loading, error }] = useSlotCopyMutation({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useSlotCopyMutation(baseOptions?: Apollo.MutationHookOptions<SlotCopyMutation, SlotCopyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SlotCopyMutation, SlotCopyMutationVariables>(SlotCopyDocument, options);
      }
export type SlotCopyMutationHookResult = ReturnType<typeof useSlotCopyMutation>;
export type SlotCopyMutationResult = Apollo.MutationResult<SlotCopyMutation>;
export type SlotCopyMutationOptions = Apollo.BaseMutationOptions<SlotCopyMutation, SlotCopyMutationVariables>;
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
export type StoreBarcodeMutationFn = Apollo.MutationFunction<StoreBarcodeMutation, StoreBarcodeMutationVariables>;

/**
 * __useStoreBarcodeMutation__
 *
 * To run a mutation, you first call `useStoreBarcodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStoreBarcodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [storeBarcodeMutation, { data, loading, error }] = useStoreBarcodeMutation({
 *   variables: {
 *      barcode: // value for 'barcode'
 *      locationBarcode: // value for 'locationBarcode'
 *      address: // value for 'address'
 *   },
 * });
 */
export function useStoreBarcodeMutation(baseOptions?: Apollo.MutationHookOptions<StoreBarcodeMutation, StoreBarcodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<StoreBarcodeMutation, StoreBarcodeMutationVariables>(StoreBarcodeDocument, options);
      }
export type StoreBarcodeMutationHookResult = ReturnType<typeof useStoreBarcodeMutation>;
export type StoreBarcodeMutationResult = Apollo.MutationResult<StoreBarcodeMutation>;
export type StoreBarcodeMutationOptions = Apollo.BaseMutationOptions<StoreBarcodeMutation, StoreBarcodeMutationVariables>;
export const UnstoreBarcodeDocument = gql`
    mutation UnstoreBarcode($barcode: String!) {
  unstoreBarcode(barcode: $barcode) {
    barcode
    address
  }
}
    `;
export type UnstoreBarcodeMutationFn = Apollo.MutationFunction<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>;

/**
 * __useUnstoreBarcodeMutation__
 *
 * To run a mutation, you first call `useUnstoreBarcodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnstoreBarcodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unstoreBarcodeMutation, { data, loading, error }] = useUnstoreBarcodeMutation({
 *   variables: {
 *      barcode: // value for 'barcode'
 *   },
 * });
 */
export function useUnstoreBarcodeMutation(baseOptions?: Apollo.MutationHookOptions<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>(UnstoreBarcodeDocument, options);
      }
export type UnstoreBarcodeMutationHookResult = ReturnType<typeof useUnstoreBarcodeMutation>;
export type UnstoreBarcodeMutationResult = Apollo.MutationResult<UnstoreBarcodeMutation>;
export type UnstoreBarcodeMutationOptions = Apollo.BaseMutationOptions<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>;
export const CurrentUserDocument = gql`
    query CurrentUser {
  user {
    username
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
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

/**
 * __useFindQuery__
 *
 * To run a query within a React component, call `useFindQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindQuery({
 *   variables: {
 *      request: // value for 'request'
 *   },
 * });
 */
export function useFindQuery(baseOptions: Apollo.QueryHookOptions<FindQuery, FindQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindQuery, FindQueryVariables>(FindDocument, options);
      }
export function useFindLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindQuery, FindQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindQuery, FindQueryVariables>(FindDocument, options);
        }
export type FindQueryHookResult = ReturnType<typeof useFindQuery>;
export type FindLazyQueryHookResult = ReturnType<typeof useFindLazyQuery>;
export type FindQueryResult = Apollo.QueryResult<FindQuery, FindQueryVariables>;
export const FindLabwareDocument = gql`
    query FindLabware($barcode: String!) {
  labware(barcode: $barcode) {
    ...LabwareFields
  }
}
    ${LabwareFieldsFragmentDoc}`;

/**
 * __useFindLabwareQuery__
 *
 * To run a query within a React component, call `useFindLabwareQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindLabwareQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindLabwareQuery({
 *   variables: {
 *      barcode: // value for 'barcode'
 *   },
 * });
 */
export function useFindLabwareQuery(baseOptions: Apollo.QueryHookOptions<FindLabwareQuery, FindLabwareQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindLabwareQuery, FindLabwareQueryVariables>(FindLabwareDocument, options);
      }
export function useFindLabwareLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLabwareQuery, FindLabwareQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindLabwareQuery, FindLabwareQueryVariables>(FindLabwareDocument, options);
        }
export type FindLabwareQueryHookResult = ReturnType<typeof useFindLabwareQuery>;
export type FindLabwareLazyQueryHookResult = ReturnType<typeof useFindLabwareLazyQuery>;
export type FindLabwareQueryResult = Apollo.QueryResult<FindLabwareQuery, FindLabwareQueryVariables>;
export const FindLabwareLocationDocument = gql`
    query FindLabwareLocation($barcodes: [String!]!) {
  stored(barcodes: $barcodes) {
    location {
      barcode
    }
  }
}
    `;

/**
 * __useFindLabwareLocationQuery__
 *
 * To run a query within a React component, call `useFindLabwareLocationQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindLabwareLocationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindLabwareLocationQuery({
 *   variables: {
 *      barcodes: // value for 'barcodes'
 *   },
 * });
 */
export function useFindLabwareLocationQuery(baseOptions: Apollo.QueryHookOptions<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>(FindLabwareLocationDocument, options);
      }
export function useFindLabwareLocationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>(FindLabwareLocationDocument, options);
        }
export type FindLabwareLocationQueryHookResult = ReturnType<typeof useFindLabwareLocationQuery>;
export type FindLabwareLocationLazyQueryHookResult = ReturnType<typeof useFindLabwareLocationLazyQuery>;
export type FindLabwareLocationQueryResult = Apollo.QueryResult<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>;
export const FindLocationByBarcodeDocument = gql`
    query FindLocationByBarcode($barcode: String!) {
  location(locationBarcode: $barcode) {
    ...LocationFields
  }
}
    ${LocationFieldsFragmentDoc}`;

/**
 * __useFindLocationByBarcodeQuery__
 *
 * To run a query within a React component, call `useFindLocationByBarcodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindLocationByBarcodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindLocationByBarcodeQuery({
 *   variables: {
 *      barcode: // value for 'barcode'
 *   },
 * });
 */
export function useFindLocationByBarcodeQuery(baseOptions: Apollo.QueryHookOptions<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(FindLocationByBarcodeDocument, options);
      }
export function useFindLocationByBarcodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(FindLocationByBarcodeDocument, options);
        }
export type FindLocationByBarcodeQueryHookResult = ReturnType<typeof useFindLocationByBarcodeQuery>;
export type FindLocationByBarcodeLazyQueryHookResult = ReturnType<typeof useFindLocationByBarcodeLazyQuery>;
export type FindLocationByBarcodeQueryResult = Apollo.QueryResult<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>;
export const GetDestroyInfoDocument = gql`
    query GetDestroyInfo {
  destructionReasons {
    id
    text
  }
}
    `;

/**
 * __useGetDestroyInfoQuery__
 *
 * To run a query within a React component, call `useGetDestroyInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDestroyInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDestroyInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDestroyInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>(GetDestroyInfoDocument, options);
      }
export function useGetDestroyInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>(GetDestroyInfoDocument, options);
        }
export type GetDestroyInfoQueryHookResult = ReturnType<typeof useGetDestroyInfoQuery>;
export type GetDestroyInfoLazyQueryHookResult = ReturnType<typeof useGetDestroyInfoLazyQuery>;
export type GetDestroyInfoQueryResult = Apollo.QueryResult<GetDestroyInfoQuery, GetDestroyInfoQueryVariables>;
export const GetPrintersDocument = gql`
    query GetPrinters {
  printers {
    name
    labelTypes {
      name
    }
  }
}
    `;

/**
 * __useGetPrintersQuery__
 *
 * To run a query within a React component, call `useGetPrintersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPrintersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPrintersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPrintersQuery(baseOptions?: Apollo.QueryHookOptions<GetPrintersQuery, GetPrintersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPrintersQuery, GetPrintersQueryVariables>(GetPrintersDocument, options);
      }
export function useGetPrintersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPrintersQuery, GetPrintersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPrintersQuery, GetPrintersQueryVariables>(GetPrintersDocument, options);
        }
export type GetPrintersQueryHookResult = ReturnType<typeof useGetPrintersQuery>;
export type GetPrintersLazyQueryHookResult = ReturnType<typeof useGetPrintersLazyQuery>;
export type GetPrintersQueryResult = Apollo.QueryResult<GetPrintersQuery, GetPrintersQueryVariables>;
export const GetRegistrationInfoDocument = gql`
    query GetRegistrationInfo {
  species {
    name
  }
  hmdmcs {
    hmdmc
  }
  labwareTypes {
    name
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
    `;

/**
 * __useGetRegistrationInfoQuery__
 *
 * To run a query within a React component, call `useGetRegistrationInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRegistrationInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>(GetRegistrationInfoDocument, options);
      }
export function useGetRegistrationInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>(GetRegistrationInfoDocument, options);
        }
export type GetRegistrationInfoQueryHookResult = ReturnType<typeof useGetRegistrationInfoQuery>;
export type GetRegistrationInfoLazyQueryHookResult = ReturnType<typeof useGetRegistrationInfoLazyQuery>;
export type GetRegistrationInfoQueryResult = Apollo.QueryResult<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>;
export const GetReleaseInfoDocument = gql`
    query GetReleaseInfo {
  releaseDestinations {
    name
  }
  releaseRecipients {
    username
  }
}
    `;

/**
 * __useGetReleaseInfoQuery__
 *
 * To run a query within a React component, call `useGetReleaseInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetReleaseInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetReleaseInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetReleaseInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>(GetReleaseInfoDocument, options);
      }
export function useGetReleaseInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>(GetReleaseInfoDocument, options);
        }
export type GetReleaseInfoQueryHookResult = ReturnType<typeof useGetReleaseInfoQuery>;
export type GetReleaseInfoLazyQueryHookResult = ReturnType<typeof useGetReleaseInfoLazyQuery>;
export type GetReleaseInfoQueryResult = Apollo.QueryResult<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>;
export const GetSearchInfoDocument = gql`
    query GetSearchInfo {
  tissueTypes {
    name
  }
}
    `;

/**
 * __useGetSearchInfoQuery__
 *
 * To run a query within a React component, call `useGetSearchInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSearchInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSearchInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSearchInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetSearchInfoQuery, GetSearchInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSearchInfoQuery, GetSearchInfoQueryVariables>(GetSearchInfoDocument, options);
      }
export function useGetSearchInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSearchInfoQuery, GetSearchInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSearchInfoQuery, GetSearchInfoQueryVariables>(GetSearchInfoDocument, options);
        }
export type GetSearchInfoQueryHookResult = ReturnType<typeof useGetSearchInfoQuery>;
export type GetSearchInfoLazyQueryHookResult = ReturnType<typeof useGetSearchInfoLazyQuery>;
export type GetSearchInfoQueryResult = Apollo.QueryResult<GetSearchInfoQuery, GetSearchInfoQueryVariables>;
export const GetSectioningInfoDocument = gql`
    query GetSectioningInfo {
  comments(category: "section") {
    id
    text
    category
  }
  labwareTypes {
    name
    numRows
    numColumns
  }
}
    `;

/**
 * __useGetSectioningInfoQuery__
 *
 * To run a query within a React component, call `useGetSectioningInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSectioningInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSectioningInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSectioningInfoQuery(baseOptions?: Apollo.QueryHookOptions<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(GetSectioningInfoDocument, options);
      }
export function useGetSectioningInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(GetSectioningInfoDocument, options);
        }
export type GetSectioningInfoQueryHookResult = ReturnType<typeof useGetSectioningInfoQuery>;
export type GetSectioningInfoLazyQueryHookResult = ReturnType<typeof useGetSectioningInfoLazyQuery>;
export type GetSectioningInfoQueryResult = Apollo.QueryResult<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>;