import { generateColName } from "@/utils/functions";

const rows = Array.from(Array(32).keys());
const cols = Array.from(Array(32).keys());

export const generateSpreadSheetState = rows.map((row) =>
  cols.map((col) => {
    if (col === 0) {
      if (row === 0) {
        return { value: "", isReadOnly: true, watchedBy: [] };
      }
      return { value: row, isReadOnly: true, watchedBy: [] };
    }
    if (row === 0) {
      return {
        value: generateColName(col - 1),
        isReadOnly: true,
        watchedBy: [],
      };
    }
    return {
      value: Math.floor(-1000 + Math.random() * (1000 + 1 - -1000)),
      watchedBy: [],
    };
  })
);
