import express, { Request, Response } from "express";
import { EmployeeDatabaseInMemory } from './employee/EmployeeDatabaseInMemory';
import { RecommendationDatabaseInMemory } from './employee/RecommendationDatabaseInMemory';
import { RecommendationT } from './employee/Recommendation';
import { isLeft } from 'fp-ts/Either';
import * as t from 'io-ts';

const app = express();
const port = process.env.PORT ?? 8080;
const database = new EmployeeDatabaseInMemory();
const recommendationDatabase = new RecommendationDatabaseInMemory();

// JSONボディパーサーを追加
app.use(express.json());

// 推薦作成用のバリデーションスキーマ（idとcreatedAtを除外）
const CreateRecommendationT = t.type({
    fromEmployeeId: t.string,
    toEmployeeId: t.string,
    category: t.union([
        t.literal('mentoring'),
        t.literal('code_review'),
        t.literal('knowledge_sharing'),
        t.literal('team_support'),
        t.literal('problem_solving'),
        t.literal('innovation'),
        t.literal('leadership'),
        t.literal('other')
    ]),
    title: t.string,
    description: t.string,
    impact: t.union([
        t.literal('low'),
        t.literal('medium'),
        t.literal('high'),
        t.literal('critical')
    ]),
    isAnonymous: t.boolean,
    tags: t.array(t.string),
});

app.get("/api/employees", async (req: Request, res: Response) => {
    const filterText = req.query.filterText ?? "";
    // req.query is parsed by the qs module.
    // https://www.npmjs.com/package/qs
    if (Array.isArray(filterText)) {
        // Multiple filterText is not supported
        res.status(400).send();
        return;
    }
    if (typeof filterText !== "string") {
        // Nested query object is not supported
        res.status(400).send();
        return;
    }
    try {
        const employees = await database.getEmployees(filterText);
        res.status(200).send(JSON.stringify(employees));
    } catch (e) {
        console.error(`Failed to load the users filtered by ${filterText}.`, e);
        res.status(500).send();
    }
});

app.get("/api/employees/:userId", async (req: Request, res: Response) => {
    const userId = req.params.userId;
    try {
        const employee = await database.getEmployee(userId);
        if (employee == undefined) {
            res.status(404).send();
            return;
        }
        res.status(200).send(JSON.stringify(employee));
    } catch (e) {
        console.error(`Failed to load the user ${userId}.`, e);
        res.status(500).send();
    }
});

// 推薦APIエンドポイント
app.post("/api/recommendations", async (req: Request, res: Response) => {
    try {
        console.log("Received recommendation data:", req.body);
        
        const validation = CreateRecommendationT.decode(req.body);
        if (isLeft(validation)) {
            console.error("Validation error details:", JSON.stringify(validation.left, null, 2));
            res.status(400).json({ 
                error: "Invalid recommendation data", 
                details: validation.left,
                receivedData: req.body
            });
            return;
        }

        const recommendation = await recommendationDatabase.createRecommendation(req.body);
        res.status(201).json(recommendation);
    } catch (e) {
        console.error("Failed to create recommendation:", e);
        res.status(500).json({ error: "Failed to create recommendation", details: e });
    }
});

app.get("/api/recommendations", async (req: Request, res: Response) => {
    try {
        const recommendations = await recommendationDatabase.getAllRecommendations();
        res.status(200).json(recommendations);
    } catch (e) {
        console.error("Failed to get recommendations:", e);
        res.status(500).json({ error: "Failed to get recommendations" });
    }
});

app.get("/api/recommendations/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const recommendation = await recommendationDatabase.getRecommendation(id);
        if (recommendation == undefined) {
            res.status(404).json({ error: "Recommendation not found" });
            return;
        }
        res.status(200).json(recommendation);
    } catch (e) {
        console.error(`Failed to get recommendation ${id}:`, e);
        res.status(500).json({ error: "Failed to get recommendation" });
    }
});

app.get("/api/employees/:userId/recommendations", async (req: Request, res: Response) => {
    const userId = req.params.userId;
    try {
        const recommendations = await recommendationDatabase.getRecommendationsForEmployee(userId);
        res.status(200).json(recommendations);
    } catch (e) {
        console.error(`Failed to get recommendations for employee ${userId}:`, e);
        res.status(500).json({ error: "Failed to get recommendations" });
    }
});

app.put("/api/recommendations/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const recommendation = await recommendationDatabase.updateRecommendation(id, req.body);
        if (recommendation == undefined) {
            res.status(404).json({ error: "Recommendation not found" });
            return;
        }
        res.status(200).json(recommendation);
    } catch (e) {
        console.error(`Failed to update recommendation ${id}:`, e);
        res.status(500).json({ error: "Failed to update recommendation" });
    }
});

app.delete("/api/recommendations/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const success = await recommendationDatabase.deleteRecommendation(id);
        if (!success) {
            res.status(404).json({ error: "Recommendation not found" });
            return;
        }
        res.status(204).send();
    } catch (e) {
        console.error(`Failed to delete recommendation ${id}:`, e);
        res.status(500).json({ error: "Failed to delete recommendation" });
    }
});

app.listen(port, () => {
    console.log(`App listening on the port ${port}`);
});
