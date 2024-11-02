import dbConnect from "@/lib/db";
import Record from "@/models/Record";

export async function GET(request) {
  try {
    console.log("get ranking");
    await dbConnect();
    console.log("dbConnect");
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return Response.json({ error: "請提供 gameId" }, { status: 400 });
    }

    // 獲取前 10 名最高分
    const topRecords = await Record.find({ gameId })
      .sort({ time: 1 })
      .limit(10)
      .select("name time createdAt");

    // 獲取統計數據
    const stats = await Record.aggregate([
      { $match: { gameId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$time" },
          maxScore: { $min: "$time" },
          totalPlayers: { $addToSet: "$name" },
        },
      },
      {
        $project: {
          _id: 0,
          avgScore: { $round: ["$avgScore", 2] },
          maxScore: 1,
          totalPlayers: { $size: "$totalPlayers" },
        },
      },
    ]);

    return Response.json({
      rankings: topRecords,
      stats: stats[0] || {
        avgScore: 0,
        maxScore: 0,
        totalPlayers: 0,
      },
    });
  } catch (error) {
    return Response.json(
      { error: "獲取排行榜失敗" + error?.message },
      { status: 500 }
    );
  }
}
