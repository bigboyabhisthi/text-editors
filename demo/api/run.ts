import { PrismaClient } from "@prisma/client";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { brotliCompressSync, deflateSync, gzipSync } from "zlib";

type RequestBody = {
  query: string;
};

const allowedOrigins = [
  "http://localhost:3000",
  "https://qc.prisma-adp.vercel.app",
];

export default async function types(req: VercelRequest, res: VercelResponse) {
  if (allowedOrigins.includes(req.headers.origin || "")) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin!);
  }

  res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept-Encoding"
  );

  if (req.method === "OPTIONS") {
    return res.end();
  }

  if (req.method !== "POST") {
    return res.status(400).send("Bad Request");
  }

  const { query } = req.body as RequestBody;

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  const queryResponse = {
    error: null,
    data: null,
  };

  const prisma = new PrismaClient();
  try {
    queryResponse.data = await new AsyncFunction(
      "prisma",
      `return await ${query}`
    )(prisma);
  } catch (e) {
    console.error("Error executing query", e.message);
    queryResponse.error = e.message;
  }
  await prisma.$disconnect();

  const responseBody = JSON.stringify({
    query,
    response: queryResponse,
  });

  res.setHeader("Content-Type", "application/json");

  // Naive implementation, but good enough for a demo lol
  const acceptsEncoding = req.headers["accept-encoding"];
  if (acceptsEncoding?.includes("br")) {
    return res
      .setHeader("Content-Encoding", "br")
      .send(brotliCompressSync(Buffer.from(responseBody, "utf-8")));
  } else if (acceptsEncoding?.includes("gzip")) {
    return res
      .setHeader("Content-Encoding", "gzip")
      .send(gzipSync(Buffer.from(responseBody, "utf-8")));
  } else if (acceptsEncoding?.includes("gzip")) {
    return res
      .setHeader("Content-Encoding", "deflate")
      .send(deflateSync(Buffer.from(responseBody, "utf-8")));
  } else {
    return res.json({ query, response: responseBody });
  }
}
