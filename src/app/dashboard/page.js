"use client";

import BottomNavBar from "@/components/BottomNavBar";
import React, { useState, useEffect, useRef } from "react";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";
import { Grid2 } from "@mui/material";

export default function Dashboard() {
  const [stats, setStats] = useState({
    maxScore: 0,
    avgScore: 0,
    totalPlayers: 0,
  });
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getRanking = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ranking?gameId=puzzle`,
        { next: { revalidate: 60 } }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch rankings");
      }
      return response.json();
    } catch (err) {
      throw new Error("取得失敗");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getRanking();
        setRankings(data.rankings);
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderRank = (index) => {
    if (index == 0) return <LooksOneIcon />;
    if (index == 1) return <LooksTwoIcon />;
    if (index == 2) return <Looks3Icon />;
    return index + 1;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">遊戲排行榜</h1>

      {/* 統計信息 */}
      <Grid2 container spacing={"16px"} mb="20px" textAlign={"center"}>
        <Grid2
          size={{ xs: 12, md: 4 }}
          p="16px"
          className="bg-gray-200 bg-opacity-50 rounded-lg"
        >
          <h3>最快時間</h3>
          <p className="text-2xl">{stats.maxScore || "-"}</p>
        </Grid2>
        <Grid2
          size={{ xs: 12, md: 4 }}
          p="16px"
          className="bg-gray-200 bg-opacity-50 rounded-lg"
        >
          <h3>平均時間</h3>
          <p className="text-2xl">{stats.avgScore || "-"}</p>
        </Grid2>
        <Grid2
          size={{ xs: 12, md: 4 }}
          p="16px"
          className="bg-gray-200 bg-opacity-50 rounded-lg"
        >
          <h3>參與人數</h3>
          <p className="text-2xl">{stats.totalPlayers || "-"}</p>
        </Grid2>
      </Grid2>

      {/* 排行榜列表 */}
      <div className="rounded-lg shadow bg-gray-200 bg-opacity-50">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2">排名</th>
              <th className="p-4">名字</th>
              <th className="p-2">時間</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((record, index) => (
              <tr key={record._id} className=" text-center">
                <td className="p-2 ">{renderRank(index)}</td>
                <td className="p-4">{record.name}</td>
                <td className="p-2 ">{formatTime(record.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
