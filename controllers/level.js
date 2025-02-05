import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addLevel = async (req, res) => {
    try {
        const { name, type } = req.body;

        // Validate input
        if (!name?.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const validTypes = ["Easy", "Medium", "Hard"];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({ message: "Type must be 'Easy', 'Medium', or 'Hard'" });
        }

        // Check if the level already exists
        const findLevelQuery = `SELECT * FROM levels WHERE name = ?`;
        const existingLevel = await userQuery(findLevelQuery, [name]);

        if (existingLevel.length > 0) {
            return res.status(409).json({ message: "Level already exists" });
        }

        // Insert new level
        const addLevelQuery = `INSERT INTO levels (name, type) VALUES (?, ?)`;
        const newLevel = await userQuery(addLevelQuery, [name, type]);

        if (newLevel.affectedRows === 1) {
            return res.status(201).json({ message: "Level added successfully" });
        }

        return res.status(500).json({ message: "Failed to add level" });

    } catch (error) {
        console.error("Error adding level:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const getLevels = async (req, res) => {
    const getLevelsQuery = `SELECT * FROM levels`;
    try {
        const levels = await userQuery(getLevelsQuery);
        if (levels.length > 0) {
        return res.status(200).json({ levels });
        }
        return res.status(404).json({ message: "No levels found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const updateLevel = async (req, res) => {
    try {
        const { id, name, type } = req.body;

        // Validate inputs
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        if (!name?.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }

        const validTypes = ["Easy", "Medium", "Hard"];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({ message: "Type must be 'Easy', 'Medium', or 'Hard'" });
        }

        // Check if the level exists
        const findLevelQuery = `SELECT * FROM levels WHERE id = ?`;
        const existingLevel = await userQuery(findLevelQuery, [id]);

        if (existingLevel.length === 0) {
            return res.status(404).json({ message: "Level not found" });
        }

        // Check if a level with the new name already exists (excluding current level)
        const checkDuplicateQuery = `SELECT * FROM levels WHERE name = ? AND id != ?`;
        const duplicateLevel = await userQuery(checkDuplicateQuery, [name, id]);

        if (duplicateLevel.length > 0) {
            return res.status(409).json({ message: "A level with this name already exists" });
        }

        // Update level
        const updateLevelQuery = `UPDATE levels SET name = ?, type = ? WHERE id = ?`;
        const updatedLevel = await userQuery(updateLevelQuery, [name, type, id]);

        if (updatedLevel.affectedRows === 1) {
            return res.status(200).json({ message: "Level updated successfully" });
        }

        return res.status(500).json({ message: "Failed to update level" });

    } catch (error) {
        console.error("Error updating level:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const deleteLevel = async (req, res) => {
    const { id } = req.params;
    const deleteLevelQuery = `DELETE FROM levels WHERE id = ?`;
    try {
        const deletedLevel = await userQuery(deleteLevelQuery, id);
        if (deletedLevel.affectedRows === 1) {
        return res.status(200).json({ message: "Level deleted successfully" });
        }
        return res.status(404).json({ message: "Level not found" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export default { addLevel, getLevels, updateLevel, deleteLevel };