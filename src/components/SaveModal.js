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
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function SaveModal({ openSave, setOpenSave, data }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
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
              body: JSON.stringify({ name, ...data }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || "提交失敗");
            }

            setOpenSave(false);
            router.push("/dashboard?tab=" + data.gameId);
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
        <Box mb="16px">
          {data.gameId == "dinosaur" && (
            <Box>
              總共獲得 <b style={{ color: "white" }}>{data.time}</b> 分
            </Box>
          )}
          {data.gameId == "puzzle" && (
            <Box>
              總共花費 <b style={{ color: "white" }}>{data.time}</b> 秒
            </Box>
          )}
          , 留下您的大名或祝福，但要記得名字才能領獎喔！
        </Box>
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
            router.push("/dashboard?tab=" + data.gameId);
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
  );
}
