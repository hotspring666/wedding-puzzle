import dbConnect from "@/lib/db";
import Record from "@/models/Record";

// 獲取遊戲紀錄
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const limit = Number(searchParams.get("limit")) || 10;

    const query = gameId ? { gameId } : {};

    const records = await Record.find(query)
      .sort({ number: -1 }) // 按分數降序排序
      .limit(limit);

    return Response.json({ records });
  } catch (error) {
    console.error("獲取紀錄失敗:", error);
    return Response.json({ error: "獲取紀錄失敗" }, { status: 500 });
  }
}

// 創建新紀錄
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    if (!body.name || !body.gameId || !body.time)
      throw new Error("沒有必填欄位");
    const record = await Record.create({
      name: body.name,
      gameId: body.gameId,
      time: body.time,
    });

    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "創建紀錄失敗: " + error?.message },
      { status: 500 }
    );
  }
}
