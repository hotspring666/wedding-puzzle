"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import io from "socket.io-client";
import _ from "lodash";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [gameMode, setGameMode] = useState("normal");
  const [competitionId, setCompetitionId] = useState("");
  const [competitionEnd, setCompetitionEnd] = useState(false);
  const [competitionStarted, setCompetitionStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [remainingPieces, setRemainingPieces] = useState(0);
  const searchParams = useSearchParams();
  useEffect(() => {
    const urlRoomId = searchParams.get("room");
    const urlCompetitionId = searchParams.get("competition");

    if (urlRoomId) {
      setRoomId(urlRoomId);
      setJoined(true);
    }

    if (urlCompetitionId) {
      setGameMode("competition");
      setCompetitionId(urlCompetitionId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (joined && gameMode === "competition") {
      const socket = io();
      socket.on("competitionUpdate", (data) => {
        if (competitionId !== data.competitionId) return;
        setCompetitionStarted(true);
        setTimeRemaining(data.remainingTime);
        const roomData = _.find(data.rooms, {
          roomId: competitionId + roomId,
        });
        setRemainingPieces(roomData?.totalPieces - roomData?.solvedCount);
      });

      socket.on("competitionEnd", () => {
        setCompetitionStarted(false);
        setTimeRemaining(0);
        setCompetitionEnd(true);
      });
    }
  }, [joined, gameMode]);

  const handleJoinRoom = () => {
    if (roomId) {
      setJoined(true);
    }
  };
  return (
    <div style={{ overflow: "hidden" }}>
      {!joined ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
          <div className="p-8 bg-black rounded-lg shadow-lg w-full max-w-md">
            <h1 className="mb-2 text-3xl font-bold text-center text-white">
              拼圖樂園
            </h1>
            <h2 className="mb-6 text-xl font-semibold text-center text-gray-300">
              加入拼圖房間
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="輸入房間 ID"
                className="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleJoinRoom}
              className="w-full px-4 py-2 text-black bg-white rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-300 ease-in-out"
            >
              加入房間
            </button>
            <p className="mt-4 text-sm text-center text-gray-400">
              輸入房間 ID 來加入朋友的拼圖遊戲，或創建一個新的房間！
            </p>
          </div>
        </div>
      ) : (
        <div>
          {gameMode === "competition" && !competitionStarted ? (
            <div className="text-center p-4 text-gray-300">
              <h2 className="text-2xl font-bold mb-4">
                {competitionEnd ? "結束！！" : "等待競賽開始..."}
              </h2>
              <p>房間 ID: {roomId}</p>
              <p>競賽 ID: {competitionId}</p>
            </div>
          ) : (
            <JigsawPuzzle
              imageSrc="example.jpg"
              rows={5}
              columns={4}
              onSolved={() => alert("Solved!")}
              roomId={roomId}
              gameMode={gameMode}
              competitionId={competitionId}
            />
          )}
          {gameMode === "competition" && (
            <div className="competition-info fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-1">
              <p className="text-lg">
                剩餘時間: {Math.floor(timeRemaining / 60)}:
                {(timeRemaining % 60).toString().padStart(2, "0")} 剩餘拼圖片數:{" "}
                {remainingPieces}
              </p>
              <p className="text-lg"></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
