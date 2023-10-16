import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabwarePlan, { buildInitialLayoutPlan } from '../../../../src/components/planning/LabwarePlan';
import { labwareTypeInstances } from '../../../../src/lib/factories/labwareTypeFactory';
import { LabwareTypeName } from '../../../../src/types/stan';
import labwareFactory from '../../../../src/lib/factories/labwareFactory';
import { enableMapSet } from 'immer';
import userEvent from '@testing-library/user-event';
import { LabwareType } from '../../../../src/types/sdk';
import { createLabwarePlanMachine } from '../../../../src/components/planning/labwarePlan.machine';
import { interpret } from 'xstate';
beforeAll(() => {
  enableMapSet();
});
describe('On Mount', () => {
  describe('When the output labware type set to TUBE', () => {
    it('displays Number of labware, Sectioning Thickness', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.TUBE);
      });
      waitFor(() => {
        expectDisplayNumberOfLabwareAndSectionThicknessInputs();
      });
    });
  });
  describe('When the output labware type set to 4 SLOTS', () => {
    it('displays Number of labware, Sectioning Thickness', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.FOUR_SLOT_SLIDE);
      });
      waitFor(() => {
        expectDisplayNumberOfLabwareAndSectionThicknessInputs();
      });
    });
  });
  describe('When the output labware type set to SLIDE', () => {
    it('displays Number of labware, Sectioning Thickness', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.SLIDE);
      });
      waitFor(() => {
        expectDisplayNumberOfLabwareAndSectionThicknessInputs();
      });
    });
  });
  describe('When the output labware type set to FATAL WASTE CONTAINER', () => {
    it('displays Number of labware', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.FETAL_WASTE_CONTAINER);
      });
      waitFor(() => {
        expect(screen.getByTestId('Number of Labware')).toBeVisible();
        expect(screen.queryByTestId('formInput')).toBeNull();
        expect(screen.queryByTestId('slide-costing')).toBeNull();
        expect(screen.queryByTestId('Number of Labware')).toBeNull();
      });
    });
  });
  describe('When the output labware type set to XENIUM', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.XENIUM);
    });
    it('displays Number of labware, Sectioning Thickness, LOT number and Slide Costing', () => {
      waitFor(() => {
        expectDisplayNumberOfLabwareSectionThicknessLotNumberAndSlideCosting();
      });
    });
  });
  describe('When the output labware type set to VISIUM LP', () => {
    it('displays Number of labware, Sectioning Thickness, LOT number and Slide Costing', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.VISIUM_LP);
      });
      waitFor(() => {
        expectDisplayNumberOfLabwareSectionThicknessLotNumberAndSlideCosting();
      });
    });
  });
  describe('When the output labware type set to VISIUM TO', () => {
    it('displays Number of labware, Sectioning Thickness, LOT number and Slide Costing', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.VISIUM_TO);
      });
      waitFor(() => {
        expectDisplayNumberOfLabwareSectionThicknessLotNumberAndSlideCosting();
      });
    });
  });

  describe('When the output labware type set to VISIUM ADH', () => {
    it('displays Number of labware, Sectioning Thickness, LOT number and Slide Costing', () => {
      act(() => {
        renderLabwarePlan(LabwareTypeName.VISIUM_ADH);
      });
      waitFor(() => {
        expectDisplayNumberOfLabwareSectionThicknessLotNumberAndSlideCosting();
      });
    });
  });
});
describe('When the user clicks on Delete Layout', () => {
  it('removes all the planner fields', () => {
    renderLabwarePlan(LabwareTypeName.TUBE);
    waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Delete Layout' }));
      await waitForElementToBeRemoved(() => screen.getByRole('button', { name: 'Create Labware' }));
    });
  });
});
describe('When all the fields are correctly field', () => {
  it('activates Create Labware button', () => {
    act(() => {
      renderLabwarePlan(LabwareTypeName.TUBE);
      const machine = createLabwarePlanMachine(
        buildInitialLayoutPlan(
          [buildLabware(LabwareTypeName.TUBE)],
          sampleColors,
          buildLabware(LabwareTypeName.TUBE, 'STAN-124')
        )
      );
      const service = interpret(machine).start();
      service.send({ type: 'EDIT_LAYOUT' });
    });
    waitFor(async () => {
      await userEvent.type(screen.getByTestId('Section Thickness'), '1');
      expect(screen.getByRole('button', { name: 'Create Labware' })).toBeEnabled();
    });
  });
});
describe('Fields validations', () => {
  describe('when Section Thickness is invalid', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.TUBE);
    });
    it('renders section thickness error message', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByTestId('Section Thickness'));
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(screen.getByText('sectionThickness must be greater than or equal to 1')).toBeVisible();
      });
    });
  });
  describe('when slide costing is not set', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.TUBE);
    });
    it('renders slide costing error message', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByTestId('slide-costing'));
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(screen.getByText('Slide costing is a required field')).toBeVisible();
      });
    });
  });
  describe('when Number of Labware is invalid', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.TUBE);
    });
    it('renders number of labbware error message', () => {
      waitFor(async () => {
        await userEvent.clear(screen.getByTestId('Number of Labware'));
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(screen.getByText('quantity is a required field')).toBeVisible();
      });
    });
  });

  describe('when lot number is invalid', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.TUBE);
    });
    it('renders lot number error message', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByTestId('formInput'));
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(screen.getByText('lotNumber is a required field')).toBeVisible();
      });
    });
  });

  describe('when section thickness is invalid', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.TUBE);
    });
    it('renders section thickness error message', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByTestId('Section Thickness'));
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(screen.getByText('sectionThickness must be greater than or equal to 1')).toBeVisible();
      });
    });
  });

  describe('when barcode is not set', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.XENIUM);
    });
    it('renders barcode error message', () => {
      waitFor(async () => {
        await userEvent.click(screen.getByTestId('Barcode'));
        await userEvent.click(screen.getByTestId('Section Thickness'));
        expect(screen.getByText('barcode is a required field')).toBeVisible();
      });
    });
  });
  describe('when XENIUM labware type is selected', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.XENIUM);
    });
    it('validates lotNumber to digit, hyphen, 4 digits, letter', () => {
      waitFor(async () => {
        await userEvent.type(screen.getByTestId('formInput'), '12345566');
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(
          screen.getByText('Slide lot number should be in format: Digit, hyphen, 4 digits, uppercase letter')
        ).toBeVisible();
      });
    });
    it('validates Barcode to 7 digit number', () => {
      waitFor(async () => {
        await userEvent.type(screen.getByTestId('Barcode'), '1');
        await userEvent.click(screen.getByTestId('formInput'));
        expect(screen.getByText('Xenium barcode should be a 7-digit number')).toBeVisible();
      });
    });
  });
  describe('when VISIUM labware type is selected', () => {
    beforeEach(() => {
      renderLabwarePlan(LabwareTypeName.VISIUM_LP);
    });
    it('validates lotNumber to 6-7 digits', () => {
      waitFor(async () => {
        await userEvent.type(screen.getByTestId('formInput'), '12');
        await userEvent.click(screen.getByTestId('Barcode'));
        expect(screen.getByText('Slide lot number should be a 6-7 digits number')).toBeVisible();
      });
    });
    it('validates Barcode to at least 14 characters', () => {
      waitFor(async () => {
        await userEvent.type(screen.getByTestId('Barcode'), '1');
        await userEvent.click(screen.getByTestId('formInput'));
        expect(screen.getByText('barcode must be at least 14 characters')).toBeVisible();
      });
    });
  });
});
const expectDisplayNumberOfLabwareAndSectionThicknessInputs = () => {
  expect(screen.getByTestId('Number of Labware')).toBeVisible();
  expect(screen.getByTestId('Section Thickness')).toBeVisible();
  expect(screen.queryByTestId('formInput')).toBeNull();
  expect(screen.queryByTestId('slide-costing')).toBeNull();
};

