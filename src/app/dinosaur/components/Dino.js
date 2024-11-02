"use client";
import React, { useEffect, useRef, useState } from "react";
import Resources from "./Resources.js";
import DinoScript from "./DinoScript.js";
import DinoStyle from "./DinoStyle.js";

import "./Dino.css";

const ChromeDinoComponent = ({ onFinish }) => {
  const startDivRef = useRef(null);
  const endDivRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const cleanupGame = () => {
    if (window.Runner && window.Runner.instance_) {
      window.Runner.instance_.stopListening();
      window.Runner.instance_.stop();
      window.Runner.instance_ = null;
    }
    if (window.runnerInstance) {
      window.runnerInstance = null;
    }
    // 清理全局Runner對象
    window.Runner = undefined;
  };

  const appendDinoScript = () => {
    cleanupGame();
    const dinoScriptContainer = document.createElement("script");
    dinoScriptContainer.appendChild(document.createTextNode(DinoScript()));
    startDivRef.current.appendChild(dinoScriptContainer);
  };
  const appendRunnerScript = () => {
    const runnerScriptContainer = document.createElement("script");
    runnerScriptContainer.appendChild(
      document.createTextNode(`
        window.runnerInstance = new Runner('.interstitial-wrapper');
        window.runnerInstance.playIntro();
        window.runnerInstance.tRex.startJump(); // 設定恐龍為運行狀態
      `)
    );
    endDivRef.current.appendChild(runnerScriptContainer);
  };

  const handleClick = () => {
    if (
      window.Runner &&
      window.Runner.instance_ &&
      !window.Runner.instance_.crashed
    ) {
      window.Runner.instance_.tRex.startJump();
    }
  };

  const handleGameOver = () => {
    const score =
      window.Runner?.instance_?.distanceMeter.getActualDistance(
        window.Runner.instance_.distanceRan
      ) || 0;

    if (onFinish) {
      onFinish(score);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (isClient) {
      appendDinoScript();
      appendRunnerScript();

      document.addEventListener("click", handleClick);
      window.addEventListener("gameover", handleGameOver);

      return () => {
        document.removeEventListener("click", handleClick);
        window.removeEventListener("gameover", handleGameOver);
        if (window.runnerInstance) {
          window.runnerInstance = null;
        }
      };
    }
  }, [isClient]);

  if (!isClient) return null; // 只在客戶端渲染

  return (
    <div ref={startDivRef}>
      <style>{DinoStyle}</style>
      <div id="main-frame-error" className="interstitial-wrapper">
        <Resources />
        <div ref={endDivRef}></div>
      </div>
    </div>
  );
};

export default ChromeDinoComponent;
