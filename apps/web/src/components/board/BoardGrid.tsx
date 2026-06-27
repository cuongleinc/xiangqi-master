import React from 'react';

interface BoardGridProps {
  cellSize: number;
  padding: number;
  showCoordinates: boolean;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ cellSize, padding, showCoordinates }) => {
  const lines: React.ReactElement[] = [];
  const lineColor = '#5c4033';
  const riverColor = '#2d5a27';

  // Horizontal lines (10 lines, rows 0-9)
  for (let row = 0; row < 10; row++) {
    const y = padding + row * cellSize;
    // Draw only from col 0 to col 8 (left edge to right edge of the board)
    const x1 = padding;
    const x2 = padding + 8 * cellSize;
    lines.push(
      <line key={`h${row}`} x1={x1} y1={y} x2={x2} y2={y} stroke={lineColor} strokeWidth={1.5} />,
    );
  }

  // Vertical lines (9 lines, but note the river gap)
  for (let col = 0; col < 9; col++) {
    const x = padding + col * cellSize;
    if (col === 0 || col === 8) {
      // Edge columns: full line from row 0 to row 9
      lines.push(
        <line key={`v${col}`} x1={x} y1={padding} x2={x} y2={padding + 9 * cellSize} stroke={lineColor} strokeWidth={1.5} />,
      );
    } else {
      // Inner columns: split by river (between row 4 and row 5)
      lines.push(
        <line key={`v${col}t`} x1={x} y1={padding} x2={x} y2={padding + 4 * cellSize} stroke={lineColor} strokeWidth={1.5} />,
      );
      lines.push(
        <line key={`v${col}b`} x1={x} y1={padding + 5 * cellSize} x2={x} y2={padding + 9 * cellSize} stroke={lineColor} strokeWidth={1.5} />,
      );
    }
  }

  // Palace diagonals
  const palaceStroke = lineColor;
  // Top palace (Black): cols 3-5, rows 0-2
  const pTopLeftX = padding + 3 * cellSize;
  const pTopRightX = padding + 5 * cellSize;
  const pTopTopY = padding + 0 * cellSize;
  const pTopBotY = padding + 2 * cellSize;
  lines.push(<line key="pald1" x1={pTopLeftX} y1={pTopTopY} x2={pTopRightX} y2={pTopBotY} stroke={palaceStroke} strokeWidth={1} />);
  lines.push(<line key="pald2" x1={pTopRightX} y1={pTopTopY} x2={pTopLeftX} y2={pTopBotY} stroke={palaceStroke} strokeWidth={1} />);

  // Bottom palace (Red): cols 3-5, rows 7-9
  const pBotLeftX = padding + 3 * cellSize;
  const pBotRightX = padding + 5 * cellSize;
  const pBotTopY = padding + 7 * cellSize;
  const pBotBotY = padding + 9 * cellSize;
  lines.push(<line key="pald3" x1={pBotLeftX} y1={pBotTopY} x2={pBotRightX} y2={pBotBotY} stroke={palaceStroke} strokeWidth={1} />);
  lines.push(<line key="pald4" x1={pBotRightX} y1={pBotTopY} x2={pBotLeftX} y2={pBotBotY} stroke={palaceStroke} strokeWidth={1} />);

  // River text
  const riverY = padding + 4.5 * cellSize;
  const fontSize = cellSize * 0.5;
  lines.push(
    <text key="river-left" x={padding + 1 * cellSize} y={riverY} fontSize={fontSize} fill={riverColor} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
      楚河
    </text>,
  );
  lines.push(
    <text key="river-right" x={padding + 7 * cellSize} y={riverY} fontSize={fontSize} fill={riverColor} textAnchor="middle" dominantBaseline="middle" fontStyle="italic">
      漢界
    </text>,
  );

  // Coordinates
  if (showCoordinates) {
    const coordFontSize = cellSize * 0.3;
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    for (let col = 0; col < 9; col++) {
      const x = padding + col * cellSize;
      // Top
      lines.push(<text key={`ct${col}`} x={x} y={padding * 0.5} fontSize={coordFontSize} fill="#5c4033" textAnchor="middle">{files[col]}</text>);
      // Bottom
      lines.push(<text key={`cb${col}`} x={x} y={padding + 9 * cellSize + padding * 0.5} fontSize={coordFontSize} fill="#5c4033" textAnchor="middle">{files[col]}</text>);
    }
    for (let row = 0; row < 10; row++) {
      const y = padding + row * cellSize;
      lines.push(<text key={`rl${row}`} x={padding * 0.4} y={y} fontSize={coordFontSize} fill="#5c4033" textAnchor="middle" dominantBaseline="middle">{row}</text>);
      lines.push(<text key={`rr${row}`} x={padding + 8 * cellSize + padding * 0.6} y={y} fontSize={coordFontSize} fill="#5c4033" textAnchor="middle" dominantBaseline="middle">{row}</text>);
    }
  }

  return <g>{lines}</g>;
};
