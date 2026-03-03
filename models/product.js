import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,    
  },
  images: [
    {
      id: String,
      url: String,
    },
  ],
  sold: {
    type: Number,
    default: 0,
    index:true
  },
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),    
  },
  isDeleted:{
    type:Boolean,
    default:false,    
  }
});

productSchema.index(
  {title:"text"},
  {name:"product_title_text_idx"}
);
productSchema.index({isDeleted:1, category:1, price:1},{name:"product_category_price_idx"})
productSchema.index({ isDeleted:1,category:1, createdAt:-1},{name:"product_category_idx"})
productSchema.index({isDeleted:1,createdAt:-1},{name:"product_createAt_idx"})
productSchema.index({sold:1},{name:"product_sold_idx"})

export const Product = mongoose.model("Product", productSchema);
