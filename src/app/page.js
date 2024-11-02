"use client";

import React, { useEffect, useState } from "react";

import _ from "lodash";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const renderGame = ({ gameId, title, backgroundColor }) => {
    return (
      <Box
        key={gameId}
        borderRadius={"8px"}
        my="16px"
        height="120px"
        display={"flex"}
        backgroundColor={backgroundColor}
        p="16px"
        alignItems={"center"}
        justifyContent={"center"}
        style={{ cursor: "pointer" }}
        onClick={() => {
          router.push("/" + gameId);
        }}
      >
        <Box fontSize={"24px"}>{title}</Box>
      </Box>
    );
  };
  return (
    <Box style={{ overflow: "hidden" }} className="p-4">
      <h1 className="text-2xl font-bold mb-4">遊戲排行榜</h1>
      <Box my="8px">紀錄保持者有小禮物喔🎁</Box>
      {renderGame({
        gameId: "puzzle",
        title: "拼圖",
        backgroundColor: "#F98734",
      })}
      {renderGame({
        gameId: "dinosaur",
        title: "恐龍",
        backgroundColor: "#7b61ff",
      })}
    </Box>
  );
}
