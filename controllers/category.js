import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

// 🚀 **1. Create Category**
const addCategory = async (req, res) => {
    try {
        const { name, image, level_id } = req.body;

        // 🔸 Validate inputs
        if (!name?.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!level_id) {
            return res.status(400).json({ message: "Level ID is required" });
        }

        //check if level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // 🔸 Check if category name already exists
        const findCategoryQuery = `SELECT * FROM categories WHERE name = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [name]);

        if (existingCategory.length > 0) {
            return res.status(409).json({ message: "Category already exists" });
        }

        // 🔸 Insert new category
        const addCategoryQuery = `INSERT INTO categories (name, image, level_id) VALUES (?, ?, ?)`;
        const newCategory = await userQuery(addCategoryQuery, [name, image || "", level_id]);

        if (newCategory.affectedRows === 1) {
            return res.status(201).json({ message: "Category added successfully" });
        }

        return res.status(500).json({ message: "Failed to add category" });

    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 🚀 **2. Get All Categories**
const getCategories = async (req, res) => {
    try {
        const getCategoriesQuery = `SELECT * FROM categories`;
        const categories = await userQuery(getCategoriesQuery);

        if (categories.length > 0) {
            return res.status(200).json({ categories });
        }
        return res.status(404).json({ message: "No categories found" });

    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 🚀 **2. Get All Categories**
const getCategoriesByLevel = async (req, res) => {
    try {
        const { level_id } = req.params;
        // check if level exists
        
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        const getCategoriesQuery = `SELECT * FROM categories WHERE level_id = ?`;
        const categories = await userQuery(getCategoriesQuery, [level_id]);

        if (categories.length > 0) {
            return res.status(200).json({ categories });
        }
        return res.status(404).json({ message: "No categories found" });
       
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 🚀 **3. Update Category**
const updateCategory = async (req, res) => {
    try {
        const { id, name, image, level_id } = req.body;

        // 🔸 Validate inputs
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }
        if (!name?.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        if (!level_id) {
            return res.status(400).json({ message: "Level ID is required" });
        }

        // 🔸 Check if category exists by id
        const findCategoryQuery = `SELECT * FROM categories WHERE id = ?`;
        const existingCategory = await userQuery(findCategoryQuery, [id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        // 🔸 Check if category exists by name
        const findCategoryByNameQuery = `SELECT * FROM categories WHERE name = ?`;
        const existingCategoryByName = await userQuery(findCategoryByNameQuery, [name]);

        if (existingCategoryByName.length > 0 ) {
            return res.status(409).json({ message: "Category already exists with this name" });
        }
        
        //check if level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [level_id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // 🔸 Update category
        const updateCategoryQuery = `UPDATE categories SET name = ?, image = ?, level_id = ? WHERE id = ?`;
        const updatedCategory = await userQuery(updateCategoryQuery, [name, image || "", level_id, id]);

        if (updatedCategory.affectedRows === 1) {
            return res.status(200).json({ message: "Category updated successfully" });
        }

        return res.status(500).json({ message: "Failed to update category" });

    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 🚀 **4. Delete Category**
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const deleteCategoryQuery = `DELETE FROM categories WHERE id = ?`;
        const deletedCategory = await userQuery(deleteCategoryQuery, [id]);

        if (deletedCategory.affectedRows === 1) {
            return res.status(200).json({ message: "Category deleted successfully" });
        }

        return res.status(404).json({ message: "Category not found" });

    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ message: error.message });
    }
};

// 🔹 **Export APIs**
export default { addCategory, getCategories, updateCategory, deleteCategory, getCategoriesByLevel };
