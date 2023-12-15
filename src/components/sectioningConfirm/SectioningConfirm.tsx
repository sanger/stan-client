import React, { useCallback, useEffect } from 'react';
import { PlanFinder } from '../planFinder/PlanFinder';
import Heading from '../Heading';
import columns from '../dataTableColumns/labwareColumns';
import { LabwareTypeName } from '../../types/stan';
import ConfirmTubes from './ConfirmTubes';
import ConfirmLabware from './ConfirmLabware';
import PinkButton from '../buttons/PinkButton';
import {
  CommentFieldsFragment,
  ConfirmSectionLabware,
  FindPlanDataQuery,
  LabwareFieldsFragment,
  LabwareFlaggedFieldsFragment,
  SlotRegionFieldsFragment
} from '../../types/sdk';
import { useMachine } from '@xstate/react';
import { createSectioningConfirmMachine } from './sectioningConfirm.machine';
import Warning from '../notifications/Warning';
import WorkNumberSelect from '../WorkNumberSelect';
import RadioGroup, { RadioButtonInput } from '../forms/RadioGroup';
import { objectKeys } from '../../lib/helpers';
import { LayoutPlan } from '../../lib/machines/layout/layoutContext';
import { Column } from 'react-table';
import { extractLabwareFromFlagged } from '../../lib/helpers/labwareHelper';
import DataTable from '../DataTable';

type SectioningConfirmProps = {
  /**
   * The list of comments that will be available for the user to choose for each section
   */
  comments: Array<CommentFieldsFragment>;

  /**
   * The list of regions in slot taht will be available for the user to choose for each section.
   * Region is to specify where the user is keeping the section of a sample in a slot, if there are multiple samples(/sections)
   */
  slotRegions: Array<SlotRegionFieldsFragment>;

  /**
   * The initial list of plans
   */
  initialPlans: Array<FindPlanDataQuery>;

  /**
   * Callback when sections have been successfully confirmed,with created labwares as parameter
   */
  onConfirmed: (labwares?: Array<LabwareFieldsFragment>) => void;
};

export enum SectionNumberMode {
  Auto = 'Auto',
  Manual = 'Manual'
}

/**
 * Component for managing the confirmation of a list of Sectioning Plans.
 * Responsible for calling core with the {@code confirmSection} request.
 */
