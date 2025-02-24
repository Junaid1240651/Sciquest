import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addPuzzleQandA = async (req, res) => {
    try {
        const { puzzle_id } = req.params;
        const { question, options, answer } = req.body;

        // Convert options array to JSON string
        const stringfyOptions = JSON.stringify(options);

        //check if puzzle exists
        const findPuzzleQuery = `SELECT * FROM puzzle WHERE id = ?`;
        const existingPuzzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

        if (existingPuzzzle.length === 0) {
            return res.status(404).json({ message: "Puzzle not found" });
        }

        //check if question already exists
        const checkQuery = `SELECT * FROM puzzleQandA WHERE question = ?`;
        const existingQuestion = await userQuery(checkQuery, [question]);

        if (existingQuestion.length > 0) {
            return res.status(409).json({ message: "Question already exists" });
        }
        
        // Insert new puzzleQandA question
         await userQuery(
            `INSERT INTO puzzleQandA (question, options, answer, puzzle_id) VALUES (?, ?, ?, ?)`,
            [question, stringfyOptions, answer, puzzle_id]
        );

        res.status(201).json({
            status: "success",
            message: "Puzzle question added successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
};



const getPuzzleQandA = async (req, res) => {
    try {
        const puzzleQandA = await userQuery(`SELECT * FROM puzzleQandA`);
        if (puzzleQandA.length === 0) {
            return res.status(404).json({ message: "No puzzle question found" });
        }
        // Convert options string to array
        puzzleQandA.forEach((quize) => {
            quize.options = JSON.parse(quize.options);
        });
        res.status(200).json({
            status: "success",
            puzzleQandA,
        });
        
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const getPuzzleQandAById = async (req, res) => {
    try {
        const { id } = req.params;
        const puzzleQandA = await userQuery(`SELECT * FROM puzzleQandA WHERE id = ?`, [id]);
        if (puzzleQandA.length === 0) {
            return res.status(404).json({ message: "Puzzle question not found" });
        }
        // Convert options string to array
        puzzleQandA[0].options = JSON.parse(puzzleQandA[0].options);
        res.status(200).json({
            status: "success",
            puzzleQandA: puzzleQandA[0],
        });
    } catch {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const getPuzzleQandAByPuzzleId = async (req, res) => {
    try {
        const { puzzle_id } = req.params;
        //check if puzzle exists
        
        const findPuzzleQuery = `SELECT * FROM puzzle WHERE id = ?`;
        const existingPuzzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

        if (existingPuzzzle.length === 0) {
            return res.status(404).json({ message: "Puzzle not found" });
        }

        const puzzleQandA = await userQuery(`SELECT * FROM puzzleQandA WHERE puzzle_id = ?`, [puzzle_id]);
        if (puzzleQandA.length === 0) {
            return res.status(404).json({ message: "Puzzle question not found" });
        }
        
        // Convert options string to array
        puzzleQandA.forEach((quize) => {
            quize.options = JSON.parse(quize.options);
        });
        res.status(200).json({
            status: "success",
            puzzleQandA,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}
const updatePuzzleQandA = async (req, res) => {
    const { id } = req.params;
    const { question, options, answer } = req.body;

    // Convert options array to JSON string
    const stringfyOptions = JSON.stringify(options);
    try {
        //check if question exists
        const checkQuery = `SELECT * FROM puzzleQandA WHERE id = ?`;
        const existingQandA = await userQuery(checkQuery, [id]);

        if (existingQandA.length === 0) {
            return res.status(404).json({ message: "Quize question not found" });
        }

        // Update quiz question
        await userQuery(
            `UPDATE puzzleQandA SET question = ?, options = ?, answer = ? WHERE id = ?`,
            [question, stringfyOptions, answer, id]
        );
        res.status(200).json({
            status: "success",
            message: "Puzzle question updated successfully",
        });
        
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
        
    }
}

const deletePuzzleQandA = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteQuery = `DELETE FROM puzzleQandA WHERE id = ?`;
        const deletedPuzzleQandA = await userQuery(deleteQuery, [id]);

        if (deletedPuzzleQandA.affectedRows === 1) {
            return res.status(200).json({ message: "Puzzle question deleted successfully" });
        }
        return res.status(404).json({ message: "Puzzle question not found" });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
        
    }
}
export default { addPuzzleQandA, getPuzzleQandA, getPuzzleQandAById, getPuzzleQandAByPuzzleId, updatePuzzleQandA, deletePuzzleQandA };