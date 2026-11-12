import React from 'react';
import { useFormikContext } from 'formik';
import Table, { TableBody, TableCell, TableHead, TableHeader } from '../Table';
import FormikInput from '../forms/Input';
import { RegionDefinerFormValues } from './analyser.types';

type RegionsTableProps = {
  labwareIndex: number;
  /** Called with the region name when a region name field loses focus, unless it is empty or starts or ends with a space */
  onRoiBlur: (roi: string) => Promise<void>;
};

const RegionsTable = ({ labwareIndex, onRoiBlur }: RegionsTableProps) => {
  const { values, handleBlur } = useFormikContext<RegionDefinerFormValues>();
  const analyserLabware = values.labware[labwareIndex];

  return (
    <Table tableClassName="border border-gray-400 rounded-md">
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
                  //Leaving the field does two things: Formik's handleBlur shows the field's validation message,
                  //and our check below prevents showing the region barcode for a name that can't be saved.
                  //Field passes our props after its own, so this onBlur replaces Formik's, and handleBlur is called here.
                  onBlur={async (e: React.ChangeEvent<HTMLInputElement>) => {
                    handleBlur(e);
                    const roi = e.target.value;
                    //Show the region barcode only for a name that can be saved:
                    //not empty, and no space at the start or end (core rejects those)
                    if (roi && roi === roi.trim()) {
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