const expectDisplayNumberOfLabwareSectionThicknessLotNumberAndSlideCosting = () => {
  expect(screen.getByTestId('formInput')).toBeVisible();
  expect(screen.getByTestId('Number of Labware')).toBeVisible();
  expect(screen.getByTestId('Barcode')).toBeVisible();
  expect(screen.getByTestId('Section Thickness')).toBeVisible();
};

const renderLabwarePlan = (outputLabwareType: string) => {
  return render(
    <div>
      <LabwarePlan
        key="labwarePlan"
        cid="labwarePlan"
        outputLabware={buildLabware(outputLabwareType, 'STAN-124')}
        sampleColors={sampleColors}
        operationType={'Section'}
        sourceLabware={[buildLabware(LabwareTypeName.TUBE)]}
        onDeleteButtonClick={jest.fn()}
        onComplete={jest.fn()}
      />
    </div>
  );
};

const sampleColors = new Map([
  [7797, 'red'],
  [7798, 'green'],
  [7799, 'indigo'],
  [7800, 'pink'],
  [7801, 'blue'],
  [7802, 'purple'],
  [7803, 'red'],
  [7804, 'green']
]);

const buildLabware = (labwareTypeName: string, barcode = 'STAN-123') => {
  return labwareFactory.build({ labwareType: labwareType(labwareTypeName), barcode });
};

const labwareType = (labwareTypeName: string): LabwareType | undefined => {
  return labwareTypeInstances.find((lt) => lt.name === labwareTypeName);
};
