import { app } from "./app";
import { env } from "./config/env";
import { startCronJobs } from "./jobs";

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Servidor Patota Becker rodando na porta ${env.port}`);
  startCronJobs();
});
