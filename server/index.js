require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth_routes");
const tenantRoutes = require("./routes/tenant_routes");
const inviteRoutes = require("./routes/invite_routes");

const authMiddleware = require("./middlewares/auth_middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/invites", inviteRoutes);
app.get("/", (req, res) => {
  res.send("Inventio API is running!");
});

const PORT = process.env.BE_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
