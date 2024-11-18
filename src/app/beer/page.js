"use client";
import SaveModal from "@/components/SaveModal";
import { Box } from "@mui/material";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
const CUP_HEIGHT = 0.05;

export default function BeerPushing() {
  const [force, setForce] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [targetArea, setTargetArea] = useState({ start: 50, end: 70 });
  const [cupPosition, setCupPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [openSave, setOpenSave] = useState();
  const [record, setRecord] = useState(0);
  const deskRef = useRef(null);
  const [deskHeight, setDeskHeight] = useState(0);

  useLayoutEffect(() => {
    if (deskRef.current) {
      setDeskHeight(deskRef.current.offsetHeight);
    }
  }, []);

  const onFinish = (finalScore) => {
    setOpenSave(true);
    setRecord(finalScore);
  };

  useEffect(() => {
    if (gameStatus === "playing") {
      const baseHeight = 20;
      const minHeight = 1;
      const reductionRate = 0.1;
      const effectiveReduction = Math.min(
        score * reductionRate,
        (baseHeight - minHeight) / baseHeight
      );
      const targetHeight = Math.max(
        baseHeight - baseHeight * effectiveReduction,
        minHeight
      );

      const minStart = 50; // 最小起始位置為 50%
      const maxStart = 100 - targetHeight; // 最大起始位置
      const start =
        minStart + Math.floor(Math.random() * (maxStart - minStart));

      setTargetArea({
        start: start,
        end: Math.min(start + targetHeight, 100),
      });
    }
  }, [gameStatus, score]);

  const startCharging = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) return;
    setIsPressing(true);
    setForce(0);

    const timer = setInterval(() => {
      setForce((prevForce) => Math.min(prevForce + 1, 150));
    }, 50);

    const cleanup = () => {
      clearInterval(timer);
      document.removeEventListener("mouseup", cleanup);
      document.removeEventListener("touchend", cleanup);
    };

    document.addEventListener("mouseup", cleanup);
    document.addEventListener("touchend", cleanup);

    return cleanup;
  };

  const pushCup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) return;

    setIsPressing(false);
    setIsAnimating(true);

    const currentForce = force;
    setForce(0);

    const maxForce = 100;
    const pushDistance = (currentForce / maxForce) * 100; // 修改為 100%
    let currentPosition = 0;
    const animationDuration = 500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      currentPosition = pushDistance * progress;

      if (progress < 1) {
        setCupPosition(currentPosition);
        requestAnimationFrame(animate);
      } else {
        setCupPosition(pushDistance);

        // 只有當杯子在桌子範圍內時才檢查得分
        if (pushDistance <= 100) {
          checkScore(currentPosition);
        } else {
          // 超過桌子範圍，直接失敗
          setLives((prev) => {
            if (prev <= 1) {
              setGameStatus("failed");
              onFinish(score);
              return 0;
            }
            return prev - 1;
          });
        }

        setTimeout(() => {
          setCupPosition(0);
          setIsAnimating(false);
        }, 1000);
      }
    };

    requestAnimationFrame(animate);
  };

  const checkScore = (position) => {
    const cupBottom = position;
    // 修正 CUP_HEIGHT 的解析
    const cupTop = position + 100 * CUP_HEIGHT;

    const isCupOverlappingTarget =
      (cupBottom >= targetArea.start && cupBottom <= targetArea.end) ||
      (cupTop >= targetArea.start && cupTop <= targetArea.end) ||
      (cupBottom <= targetArea.start && cupTop >= targetArea.end);

    if (isCupOverlappingTarget) {
      setTimeout(() => {
        setScore((prev) => prev + 1);
      }, 1000);
    } else {
      setLives((prev) => {
        if (prev <= 1) {
          setGameStatus("failed");
          onFinish(score);
          return 0;
        }
        return prev - 1;
      });
    }
  };

  return (
    <div
      className="flex flex-col items-center min-h-screen gap-4"
      style={{ marginTop: "30px" }}
    >
      <div className="relative w-64" style={{ height: "calc(80vh - 105px)" }}>
        <div
          ref={deskRef}
          className="desk relative h-full w-full bg-brown-200 border border-brown-300"
          style={{
            background: "linear-gradient(to bottom, #d2b48c 0%, #8b4513 100%)",
            borderRadius: "8px",
          }}
        >
          <div
            className="absolute w-full bg-green-200 opacity-50"
            style={{
              bottom: `${targetArea.start}%`,
              height: `${targetArea.end - targetArea.start}%`,
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-yellow-500"
            style={{
              bottom: `${Math.min(cupPosition, 100)}%`,
              borderRadius: "50%", // This ensures a perfect circle
              height: `${deskHeight * CUP_HEIGHT}px`, // 3% of desk height
              width: `${deskHeight * CUP_HEIGHT}px`, // Keep it a perfect circle
              transition: isPressing ? "none" : "bottom 0.5s ease-out",
            }}
          />
        </div>
      </div>
      <Box
        display="flex"
        justifyContent="space-between"
        gap="8px"
        width={"90%"}
        maxWidth={"280px"}
        m="0 auto"
      >
        <div>
          <p className="text-lg">得分: {score}</p>
          <div className="text-lg">生命: {lives}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onTouchStart={startCharging}
            onMouseDown={startCharging}
            onTouchEnd={pushCup}
            onMouseUp={pushCup}
            disabled={isAnimating}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              isAnimating ? "opacity-50 cursor-not-allowed" : ""
            } `}
            style={{
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
            }}
          >
            {isPressing ? `蓄力中` : isAnimating ? "等待中..." : "推酒杯"}
          </button>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-50 ${
                force > 100 ? "bg-red-600" : "bg-blue-600"
              }`}
              style={{ width: `${Math.min(force, 150)}%` }}
            ></div>
          </div>
        </div>
      </Box>

      <SaveModal
        openSave={openSave}
        setOpenSave={setOpenSave}
        data={{ gameId: "beer", time: record }}
      />
    </div>
  );
}
