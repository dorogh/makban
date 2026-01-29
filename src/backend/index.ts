import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

// Serve static files from the built frontend
const publicPath = path.join(process.cwd(), "dist/public");
fastify.register(fastifyStatic, {
  root: publicPath,
  prefix: "/",
});

// Fallback to index.html for client-side routing
fastify.setNotFoundHandler((_request, reply) => {
  reply.sendFile("index.html", publicPath);
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3000");
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    console.log(`Server is running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
