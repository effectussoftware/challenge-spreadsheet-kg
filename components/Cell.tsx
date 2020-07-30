import styled from "@emotion/styled";
import { useEffect, useState, useRef, memo } from "react";

interface CellProps {
  handleCellClick: (rowIndex: number, colIndex: number) => void;
  handleCellDoubleClick: (rowIndex: number, colIndex: number) => void;
  disableEditing: () => void;
  isReadOnly: boolean;
  isCurrentlyEditing: boolean;
  isSelected: boolean;
  cell: { value: string | number; isReadOnly?: boolean; formula?: string };
  onCommitValue: (
    newValue: string | number,
    rowIndex: number,
    colIndex: number
  ) => void;
  colIndex: number;
  rowIndex: number;
  state: {
    value: string | number;
    isReadOnly?: boolean;
    formula?: string;
  }[][];
}

const Td = styled.td<Partial<CellProps>>`
  border: 1px solid #ececec;
  cursor: cell;
  user-select: none;
  height: 24px;
  ${(p) =>
    p.isReadOnly &&
    `
    background-color: #f5f5f5;
    text-align: center;
    color: #999
  `}
  ${(p) =>
    p.isCurrentlyEditing &&
    `
    border: 1px double #2185d0;
  `}
  ${(p) =>
    p.isSelected &&
    `
    border: 1px double #2185d0;
    background-color: #2185d029;
  `}
`;

const Value = styled.span`
  display: flex;
  overflow: scroll;
  width: 60px;
  height: 100%;
  align-items: center;
`;

const CellInput = styled.input`
  font-size: inherit;
  border: none;
  width: 60px;
  height: 100%;
  outline: none !important;
`;

function Cell({
  handleCellClick,
  handleCellDoubleClick,
  disableEditing,
  isReadOnly,
  isCurrentlyEditing,
  isSelected,
  cell,
  onCommitValue,
  colIndex,
  rowIndex,
  state,
}: CellProps) {
  const isInitialMount = useRef(true);
  const [value, setValue] = useState(cell.formula || cell.value);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (!isCurrentlyEditing) {
      onCommitValue(value, rowIndex, colIndex);
    }
  }, [isCurrentlyEditing, state]);

  return (
    <Td
      onClick={() => handleCellClick(rowIndex, colIndex)}
      onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
      {...{ isReadOnly, isCurrentlyEditing, isSelected }}
    >
      {isCurrentlyEditing ? (
        <CellInput
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onBlur={disableEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") disableEditing();
          }}
        />
      ) : (
        <Value>{cell.value}</Value>
      )}
    </Td>
  );
}

export default memo(Cell);
