import express from "express";
import cors from "cors";
import {
  loadAllData,
  searchEntities,
  searchCraftableItems,
  searchMobs,
} from "./data/dataLoader";
import classicRoutes from "./routes/classicRoutes";
import craftingRoutes from "./routes/craftingRoutes";
import textureRoutes from "./routes/textureRoutes";
import soundRoutes from "./routes/soundRoutes";
import silhouetteRoutes from "./routes/silhouetteRoutes";
import timelineRoutes from "./routes/timelineRoutes";
import reverseCraftingRoutes from "./routes/reverseCraftingRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Load data
loadAllData();

// Routes
app.use("/api/classic", classicRoutes);
app.use("/api/crafting", craftingRoutes);
app.use("/api/texture", textureRoutes);
app.use("/api/sound", soundRoutes);
app.use("/api/silhouette", silhouetteRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/reverse-crafting", reverseCraftingRoutes);

// Search endpoint
app.get("/api/items/search", (req, res) => {
  const query = ((req.query.q as string) || "").slice(0, 100);
  const mode = (req.query.mode as string) || "";
  if (query.length < 1) {
    return res.json([]);
  }
  let results;
  if (mode === "crafting") {
    results = searchCraftableItems(query, 10);
  } else if (mode === "silhouette") {
    results = searchMobs(query, 10);
  } else {
    results = searchEntities(query, 10);
  }
  res.json(results);
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Only listen if this file is run directly (not imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Craftdle server running on http://localhost:${PORT}`);
  });
}

export default app;
