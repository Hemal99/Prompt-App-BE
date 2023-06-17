import mongoose, { Schema, Document, Model } from "mongoose";
import { Status } from "../utility/constants";

interface PromptDoc extends Document {
  title: string;
  description: string;
  author: string;
  category: string;
  action: string;
  keywords: string;
  prompt: string;
  uniqueId: string;
  status: Status;
}

const PromptSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    category: { type: String },
    action: { type: String },
    inputParams: { type: String },
    prompt: { type: String },
    uniqueId: { type: String },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Pending,
    },
    rating: { type: Number, default: 0 },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

PromptSchema.index({ "$**": "text" });

const Prompt = mongoose.model<PromptDoc>("prompt", PromptSchema);

export { Prompt };
