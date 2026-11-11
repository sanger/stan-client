import React from 'react';
import { useFormikContext } from 'formik';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import FormikInput from '../forms/Input';
import { RegionDefinerFormValues } from './analyser.types';

type RegionsTableProps = {
  labwareIndex: number;
  /** Called with the trimmed region name when a region name field loses focus and is not empty */
  onRoiBlur: (roi: string) => Promise<void>;
};

const RegionsTable = ({ labwareIndex, onRoiBlur }: RegionsTableProps) => {
  const { values, handleBlur } = useFormikContext<RegionDefinerFormValues>();
  const analyserLabware = values.labware[labwareIndex];

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeader>Region</TableHeader>
          <TableHeader>External Id</TableHeader>
          <TableHeader>Section Number</TableHeader>
          <TableHeader>Address(es)</TableHeader>
        </tr>
      </TableHead>
      <TableBody>
        {analyserLabware.regions.map((region, regionIndex) => (
          <tr key={`region-row-${regionIndex}`}>
            <TableCell className="break-words align-top">
              <div className="grid grid-cols-1">
                <FormikInput
                  label={''}
                  type="textarea"
                  as="textarea"
                  data-testid={`${analyserLabware.labware.barcode}-${regionIndex}-roi`}
                  name={`labware[${labwareIndex}].regions[${regionIndex}].roi`}
                  //Replaces Formik's onBlur, so that leaving the field calls onRoiBlur (the page shows the region barcode pop-up).
                  //Formik's handleBlur is still called first, so the field is marked touched and its validation error shows.
                  onBlur={async (e: React.ChangeEvent<HTMLInputElement>) => {
                    handleBlur(e);
                    const roi = e.target.value.trim();
                    if (roi.length !== 0) {
                      await onRoiBlur(roi);
                    }
                  }}
                />
              </div>
            </TableCell>
            <TableCell className="break-words align-top">
              <div className="grid grid-cols-1">
                {region.sectionGroups.map((section, index) => {
                  return (
                    <label className="py-1" key={`externalName-${index}`}>
                      {section.source.tissue?.externalName}
                    </label>
                  );
                })}
              </div>
            </TableCell>
            <TableCell className="break-words align-top">
              <div className="grid grid-cols-1">
                {region.sectionGroups.map((section, index) => {
                  return (
                    <label className="py-1" key={`section-${index}`}>
                      {section.source.newSection}
                    </label>
                  );
                })}
              </div>
            </TableCell>
            <TableCell>
              <div className="grid grid-cols-1 text-wrap">
                {region.sectionGroups.map((section, index) => {
                  return (
                    <label className="py-1" key={`addresses-${index}`}>
                      {Array.from(section.addresses).join(', ')}
                    </label>
                  );
                })}
              </div>
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
};

export default RegionsTable;
