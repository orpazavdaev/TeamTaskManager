import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for Angular frontend
    const allowedOrigins = [
      "http://localhost:4200",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Enable validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    const port = process.env.PORT || 3000;

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("🛑 Received SIGTERM, shutting down gracefully...");
      await app.close();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 Received SIGINT, shutting down gracefully...");
      await app.close();
      process.exit(0);
    });

    // Try to listen, with retry logic
    try {
      await app.listen(port);
      console.log(`🚀 Server is running on: http://localhost:${port}`);
    } catch (listenError) {
      if (listenError.code === "EADDRINUSE") {
        console.error(`⚠️  Port ${port} is already in use.`);
        console.error("   Waiting 2 seconds and retrying...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
          await app.listen(port);
          console.log(`🚀 Server is running on: http://localhost:${port}`);
        } catch (retryError) {
          throw listenError; // Throw original error if retry fails
        }
      } else {
        throw listenError;
      }
    }
  } catch (error) {
    console.error("❌ Error starting server:", error);
    if (error.code === "EADDRINUSE") {
      console.error(`⚠️  Port ${process.env.PORT || 3000} is already in use.`);
      console.error(
        "   Please stop the process using this port or use a different port."
      );
      console.error("   To find the process: netstat -ano | findstr :3000");
      console.error("   To kill it: taskkill /PID <PID> /F");
    }
    process.exit(1);
  }
}

bootstrap();
