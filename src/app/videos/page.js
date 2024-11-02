"use client";

import { Box, Grid2 } from "@mui/material";
import React from "react";

export default function Videos() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">影片</h1>
      <Grid2 container spacing={"16px"}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box maxWidth={"560px"} m="0 auto">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/Lf-tee9V1vY?si=38vVtWIfcAJgxjxM"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Box maxWidth={"560px"} m="0 auto">
            <iframe
              width="100%"
              height="315"
              src="https://www.youtube.com/embed/mht8Mc8HCnk?si=giLu4DkzTpCzf68b"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </Box>
        </Grid2>
      </Grid2>
    </div>
  );
}
