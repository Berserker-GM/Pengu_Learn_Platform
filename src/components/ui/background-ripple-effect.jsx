import React, { useState, useCallback, useMemo } from "react";
import { cn } from "../../lib/utils";

function DivGrid({
    rows,
    cols,
    cellSize,
    borderColor = "rgba(255,255,255,0.08)",
    fillColor = "rgba(255,255,255,0.02)",
    clickedCell,
    onCellClick,
    interactive = false,
    className,
}) {
    const [hoveredCell, setHoveredCell] = useState(null);

    const getDistance = useCallback((r1, c1, r2, c2) => {
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }, []);

    const cells = useMemo(() => {
        const result = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                result.push({ r, c });
            }
        }
        return result;
    }, [rows, cols]);

    return (
        <div
            className={cn("grid", className)}
            style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            }}
        >
            {cells.map(({ r, c }) => {
                const dist = clickedCell
                    ? getDistance(r, c, clickedCell.row, clickedCell.col)
                    : -1;
                const isRippling = dist >= 0 && dist <= Math.max(rows, cols);

                return (
                    <div
                        key={`${r}-${c}`}
                        className={cn(
                            "border transition-colors duration-200",
                            interactive && "cursor-pointer hover:bg-white/10"
                        )}
                        style={{
                            width: cellSize,
                            height: cellSize,
                            borderColor: borderColor,
                            backgroundColor: fillColor,
                            animation: isRippling
                                ? `cell-ripple 200ms ease-out none 1 ${dist * 40}ms`
                                : "none",
                        }}
                        onMouseEnter={() => setHoveredCell({ row: r, col: c })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onCellClick?.(r, c)}
                    />
                );
            })}
        </div>
    );
}

export function BackgroundRippleEffect({
    rows = 8,
    cols = 27,
    cellSize = 56,
}) {
    const [clickedCell, setClickedCell] = useState(null);

    const handleCellClick = useCallback((row, col) => {
        setClickedCell(null);
        // Force re-trigger animation
        requestAnimationFrame(() => {
            setClickedCell({ row, col });
        });
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-auto">
            <DivGrid
                rows={rows}
                cols={cols}
                cellSize={cellSize}
                clickedCell={clickedCell}
                onCellClick={handleCellClick}
                interactive={true}
                borderColor="rgba(255,255,255,0.06)"
                fillColor="rgba(255,255,255,0.01)"
            />
        </div>
    );
}
