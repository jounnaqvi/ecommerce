import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products", // Ensure this matches your Products model name
      },
    ],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "User", // Correct the model reference here
    },
    status: {
      type: String,
      default: "Not Process",
      enum: ["Not Process", "Processing", "Shipped", "Delivered", "Cancel"], // Fixed typo in "delivered" and "cancel"
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
