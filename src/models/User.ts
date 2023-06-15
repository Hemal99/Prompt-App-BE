import mongoose, { Schema, Document, Model } from "mongoose";
import { Role } from "../utility/constants";

interface UserDoc extends Document {
  userName: string;
  uniqueId: string;
  deviceToken: string;
  role: Role;
}

const UserSchema = new Schema(
  {
    userName: { type: String, unique: true }, 
    uniqueId: { type: String },
    deviceToken: { type: String },
    role: { type: String },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const User = mongoose.model<UserDoc>("user", UserSchema);

export { User };
