import fs from 'fs';
import path from 'path';

const fileHasRejectFrozenOnScanner = (relativePath: string): boolean => {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return /<LabwareScanner[\s\S]*?rejectFrozen/.test(content);
};

describe('shared scanner frozen blocking wiring', () => {
  it('Segmentation passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/CellSegmentation/Segmentation.tsx')).toBe(true);
  });

  it('SegmentationQc passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/CellSegmentation/SegmentationQc.tsx')).toBe(true);
  });

  it('Planner passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/planning/Planner.tsx')).toBe(true);
  });

  it('PlanFinder passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/planFinder/PlanFinder.tsx')).toBe(true);
  });

  it('SlotMapper passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/slotMapper/SlotMapper.tsx')).toBe(true);
  });

  it('MultipleLabwareSlotMapper passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/slotMapper/MultipleLabwareSlotMapper.tsx')).toBe(true);
  });

  it('SlotCopyComponent passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/libraryGeneration/SlotCopyComponent.tsx')).toBe(true);
  });

  it('DualIndexPlateComponent passes rejectFrozen', () => {
    expect(fileHasRejectFrozenOnScanner('src/components/libraryGeneration/DualIndexPlateComponent.tsx')).toBe(true);
  });
});