export default function SectioningConfirm({
  comments,
  slotRegions,
  initialPlans,
  onConfirmed
}: SectioningConfirmProps) {
  const sectioningMachine = React.useMemo(() => {
    return createSectioningConfirmMachine();
  }, []);
  const [current, send, service] = useMachine(sectioningMachine);

  const { sourceLabware, layoutPlansByLabwareType, requestError, confirmSectionResultLabwares, sectionNumberMode } =
    current.context;

  /**
   * Call the {@code onConfirmed} callback when machine reaches the {@code confirmed} state
   */
  useEffect(() => {
    const subscription = service.subscribe((state) => {
      if (state.matches('confirmed')) {
        const sources = extractLabwareFromFlagged(sourceLabware);
        onConfirmed([...confirmSectionResultLabwares, ...sources]);
      }
    });
    return subscription.unsubscribe;
  }, [service, onConfirmed, confirmSectionResultLabwares, sourceLabware]);

  /**
   * Callback for when the work number select changes
   */
  const handleWorkNumberChange = useCallback(
    (workNumber: string) => {
      send({ type: 'UPDATE_WORK_NUMBER', workNumber });
    },
    [send]
  );

  /**
   * Callback for when the {@link PlanFinder} updates its list of plans
   */
  const handlePlanChange = useCallback(
    (plans: Array<FindPlanDataQuery>) => {
      console.log('handlePlanChange', plans);
      send({ type: 'UPDATE_PLANS', plans });
    },
    [send]
  );

  /**
   * Callback for when a {@link ConfirmLabware} or {@link ConfirmTubes} updates
   * e.g. sections are added, comments are made against sections
   */
  const handleConfirmChange = useCallback(
    (confirmSectionLabware: ConfirmSectionLabware) => {
      send({
        type: 'UPDATE_CONFIRM_SECTION_LABWARE',
        confirmSectionLabware
      });
    },
    [send]
  );

  /**
   * Callback for new section layout changes
   */
  const handleSectionUpdate = useCallback(
    (layoutPlan: LayoutPlan) => {
      send({ type: 'UPDATE_SECTION_LAYOUT', layoutPlan });
    },
    [send]
  );

  /**
   * Callback to handle change in section numbering mode
   */
  const handleSectionNumberingModeChange = useCallback(
    (mode: SectionNumberMode) => {
      send({ type: 'UPDATE_SECTION_NUMBERING_MODE', mode });
    },
    [send]
  );

  const handleSectionNumberChange = useCallback(
    (layoutPlan: LayoutPlan, slotAddress: string, sectionIndex: number, sectionNumber: number) => {
      send({
        type: 'UPDATE_SECTION_NUMBER',
        layoutPlan,
        slotAddress,
        sectionIndex,
        sectionNumber
      });
    },
    [send]
  );

  const sectionNumberEnabled = () => {
    return (
      Object.entries(layoutPlansByLabwareType).filter(
        ([labwareTypeName, _]) => labwareTypeName !== LabwareTypeName.FETAL_WASTE_CONTAINER
      ).length !== 0
    );
  };
  return (
    <div className="my-4 mx-auto max-w-screen-xl space-y-12">
      <div>
        <Heading level={3}>SGP Number</Heading>
        <p className="mt-2">Select an SGP number to associate with this confirmation.</p>
        <div className="mt-4 md:w-1/2">
          <WorkNumberSelect onWorkNumberChange={handleWorkNumberChange} />
        </div>
      </div>

      <div>
        <Heading level={3}>Find Plans</Heading>

        <p className="mt-2">Find sectioning plans for labware by scanning the labware barcode into the input below:</p>

        <div className="mt-4">
          <PlanFinder initialPlans={initialPlans} onChange={handlePlanChange}>
            {({ removePlanByBarcode }) => (
              <div className="mt-8 space-y-12">
                {Object.keys(layoutPlansByLabwareType).length > 0 && (
                  <>
                    <div className="space-y-4">
                      <Heading level={3}>Source Labware</Heading>
                      <DataTable
                        columns={[
                          columns.flaggedBarcode(),
                          columns.highestSectionForSlot('A1') as Column<LabwareFlaggedFieldsFragment>
                        ]}
                        data={sourceLabware}
                      />
                    </div>

                    <div className={'sm:justify-between'}>
                      <Heading level={3}>Section Numbering</Heading>
                      <RadioGroup label="Select mode" name={'sectionNumber'} withFormik={false}>
                        {objectKeys(SectionNumberMode).map((key) => {
                          return (
                            <RadioButtonInput
                              key={key}
                              name={'sectionNumber'}
                              value={SectionNumberMode[key]}
                              checked={sectionNumberEnabled() && sectionNumberMode === SectionNumberMode[key]}
                              onChange={() => handleSectionNumberingModeChange(SectionNumberMode[key])}
                              label={SectionNumberMode[key]}
                              disabled={!sectionNumberEnabled()}
                            />
                          );
                        })}
                      </RadioGroup>
                    </div>
                  </>
                )}
                <div className="space-y-4">
                  {/* Always show fetal waste first (if there are any) */}
                  {layoutPlansByLabwareType?.[LabwareTypeName.FETAL_WASTE_CONTAINER] && (
                    <div key={LabwareTypeName.FETAL_WASTE_CONTAINER} className="space-y-4">
                      <Heading level={3}>{LabwareTypeName.FETAL_WASTE_CONTAINER}</Heading>
                      {layoutPlansByLabwareType?.[LabwareTypeName.FETAL_WASTE_CONTAINER].map((layoutPlan) => (
                        <ConfirmLabware
                          onChange={handleConfirmChange}
                          removePlan={removePlanByBarcode}
                          key={layoutPlan.destinationLabware.barcode}
                          originalLayoutPlan={layoutPlan}
                          comments={comments}
                          slotRegions={slotRegions}
                          mode={sectionNumberMode}
                          sectionNumberEnabled={false}
                        />
                      ))}
                    </div>
                  )}

                  {/* Always show tubes first (if there are any) */}
                  {layoutPlansByLabwareType?.[LabwareTypeName.TUBE] && (
                    <div key={LabwareTypeName.TUBE} className="space-y-4">
                      <Heading level={3}>{LabwareTypeName.TUBE}</Heading>
                      <ConfirmTubes
                        onChange={handleConfirmChange}
                        onSectionUpdate={handleSectionUpdate}
                        onSectionNumberChange={handleSectionNumberChange}
                        layoutPlans={layoutPlansByLabwareType[LabwareTypeName.TUBE]}
                        comments={comments}
                        mode={sectionNumberMode}
                      />
                    </div>
                  )}

                  {/* Filter out tubes as they've been shown above */}
                  {Object.entries(layoutPlansByLabwareType)
                    .filter(
                      ([labwareTypeName, _]) =>
                        labwareTypeName !== LabwareTypeName.TUBE &&
                        labwareTypeName !== LabwareTypeName.FETAL_WASTE_CONTAINER
                    )
                    .map(([labwareTypeName, lps]) => {
                      return (
                        <div key={labwareTypeName} className="space-y-4">
                          <Heading level={3}>{labwareTypeName}</Heading>

                          {lps.map((layoutPlan) => (
                            <ConfirmLabware
                              onChange={handleConfirmChange}
                              onSectionUpdate={handleSectionUpdate}
                              removePlan={removePlanByBarcode}
                              key={layoutPlan.destinationLabware.barcode}
                              originalLayoutPlan={layoutPlan}
                              comments={comments}
                              slotRegions={slotRegions}
                              mode={sectionNumberMode}
                              onSectionNumberChange={handleSectionNumberChange}
                            />
                          ))}
                        </div>
                      );
                    })}
                  {requestError && (
                    <div>
                      <Warning
                        error={requestError}
                        message={'There was an error confirming the Sectioning operation'}
                      />
                    </div>
                  )}

                  {Object.keys(layoutPlansByLabwareType).length > 0 && (
                    <div className="flex flex-row items-center justify-end">
                      <PinkButton
                        disabled={!current.matches({ ready: 'valid' })}
                        onClick={() => send('CONFIRM')}
                        action="primary"
                      >
                        Save
                      </PinkButton>
                    </div>
                  )}
                </div>
              </div>
            )}
          </PlanFinder>
        </div>
      </div>
    </div>
  );
}
