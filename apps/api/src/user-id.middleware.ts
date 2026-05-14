import { Injectable, NestMiddleware } from "@nestjs/common";
import { userIdStorage, DEFAULT_USER_ID } from "./modules/user-context";

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use(req: any, _res: any, next: () => void): void {
    const raw = req.headers["x-user-id"] as string | string[] | undefined;
    const userId = Array.isArray(raw) ? raw[0] : raw;
    const safe = typeof userId === "string" && userId.trim() ? userId.trim() : DEFAULT_USER_ID;
    userIdStorage.run(safe, next);
  }
}
