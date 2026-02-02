const WORDS = [
  "apple", "actor", "airplane", "animal", "answer", "apartment", "archive", "arrow", "artist", "aspect",
  "balance", "banana", "battery", "beach", "beacon", "beauty", "bedroom", "belief", "bicycle", "border",
  "bottle", "branch", "bread", "bridge", "browser", "budget", "building", "butter", "button", "camera",
  "canvas", "capital", "carpet", "castle", "category", "cellar", "center", "ceremony", "chain", "chair",
  "chance", "channel", "chapter", "circle", "citizen", "city", "climate", "clock", "cloud", "coffee",
  "column", "comfort", "command", "company", "concept", "concert", "control", "corner", "country", "courage",
  "course", "court", "craft", "credit", "crystal", "culture", "curtain", "cycle", "damage", "database",
  "dealer", "debate", "decision", "degree", "desert", "design", "detail", "device", "diamond", "direction",
  "director", "disease", "display", "distance", "document", "domain", "drawer", "driver", "economy",
  "editor", "effect", "effort", "engine", "episode", "estate", "event", "example", "exchange", "expert",
  "factor", "factory", "failure", "feature", "feather", "festival", "fiction", "field", "figure", "filter",
  "finger", "flower", "focus", "forest", "fortune", "frame", "freedom", "function", "gallery", "garden",
  "gateway", "gesture", "glass", "glory", "government", "grain", "graph", "gravity", "ground", "growth",
  "guide", "habit", "harbor", "hardware", "harmony", "headline", "health", "history", "holiday", "horizon",
  "hospital", "hotel", "hour", "house", "identity", "image", "impact", "income", "industry", "infection",
  "inflation", "information", "initiative", "insect", "instance", "instrument", "interest", "interface",
  "island", "issue", "item", "journey", "judge", "judgment", "junction", "justice", "keyboard", "kingdom",
  "knowledge", "ladder", "language", "laptop", "layer", "leader", "league", "learning", "letter", "library",
  "limit", "location", "logic", "machine", "magazine", "manager", "market", "material", "measure", "memory",
  "message", "method", "middle", "mirror", "mission", "model", "moment", "monitor", "month", "morning",
  "motion", "mountain", "movement", "museum", "music", "nation", "network", "noise", "notebook", "number",
  "object", "occasion", "office", "operation", "opinion", "opportunity", "option", "orange", "origin",
  "outcome", "package", "painting", "paper", "passage", "passion", "pattern", "payment", "people", "period",
  "permission", "person", "phase", "philosophy", "picture", "planet", "platform", "player", "pleasure",
  "policy", "position", "possibility", "practice", "pressure", "price", "priority", "problem", "process",
  "product", "profile", "project", "property", "proposal", "purpose", "quality", "quantity", "question",
  "reaction", "reality", "reason", "record", "region", "relation", "release", "religion", "reminder",
  "report", "request", "research", "resource", "response", "result", "review", "river", "role", "routine",
  "rule", "safety", "sample", "scene", "schedule", "school", "science", "screen", "script", "season",
  "section", "segment", "selection", "sense", "series", "service", "session", "shadow", "signal", "solution",
  "source", "space", "speaker", "species", "speech", "spirit", "standard", "statement", "station", "status",
  "storage", "strategy", "stream", "structure", "studio", "subject", "success", "suggestion", "summary",
  "support", "surface", "system", "table", "target", "task", "technology", "theory", "ticket", "time",
  "topic", "tradition", "traffic", "training", "transition", "transport", "travel", "treatment", "trend",
  "trial", "trust", "union", "unit", "universe", "update", "user", "value", "variation", "vehicle", "version",
  "victory", "village", "vision", "volume", "warning", "wealth", "weather", "website", "window", "wisdom",
  "worker", "world", "writer", "youth", "zone"
];

export const getWords = () => {
  const words = [];
  while (words.length < 8) {
    const randomIndex = Math.round(Math.random() * words.length);
    const word = WORDS[randomIndex];
    if (!words.includes(word))
      words.push(word);
  }
  return [words.slice(0, 4), words.slice(4)];
};