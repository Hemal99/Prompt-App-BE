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
import { Role } from "../utility/constants";
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
    const prompts = await Prompt.find({});

    return res.status(200).json(prompts);
  } catch (err) {
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
    const { author, title, description, category, action, inputParams, prompt } =
      req.body;

    // generate unique id
    const id = generateUniqueID(author);

    console.log(id);

    const newPrompt = new Prompt({
      author,
      title,
      description,
      category,
      action,
      inputParams,
      prompt,
      uniqueId: id,
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
