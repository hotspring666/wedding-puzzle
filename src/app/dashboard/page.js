"use client";

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function Dashboard() {
  const [competitions, setCompetitions] = useState([]);
  const [newCompetitionName, setNewCompetitionName] = useState("");
  const [newCompetitionTimeLimit, setNewCompetitionTimeLimit] = useState(300);
  const socketRef = useRef();
  console.log("competitions", competitions);
  useEffect(() => {
    const initSocket = async () => {
      await fetch("/api/socket");
      socketRef.current = io();
      socketRef.current.emit("joinDashboard");
      socketRef.current.on("competitionCreated", (competition) => {
        setCompetitions((prev) => [...prev, competition]);
      });

      socketRef.current.on("competitionStarted", (startedCompetition) => {
        setCompetitions((prev) =>
          prev.map((comp) =>
            comp.competitionId === startedCompetition.updateCompetitionId
              ? { ...comp, isStarted: true }
              : comp
          )
        );
      });

      socketRef.current.on("competitionEnd", (startedCompetition) => {
        setCompetitions((prev) =>
          prev.map((comp) =>
            comp.competitionId === startedCompetition.updateCompetitionId
              ? { ...comp, isEnd: true }
              : comp
          )
        );
      });

      socketRef.current.on(
        "competitionUpdate",
        ({ competitionId, remainingTime, rooms }) => {
          setCompetitions((prev) =>
            prev.map((comp) => {
              if (comp.competitionId === competitionId) {
                return {
                  ...comp,
                  remainingTime,
                  rooms: comp.rooms.map((room) => {
                    const update = rooms.find((u) => u.roomId === room.roomId);
                    return update ? { ...room, ...update } : room;
                  }),
                };
              }
              return comp;
            })
          );
        }
      );

      socketRef.current.emit("getCompetitions");

      socketRef.current.on("allCompetitions", (allCompetitions) => {
        setCompetitions(allCompetitions);
      });
    };
    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const createCompetition = () => {
    if (newCompetitionName && newCompetitionTimeLimit > 0) {
      socketRef.current.emit("createCompetition", {
        competitionId: newCompetitionName,
        roomSize: 18,
        timeLimit: newCompetitionTimeLimit,
        rows: 5,
        columns: 5,
        iamge: `https://picsum.photos/200/300?random=66`,
      });
      setNewCompetitionName("");
      setNewCompetitionTimeLimit(300);
    }
  };

  const startCompetition = (competitionId) => {
    socketRef.current.emit("startCompetition", competitionId);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-y-auto">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-blue-300">競賽儀表板</h1>

        <div className="mb-8 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2 text-blue-200">
            創建新競賽
          </h2>
          <input
            type="text"
            value={newCompetitionName}
            onChange={(e) => setNewCompetitionName(e.target.value)}
            placeholder="競賽名稱"
            className="mr-2 p-2 border rounded bg-gray-700 text-white"
          />
          <input
            type="number"
            value={newCompetitionTimeLimit}
            onChange={(e) => setNewCompetitionTimeLimit(Number(e.target.value))}
            placeholder="時間限制（秒）"
            className="mr-2 p-2 border rounded bg-gray-700 text-white"
          />
          <button
            onClick={createCompetition}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            創建競賽
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2 text-blue-200">
            當前競賽
          </h2>
          {competitions.map((competition) => {
            console.log("competition", competition);
            return (
              <div
                key={competition.id}
                className="mb-4 p-4 border border-gray-700 rounded-lg bg-gray-800"
              >
                <h3 className="text-xl font-semibold text-blue-300">
                  {competition.competitionId}
                </h3>
                <p>
                  狀態:{" "}
                  {competition.isEnd
                    ? "End"
                    : competition.isStarted
                    ? "進行中"
                    : "等待開始"}{" "}
                  {competition.isStarted &&
                    !competition.isEnd &&
                    `剩餘時間: ${Math.floor(competition.remainingTime / 60)}:
                ${(competition.remainingTime % 60)
                  .toString()
                  .padStart(2, "0")}`}
                </p>
                <p>時間限制: {competition.timeLimit} 秒</p>
                {!competition.isStarted && (
                  <button
                    disabled={competition.isStarted}
                    onClick={() => startCompetition(competition.competitionId)}
                    className="bg-green-600 text-white p-2 rounded hover:bg-green-700 mt-2"
                  >
                    開始競賽
                  </button>
                )}
                <h4 className="mt-2 font-semibold text-blue-200">房間:</h4>
                <ul>
                  {competition.rooms.map((room) => (
                    <li key={room.roomId} className="ml-4 text-gray-300">
                      房間 {room.roomId}: 已解決 {room.solvedCount} /{" "}
                      {room.totalPieces}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
