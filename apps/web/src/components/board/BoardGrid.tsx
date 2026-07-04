import React from 'react';

interface BoardGridProps {
  cellSize: number;
  padding: number;
  showCoordinates: boolean;
}

export const BoardGrid: React.FC<BoardGridProps> = ({ cellSize, padding, showCoordinates }) => {
  const lines: React.ReactElement[] = [];
  const lineColor = '#5c3d1a';
  const palaceColor = '#8B4513';
  const riverColor = '#5c3d1a';

  // Horizontal lines (10 lines)
  for (let row = 0; row < 10; row++) {
    const y = padding + row * cellSize;
    lines.push(
      <line key={`h${row}`} x1={padding} y1={y} x2={padding + 8 * cellSize} y2={y} stroke={lineColor} strokeWidth={1} />,
    );
  }

  // Vertical lines (9 lines, split at river for inner columns)
  for (let col = 0; col < 9; col++) {
    const x = padding + col * cellSize;
    if (col === 0 || col === 8) {
      lines.push(
        <line key={`v${col}`} x1={x} y1={padding} x2={x} y2={padding + 9 * cellSize} stroke={lineColor} strokeWidth={1} />,
      );
    } else {
      lines.push(
        <line key={`v${col}t`} x1={x} y1={padding} x2={x} y2={padding + 4 * cellSize} stroke={lineColor} strokeWidth={1} />,
      );
      lines.push(
        <line key={`v${col}b`} x1={x} y1={padding + 5 * cellSize} x2={x} y2={padding + 9 * cellSize} stroke={lineColor} strokeWidth={1} />,
      );
    }
  }

  // Palace diagonals — X-shaped, #8B4513
  const pLeft = padding + 3 * cellSize;
  const pRight = padding + 5 * cellSize;
  const pTopY = padding + 0 * cellSize;
  const pTopBotY = padding + 2 * cellSize;
  lines.push(<line key="pald1" x1={pLeft} y1={pTopY} x2={pRight} y2={pTopBotY} stroke={palaceColor} strokeWidth={1} />);
  lines.push(<line key="pald2" x1={pRight} y1={pTopY} x2={pLeft} y2={pTopBotY} stroke={palaceColor} strokeWidth={1} />);

  const pBotY = padding + 7 * cellSize;
  const pBotBotY = padding + 9 * cellSize;
  lines.push(<line key="pald3" x1={pLeft} y1={pBotY} x2={pRight} y2={pBotBotY} stroke={palaceColor} strokeWidth={1} />);
  lines.push(<line key="pald4" x1={pRight} y1={pBotY} x2={pLeft} y2={pBotBotY} stroke={palaceColor} strokeWidth={1} />);

  // River text — serif, #5c3d1a, wide letter-spacing
  const riverY = padding + 4.5 * cellSize;
  const fontSize = cellSize * 0.5;
  lines.push(
    <text key="river-left" x={padding + 1.2 * cellSize} y={riverY} fontSize={fontSize} fill={riverColor} textAnchor="middle" dominantBaseline="middle" fontFamily="Ma Shan Zheng, serif" fontWeight="bold" letterSpacing={cellSize * 0.15}>
      楚河
    </text>,
  );
  lines.push(
    <text key="river-right" x={padding + 6.8 * cellSize} y={riverY} fontSize={fontSize} fill={riverColor} textAnchor="middle" dominantBaseline="middle" fontFamily="Ma Shan Zheng, serif" fontWeight="bold" letterSpacing={cellSize * 0.15}>
      漢界
    </text>,
  );

  // Coordinates — in the outer zone, symmetric on all four sides
  if (showCoordinates) {
    const labelSize = 14;
    const labelColor = '#5c3d1a';
    const labelOpacity = 0.8;
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    const o = padding * 0.20; // offset from SVG edge — identical top/bottom/left/right

    // Column labels: top and bottom — same distance from SVG edge
    const colTopY = o;
    const gridBot = padding + 9 * cellSize;
    const colBotY = gridBot + padding * 0.80; // = svgHeight - o
    for (let col = 0; col < 9; col++) {
      const x = padding + col * cellSize;
      lines.push(<text key={`ct${col}`} x={x} y={colTopY} fontSize={labelSize} fill={labelColor} opacity={labelOpacity} textAnchor="middle" fontFamily="system-ui, sans-serif">{files[col]}</text>);
      lines.push(<text key={`cb${col}`} x={x} y={colBotY} fontSize={labelSize} fill={labelColor} opacity={labelOpacity} textAnchor="middle" fontFamily="system-ui, sans-serif">{files[col]}</text>);
    }

    // Row labels: left and right — same distance from SVG edge
    const rowLeftX = o;
    const gridRight = padding + 8 * cellSize;
    const rowRightX = gridRight + padding * 0.80; // = svgWidth - o
    for (let row = 0; row < 10; row++) {
      const y = padding + row * cellSize;
      lines.push(<text key={`rl${row}`} x={rowLeftX} y={y} fontSize={labelSize} fill={labelColor} opacity={labelOpacity} textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui, sans-serif">{row}</text>);
      lines.push(<text key={`rr${row}`} x={rowRightX} y={y} fontSize={labelSize} fill={labelColor} opacity={labelOpacity} textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui, sans-serif">{row}</text>);
    }
  }

  return <g>{lines}</g>;
};
