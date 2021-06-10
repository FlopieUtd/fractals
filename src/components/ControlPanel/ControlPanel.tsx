import React from "react";
import "./ControlPanel.css";

interface ControlPanelProps {
  numberOfOuterPoints: number;
  setnumberOfOuterPoints: (number: number) => void;
  onReset: () => void;
}

export const ControlPanel = ({
  numberOfOuterPoints,
  setnumberOfOuterPoints,
  onReset,
}: ControlPanelProps) => {
  return (
    <div className="control-panel">
      <div className="console">Welcome to the chaos game.</div>
      <input
        type="range"
        min="3"
        max="6"
        value={numberOfOuterPoints}
        className="slider"
        onChange={e => {
          console.log("change");
          setnumberOfOuterPoints(Number(e.target.value));
        }}
      />
      <button onClick={onReset}>Reset</button>
    </div>
  );
};
