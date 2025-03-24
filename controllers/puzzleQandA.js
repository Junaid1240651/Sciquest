import dotenv from "dotenv";
dotenv.config();
import _ from "lodash";
import userQuery from "../utils/helper/dbHelper.js";

const addPuzzleQandA = async (req, res) => {
    try {
        const { puzzle_id } = req.params;
        const { question, options, answer, type } = req.body;

        // Convert options array to JSON string
        const stringfyOptions = JSON.stringify(options || []);
        const stringfyAnswer = JSON.stringify(answer || []);

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
            `INSERT INTO puzzleQandA (question, options, answer, puzzle_id, type) VALUES (?, ?, ?, ?, ?)`,
             [question, stringfyOptions, stringfyAnswer, puzzle_id, type]
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
        // Fetch all puzzle questions with level and category details
        const puzzleQandAQuery = `
            SELECT 
                pq.*,
                l.id AS level_id,
                l.type AS level_type,
                c.id AS category_id,
                c.name AS category_name
            FROM puzzleQandA pq
            LEFT JOIN puzzle p ON pq.puzzle_id = p.id
            LEFT JOIN levels l ON p.level_id = l.id
            LEFT JOIN categories c ON p.categories_id = c.id`;

        const puzzleQandA = await userQuery(puzzleQandAQuery);

        if (puzzleQandA.length === 0) {
            return res.status(404).json({ message: "No puzzle questions found" });
        }

        // Convert options string to array and include level/category details
        puzzleQandA.forEach((quize) => {
            quize.options = JSON.parse(quize.options);
            quize.answer = JSON.parse(quize.answer);
        });

        return res.status(200).json({
            status: "success",
            puzzleQandA,
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getPuzzleQandAById = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch a specific puzzle question along with level and category details
        const puzzleQandAQuery = `
            SELECT 
                pq.*, 
                l.id AS level_id,
                l.type AS level_type,
                c.id AS category_id,
                c.name AS category_name
            FROM puzzleQandA pq
            LEFT JOIN puzzle p ON pq.puzzle_id = p.id
            LEFT JOIN levels l ON p.level_id = l.id
            LEFT JOIN categories c ON p.categories_id = c.id
            WHERE pq.id = ?`;

        const puzzleQandA = await userQuery(puzzleQandAQuery, [id]);

        if (puzzleQandA.length === 0) {
            return res.status(404).json({ message: "Puzzle question not found" });
        }

        // Convert options string to array
        puzzleQandA[0].options = JSON.parse(puzzleQandA[0].options);
        puzzleQandA[0].answer = JSON.parse(puzzleQandA[0].answer);

        return res.status(200).json({
            status: "success",
            puzzleQandA: puzzleQandA[0],
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const getPuzzleQandAByPuzzleId = async (req, res) => {
    try {
        const { puzzle_id } = req.params;

        // Check if puzzle exists and get its details (including level_id & categories_id)
        const findPuzzleQuery = `
            SELECT p.*, l.type AS level_type, c.name AS category_name 
            FROM puzzle p
            LEFT JOIN levels l ON p.level_id = l.id
            LEFT JOIN categories c ON p.categories_id = c.id
            WHERE p.id = ?`;

        const existingPuzzle = await userQuery(findPuzzleQuery, [puzzle_id]);

        if (existingPuzzle.length === 0) {
            return res.status(404).json({ message: "Puzzle not found" });
        }

        const { level_type, category_name, level_id, categories_id } = existingPuzzle[0];

        // Get puzzle questions along with attempt & answer from complete_puzzle
        const puzzleQandAQuery = `
            SELECT 
                pq.*, 
                COALESCE(MAX(cp.attempt), 0) AS attempt, 
                COALESCE(MAX(cp.answer), 0) AS correct_answer
            FROM puzzleQandA pq
            LEFT JOIN complete_puzzle cp ON pq.id = cp.puzzleQandA_id
            WHERE pq.puzzle_id = ?
            GROUP BY pq.id`;

        const puzzleQandA = await userQuery(puzzleQandAQuery, [puzzle_id]);

        if (puzzleQandA.length === 0) {
            return res.status(404).json({ message: "No puzzle questions found" });
        }

        // Convert options string to array and add level_type & category_name to each question
        puzzleQandA.forEach((puzzle) => {
            puzzle.options = JSON.parse(puzzle.options);
            puzzle.level_id = level_id; // Add level ID
            puzzle.level_type = level_type;   // Add level type to each question
            puzzle.category_name = category_name; // Add category name to each question
            puzzle.categories_id = categories_id; // Add category ID
            puzzle.answer = JSON.parse(puzzle.answer);
        });

        return res.status(200).json({
            status: "success",
            puzzleQandA, // All questions now include level_type and category_name
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

const updatePuzzleQandA = async (req, res) => {
    const { id } = req.params;
    const { question, options, answer, type } = req.body;

    // Convert options array to JSON string
    const stringfyOptions = JSON.stringify(options || []);
    const stringfyAnswer = JSON.stringify(answer || []);
    try {
        //check if question exists
        const checkQuery = `SELECT * FROM puzzleQandA WHERE id = ?`;
        const existingQandA = await userQuery(checkQuery, [id]);

        if (existingQandA.length === 0) {
            return res.status(404).json({ message: "Quize question not found" });
        }

        // Update quiz question
        await userQuery(
            `UPDATE puzzleQandA SET question = ?, options = ?, answer = ?, type = ? WHERE id = ?`,
            [question, stringfyOptions, answer, type, id]
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