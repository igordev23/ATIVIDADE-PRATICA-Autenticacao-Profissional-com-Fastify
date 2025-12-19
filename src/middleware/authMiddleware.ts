import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../services/tokenServices";

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        reply.status(401).send({ error: "Token não fornecido" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        await verifyAccessToken(token);
    } catch (err) {
        reply.status(401).send({ error: "Token inválido ou expirado" });
    }
}
