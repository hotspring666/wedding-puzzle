"use client";

import React, { useState, useEffect, useRef } from "react";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import { Grid2, Tab, Box } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";

export default function Dashboard() {
  const [stats, setStats] = useState({
    maxScore: 0,
    avgScore: 0,
    totalPlayers: 0,
  });
  const [rankings, setRankings] = useState([]);
  const [value, setValue] = useState("puzzle");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [isLoading, setIsLoading] = useState(true);
  const scoreDispaly = value == "puzzle" ? "時間" : "分數";

  const formatTime = (time) => {
    if (value !== "puzzle") return time;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getRanking = async (value) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ranking?gameId=` + value,
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
        const data = await getRanking(value);
        setRankings(data.rankings);
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [value]);

  const renderRank = (index) => {
    if (index == 0) return <LooksOneIcon />;
    if (index == 1) return <LooksTwoIcon />;
    return index + 1;
  };

  const renderStats = () => {
    return (
      <Box mt="16px" overflow={"auto"}>
        {/* 統計信息 */}
        <Grid2 container spacing={"16px"} mb="20px" textAlign={"center"}>
          <Grid2
            size={{ xs: 12, md: 4 }}
            p="16px"
            className="bg-gray-200 bg-opacity-30 rounded-lg"
          >
            <h3>1st {scoreDispaly}</h3>
            <p className="text-2xl">
              {stats.maxScore ? formatTime(stats.maxScore) : "-"}
            </p>
          </Grid2>
          <Grid2
            size={{ xs: 12, md: 4 }}
            p="16px"
            className="bg-gray-200 bg-opacity-30 rounded-lg"
          >
            <h3>平均{scoreDispaly}</h3>
            <p className="text-2xl">{stats.avgScore || "-"}</p>
          </Grid2>
          <Grid2
            size={{ xs: 12, md: 4 }}
            p="16px"
            className="bg-gray-200 bg-opacity-30 rounded-lg"
          >
            <h3>參與人數</h3>
            <p className="text-2xl">{stats.totalPlayers || "-"}</p>
          </Grid2>
        </Grid2>

        {/* 排行榜列表 */}
        <div className="rounded-lg shadow bg-gray-200 bg-opacity-30">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2">排名</th>
                <th className="p-4">名字</th>
                <th className="p-2">{scoreDispaly}</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((record, index) => (
                <tr key={record._id} className=" text-center">
                  <td className="p-2 ">{renderRank(index)}</td>
                  <td className="p-4" style={{ wordBreak: "break-all" }}>
                    {record.name}
                  </td>
                  <td className="p-2 ">{formatTime(record.time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  };

  return (
    <div className="p-4" style={{ overflow: "auto" }}>
      <h1 className="text-2xl font-bold mb-4">遊戲排行榜</h1>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange}>
            <Tab label="拼圖" value="puzzle" />
            <Tab label="恐龍" value="dinosaur" />
          </TabList>
        </Box>
        {renderStats()}
      </TabContext>
    </div>
  );
}
