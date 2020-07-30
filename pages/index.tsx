import { useState, useRef, useCallback } from "react";
import Head from "next/head";
import styled from "@emotion/styled";
import { useImmer } from "use-immer";
import mexp from "math-expression-evaluator";

import Cell from "@/components/Cell";
import useOutsideClickListener from "@/utils/useOutsideClickListener";
import {
  extractValuesArray,
  extractOperatorsArray,
  splitBetweenNumbers,
} from "@/utils/functions";
import { generateSpreadSheetState } from "@/utils/mockData";

const Table = styled.table`
  table-layout: fixed;
  border-collapse: collapse;
  font-family: sans-serif;
`;

export const getStaticProps = () => {
  return {
    props: {
      spreadSheetState: generateSpreadSheetState,
    },
  };
};

export default function Home({ spreadSheetState }) {
  const containerRef = useRef();
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentlyEditing, setCurrentlyEditing] = useState(null);

  useOutsideClickListener(containerRef, () => {
    setCurrentlyEditing(null);
    setSelectedCell(null);
  });

  const [state, setState] = useImmer<
    {
      value: string | number;
      isReadOnly?: boolean;
      formula?: string;
    }[][]
  >(spreadSheetState);

  const handleCellClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      setSelectedCell(
        !state[rowIndex][colIndex].isReadOnly ? `${rowIndex}-${colIndex}` : null
      );
    },
    [setSelectedCell, state]
  );

  const handleCellDoubleClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      setCurrentlyEditing(
        !state[rowIndex][colIndex].isReadOnly ? `${rowIndex}-${colIndex}` : null
      );
    },
    [setCurrentlyEditing, state]
  );

  const disableEditing = useCallback(() => setCurrentlyEditing(null), []);

  const handleCommitValue = useCallback(
    (newVal: string | number, rowIndex: number, colIndex: number) => {
      setState((draft) => {
        if (typeof newVal === "string" && newVal.startsWith("=")) {
          draft[rowIndex][colIndex].formula = newVal;

          const valuesArr = extractValuesArray(newVal);

          const operatorsArr = extractOperatorsArray(newVal);

          try {
            const newVals = valuesArr.map((val) => {
              if (!isNaN(Number(val))) {
                return val;
              }

              const splittedValArr = splitBetweenNumbers(val);
              if (splittedValArr.length > 2) {
                throw new Error("INVALID EXPRESSION");
              }

              const columnI = splittedValArr[0]
                .split("")
                .reduce((acc, curr, i) => {
                  // A is char 65, subtracts 64 so A is 1
                  const alphabeticCharCode = curr.charCodeAt(0) - 64;
                  // Check if char is between A-Z
                  if (alphabeticCharCode < 1 || alphabeticCharCode > 26) {
                    throw new Error("INVALID EXPRESSION");
                  } else {
                    acc += alphabeticCharCode + i * 27;
                  }
                  return acc;
                }, 0);

              const rowI = splittedValArr[1];

              return draft[rowI][columnI].value;
            });

            const operation = newVals.reduce((acc, curr, i) => {
              acc += `${operatorsArr[i]}${curr}`;
              return acc;
            }, "");

            draft[rowIndex][colIndex].value = mexp.eval(operation);
          } catch {
            draft[rowIndex][colIndex].value = "INVALID EXPRESSION";
          }
        } else {
          draft[rowIndex][colIndex].value = newVal;
        }
      });
    },
    [setState]
  );

  return (
    <div className="container" ref={containerRef}>
      <Head>
        <title>Spreadsheet</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <p>Double click to edit a cell</p>
      <p>Formulas should begin with &quot;=&quot;</p>
      <p>Example: &quot;=A1 + B2 - 100&quot;</p>

      <Table>
        <tbody>
          {state.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, colIndex) => (
                <Cell
                  key={`cell-${rowIndex}-${colIndex}`}
                  isReadOnly={cell.isReadOnly}
                  colIndex={colIndex}
                  rowIndex={rowIndex}
                  handleCellClick={handleCellClick}
                  handleCellDoubleClick={handleCellDoubleClick}
                  isCurrentlyEditing={
                    currentlyEditing === `${rowIndex}-${colIndex}`
                  }
                  disableEditing={disableEditing}
                  cell={cell}
                  isSelected={selectedCell === `${rowIndex}-${colIndex}`}
                  onCommitValue={handleCommitValue}
                  state={state}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
