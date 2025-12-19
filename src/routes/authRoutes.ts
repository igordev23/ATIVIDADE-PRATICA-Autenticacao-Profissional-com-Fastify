import { FastifyInstance } from "fastify";
import {
    loginProfissional,
    protectedProfissional,
    refresh,
    logoutProfissional
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

export default async function authRoutes(fastify: FastifyInstance) {
    // FLUXO PROFISSIONAL
    fastify.post("/auth/login", loginProfissional);

    // Rota protegida com middleware
    fastify.get("/auth/protected", { preHandler: authMiddleware }, protectedProfissional);

    fastify.post("/auth/refresh", refresh);

     // Nova rota para logout
    fastify.post("/auth/logout", { preHandler: authMiddleware }, logoutProfissional);
}