//============================REQUIRE MONGOOSE====================================================================
const { menuModel } = require("../../../models/menuModel");
const { subMenuModel } = require("../../../models/subMenuModel");
const validator = require("../../../middlewares/validations");

//=============================LIST ALL Sub MENUS====================================================================

// const listSubMenu = async (req, res, next) => {
//   try {
//     let result;
//     let submenuId = req.query.menu_id;
//     if (!submenuId) {
//       result = await subMenuModel.find({});
//     } else {
//       result = await subMenuModel.find({ menu_id: submenuId });
//     }
//     return res.status(200)
          // .json({
          //   statusCode: 200,
//       message: "Sub menus fetched successfully",
//       data: result,
//     });
//   } catch (err) {
//     return res.status(500)
          // .json({
          //   statusCode: 500, message: err.message });
//   }
// };
// const listSubMenu = async (req, res, next) => {
//   try {
//     let menu_id = req.query.menu_id;
//     let menuData = [];
//     if (!menu_id) {
//     const menus = await menuModel.find({}, '_id title time');
//     for (const menu of menus) {
//       const items = await subMenuModel.find({ menu_id: menu._id }, 'quantity item_name price createdAt updatedAt');
//       const menuObject = {
//         _id: menu._id,
//         quantity:menu.quantity,
//         title: menu.title,
//         time: menu.time,
//         items,
//         createdAt: menu.createdAt,
//         updatedAt: menu.updatedAt,
//       };
//         menuData.push(menuObject);
//     }
//   }else{
//     let isMenuIdValid = await menuModel.findOne({_id:menu_id});
    
//          if(!isMenuIdValid){return res.status(404).json({ error: "Invalid menu id." });}
//        let items = await subMenuModel.find({ menu_id: menu_id });
//           menuData = {
//           _id: isMenuIdValid._id,
//           quantity:isMenuIdValid.quantity,
//           title: isMenuIdValid.title,
//           time:isMenuIdValid.time,
//           items,
//           createdAt: isMenuIdValid.createdAt,
//           updatedAt: isMenuIdValid.updatedAt,
//         };
//   }
//     return res.status(200)
          // .json({
          //   statusCode: 200,
//       message: "Sub menus fetched successfully",
//       data: menuData,
//     });
//   } catch (err) {
//     return res.status(500)
          // .json({
          //   statusCode: 500, message: err.message });
//   }
// };



const listSubMenu = async (req, res) => {
  try {
  
    let menu_id = req.query.menu_id;
    let menuData = [];
    if (!menu_id) {
      const menus = await menuModel.find({}, '_id title time');
      const menuPromises = menus.map(async (menu) => {
        const items = await subMenuModel.find(
          { menu_id: menu._id },
          'quantity item_name price  createdAt updatedAt'
          //COUNT
        );
        return {
          _id: menu._id,
          title: menu.title,
          time: menu.time,
          items,
        };
      });
      menuData = await Promise.all(menuPromises);
    } else {
      let isMenuIdValid = await menuModel.findOne({ _id: menu_id });

      if (!isMenuIdValid) {
        return res.status(404).json({ error: "Invalid menu id." });
      }

      const items = await subMenuModel.find(
        { menu_id: menu_id },
        'quantity item_name price  createdAt updatedAt'
        //COUNT
      );
      menuData = {
        _id: isMenuIdValid._id,
        title: isMenuIdValid.title,
        time: isMenuIdValid.time,
        items,
        // count:isMenuIdValid.count
  
      };
    }

    return res.status(200)
          .json({
            statusCode: 200,
      message: "Sub menus fetched successfully",
      data: menuData,
    });
  } catch (err) {
    return res.status(500)
          .json({
            statusCode: 500, message: err.message });
  }
};


// const listSubMenu = async (req, res) => {
//   try {
//     let menu_id = req.query.menu_id;
//     let menuData = [];

//     if (!menu_id) {
//       const menus = await menuModel.find({}, '_id title time');
//       const menuPromises = menus.map(async (menu) => {
//         const items = await subMenuModel.find(
//           { menu_id: menu._id },
//           'quantity item_name price count createdAt updatedAt'
//         );
//         const menuWithItems = {
//           _id: menu._id,
//           title: menu.title,
//           time: menu.time,
//           items: items.map(item => ({
//             title: menu.title, // Set the title for each item to the menu title
//             _id: item._id,
//             item_name: item.item_name,
//             price: item.price,
//             quantity: item.quantity,
//             count: item.count,
//             createdAt: item.createdAt,
//             updatedAt: item.updatedAt,
//           })),
//         };
//         return menuWithItems;
//       });
//       menuData = await Promise.all(menuPromises);
//     } else {
//       let isMenuIdValid = await menuModel.findOne({ _id: menu_id });

