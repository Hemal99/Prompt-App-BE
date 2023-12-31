import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { UserLoginInput } from "../dto";
import { Admin, User } from "../models";

import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} from "../utility";
import { Role, Status } from "../utility/constants";
import { sendMail } from "../services/MailService";
import { Prompt } from "../models/Prompt";
import { generateUniqueID } from "../utility/genarateID";


const mongoose = require("mongoose");

export const sendEmailFunc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, classId } = req.body;
    await sendMail(email, classId);
    return res.status(200).json({ message: "Email Sent" });
  } catch (err) {
    return res.sendStatus(500);
  }
};

export const UserSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const existingUser = await Admin.findOne({ email: email });

    if (existingUser !== null) {
      return res.status(400).json({ message: "User already exist!" });
    }

    const user = new Admin({
      email: email,
      password: userPassword,
      role: Role.Admin,
      salt: salt,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    });

    const result = await user.save();

    //Generate the Signature
    const signature = await GenerateSignature({
      _id: result._id,
      phone: result.phone,
      role: result.role,
    });
    // Send the result

    return res.status(201).json({
      signature,
      email: result.email,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

export const UserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(UserLoginInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  return res.json({ msg: "Message" });
};

export const GetPrompts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, update, rating, search, subCategories } = req.body;

    const currentDate = new Date();
    const timeIntervals = {
      1: {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        ),
      },
      2: {
        $gte: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 14
        ),
        $lt: new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        ),
      },
      3: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth()),
      },
      4: {
        $gte: new Date(currentDate.getFullYear() - 1),
        $lt: new Date(currentDate.getFullYear()),
      },
    };

    const query = {
      ...(category === "0" ? {} : { category }),
      ...(subCategories === "0" ? {} : { subCategories }),
      ...(update === "0" ? {} : { createdAt: timeIntervals[parseInt(update)] }),
      ...(rating === "0" ? {} : { rating: parseInt(rating) }),
      ...(search !== "" ? { $text: { $search: search } } : {}),
      status: Status.Approved,
    };
    const prompts = await Prompt.find(query).populate("author");

    return res.status(200).json(prompts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while getting Prompts" });
  }
};

export const GetLatestPrompts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prompts = await Prompt.find({
      status: Status.Approved,
    })
      .populate("author")
      .sort({ createdAt: -1 })
      .limit(6);
    return res.status(200).json(prompts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while getting Prompts" });
  }
};

export const GetPromptByAuthorId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorId = req.params.authorId;
    const prompts = await Prompt.find({
      author: authorId,
    }).populate("author");
    return res.status(200).json(prompts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while getting Prompts" });
  }
};

export const GetPromptById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const Id = req.params.Id;
    const prompts = await Prompt.findOne({
      _id: Id,
    }).populate("author");
    return res.status(200).json(prompts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while getting Prompts" });
  }
};
// add prompt

export const AddPrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      author,
      title,
      description,
      category,
      subCategories,
      action,
      inputParams,
      prompt,
      userId,
      designation,
    } = req.body;

    let user = null;

    if (userId !== "") {
      user = await User.findById(userId);
    }

    let promptId = "";
    let authorName = "";

    if (user) {
      promptId = user._id;
      authorName = user.userName;
    } else {
      const newUser = await User.create({
        userName: author,
        deviceToken: "test",
        role: Role.User,
        designation: designation,
      });

      promptId = newUser._id;
      authorName = newUser.userName;
    }

    const newPrompt = new Prompt({
      author: promptId,
      title,
      description,
      category,
      action,
      inputParams,
      prompt,
      subCategories,
      uniqueId: promptId,
    });

    const result = await newPrompt.save();

    return res.status(200).json({
      result,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while Adding Prompts" });
  }
};

export const UpdatePrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const updatedAttributes = req.body;
  updatedAttributes.status = Status.Pending;
  const objectId = req.params.Id;

  try {
    const testPrompt: any = await Prompt.findOne({ _id: objectId }).populate(
      "author"
    );
    const authorId = testPrompt?.author._id;

    const prompt = await Prompt.findOneAndUpdate(
      { _id: objectId },
      { $set: updatedAttributes },
      { new: true }
    );

    if (authorId) {
      await User.findOneAndUpdate(
        { _id: authorId },
        { $set: { designation: req.body.designation } },
        { new: true }
      );
    }

    return res.status(200).json(prompt);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while updating Prompt" });
  }
};

export const UpdateComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { comment, rate } = req.body;
  const promptId = req.params.promptId;
  try {
    const prompt = await Prompt.findOneAndUpdate(
      { _id: promptId },
      {
        $push: { comments: { comment, rate } },
      },
      { new: true }
    );

    return res.status(200).json(prompt);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while updating Prompt" });
  }
};

export const RatePrompt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { promptId, rating, deviceId } = req.body;
  try {
    const prompt1 = await Prompt.findOneAndUpdate(
      { _id: promptId },
      {
        $push: { ratingList: deviceId },
        $inc: { ratecount: 1, ratesum: rating },
      },
      { new: true }
    );
    const prompt = await Prompt.findOne({ _id: promptId });

    if (prompt) {
      const newRateCount = prompt.ratecount;
      const newRateSum = prompt.ratesum;
      const newRating = Math.round(newRateSum / newRateCount);

      await Prompt.findOneAndUpdate(
        { _id: promptId },
        {
          $set: {
            rating: newRating,
          },
        },
        { new: true }
      );
    }

    return res.status(200).json(prompt1);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error while updating Prompt" });
  }
};

