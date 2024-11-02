"use client";

import React, { useState } from "react";
import Dino from "./components/Dino";
import { Box } from "@mui/material";
import SaveModal from "@/components/SaveModal";

export default function DinoGame() {
  const [openSave, setOpenSave] = useState();
  const [record, setRecord] = useState(0);
  const onFinish = (score) => {
    setOpenSave(true);
    setRecord(score);
  };
  return (
    <Box>
      <Dino onFinish={onFinish} />
      <SaveModal
        openSave={openSave}
        setOpenSave={setOpenSave}
        data={{ gameId: "dinosaur", time: record }}
      />
    </Box>
  );
}
