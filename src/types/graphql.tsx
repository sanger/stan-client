import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
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

export type Donor = {
  __typename?: 'Donor';
  donorName: Scalars['String'];
  lifeStage: LifeStage;
};

export type Tissue = {
  __typename?: 'Tissue';
  externalName: Scalars['String'];
  replicate: Scalars['Int'];
  spatialLocation: SpatialLocation;
  donor: Donor;
  hmdmc: Hmdmc;
  mouldSize: MouldSize;
  medium: Medium;
  fixative: Fixative;
};

export type Sample = {
  __typename?: 'Sample';
  id: Scalars['Int'];
  section?: Maybe<Scalars['Int']>;
  tissue: Tissue;
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
  hmdmc: Scalars['String'];
  tissueType: Scalars['String'];
  spatialLocation: Scalars['Int'];
  replicateNumber: Scalars['Int'];
  externalIdentifier: Scalars['String'];
  highestSection: Scalars['Int'];
  labwareType: Scalars['String'];
  medium: Scalars['String'];
  fixative: Scalars['String'];
  mouldSize: Scalars['String'];
};

export type RegisterRequest = {
  blocks: Array<BlockRegisterRequest>;
};

export type RegisterResult = {
  __typename?: 'RegisterResult';
  labware: Array<Labware>;
  tissue: Array<Tissue>;
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

export type Action = {
  __typename?: 'Action';
  source: Slot;
  destination: Slot;
  operationId: Scalars['Int'];
  sample: Sample;
};

export type Operation = {
  __typename?: 'Operation';
  operationType: OperationType;
  actions: Array<Action>;
  user: User;
  performed: Scalars['Timestamp'];
  releaseDestination?: Maybe<ReleaseDestination>;
  releaseRecipient?: Maybe<ReleaseRecipient>;
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
  labelType: LabelType;
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
  barcode: Scalars['String'];
  name?: Maybe<Scalars['String']>;
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
  name?: Maybe<Scalars['String']>;
  customName?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['Address']>;
};

export type UnstoreResult = {
  __typename?: 'UnstoreResult';
  numUnstored: Scalars['Int'];
  unstored: Array<UnstoredItem>;
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
  labware: Labware;
  printers: Array<Printer>;
  comments: Array<Comment>;
  releaseDestinations: Array<ReleaseDestination>;
  releaseRecipients: Array<ReleaseRecipient>;
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
  plan: PlanResult;
  printLabware?: Maybe<Scalars['String']>;
  confirmOperation: ConfirmOperationResult;
  release: ReleaseResult;
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

export type LabwareLayoutFragment = (
  { __typename?: 'Labware' }
  & Pick<Labware, 'id' | 'barcode'>
  & { labwareType: (
    { __typename?: 'LabwareType' }
    & Pick<LabwareType, 'name' | 'numRows' | 'numColumns'>
    & { labelType?: Maybe<(
      { __typename?: 'LabelType' }
      & Pick<LabelType, 'name'>
    )> }
  ), slots: Array<(
    { __typename?: 'Slot' }
    & Pick<Slot, 'address' | 'labwareId'>
    & { samples: Array<(
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
      ) }
    )> }
  )> }
);

export type LocationFieldsFragment = (
  { __typename?: 'Location' }
  & Pick<Location, 'barcode' | 'name' | 'customName' | 'address' | 'direction'>
  & { parent?: Maybe<(
    { __typename?: 'LinkedLocation' }
    & Pick<LinkedLocation, 'barcode' | 'name' | 'customName'>
  )>, size?: Maybe<(
    { __typename?: 'Size' }
    & Pick<Size, 'numRows' | 'numColumns'>
  )>, stored: Array<(
    { __typename?: 'StoredItem' }
    & Pick<StoredItem, 'barcode' | 'address'>
  )>, children: Array<(
    { __typename?: 'LinkedLocation' }
    & Pick<LinkedLocation, 'barcode' | 'name' | 'customName' | 'address'>
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
      & LabwareLayoutFragment
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
      & LabwareLayoutFragment
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
  barcodes: Array<Scalars['String']>;
  printer: Scalars['String'];
}>;


export type PrintMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'printLabware'>
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
      & LabwareLayoutFragment
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

export type FindLabwareQueryVariables = Exact<{
  barcode: Scalars['String'];
}>;


export type FindLabwareQuery = (
  { __typename?: 'Query' }
  & { labware: (
    { __typename?: 'Labware' }
    & Pick<Labware, 'id' | 'barcode'>
    & { labwareType: (
      { __typename?: 'LabwareType' }
      & Pick<LabwareType, 'name'>
    ), slots: Array<(
      { __typename?: 'Slot' }
      & Pick<Slot, 'address' | 'block'>
      & { samples: Array<(
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
        ) }
      )> }
    )> }
  ) }
);

