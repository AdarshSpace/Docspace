import { Schema, models, model } from "mongoose";

const documentShareSchema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sharedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

documentShareSchema.index(
  { documentId: 1, userId: 1 },
  { unique: true }
);

const DocumentShare =
  models.DocumentShare ||
  model("DocumentShare", documentShareSchema, "documentShares");

export default DocumentShare;