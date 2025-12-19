import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "./routes/authRoutes";
import { connectRedis } from "./db/clienteRedis";

const app = Fastify({ logger: true });

app.register(cors);
app.register(authRoutes);

// Rota GET /
app.get("/", async () => {
  return {
    message: "API funcionando corretamente!"
  };
});

async function start() {
  try {
    await app.listen({ port: 3000 });
    await connectRedis();
    console.log("Servidor rodando na porta 3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
