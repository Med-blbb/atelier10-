import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  products: [
    {
      name: String,
      description: String,
      price: Number,
    },
  ],
  total: Number,
});

export default mongoose.model("order", OrderSchema);
