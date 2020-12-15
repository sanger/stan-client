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
  description: Scalars['String'];
};

export type AddressStringInput = {
  address: Scalars['Address'];
  comment: Scalars['Int'];
};

export type ConfirmOperationLabware = {
  barcode: Scalars['String'];
  cancelled?: Maybe<Scalars['Boolean']>;
  cancelledAddresses?: Maybe<Array<Scalars['Address']>>;
  addressComments?: Maybe<Array<AddressStringInput>>;
};

export type ConfirmOperationRequest = {
  labware: Array<ConfirmOperationLabware>;
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
};


export type QueryLabwareArgs = {
  barcode: Scalars['String'];
};


export type QueryPrintersArgs = {
  labelType?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  login: LoginResult;
  logout?: Maybe<Scalars['String']>;
  register: RegisterResult;
  plan: PlanResult;
  printLabware?: Maybe<Scalars['String']>;
  confirm?: Maybe<Scalars['String']>;
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


export type MutationConfirmArgs = {
  request: ConfirmOperationRequest;
};

export type LabwareLayoutFragment = (
  { __typename?: 'Labware' }
  & Pick<Labware, 'id' | 'barcode'>
  & { labwareType: (
    { __typename?: 'LabwareType' }
    & Pick<LabwareType, 'name' | 'numRows' | 'numColumns'>
  ), slots: Array<(
    { __typename?: 'Slot' }
    & Pick<Slot, 'address' | 'labwareId'>
    & { samples: Array<(
      { __typename?: 'Sample' }
      & Pick<Sample, 'id'>
    )> }
  )> }
);

export type ConfirmMutationVariables = Exact<{
  request: ConfirmOperationRequest;
}>;


export type ConfirmMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'confirm'>
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
      & Pick<Labware, 'barcode'>
      & { slots: Array<(
        { __typename?: 'Slot' }
        & { samples: Array<(
          { __typename?: 'Sample' }
          & { tissue: (
            { __typename?: 'Tissue' }
            & Pick<Tissue, 'externalName'>
          ) }
        )> }
      )>, labwareType: (
        { __typename?: 'LabwareType' }
        & Pick<LabwareType, 'name'>
      ) }
    )> }
  ) }
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
          & Pick<Tissue, 'replicate'>
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

export type GetSectioningInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSectioningInfoQuery = (
  { __typename?: 'Query' }
  & { labwareTypes: Array<(
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
  }
  slots {
    address
    labwareId
    samples {
      id
    }
  }
}
    `;
export const ConfirmDocument = gql`
    mutation Confirm($request: ConfirmOperationRequest!) {
  confirm(request: $request)
}
    `;
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
      barcode
      slots {
        samples {
          tissue {
            externalName
          }
        }
      }
      labwareType {
        name
      }
    }
  }
}
    `;
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
export const GetSectioningInfoDocument = gql`
    query GetSectioningInfo {
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