import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addQuizeQandA = async (req, res) => {
    try {
        const { quize_id } = req.params;
        const { question, options, answer } = req.body;

        // Convert options array to JSON string
        const stringfyOptions = JSON.stringify(options);

        //check if quize exists
        const findQuizeQuery = `SELECT * FROM quizes WHERE id = ?`;
        const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

        if (existingQuize.length === 0) {
            return res.status(404).json({ message: "Quize not found" });
        }

        //check if question already exists
        const checkQuery = `SELECT * FROM quizeQandA WHERE question = ?`;
        const existingQuestion = await userQuery(checkQuery, [question]);

        if (existingQuestion.length > 0) {
            return res.status(409).json({ message: "Question already exists" });
        }
        
        // Insert new quizeQandA question
         await userQuery(
            `INSERT INTO quizeQandA (question, options, answer) VALUES (?, ?, ?)`,
            [question, stringfyOptions, answer]
        );

        res.status(201).json({
            status: "success",
            message: "Quiz question added successfully",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
};



const getQuizeQandA = async (req, res) => {
    try {
        const quizeQandA = await userQuery(`SELECT * FROM quizeQandA`);
        if (quizeQandA.length === 0) {
            return res.status(404).json({ message: "No quize question found" });
        }
        // Convert options string to array
        quizeQandA.forEach((quize) => {
            quize.options = JSON.parse(quize.options);
        });
        res.status(200).json({
            status: "success",
            quizeQandA,
        });
        
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const getQuizeQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const quizeQuestion = await userQuery(`SELECT * FROM quizeQandA WHERE id = ?`, [id]);
        if (quizeQuestion.length === 0) {
            return res.status(404).json({ message: "Quize question not found" });
        }
        // Convert options string to array
        quizeQuestion[0].options = JSON.parse(quizeQuestion[0].options);
        res.status(200).json({
            status: "success",
            quizeQuestion: quizeQuestion[0],
        });
    } catch {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
    }
}

const updateQuizeQandA = async (req, res) => {
    const { id } = req.params;
    const { question, options, answer } = req.body;

    // Convert options array to JSON string
    const stringfyOptions = JSON.stringify(options);
    try {
        //check if question exists
        const checkQuery = `SELECT * FROM quizeQandA WHERE id = ?`;
        const existingQuestion = await userQuery(checkQuery, [id]);

        if (existingQuestion.length === 0) {
            return res.status(404).json({ message: "Quize question not found" });
        }

        // Update quiz question
        await userQuery(
            `UPDATE quizeQandA SET question = ?, options = ?, answer = ? WHERE id = ?`,
            [question, stringfyOptions, answer, id]
        );
        res.status(200).json({
            status: "success",
            message: "Quize question updated successfully",
        });
        
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
        
    }
}

const deleteQuizeQandA = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteQuery = `DELETE FROM quizeQandA WHERE id = ?`;
        const deletedQuizeQandA = await userQuery(deleteQuery, [id]);

        if (deletedQuizeQandA.affectedRows === 1) {
            return res.status(200).json({ message: "Quize question deleted successfully" });
        }
        return res.status(404).json({ message: "Quize question not found" });
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message,
        });
        
    }
}
export default { addQuizeQandA, getQuizeQandA, getQuizeQuestionById, updateQuizeQandA, deleteQuizeQandA };