//       if (!isMenuIdValid) {
//         return res.status(404).json({ error: "Invalid menu id." });
//       }

//       const items = await subMenuModel.find(
//         { menu_id: menu_id },
//         'quantity item_name price count createdAt updatedAt'
//       );

//       menuData = {
//         _id: isMenuIdValid._id,
//         title: isMenuIdValid.title,
//         time: isMenuIdValid.time,
//         items: items.map(item => ({
//           title: isMenuIdValid.title, // Set the title for each item to the menu title
//           _id: item._id,
//           item_name: item.item_name,
//           price: item.price,
//           quantity: item.quantity,
//           count: item.count,
//           createdAt: item.createdAt,
//           updatedAt: item.updatedAt,
//         })),
//         count: isMenuIdValid.count,
//       };
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       message: "Sub menus fetched successfully",
//       data: menuData,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// };




//=============================ADD NEW Sub MENUS=====================================================================
const addSubMenu = async (req, res, next) => {
  let {item_name, menu_id, price} = req.body;
  try {
    const requiredFields = { item_name, menu_id, price };
    const error = validator.isRequired(requiredFields);
    
    if (error.length) return res.status(400).json({ statusCode: 400, message:error });
              
    const isTitleAlreadyExist = await subMenuModel.findOne({
      item_name: { $regex: new RegExp(`\\b${item_name}\\b`, 'i') },
      menu_id,
    });
    
    if (isTitleAlreadyExist) return res.status(400).json({ statusCode: 400, message: "Title already exists" });
    
    const isMenuExists = await menuModel.findOne({ _id: menu_id });
    
    if (!isMenuExists) return res.status(400).json({ statusCode: 400, message: "Invalid menu id." });
    
    const newSubMenu = new subMenuModel({ item_name, menu_id, price });
    const result = await newSubMenu.save();
    
    return res.status(200).json({ message: "Sub menu added successfully", data: result });
    
  } catch (err) {
    return res.status(500)
          .json({
            statusCode: 500, message: err.message });
  }
};
//=============================UPDATE SUB MENUS======================================================================

const updateSubMenu = async (req, res, next) => {
  let {_id, item_name, menu_id, price} = req.body;
  try {
      const requiredFields = { _id, item_name, menu_id, price };
      const error = validator.isRequired(requiredFields);

      if (error.length) return res.status(400).json({ statusCode: 400, message:error });

      const isIdExist = await subMenuModel.findOne({ _id });

      if (isIdExist) {
        const isTitleAlreadyExist = await subMenuModel.findOne({
          item_name: { $regex: new RegExp(`\\b${item_name}\\b`, 'i') },
          _id: { $ne: _id },
          menu_id,
        });

        if (!isTitleAlreadyExist) {
          await subMenuModel.findByIdAndUpdate(_id, {item_name,menu_id,price});

          return res.status(200).json({ message: "Sub Menu updated successfully" });
        } else {
          return res.status(400).json({ message: "This title is already exists." });
        }
      } else {
        return res.status(400).json({ statusCode: 400, message: "Invalid sub menu id" });
      }

  } catch (err) {
   return res.status(500)
          .json({
            statusCode: 500, message: err.message });
  }
};
//==============================DELETE Sub MENUS=====================================================================
const deleteSubMenu = async (req, res, next) => {
  let subMenuId = req.query.id;

  try {
    if(!subMenuId){ return res.status(400).json({statusCode: 400, error: "Sub Menu id is required." });}
    let isMenuIdExist = await subMenuModel.findOne({ _id: subMenuId });
    if (!isMenuIdExist) {return res.status(400).json({ statusCode: 400,message: "Invalid sub menu id" }); }
      await subMenuModel.findByIdAndRemove(subMenuId);
      return res.status(200).json({statusCode: 200, message: "Sub menu deleted successfully" });
  } catch (err) {
    res.status(500).json({statusCode: 500, message: err.message });
  }
};
//=======================EXPORT FUNCTIONS==========================================================================
module.exports = {
  listSubMenu,
  addSubMenu,
  updateSubMenu,
  deleteSubMenu,
};