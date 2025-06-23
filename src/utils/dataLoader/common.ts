import { DataFile as WiseDataFile, availableWiseDataFiles } from './wise';
import { BnDataFile, availableBnDataFiles } from './bnBank';

export type DataFile = WiseDataFile | BnDataFile;

export const availableDataFiles: DataFile[] = [
  ...availableWiseDataFiles,
  ...availableBnDataFiles,
].sort((a, b) => {
  if (a.year !== b.year) return b.year - a.year;
  return b.month - a.month;
});
