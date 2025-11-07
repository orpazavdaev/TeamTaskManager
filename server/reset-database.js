// Temporary script to reset all boards and tasks
// Run with: node reset-database.js

const mongoose = require("mongoose");
require("dotenv").config();

const BoardSchema = new mongoose.Schema({}, { strict: false });
const TaskSchema = new mongoose.Schema({}, { strict: false });

const Board = mongoose.model("Board", BoardSchema);
const Task = mongoose.model("Task", TaskSchema);

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/teamtaskmanager"
    );
    console.log("Connected to MongoDB");

    // Delete all tasks first
    const tasksResult = await Task.deleteMany({});
    console.log(`Deleted ${tasksResult.deletedCount} tasks`);

    // Delete all boards
    const boardsResult = await Board.deleteMany({});
    console.log(`Deleted ${boardsResult.deletedCount} boards`);

    console.log("\n✅ Database reset complete!");
    console.log(`   - Deleted ${tasksResult.deletedCount} tasks`);
    console.log(`   - Deleted ${boardsResult.deletedCount} boards`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
