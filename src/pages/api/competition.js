import { Server } from "socket.io";

export default function handler(req, res) {
  const { method } = req;
  const io = res.socket.server.io;

  if (!io) {
    return res.status(500).json({ error: "Socket.io not initialized" });
  }

  if (method === "POST") {
    // save score
    const { roomId, timeLimit, rows, columns } = req.body;
    if (!roomId || !timeLimit || !rows || !columns) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    io.of("/").adapter.rooms.get(roomId) ||
      io.of("/").adapter.rooms.set(roomId, new Set());
    io.sockets.emit("createCompetitionRoom", {
      roomId,
      timeLimit,
      rows,
      columns,
    });

    return res.status(200).json({ message: "Competition room created" });
  } else if (method === "GET") {
    // 獲取競賽結果

    const competitionRoom = io.of("/").adapter.rooms.get(roomId);
    if (!competitionRoom) {
      return res.status(404).json({ error: "Competition room not found" });
    }

    const results = competitionRoom.results || [];
    const participants = Array.from(competitionRoom.participants.values());

    return res.status(200).json({ results, participants });
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
