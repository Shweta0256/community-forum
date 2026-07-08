export type SaveRecord = {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type SaveCommandResult =
  | { action: "created"; record: SaveRecord }
  | { action: "reactivated"; record: SaveRecord }
  | { action: "noop"; record: SaveRecord };

export type UnsaveCommandResult =
  | { action: "soft-deleted"; record: SaveRecord }
  | { action: "noop"; record: SaveRecord | null };

export function savePost(params: {
  existingRecord: SaveRecord | null;
  userId: string;
  postId: string;
  now: Date;
  createId: () => string;
}): SaveCommandResult {
  const { existingRecord, userId, postId, now, createId } = params;

  if (!existingRecord) {
    return {
      action: "created",
      record: {
        id: createId(),
        userId,
        postId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      }
    };
  }

  if (existingRecord.deletedAt === null) {
    return {
      action: "noop",
      record: {
        ...existingRecord,
        updatedAt: now
      }
    };
  }

  return {
    action: "reactivated",
    record: {
      ...existingRecord,
      updatedAt: now,
      deletedAt: null
    }
  };
}

export function unsavePost(params: {
  existingRecord: SaveRecord | null;
  now: Date;
}): UnsaveCommandResult {
  const { existingRecord, now } = params;

  if (!existingRecord || existingRecord.deletedAt !== null) {
    return {
      action: "noop",
      record: existingRecord
    };
  }

  return {
    action: "soft-deleted",
    record: {
      ...existingRecord,
      updatedAt: now,
      deletedAt: now
    }
  };
}