export type FindLabwareLocationQueryVariables = Exact<{
  barcodes: Array<Scalars['String']>;
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

export type GetPrintersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPrintersQuery = (
  { __typename?: 'Query' }
  & { printers: Array<(
    { __typename?: 'Printer' }
    & Pick<Printer, 'name'>
    & { labelType: (
      { __typename?: 'LabelType' }
      & Pick<LabelType, 'name'>
    ) }
  )> }
);

export type GetRegistrationInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRegistrationInfoQuery = (
  { __typename?: 'Query' }
  & { hmdmcs: Array<(
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

export const LabwareLayoutFragmentDoc = gql`
    fragment LabwareLayout on Labware {
  id
  barcode
  labwareType {
    name
    numRows
    numColumns
    labelType {
      name
    }
  }
  slots {
    address
    labwareId
    samples {
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
    }
  }
}
    `;
export const LocationFieldsFragmentDoc = gql`
    fragment LocationFields on Location {
  barcode
  name
  customName
  address
  direction
  parent {
    barcode
    name
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
    name
    customName
    address
  }
}
    `;
export const ConfirmDocument = gql`
    mutation Confirm($request: ConfirmOperationRequest!) {
  confirmOperation(request: $request) {
    labware {
      ...LabwareLayout
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
    ${LabwareLayoutFragmentDoc}`;
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
        return Apollo.useMutation<ConfirmMutation, ConfirmMutationVariables>(ConfirmDocument, baseOptions);
      }
export type ConfirmMutationHookResult = ReturnType<typeof useConfirmMutation>;
export type ConfirmMutationResult = Apollo.MutationResult<ConfirmMutation>;
export type ConfirmMutationOptions = Apollo.BaseMutationOptions<ConfirmMutation, ConfirmMutationVariables>;
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
        return Apollo.useMutation<EmptyLocationMutation, EmptyLocationMutationVariables>(EmptyLocationDocument, baseOptions);
      }
export type EmptyLocationMutationHookResult = ReturnType<typeof useEmptyLocationMutation>;
export type EmptyLocationMutationResult = Apollo.MutationResult<EmptyLocationMutation>;
export type EmptyLocationMutationOptions = Apollo.BaseMutationOptions<EmptyLocationMutation, EmptyLocationMutationVariables>;
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
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
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
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const PlanDocument = gql`
    mutation Plan($request: PlanRequest!) {
  plan(request: $request) {
    labware {
      ...LabwareLayout
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
    ${LabwareLayoutFragmentDoc}`;
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
        return Apollo.useMutation<PlanMutation, PlanMutationVariables>(PlanDocument, baseOptions);
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
        return Apollo.useMutation<PrintMutation, PrintMutationVariables>(PrintDocument, baseOptions);
      }
export type PrintMutationHookResult = ReturnType<typeof usePrintMutation>;
export type PrintMutationResult = Apollo.MutationResult<PrintMutation>;
export type PrintMutationOptions = Apollo.BaseMutationOptions<PrintMutation, PrintMutationVariables>;
export const RegisterTissuesDocument = gql`
    mutation RegisterTissues($request: RegisterRequest!) {
  register(request: $request) {
    labware {
      ...LabwareLayout
    }
  }
}
    ${LabwareLayoutFragmentDoc}`;
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
        return Apollo.useMutation<RegisterTissuesMutation, RegisterTissuesMutationVariables>(RegisterTissuesDocument, baseOptions);
      }
