import * as labwareHelper from '../../../src/lib/helpers/labwareHelper';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { LabwareState } from '../../../src/types/sdk';
import { buildAddresses, GridDirection } from '../../../src/lib/helpers';

describe('Labware Helper', () => {
  describe('#isLabwareUsable', () => {
    context('when labware state is empty or active', () => {
      it('returns true', () => {
        [LabwareState.Empty, LabwareState.Active].forEach((labwareState) => {
          expect(labwareHelper.isLabwareUsable(labwareFactory.build({ state: labwareState }))).to.eq(true);
        });
      });
    });

    context('when labware state is not empty or active', () => {
      it('returns false', () => {
        [LabwareState.Destroyed, LabwareState.Discarded, LabwareState.Released].forEach((labwareState) => {
          expect(labwareHelper.isLabwareUsable(labwareFactory.build({ state: labwareState }))).to.eq(false);
        });
      });
    });

    context('Build address with different grid direction', () => {
      describe('When grid direction is set to RightDown', () => {
        it('returns the correct address', () => {
          const addresses = buildAddresses({ numRows: 2, numColumns: 2 }, GridDirection.RightDown);
          expect(addresses).to.deep.eq(['A1', 'A2', 'B1', 'B2']);
        });
      });
      describe('When grid direction is set to DownRight', () => {
        it('returns the correct address', () => {
          const addresses = buildAddresses({ numRows: 2, numColumns: 2 }, GridDirection.DownRight);
          expect(addresses).to.deep.eq(['A1', 'B1', 'A2', 'B2']);
        });
      });
      describe('When grid direction is set to RightUp', () => {
        it('returns the correct address', () => {
          const addresses = buildAddresses({ numRows: 2, numColumns: 2 }, GridDirection.RightUp);
          expect(addresses).to.deep.eq(['B1', 'B2', 'A1', 'A2']);
        });
      });
      describe('When grid direction is set to LeftUp', () => {
        it('returns the correct address', () => {
          const addresses = buildAddresses({ numRows: 2, numColumns: 2 }, GridDirection.LeftUp);
          expect(addresses).to.deep.eq(['B2', 'B1', 'A2', 'A1']);
        });
      });
    });
  });
});
