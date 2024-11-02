"use client";

import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContentText,
  DialogContent,
  TextField,
  DialogTitle,
  Button,
} from "@mui/material";
import JigsawPuzzle from "./JigsawPuzzle";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
export default function Puzzle() {
  const [openSave, setOpenSave] = useState();
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const router = useRouter();
  const handlePuzzleSolved = (time) => {
    setRecord(time);
    setOpenSave(true);
  };

  return (
    <Box style={{ maxHeight: "calc(100vh - 80px)" }}>
      <JigsawPuzzle
        imageSrc="example.jpg"
        rows={4}
        columns={3}
        onSolved={handlePuzzleSolved}
      />
      <Dialog
        open={openSave}
        onClose={() => {}}
        PaperProps={{
          component: "form",
          onSubmit: async (event) => {
            try {
              setLoading(true);
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(formData.entries());
              const name = formJson.name;
              const response = await fetch("/api/record", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, gameId: "puzzle", time: record }),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "提交失敗");
              }

              setOpenSave(false);
              router.push("/dashboard");
            } catch (err) {
              console.log(err);
              toast.error(`Error : ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        }}
      >
        <DialogTitle>恭喜成功 🎉</DialogTitle>
        <DialogContent>
          <DialogContentText mb="16px">
            總共花費 <b style={{ color: "white" }}>{record}</b> 秒,
            留下您的大名或祝福，但要記得名字才能領獎喔！
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            variant="outlined"
            id="name"
            name="name"
            label="名字或祝福"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSave(false);
              router.push("/dashboard");
            }}
          >
            離開不存
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={loading}
          >
            送出
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
