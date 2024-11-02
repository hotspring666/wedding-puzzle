import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "請輸入玩家名稱"],
    trim: true,
  },
  gameId: {
    type: String,
    required: [true, "請輸入遊戲ID"],
    trim: true,
  },
  time: {
    type: Number,
    required: [true, "請輸入時間"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 添加索引以優化查詢性能
RecordSchema.index({ gameId: 1, time: 1 });

export default mongoose.models.Record || mongoose.model("Record", RecordSchema);
