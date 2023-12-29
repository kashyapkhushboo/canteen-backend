//============================REQUIRE MONGOOSE====================================================================
const { menuModel } = require("../../../models/menuModel");
const validator = require("../../../helper/validations");
//=============================LIST ALL MENUS====================================================================
const listMenu = async (req, res, next) => {
  try {
    let result = await menuModel.find({});
    return res.status(200).json({
      message: "Menus fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//=============================ADD NEW MENUS=====================================================================
// const addMenu = async (req, res, next) => {
//   let data = req.body;
//   try {
//     let requiredFeilds = {
//       title: data.title,
//       time:data.time
//     };
//     let error = validator.isRequired(requiredFeilds);
//     if (error.length != 0) {
//       return res.status(400).json({ error: error });
//     } else {
//       let isTitleAlreadyExist = await menuModel.findOne({
//         title:{ $regex: new RegExp(`\\b${req.body.item_name}\\b`, 'i') },
//       });
//       if (!isTitleAlreadyExist) {
//         let newMenu = new menuModel(data);
//         let result = await newMenu.save();
//        return res
//           .status(200)
//           .json({ message: "Menu added successfully", data: result });
//       } else {
//         return res.status(400).json({ error: "Title already exists." });
//       }
//     }
//   } catch (err) {
//     return res.status(400).json({ message: err.message });
//   }
// };

const addMenu = async (req, res, next) => {
  let data = req.body;
  try {
    let requiredFeilds = {
      title: data.title,
      time:data.time
    };
    let error = validator.isRequired(requiredFeilds);
    if (error.length != 0) {
      return res.status(400).json({ error: error });
    } else {
      let isTitleAlreadyExist = await menuModel.findOne({
        title:{ $regex: new RegExp(`\\b${req.body.item_name}\\b`, 'i') },
      });
      if (!isTitleAlreadyExist) {
        let newMenu = new menuModel(data);
        let result = await newMenu.save();
       return res
          .status(200)
          .json({ message: "Menu added successfully", data: result });
      } else {
        return res.status(400).json({ error: "Title already exists." });
      }
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

//=============================UPDATE MENUS======================================================================
const updateMenu = async (req, res, next) => {
  let data = req.body;
  try {
    let requiredFeilds = {
      title: data.title,
    };
    let error = validator.isRequired(requiredFeilds);
    if (error.length != 0) {
      return res.status(400).json({ error: error });
    } else {
      let isIdExist = await menuModel.findOne({
        _id: req.query.id,
      });
      if (isIdExist) {
        let isTitleAlreadyExist = await menuModel.findOne({
          title: { $regex: new RegExp(`\\b${req.body.item_name}\\b`, 'i') },
          _id: { $ne: req.query.id },
        });
        if (!isTitleAlreadyExist) {
          let result = await menuModel.findByIdAndUpdate(req.query.id, data);
          return res
            .status(200)
            .json({ message: "Menu updated successfully", data: result });
        } else {
          return res
            .status(400)
            .json({ message: "This title is already exists." }); 
        }
      } else {
        return res.status(400).json({ message: "Invalid menu id" });
      }
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
//==============================DELETE MENUS=====================================================================
const deleteMenu = async (req, res, next) => {
  let menuId = req.query.id;
  try {
    if (menuId) {
      let isMenuIdExist = await menuModel.findOne({ _id: menuId });
      if (isMenuIdExist) {
        await menuModel.findByIdAndRemove(menuId);
        return res.status(200).json({ message: "Menu deleted successfully" });
      } else {
        return res.status(500).json({ message: "Invalid menu id" });
      }
    } else {
      return res.status(500).json({ message: "Menu id is required." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
//=======================EXPORT FUNCTIONS==========================================================================
module.exports = {
  listMenu,
  addMenu,
  updateMenu,
  deleteMenu, 
};