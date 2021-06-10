import React, { useRef, useEffect, useState, useCallback } from "react";
import "./App.css";
import { ControlPanel } from "../ControlPanel/ControlPanel";

const GENERATED_POINTS_AMOUNT = 20000;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 640;

enum GameState {
  Waiting,
  GeneratingPoints,
  Done,
}

interface Coordinate {
  x: number;
  y: number;
}

interface Point {
  coordinate: Coordinate;
  label: string;
}

const labelMap: { [key: number]: string } = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "E",
  5: "F",
};

export const App = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (ref.current) {
      console.log("init");
      setContext(ref.current.getContext("2d"));
      console.log(context);
    }
  }, [context]);

  // Game state
  const [gameState, setGameState] = useState(GameState.Waiting);

  // Config state
  const [numberOfOuterPoints, setnumberOfOuterPoints] = useState(3);

  // User input state
  const [outerPoints, setOuterPoints] = useState<Point[]>([]);
  const [startingPoint, setStartingPoint] = useState<Point>();

  // Generated state
  // This variable may actually not be necessary, just keep track of last point
  const [generatedPoints, setGeneratedPoints] = useState<Point[]>([]);

  const drawPoint = useCallback(
    ({ coordinate }: Point) => {
      if (!context) {
        throw new Error("Could not get canvas context!");
      }
      context.fillStyle = "lime";
      context.fillRect(coordinate.x - 1, coordinate.y - 1, 2, 2);
    },
    [context]
  );

  const addOuterPoint = useCallback(
    (coordinate: Point) => {
      setOuterPoints([
        ...outerPoints,
        { ...coordinate, label: labelMap[outerPoints.length] },
      ]);
    },
    [outerPoints]
  );

  const addGeneratedPoint = useCallback(
    (coordinate: Point) => {
      setGeneratedPoints([...generatedPoints, coordinate]);
    },
    [generatedPoints]
  );

  const processPoint = useCallback(
    (coordinate: Point, fn: (coordinate: Point) => void) => {
      drawPoint(coordinate);
      fn(coordinate);
    },
    [drawPoint]
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // @ts-ignore
      const canvas: HTMLCanvasElement = e.target;
      const rect = canvas.getBoundingClientRect();
      const point: Omit<Point, "label"> = {
        coordinate: {
          x: Math.round(e.clientX - rect.left),
          y: Math.round(e.clientY - rect.top),
        },
      };

      if (outerPoints.length < numberOfOuterPoints) {
        processPoint({ ...point, label: "outer-point" }, addOuterPoint);
      } else if (!startingPoint) {
        processPoint({ ...point, label: "starting-point" }, setStartingPoint);
        setGameState(GameState.GeneratingPoints);
      }
    },
    [
      outerPoints,
      addOuterPoint,
      startingPoint,
      numberOfOuterPoints,
      processPoint,
    ]
  );

  const handleReset = useCallback(() => {
    setGameState(GameState.Waiting);
    setOuterPoints([]);
    setStartingPoint(undefined);
    setGeneratedPoints([]);
    if (!context) {
      throw new Error("Could not get canvas context!");
    }
    setTimeout(() => {
      context.fillStyle = "black";
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }, 0);
  }, [context]);

  const generateNextPoint = useCallback(() => {
    const lastPoint: Point = generatedPoints.length
      ? generatedPoints[generatedPoints.length - 1]
      : (startingPoint as Point);
    const lastCoordinate = lastPoint.coordinate;
    const targetPoint =
      outerPoints[Math.floor(Math.random() * outerPoints.length)];
    const targetCoordinate = targetPoint.coordinate;
    const newPoint = {
      coordinate: {
        x: (lastCoordinate.x + targetCoordinate.x) / 2,
        y: (lastCoordinate.y + targetCoordinate.y) / 2,
      },
      label: "generated-point",
    };
    processPoint(newPoint, addGeneratedPoint);
  }, [
    generatedPoints,
    startingPoint,
    outerPoints,
    addGeneratedPoint,
    processPoint,
  ]);

  useEffect(() => {
    if (
      outerPoints.length === numberOfOuterPoints &&
      startingPoint &&
      generatedPoints.length < GENERATED_POINTS_AMOUNT &&
      gameState === GameState.GeneratingPoints
    ) {
      generateNextPoint();
    }
  }, [
    outerPoints,
    startingPoint,
    generatedPoints,
    generateNextPoint,
    numberOfOuterPoints,
    gameState,
  ]);

  return (
    <div className="app">
      <div className="view-port">
        <canvas
          ref={ref}
          className="canvas"
          onClick={handleCanvasClick}
          width={640}
          height={640}
        ></canvas>
      </div>

      <ControlPanel
        numberOfOuterPoints={numberOfOuterPoints}
        setnumberOfOuterPoints={setnumberOfOuterPoints}
        onReset={handleReset}
      />
    </div>
  );
};
