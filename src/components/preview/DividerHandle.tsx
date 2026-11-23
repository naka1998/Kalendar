interface DividerHandleProps {
  direction: "horizontal" | "vertical";
  isDragging: boolean;
  dividerProps: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
}

export function DividerHandle({ direction, isDragging, dividerProps }: DividerHandleProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      data-testid="divider-handle"
      className={`group relative z-10 flex shrink-0 items-center justify-center ${
        isHorizontal ? "h-3 w-full cursor-row-resize" : "h-full w-3 cursor-col-resize"
      }`}
      style={{ touchAction: "none" }}
      {...dividerProps}
    >
      {/* Visible line */}
      <div
        className={`transition-colors ${
          isDragging ? "bg-primary" : "bg-on-surface/10 group-hover:bg-primary/60"
        } ${isHorizontal ? "h-0.5 w-8 rounded-full" : "h-8 w-0.5 rounded-full"}`}
      />
    </div>
  );
}