export type RegisterTissuesMutationHookResult = ReturnType<typeof useRegisterTissuesMutation>;
export type RegisterTissuesMutationResult = Apollo.MutationResult<RegisterTissuesMutation>;
export type RegisterTissuesMutationOptions = Apollo.BaseMutationOptions<RegisterTissuesMutation, RegisterTissuesMutationVariables>;
export const ReleaseLabwareDocument = gql`
    mutation ReleaseLabware($releaseRequest: ReleaseRequest!) {
  release(request: $releaseRequest) {
    releases {
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
        return Apollo.useMutation<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>(ReleaseLabwareDocument, baseOptions);
      }
export type ReleaseLabwareMutationHookResult = ReturnType<typeof useReleaseLabwareMutation>;
export type ReleaseLabwareMutationResult = Apollo.MutationResult<ReleaseLabwareMutation>;
export type ReleaseLabwareMutationOptions = Apollo.BaseMutationOptions<ReleaseLabwareMutation, ReleaseLabwareMutationVariables>;
export const SetLocationCustomNameDocument = gql`
    mutation SetLocationCustomName($locationBarcode: String!, $newCustomName: String!) {
  setLocationCustomName(locationBarcode: $locationBarcode, customName: $newCustomName) {
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
        return Apollo.useMutation<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>(SetLocationCustomNameDocument, baseOptions);
      }
export type SetLocationCustomNameMutationHookResult = ReturnType<typeof useSetLocationCustomNameMutation>;
export type SetLocationCustomNameMutationResult = Apollo.MutationResult<SetLocationCustomNameMutation>;
export type SetLocationCustomNameMutationOptions = Apollo.BaseMutationOptions<SetLocationCustomNameMutation, SetLocationCustomNameMutationVariables>;
export const StoreBarcodeDocument = gql`
    mutation StoreBarcode($barcode: String!, $locationBarcode: String!, $address: Address) {
  storeBarcode(barcode: $barcode, locationBarcode: $locationBarcode, address: $address) {
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
        return Apollo.useMutation<StoreBarcodeMutation, StoreBarcodeMutationVariables>(StoreBarcodeDocument, baseOptions);
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
        return Apollo.useMutation<UnstoreBarcodeMutation, UnstoreBarcodeMutationVariables>(UnstoreBarcodeDocument, baseOptions);
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
        return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, baseOptions);
      }
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
          return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, baseOptions);
        }
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const FindLabwareDocument = gql`
    query FindLabware($barcode: String!) {
  labware(barcode: $barcode) {
    id
    barcode
    labwareType {
      name
    }
    slots {
      address
      block
      samples {
        id
        tissue {
          externalName
          donor {
            donorName
          }
          spatialLocation {
            tissueType {
              name
            }
            code
          }
          replicate
        }
      }
    }
  }
}
    `;

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
export function useFindLabwareQuery(baseOptions?: Apollo.QueryHookOptions<FindLabwareQuery, FindLabwareQueryVariables>) {
        return Apollo.useQuery<FindLabwareQuery, FindLabwareQueryVariables>(FindLabwareDocument, baseOptions);
      }
export function useFindLabwareLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLabwareQuery, FindLabwareQueryVariables>) {
          return Apollo.useLazyQuery<FindLabwareQuery, FindLabwareQueryVariables>(FindLabwareDocument, baseOptions);
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
export function useFindLabwareLocationQuery(baseOptions?: Apollo.QueryHookOptions<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>) {
        return Apollo.useQuery<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>(FindLabwareLocationDocument, baseOptions);
      }
export function useFindLabwareLocationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>) {
          return Apollo.useLazyQuery<FindLabwareLocationQuery, FindLabwareLocationQueryVariables>(FindLabwareLocationDocument, baseOptions);
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
export function useFindLocationByBarcodeQuery(baseOptions?: Apollo.QueryHookOptions<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>) {
        return Apollo.useQuery<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(FindLocationByBarcodeDocument, baseOptions);
      }
export function useFindLocationByBarcodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>) {
          return Apollo.useLazyQuery<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>(FindLocationByBarcodeDocument, baseOptions);
        }
export type FindLocationByBarcodeQueryHookResult = ReturnType<typeof useFindLocationByBarcodeQuery>;
export type FindLocationByBarcodeLazyQueryHookResult = ReturnType<typeof useFindLocationByBarcodeLazyQuery>;
export type FindLocationByBarcodeQueryResult = Apollo.QueryResult<FindLocationByBarcodeQuery, FindLocationByBarcodeQueryVariables>;
export const GetPrintersDocument = gql`
    query GetPrinters {
  printers {
    name
    labelType {
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
        return Apollo.useQuery<GetPrintersQuery, GetPrintersQueryVariables>(GetPrintersDocument, baseOptions);
      }
export function useGetPrintersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPrintersQuery, GetPrintersQueryVariables>) {
          return Apollo.useLazyQuery<GetPrintersQuery, GetPrintersQueryVariables>(GetPrintersDocument, baseOptions);
        }
export type GetPrintersQueryHookResult = ReturnType<typeof useGetPrintersQuery>;
export type GetPrintersLazyQueryHookResult = ReturnType<typeof useGetPrintersLazyQuery>;
export type GetPrintersQueryResult = Apollo.QueryResult<GetPrintersQuery, GetPrintersQueryVariables>;
export const GetRegistrationInfoDocument = gql`
    query GetRegistrationInfo {
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
        return Apollo.useQuery<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>(GetRegistrationInfoDocument, baseOptions);
      }
export function useGetRegistrationInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>) {
          return Apollo.useLazyQuery<GetRegistrationInfoQuery, GetRegistrationInfoQueryVariables>(GetRegistrationInfoDocument, baseOptions);
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
        return Apollo.useQuery<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>(GetReleaseInfoDocument, baseOptions);
      }
export function useGetReleaseInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>) {
          return Apollo.useLazyQuery<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>(GetReleaseInfoDocument, baseOptions);
        }
export type GetReleaseInfoQueryHookResult = ReturnType<typeof useGetReleaseInfoQuery>;
export type GetReleaseInfoLazyQueryHookResult = ReturnType<typeof useGetReleaseInfoLazyQuery>;
export type GetReleaseInfoQueryResult = Apollo.QueryResult<GetReleaseInfoQuery, GetReleaseInfoQueryVariables>;
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
        return Apollo.useQuery<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(GetSectioningInfoDocument, baseOptions);
      }
export function useGetSectioningInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>) {
          return Apollo.useLazyQuery<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>(GetSectioningInfoDocument, baseOptions);
        }
export type GetSectioningInfoQueryHookResult = ReturnType<typeof useGetSectioningInfoQuery>;
export type GetSectioningInfoLazyQueryHookResult = ReturnType<typeof useGetSectioningInfoLazyQuery>;
export type GetSectioningInfoQueryResult = Apollo.QueryResult<GetSectioningInfoQuery, GetSectioningInfoQueryVariables>;