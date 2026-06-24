import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RecordInPlace from '../../../src/pages/RecordInPlace';
import { LabwareState } from '../../../src/types/sdk';

const mockSend = jest.fn();
const mockNavigate = jest.fn();
const mockUseLoaderData = jest.fn().mockReturnValue([]);
const mockLabware = [
  {
    __typename: 'Labware',
    id: 1,
    barcode: 'STAN-1',
    state: LabwareState.Active,
    slots: []
  }
];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLoaderData: () => mockUseLoaderData(),
  useNavigate: () => mockNavigate
}));

jest.mock('@xstate/react', () => ({
  useMachine: () => [
    {
      context: { serverError: undefined },
      matches: (state: string) => state === 'submitted'
    },
    mockSend
  ]
}));

jest.mock('../../../src/lib/machines/form/formMachine', () => ({
  __esModule: true,
  default: () => ({
    provide: () => ({})
  })
}));

jest.mock('../../../src/lib/sdk', () => ({
  stanCore: {
    RecordInPlace: jest.fn()
  }
}));

jest.mock('formik', () => ({
  Formik: ({ children }: any) => {
    const formikBag = {
      values: {
        workNumbers: ['SGP1001'],
        labware: mockLabware,
        equipmentId: undefined,
        operationType: 'Cryopreserve'
      },
      setFieldValue: jest.fn(),
      isValid: true
    };
    return <>{children(formikBag)}</>;
  },
  Form: ({ children }: any) => <form>{children}</form>
}));

jest.mock('../../../src/components/labwareScanner/LabwareScanner', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="mock-labware-scanner">{children}</div>
}));

jest.mock('../../../src/components/labwareScanPanel/LabwareScanPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-labware-scan-panel" />
}));

jest.mock('../../../src/components/WorkNumberSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-work-number-select" />
}));

jest.mock('../../../src/components/forms', () => ({
  FormikErrorMessage: () => null,
  selectOptionValues: () => []
}));

jest.mock('../../../src/components/forms/CustomReactSelect', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-custom-select" />
}));

describe('RecordInPlace completion buttons', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const setup = (displayImagingQcOption: boolean) => {
    render(
      <BrowserRouter>
        <RecordInPlace
          title={'Cryopreserve'}
          operationType={'Cryopreserve'}
          columns={[]}
          displayStoreOption={true}
          displayImagingQcOption={displayImagingQcOption}
        />
      </BrowserRouter>
    );
  };

  it('hides Imaging QC and shows Store when displayImagingQcOption is false', () => {
    setup(false);

    expect(screen.queryByRole('button', { name: 'Imaging QC' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Store' })).toBeInTheDocument();
  });

  it('shows Imaging QC and Store when displayImagingQcOption is true', () => {
    setup(true);

    expect(screen.getByRole('button', { name: 'Imaging QC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Store' })).toBeInTheDocument();
  });

  it('for thaw flow, hides Imaging QC and keeps Store when displayImagingQcOption is false', () => {
    render(
      <BrowserRouter>
        <RecordInPlace
          title={'Thaw'}
          operationType={'Thaw'}
          columns={[]}
          displayStoreOption={true}
          displayImagingQcOption={false}
        />
      </BrowserRouter>
    );

    expect(screen.queryByRole('button', { name: 'Imaging QC' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Store' })).toBeInTheDocument();
  });
});
