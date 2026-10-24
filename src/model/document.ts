
import { Schema, models, model } from "mongoose";

const documentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled document",
      maxlength: 200,
    },
    content: {
      type: String,
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const DocumentModel =
  models.Document || model("Document", documentSchema, "documents");

export default DocumentModel;
