import { Elysia } from "elysia";
import { HttpError } from "./auth/session";
import { postsRoutes } from "./routes/posts";
import { savedPostsRoutes } from "./routes/saved-posts";

export const app = new Elysia()
  .onError(({ code, error, set }) => {
    console.error("API error", code, error);

    if (error instanceof HttpError) {
      set.status = error.status;
      return { message: error.message };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return { message: "Invalid request" };
    }

    set.status = 500;
    return { message: "Internal server error" };
  })
  .get("/health", () => ({ ok: true }))
  .use(postsRoutes)
  .use(savedPostsRoutes);
