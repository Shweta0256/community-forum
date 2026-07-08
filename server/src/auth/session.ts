export type Session = {
  userId: string;
  role: "student" | "moderator";
  locale: "en" | "es";
};

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function requireSession(request: Request): Session {
  const userId = request.headers.get("x-user-id");
  const role = request.headers.get("x-role");
  const locale = request.headers.get("x-locale") === "es" ? "es" : "en";

  if (!userId || (role !== "student" && role !== "moderator")) {
    throw new HttpError(401, "Unauthenticated");
  }

  return {
    userId,
    role,
    locale
  } satisfies Session;
}
