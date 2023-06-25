import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { UserLoginInput } from "../dto";
import { User } from "../models";
import { Admin } from "../models/Admin";
import { Role, Status } from "../utility/constants";

import { GenerateSignature, ValidatePassword } from "../utility";
import { Prompt } from "../models/Prompt";

export const AdminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(UserLoginInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length > 0) {
    return res.status(400).json(validationError);
  }

  const { email, password } = customerInputs;
  const user = await Admin.findOne({ email });
  if (user && user?.role === Role.Admin) {
    const validation = await ValidatePassword(
      password,
      user.password,
      user.salt
    );

    if (validation) {
      const signature = await GenerateSignature({
        _id: user._id,
        phone: user.phone,
        role: user.role,
      });

      return res.status(200).json({
        signature,
        phone: user.phone,
        id: user._id,
      });
    }
  }

  return res.status(401).json({ msg: "Invalid Credentials" });
};

export const GetUserProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (user && user.role === Role.Admin) {
      const profiles = await User.find({ role: Role.User });

      if (profiles) {
        return res.status(200).json(profiles);
      }
    }
    return res.status(400).json({ msg: "Error while Fetching Profiles" });
  } catch (error) {
    return res.sendStatus(500);
  }
};

// Approve Prompt

export const ApprovePrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const { status, id } = req.params;

    console.log("status", status);
    console.log("id", id);

    if (user && user.role === Role.Admin) {
      const prompt = await Prompt.findById(id);

      if (prompt) {
        if (status === "Approve") {
          prompt.status = Status.Approved;
        } else if (status === "Reject") {
          prompt.status = Status.Rejected;
        }
        await prompt.save();
        return res.status(200).json({ msg: "Prompt Approved" });
      }
    }
    return res.status(400).json({ msg: "Error while Approving Prompt" });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const GetAllPromptsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prompts = await Prompt.find().populate("author");
    return res.status(200).json(prompts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while getting Prompts" });
  }
};

export const DeletePrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user && user.role === Role.Admin) {
      const prompt = await Prompt.findOneAndDelete({ _id: id });

      if (prompt) {
        return res.status(200).json(prompt);
      }
    }
    return res.status(400).json({ msg: "Error while Deleting Prompts" });
  } catch (error) {
    return res.sendStatus(500);
  }
};

// Delete User

export const DeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (user && user.role === Role.Admin) {
      const user = await User.findOneAndDelete({ _id: id });

      if (user) {
        return res.status(200).json(user);
      }
    }
    return res.status(400).json({ msg: "Error while Deleting User" });
  } catch (error) {
    return res.sendStatus(500);
  }
};
