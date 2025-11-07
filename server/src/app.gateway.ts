import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "http://localhost:4200",
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join-board")
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string
  ) {
    client.join(`board-${boardId}`);
    console.log(`Client ${client.id} joined board ${boardId}`);
  }

  @SubscribeMessage("leave-board")
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string
  ) {
    client.leave(`board-${boardId}`);
    console.log(`Client ${client.id} left board ${boardId}`);
  }

  // Broadcast task updates to all clients in a board
  broadcastTaskUpdate(
    boardId: string,
    task: any,
    action: "create" | "update" | "delete"
  ) {
    this.server.to(`board-${boardId}`).emit("task-update", { action, task });
  }

  // Broadcast board updates
  broadcastBoardUpdate(board: any, action: "create" | "update" | "delete") {
    this.server.emit("board-update", { action, board });
  }

  // Broadcast project updates
  broadcastProjectUpdate(project: any, action: "create" | "update" | "delete") {
    this.server.emit("project-update", { action, project });
  }
}
