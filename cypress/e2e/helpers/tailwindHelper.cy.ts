import * as twHelper from '../../../src/lib/helpers/tailwindHelper';

describe('TailwindCSS Helper', () => {
  describe('#brightenColor', () => {
    it('changes a tailwind color to a brighter variant', () => {
      expect(twHelper.brightenColor('bg-red-300')).to.eq('bg-red-400');
      expect(twHelper.brightenColor('bg-red-100')).to.eq('bg-red-200');
      expect(twHelper.brightenColor('bg-red-800')).to.eq('bg-red-900');
    });

    context('when color is already at max brightness', () => {
      it('returns the same color', () => {
        expect(twHelper.brightenColor('bg-red-900')).to.eq('bg-red-900');
      });
    });

    context('when color is at 50', () => {
      it('returns 100', () => {
        expect(twHelper.brightenColor('bg-red-50')).to.eq('bg-red-100');
      });
    });
  });

  describe('#darkenColor', () => {
    it('changes a tailwind color to a darker variant', () => {
      expect(twHelper.darkenColor('bg-red-300')).to.eq('bg-red-200');
      expect(twHelper.darkenColor('bg-red-200')).to.eq('bg-red-100');
      expect(twHelper.darkenColor('bg-red-800')).to.eq('bg-red-700');
    });

    context('when color is already at min brightness', () => {
      it('returns the same color', () => {
        expect(twHelper.darkenColor('bg-red-100')).to.eq('bg-red-100');
        expect(twHelper.darkenColor('bg-grey-50')).to.eq('bg-grey-50');
      });
    });
  });
});
