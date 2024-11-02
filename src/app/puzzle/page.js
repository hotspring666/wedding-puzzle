"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import JigsawPuzzle from "./JigsawPuzzle";
import SaveModal from "@/components/SaveModal";

export default function Puzzle() {
  const [openSave, setOpenSave] = useState();
  const [record, setRecord] = useState(null);

  const handlePuzzleSolved = (time) => {
    setRecord(time);
    setOpenSave(true);
  };

  return (
    <Box style={{ maxHeight: "calc(100vh - 80px)" }}>
      <JigsawPuzzle
        imageSrc="puzzle.jpg"
        rows={4}
        columns={3}
        onSolved={handlePuzzleSolved}
      />
      <SaveModal
        openSave={openSave}
        setOpenSave={setOpenSave}
        data={{ gameId: "puzzle", time: record }}
      />
    </Box>
  );
}
