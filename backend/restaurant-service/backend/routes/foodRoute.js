import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import { updateFood } from "../controllers/foodController.js";


const foodRouter = express.Router();

// Image storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})

foodRouter.post("/add", upload.single("image"), addFood)

foodRouter.get("/list", listFood)

foodRouter.post("/remove", removeFood)

foodRouter.get("/list", listFood);

foodRouter.post("/update", updateFood);





export default foodRouter;