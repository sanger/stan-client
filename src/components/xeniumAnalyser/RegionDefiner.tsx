import React, { useCallback, useRef } from 'react';
import Labware from '../labwarePerSection/Labware';
import { FormikErrors, useFormikContext } from 'formik';
import { GridDirection, REGION_BORDER_COLORS } from '../../lib/helpers';
import Heading from '../Heading';
import {
  AnalyserLabwareForm,
  Region,
  reIndexAndRenameRegions,
  XeniumAnalyserFormValues
} from '../../pages/XeniumAnalyser';
import { LabwareImperativeRef } from '../labware/Labware';
import warningToast from '../notifications/WarningToast';
import { toast } from 'react-toastify';
import { PlannedSectionDetails } from '../../lib/machines/layout/layoutContext';

type RegionDefinerProps = {
  labwareIndex: number;
};

function isLabwareErrorObject(err: unknown): err is FormikErrors<AnalyserLabwareForm> {
  return typeof err === 'object' && err !== null;
}

const RegionDefiner = ({ labwareIndex }: RegionDefinerProps) => {
  const { values, errors, setFieldValue, setFieldError, setValues } = useFormikContext<XeniumAnalyserFormValues>();

  const analyserLabware = values.labware[labwareIndex];

  const labwareRef = useRef<LabwareImperativeRef>();
  const deselectLabwareSlots = React.useCallback(() => {
    labwareRef.current?.deselectAll();
  }, [labwareRef]);

  const handleWarning = useCallback(
    (warningMessage: string, fieldName: string) => {
      warningToast({
        message: warningMessage,
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 7000
      });
      deselectLabwareSlots();
      setFieldError(fieldName, undefined);
    },
    [deselectLabwareSlots, setFieldError]
  );

  React.useEffect(() => {
    const labwareError = errors.labware?.[labwareIndex];

    if (!isLabwareErrorObject(labwareError)) return;

    if (labwareError.selectedRegionColorIndex) {
      handleWarning(labwareError.selectedRegionColorIndex, `labware[${labwareIndex}].selectedRegionColorIndex`);
    }

    if (labwareError.selectedAddresses) {
      handleWarning(labwareError.selectedAddresses, `labware[${labwareIndex}].selectedAddresses`);
    }
  }, [errors.labware, handleWarning, labwareIndex]);

  const setRegion = async (runName: string, sgpNumber: string) => {
    // ----------------------------------
    // Validate inputs
    // ----------------------------------
    const selectedRegionColorIndex = analyserLabware.selectedRegionColorIndex;

    if (selectedRegionColorIndex === undefined) {
      setFieldError(
        `labware[${labwareIndex}].selectedRegionColorIndex`,
        'Please select a region color before creating a region.'
      );
      return;
    }

    if (!analyserLabware.selectedAddresses || analyserLabware.selectedAddresses.size === 0) {
      setFieldError(
        `labware[${labwareIndex}].selectedAddresses`,
        'Please select the slots or sections before creating a region.'
      );
      return;
    }

    // Set of addresses selected by the user
    const selectedAddresses = new Set(analyserLabware.selectedAddresses);

    // ----------------------------------
    // Working collections
    // ----------------------------------

    // Stores all regions that will remain after extraction
    const regions: Region[] = [];

    // Stores all sections that will form the new region
    const newRegionSections: PlannedSectionDetails[] = [];
    // ----------------------------------
    // Extract selected sections
    // ----------------------------------
    analyserLabware.regions.forEach((region) => {
      // Sections that stay in this region
      const remaining: PlannedSectionDetails[] = [];

      region.sectionGroups.forEach((section) => {
        const moveToNewRegion = Array.from(section.addresses).some((addr) => selectedAddresses.has(addr));

        if (moveToNewRegion) {
          newRegionSections.push(section);
        } else {
          remaining.push(section);
        }
      });

      if (remaining.length) {
        /*
          If the user selected the same color as this region,
          and only some sections remain, we split those remaining
          sections into individual single-section regions.

          This prevents color collisions and preserves uniqueness.
        */
        if (region.colorIndexNumber === selectedRegionColorIndex) {
          remaining.forEach((section) => {
            regions.push({
              ...region,
              sectionGroups: [section],
              colorIndexNumber: undefined
            });
          });
        } else {
          // Normal case: keep region with its remaining sections
          regions.push({
            ...region,
            sectionGroups: remaining
          });
        }
      }
    });
    // ----------------------------------
    // Validation: must combine at least two sections
    // ----------------------------------

    if (newRegionSections.length < 2) {
      setFieldError(
        `labware[${labwareIndex}].selectedAddresses`,
        'Please select two or more slots or sections to combine into a single region.'
      );
      return;
    }

    // ----------------------------------
    // Insert newly created region
    // ----------------------------------

    regions.push({
      roi: '',
      sectionGroups: newRegionSections,
      colorIndexNumber: selectedRegionColorIndex
    });
    // ----------------------------------
    // Update formik values after renaming and re-indexing regions
    // ----------------------------------
    await setValues((prev) => ({
      ...prev,
      labware: prev.labware.map((labware, index) =>
        index === labwareIndex
          ? {
              ...labware,
              selectedAddresses: undefined,
              selectedRegionColorIndex: undefined,
              regions: reIndexAndRenameRegions(regions, runName, sgpNumber)
            }
          : labware
      )
    }));

    deselectLabwareSlots();
  };

  /**
   * Removes the region associated with the currently selected color.
   *
   * Behavior:
   * - Finds the region whose colorIndexNumber matches the selected color.
   * - Deletes that region.
   * - Converts each of its sections into its own standalone single-section region.
   * - Re-indexes and renames all remaining regions.
   * - Clears the selected region color in form state.
   *
   * Validation:
   * - A region color must be selected.
   * - The selected color must correspond to an existing region.
   */
  const removeRegion = async () => {
    const selectedRegionColorIndex = analyserLabware.selectedRegionColorIndex;
    // ----------------------------------
    // Validate selected color
    // ----------------------------------
    if (selectedRegionColorIndex === undefined) {
      setFieldError(
        `labware[${labwareIndex}].selectedRegionColorIndex`,
        'Please select a region color before removing a region.'
      );
      return;
    }
    // ----------------------------------
    // Locate region to remove
    // ----------------------------------
    const regionToRemove = analyserLabware.regions.find(
      (region) => region.colorIndexNumber === selectedRegionColorIndex
    );
    if (!regionToRemove) {
      setFieldError(
        `labware[${labwareIndex}].selectedRegionColorIndex`,
        'The selected region color does not correspond to any existing region.'
      );
      return;
    }
    // ----------------------------------
    // Build new region list
    // ----------------------------------
    let remainingRegions = analyserLabware.regions.filter(
      (region) => region.colorIndexNumber !== selectedRegionColorIndex
    );
    const splitSectionsIntoRegions: Region[] = regionToRemove.sectionGroups.map((section) => ({
      roi: '',
      colorIndexNumber: undefined,
      sectionGroups: [section]
    }));
    await setValues((prev) => ({
      ...prev,
      labware: prev.labware.map((labware, index) =>
        index === labwareIndex
          ? {
              ...labware,
              selectedRegionColorIndex: undefined,
              regions: reIndexAndRenameRegions(
                [...remainingRegions, ...splitSectionsIntoRegions],
                values.runName,
                labware.workNumber
              )
            }
          : labware
      )
    }));
  };

  return (
    <div>
      <Heading level={3}>Set Regions</Heading>
      <p className="my-2 text-gray-900 text-xs leading-normal">
        Hold 'Ctrl' (Cmd for Mac) key to select the slots and sections you want to group into a single region, then
        click a region color to create it.
      </p>
      <p className="my-2 text-gray-900 text-xs leading-normal">
        To remove a region, select the region color that you would like to remove and click 'Remove region'.
      </p>
      <div className="grid grid-cols-2">
        <div className="grid grid-cols-11">
          {REGION_BORDER_COLORS.map((borderColor, index) => {
            const highlightClass =
              analyserLabware.selectedRegionColorIndex === index ? `ring-3 ring-offset-2 ring-gray-700` : '';
            return (
              <div
                key={`region-color-${index}`}
                data-testid={`region-color-${index}`}
                className={`h-5 w-5 rounded-full border-2 lg bg-blue-100 ${borderColor} ${highlightClass}`}
                onClick={async () => {
                  await setFieldValue(`labware[${labwareIndex}].selectedRegionColorIndex`, index);
                }}
              ></div>
            );
          })}
        </div>
        <div className="text-xs font-medium flex flex-row-reverse cursor-pointer">
          <span
            data-testid="remove-region-button"
            onClick={removeRegion}
            className="p-2 shadow-xs  text-red-700 underline hover:bg-gray-100 focus:border-sdb-400 focus:shadow-md-outline-sdb active:bg-gray-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          >
            Remove Region
          </span>
          <span
            data-testid="create-update-region-button"
            onClick={() => setRegion(values.runName, analyserLabware.workNumber)}
            className="p-2 shadow-xs  text-red-700 underline hover:bg-gray-100 focus:border-sdb-400 focus:shadow-md-outline-sdb active:bg-gray-200 rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2"
          >
            Create/Update Region
          </span>
        </div>
      </div>
      <div className="my-6 md:flex md:flex-row md:items-centre md:justify-around">
        <div data-testid="labware-region-definer-container">
          <Labware
            labwareRefCallback={(el: LabwareImperativeRef) => {
              if (el) {
                labwareRef.current = el;
              }
            }}
            gridDirection={GridDirection.LeftUp}
            labware={analyserLabware.labware}
            selectionMode={'multi'}
            selectable={'non_empty'}
            onSelect={async (addresses) => {
              if (addresses.length > 0) {
                await setFieldValue(`labware[${labwareIndex}].selectedAddresses`, addresses);
              }
            }}
            regions={analyserLabware.regions}
          />
        </div>
      </div>
    </div>
  );
};

export default RegionDefiner;
