import { FastifyReply, FastifyRequest } from
    "fastify";
import jwt from "jsonwebtoken";
import users from "../users.json";
import { User } from "../types/user";

import { generateAccessToken, generateRefreshToken, saveAccessTokenInCache, getAccessTokenFromCache, deleteAccessTokenFromCache } from "../services/tokenServices";

const ACCESS_SECRET = "segredo";
const REFRESH_SECRET = "refresh-secreto";

export async function loginProfissional(req: FastifyRequest, reply: FastifyReply) {
    console.log("Recebendo requisição para /auth/login...");
    console.log("Corpo da requisição:", req.body);

    const { email, password } = req.body as { email: string; password: string };

    console.log("Email recebido:", email);
    console.log("Password recebido:", password);

    const user = (users as User[]).find(u => u.email === email);
    if (!user) {
        console.log("Usuário não encontrado");
        return reply.code(401).send({ error: "Credenciais inválidas" });
    }

    if (password !== "123456") {
        console.log("Senha incorreta");
        return reply.code(401).send({ error: "Senha incorreta" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log("Tokens gerados:", { accessToken, refreshToken });

    await saveAccessTokenInCache(user.id, accessToken);

    console.log("Token salvo no Redis");

    return reply.send({ accessToken, refreshToken });
}

export async function protectedProfissional(req:
    FastifyRequest, reply: FastifyReply) {
    const auth = req.headers.authorization;

    if (!auth) return reply.code(401).send({
        error:
            "Sem token"
    });

    const token = auth.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;

        const cached = await
            getAccessTokenFromCache(decoded.id);
        if (cached !== token)
            return reply.code(401).send({
                error: "Token expirado no cache"
            });

        return reply.send({
            message: "Acesso autorizado", user: decoded
        });

    } catch (err) {
        return reply.code(401).send({
            error: "Token inválido ou expirado"
        });
    }
}

export async function refresh(req: FastifyRequest,
    reply: FastifyReply) {
    const { refreshToken } = req.body as {
        refreshToken: string
    };

    try {
        const decoded = jwt.verify(refreshToken,
            REFRESH_SECRET) as jwt.JwtPayload;

        const user = (users as User[]).find(u => u.id
            === decoded.id)!;

        const newAccess = generateAccessToken(user);
        await saveAccessTokenInCache(user.id, newAccess);

        return reply.send({ accessToken: newAccess });

    } catch (err) {
        return reply.code(401).send({
            error: "Refresh token inválido"
        });
    }
    
}
// Nova função para logout
export async function logoutProfissional(req: FastifyRequest, reply: FastifyReply) {
    const auth = req.headers.authorization;

    if (!auth) return reply.code(401).send({ error: "Sem token" });

    const token = auth.replace("Bearer ", "");

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;

        // Remove o token do Redis
        await deleteAccessTokenFromCache(decoded.id);

        return reply.send({ message: "Logout realizado com sucesso" });
    } catch (err) {
        return reply.code(401).send({ error: "Token inválido ou expirado" });
    }
}