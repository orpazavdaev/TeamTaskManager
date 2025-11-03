import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { BoardsModule } from "./boards/boards.module";
import { TasksModule } from "./tasks/tasks.module";
import { GatewayModule } from "./gateway.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || "mongodb://localhost:27017/teamtaskmanager"
    ),
    GatewayModule,
    AuthModule,
    BoardsModule,
    TasksModule,
  ],
})
export class AppModule {}
