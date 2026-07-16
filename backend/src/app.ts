import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware";

import authRoutes from "./modules/auth/auth.routes";
import playerRoutes from "./modules/players/players.routes";
import guestRoutes from "./modules/guests/guests.routes";
import waitlistRoutes from "./modules/waitlist/waitlist.routes";
import matchRoutes from "./modules/matches/matches.routes";
import teamRoutes from "./modules/teams/teams.routes";
import votingRoutes from "./modules/voting/voting.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import statsRoutes from "./modules/stats/stats.routes";
import financeRoutes from "./modules/finance/finance.routes";
import rankingRoutes from "./modules/rankings/rankings.routes";
import achievementRoutes from "./modules/achievements/achievements.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import tvRoutes from "./modules/tv/tv.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/matches", teamRoutes);
app.use("/api/matches", votingRoutes);
app.use("/api/matches", attendanceRoutes);
app.use("/api/matches", statsRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/rankings", rankingRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tv", tvRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandlerMiddleware);
