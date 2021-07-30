import { buildOrderedAddresses } from "../../../src/lib/helpers/locationHelper";
import { SizeInput } from "../../../src/types/stan";
import { GridDirection, Size } from "../../../src/types/sdk";
import { buildAddresses } from "../../../src/lib/helpers";

const evenLocationSize: SizeInput = {
  numRows: 3,
  numColumns: 3,
};

const moreColsLocationSize: SizeInput = {
  numRows: 2,
  numColumns: 3,
};

const moreRowsLocationSize: SizeInput = {
  numRows: 3,
  numColumns: 2,
};

function buildResultMap(
  size: SizeInput,
  expectedStanAddresses: Array<number>
): Map<string, number> {
  const sortedStorelightAddresses = buildAddresses(size);
  const resultMap = new Map<string, number>();

  for (let index in expectedStanAddresses) {
    resultMap.set(
      sortedStorelightAddresses[index],
      expectedStanAddresses[index]
    );
  }

  return resultMap;
}

describe("Location Helper", () => {
  describe("#buildOrderedAddresses", () => {
    const tests: Array<[SizeInput, GridDirection, Map<string, number>]> = [
      [
        evenLocationSize,
        GridDirection.RightDown,
        buildResultMap(evenLocationSize, [1, 2, 3, 4, 5, 6, 7, 8, 9]),
      ],
      [
        evenLocationSize,
        GridDirection.DownRight,
        buildResultMap(evenLocationSize, [1, 4, 7, 2, 5, 8, 3, 6, 9]),
      ],
      [
        evenLocationSize,
        GridDirection.RightUp,
        buildResultMap(evenLocationSize, [7, 8, 9, 4, 5, 6, 1, 2, 3]),
      ],
      [
        evenLocationSize,
        GridDirection.UpRight,
        buildResultMap(evenLocationSize, [3, 6, 9, 2, 5, 8, 1, 4, 7]),
      ],
      [
        moreColsLocationSize,
        GridDirection.RightDown,
        buildResultMap(moreColsLocationSize, [1, 2, 3, 4, 5, 6]),
      ],
      [
        moreColsLocationSize,
        GridDirection.DownRight,
        buildResultMap(moreColsLocationSize, [1, 3, 5, 2, 4, 6]),
      ],
      [
        moreColsLocationSize,
        GridDirection.RightUp,
        buildResultMap(moreColsLocationSize, [4, 5, 6, 1, 2, 3]),
      ],
      [
        moreColsLocationSize,
        GridDirection.UpRight,
        buildResultMap(moreColsLocationSize, [2, 4, 6, 1, 3, 5]),
      ],
      [
        moreRowsLocationSize,
        GridDirection.RightDown,
        buildResultMap(moreRowsLocationSize, [1, 2, 3, 4, 5, 6]),
      ],
      [
        moreRowsLocationSize,
        GridDirection.DownRight,
        buildResultMap(moreRowsLocationSize, [1, 4, 2, 5, 3, 6]),
      ],
      [
        moreRowsLocationSize,
        GridDirection.RightUp,
        buildResultMap(moreRowsLocationSize, [5, 6, 3, 4, 1, 2]),
      ],
      [
        moreRowsLocationSize,
        GridDirection.UpRight,
        buildResultMap(moreRowsLocationSize, [3, 6, 2, 5, 1, 4]),
      ],
    ];

    tests.forEach((test) => {
      it(`correctly builds addresses for size ${test[0].numRows},${test[0].numColumns} direction ${test[1]}`, () => {
        console.log(buildOrderedAddresses(test[0], test[1]), test[2]);
        expect(buildOrderedAddresses(test[0], test[1])).to.deep.equal(test[2]);
      });
    });
  });
});
