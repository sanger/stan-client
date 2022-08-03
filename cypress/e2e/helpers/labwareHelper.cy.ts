import * as labwareHelper from '../../../src/lib/helpers/labwareHelper';
import labwareFactory from '../../../src/lib/factories/labwareFactory';
import { LabwareState } from '../../../src/types/sdk';

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
  });
});
