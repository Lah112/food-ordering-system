import foodModel from "../models/foodModel.js";
import fs from 'fs'

// add food item
const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`

  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  })

  try {
    await food.save();
    res.json({ success: true, message: "Food Added" })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

// all food list
const listFood = async (req, res) => {
  try {
    const searchQuery = req.query.search || req.query.q;;
    let foods;

    if (searchQuery) {
      foods = await foodModel.find({
        name: { $regex: searchQuery, $options: "i" },
      });
    } else {
      foods = await foodModel.find({});
    }

    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
} // ✅ This was missing!

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => { })
    await foodModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: "Food Removed" })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

const updateFood = async (req, res) => {
  const { id, name, category, price } = req.body;

  try {
    const food = await foodModel.findById(id);
    if (!food) return res.json({ success: false, message: "Food not found" });

    food.name = name;
    food.category = category;
    food.price = price;

    await food.save();
    res.json({ success: true, message: "Food updated successfully" });
  } catch (error) {
    console.log("Error updating food:", error);
    res.json({ success: false, message: "Update failed" });
  }
};

export { addFood, listFood, removeFood, updateFood };

