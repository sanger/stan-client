import labwareFactory from "../../../src/lib/factories/labwareFactory";
import { sampleFactory } from "../../../src/lib/factories/sampleFactory";
import { formatFindResult } from "../../../src/lib/services/searchService";
import { FindQuery, GridDirection } from "../../../src/types/graphql";
import locationFactory from "../../../src/lib/factories/locationFactory";
import { addressToLocationAddress } from "../../../src/lib/helpers/locationHelper";

describe("Search Service", () => {
  describe("#formatFindResult", () => {
    let findResult: FindQuery["find"];

    const sample10 = sampleFactory.build({ id: 10 });
    const sample11 = sampleFactory.build({ id: 11 });
    const sample12 = sampleFactory.build({ id: 12 });
    const sample13 = sampleFactory.build({ id: 13 });
    const sample14 = sampleFactory.build({ id: 14 });

    const labware1 = labwareFactory.build({ id: 1 });
    const labware2 = labwareFactory.build({ id: 2 });
    const labware3 = labwareFactory.build({ id: 3 });

    const location100 = locationFactory.build({ id: 100 });
    const location102 = locationFactory.build({
      id: 102,
      size: { numRows: 50, numColumns: 2 },
      direction: GridDirection.DownRight,
    });

    findResult = {
      numRecords: 5,
      entries: [
        { labwareId: 1, sampleId: 10 },
        { labwareId: 2, sampleId: 11 },
        { labwareId: 3, sampleId: 12 },
        { labwareId: 2, sampleId: 13 },
        { labwareId: 1, sampleId: 14 },
      ],
      samples: [sample10, sample11, sample12, sample13, sample14],
      labware: [labware1, labware2, labware3],
      locations: [location100, location102],
      labwareLocations: [
        {
          labwareId: 1,
          locationId: 100,
        },
        { labwareId: 3, locationId: 102, address: "40,2" },
      ],
    };

    const expected = [
      {
        barcode: labware1.barcode,
        labwareType: labware1.labwareType.name,
        externalId: sample10.tissue.externalName,
        donorId: sample10.tissue.donor.donorName,
        tissueType: sample10.tissue.spatialLocation.tissueType.name,
        location: {
          barcode: location100.barcode,
          displayName: location100.name,
          address: null,
        },
        sectionNumber: sample10.section,
        replicate: sample10.tissue.replicate,
      },
      {
        barcode: labware2.barcode,
        labwareType: labware2.labwareType.name,
        externalId: sample11.tissue.externalName,
        donorId: sample11.tissue.donor.donorName,
        tissueType: sample11.tissue.spatialLocation.tissueType.name,
        location: null,
        sectionNumber: sample11.section,
        replicate: sample11.tissue.replicate,
      },
      {
        barcode: labware3.barcode,
        labwareType: labware3.labwareType.name,
        externalId: sample12.tissue.externalName,
        donorId: sample12.tissue.donor.donorName,
        tissueType: sample12.tissue.spatialLocation.tissueType.name,
        location: {
          barcode: location102.barcode,
          displayName: location102.name,
          address: addressToLocationAddress(
            "40,2",
            location102.size!,
            location102.direction!
          ),
        },
        sectionNumber: sample12.section,
        replicate: sample12.tissue.replicate,
      },
      {
        barcode: labware2.barcode,
        labwareType: labware2.labwareType.name,
        externalId: sample13.tissue.externalName,
        donorId: sample13.tissue.donor.donorName,
        tissueType: sample13.tissue.spatialLocation.tissueType.name,
        location: null,
        sectionNumber: sample13.section,
        replicate: sample13.tissue.replicate,
      },
      {
        barcode: labware1.barcode,
        labwareType: labware1.labwareType.name,
        externalId: sample14.tissue.externalName,
        donorId: sample14.tissue.donor.donorName,
        tissueType: sample14.tissue.spatialLocation.tissueType.name,
        location: {
          barcode: location100.barcode,
          displayName: location100.name,
          address: location100.address,
        },
        sectionNumber: sample14.section,
        replicate: sample14.tissue.replicate,
      },
    ];

    it("formats FindResult into a SearchResultsType", () => {
      const result = formatFindResult(findResult);
      expect(result).to.deep.equal(expected);
    });
  });
});
