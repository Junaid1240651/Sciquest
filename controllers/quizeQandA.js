import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addQuizeQandA = async (req, res) => {
    try {
        const { quize_id } = req.params;
        
        const { question, options, answer, type } = req.body;

        // Check if question, options, answer and type are provided
        if (!question || !options || !answer || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if type is valid
        if (type !== 'Fill in the blank' && type !== 'Options') {
            return res.status(400).json({ message: "Invalid question type" });
        }

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
            `INSERT INTO quizeQandA (question, options, answer, quize_id, type) VALUES (?, ?, ?, ?, ?)`,
            [question, stringfyOptions, answer, quize_id, type]
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
        const quizeQandAQuery = `
            SELECT 
                q.*, 
                l.id AS level_id,
                l.type AS level_type,
                c.id AS category_id,
                c.name AS category_name
            FROM quizeQandA q
            LEFT JOIN quizes quiz ON q.quize_id = quiz.id
            LEFT JOIN levels l ON quiz.level_id = l.id
            LEFT JOIN categories c ON quiz.categories_id = c.id
        `;

        const quizeQandA = await userQuery(quizeQandAQuery);

        if (quizeQandA.length === 0) {
            return res.status(404).json({ message: "No quiz questions found" });
        }

        // Convert options string to array and add level_type & category_name to each question
        quizeQandA.forEach((quize) => {
            quize.options = JSON.parse(quize.options);
        });

        res.status(200).json({
            status: "success",
            quizeQandA,
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getQuizeQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const quizeQuestionQuery = `
            SELECT 
                q.*, 
                l.id AS level_id,
                l.type AS level_type,
                c.id AS category_id,
                c.name AS category_name
            FROM quizeQandA q
            LEFT JOIN quizes quiz ON q.quize_id = quiz.id
            LEFT JOIN levels l ON quiz.level_id = l.id
            LEFT JOIN categories c ON quiz.categories_id = c.id
            WHERE q.id = ?
        `;

        const quizeQuestion = await userQuery(quizeQuestionQuery, [id]);

        if (quizeQuestion.length === 0) {
            return res.status(404).json({ message: "Quiz question not found" });
        }

        // Convert options string to array
        quizeQuestion[0].options = JSON.parse(quizeQuestion[0].options);

        res.status(200).json({
            status: "success",
            quizeQuestion: quizeQuestion[0],
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getQuizeQandAByQuizeId = async (req, res) => {
    try {
        const { quize_id } = req.params;

        // Check if quiz exists and get its details (including level_id & categories_id)
        const findQuizeQuery = `
            SELECT q.*, l.type AS level_type, c.name AS category_name
            FROM quizes q
            LEFT JOIN levels l ON q.level_id = l.id
            LEFT JOIN categories c ON q.categories_id = c.id
            WHERE q.id = ?`;

        const existingQuize = await userQuery(findQuizeQuery, [quize_id]);

        if (existingQuize.length === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const { level_type, category_name, level_id, categories_id } = existingQuize[0];

        // Get quiz questions along with attempt & answer from complete_quize
        const quizeQandAQuery = `
            SELECT 
                q.*, 
                q.answer AS correct_answer,
                COALESCE(cq.attempt, 0) AS attempt,
                COALESCE(cq.answer, 0) AS correct_answer
            FROM quizeQandA q
            LEFT JOIN complete_quize cq ON q.id = cq.quizeQandA_id
            WHERE q.quize_id = ?`;

        const quizeQandA = await userQuery(quizeQandAQuery, [quize_id]);

        if (quizeQandA.length === 0) {
            return res.status(404).json({ message: "No quiz questions found" });
        }
        // Convert options string to array and add level_type & category_name to each question
        quizeQandA.forEach((quize) => {
            quize.options = JSON.parse(quize.options);
            quize.level_id = level_id; // Add level ID
            quize.level_type = level_type;   // Add level type to each question
            quize.category_name = category_name; // Add category name to each question
            quize.categories_id = categories_id; // Add category ID
        });

        return res.status(200).json({
            status: "success",
            quizeQandA, // All questions now include level_type and category_name
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const updateQuizeQandA = async (req, res) => {
    const { id } = req.params;
    const { question, options, answer, type } = req.body;

    // Convert options array to JSON string
    const stringfyOptions = JSON.stringify(options);
    //check type is valid
    if (type !== 'Fill in the blank' && type !== 'Options') {
        return res.status(400).json({ message: "Invalid question type" });
    }
    try {
        //check if question exists
        const checkQuery = `SELECT * FROM quizeQandA WHERE id = ?`;
        const existingQuestion = await userQuery(checkQuery, [id]);

        if (existingQuestion.length === 0) {
            return res.status(404).json({ message: "Quize question not found" });
        }

        // Update quiz question
        await userQuery(
            `UPDATE quizeQandA SET question = ?, options = ?, answer = ?, type = ? WHERE id = ?`,
            [question, stringfyOptions, answer, type, id]
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
export default { addQuizeQandA, getQuizeQandA, getQuizeQuestionById, getQuizeQandAByQuizeId, updateQuizeQandA, deleteQuizeQandA };