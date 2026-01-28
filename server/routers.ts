import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/authRouter";
import { generateRouter } from "./routers/generateRouter";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  generate: generateRouter,
});

export type AppRouter = typeof appRouter;
