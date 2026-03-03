import { Address } from "../models/address.js";
import tryCatch from "../utils/trycatch.js";

export const addAddress = tryCatch(async (req, res) => {
  const { address, phone } = req.body;
  await Address.create({
    address,
    phone,
    user: req.user.id,
  });
  res.status(201).json({
    message: "Address Created",
  });
});

export const allAddress = tryCatch(async (req, res) => {
  const allAddress = await Address.find({ user: req.user.id });

  res.status(200).json({
    allAddress,
  });
});

export const singleAddress = tryCatch(async (req, res) => {
  const singleAddress = await Address.findById({
    _id: req.params.id,
    user: req.user.id,
  });
  res.status(200).json({
    singleAddress,
  });
});
export const removeAddress = tryCatch(async (req, res) => {
  const address = await Address.findByIdAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!address) {
    return res.status(404).json({
      message: "Address not Found",
    });
  }
  res.status(200).json({
    message: "Address Removed",
  });
});
