import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
export const uploadOnCloud = async (files) => {
  try {
    if (!files) {
      return null;
    }
    const uploadResult = await Promise.all(
      files.map((img) => cloudinary.uploader.upload(img.path)),
    );
    await Promise.all(files.map((img) => fs.unlink(img.path)));
    return uploadResult.map((img) => ({
      id: img.public_id,
      url: img.secure_url,
    }));
  } catch (error) {
    console.log(error);
  }
};

export const deleteFromCloud = async(images)=>{
  try {
    await Promise.all(
      images.map(img=>
        cloudinary.uploader.destroy(img.id)
      )
    )
  } catch (error) {
    console.log(error)
  }
}
