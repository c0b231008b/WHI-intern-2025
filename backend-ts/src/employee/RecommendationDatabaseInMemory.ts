import { Recommendation, RecommendationT } from './Recommendation';
import { RecommendationDatabase } from './RecommendationDatabase';
import { isLeft } from 'fp-ts/Either';

export class RecommendationDatabaseInMemory implements RecommendationDatabase {
    private recommendations: Map<string, Recommendation> = new Map();

    constructor() {
        // サンプル推薦データを追加
        this.addSampleRecommendations();
    }

    private addSampleRecommendations() {
        const sampleRecommendations = [
            {
                id: "rec_1",
                fromEmployeeId: "2",
                toEmployeeId: "1",
                category: "mentoring" as const,
                title: "新人エンジニアのメンタリング",
                description: "山田さんは新人エンジニアに対して非常に丁寧で分かりやすいメンタリングを行っており、チーム全体の技術レベル向上に大きく貢献しています。特に、複雑な技術概念を初心者にも理解しやすく説明する能力が素晴らしいです。",
                impact: "high" as const,
                createdAt: "2024-01-15T10:00:00Z",
                isAnonymous: false,
                tags: ["メンタリング", "新人教育", "技術共有"]
            },
            {
                id: "rec_2",
                fromEmployeeId: "3",
                toEmployeeId: "1",
                category: "code_review" as const,
                title: "詳細で建設的なコードレビュー",
                description: "山田さんのコードレビューは非常に詳細で、単にバグを見つけるだけでなく、コードの可読性や保守性についても建設的な提案をしてくれます。レビューを受けた後は必ずコードの品質が向上します。",
                impact: "critical" as const,
                createdAt: "2024-01-20T14:30:00Z",
                isAnonymous: false,
                tags: ["コードレビュー", "品質向上", "ベストプラクティス"]
            },
            {
                id: "rec_3",
                fromEmployeeId: "4",
                toEmployeeId: "2",
                category: "knowledge_sharing" as const,
                title: "技術勉強会の主催",
                description: "佐藤さんは定期的に技術勉強会を主催し、チームメンバーが新しい技術を学ぶ機会を提供してくれています。特に、実践的な内容で、すぐに業務に活かせる知識を共有してくれるのが素晴らしいです。",
                impact: "high" as const,
                createdAt: "2024-01-25T16:00:00Z",
                isAnonymous: false,
                tags: ["勉強会", "技術共有", "チーム成長"]
            },
            {
                id: "rec_4",
                fromEmployeeId: "1",
                toEmployeeId: "3",
                category: "problem_solving" as const,
                title: "複雑なバグの解決",
                description: "鈴木さんは複雑なバグが発生した際に、論理的なアプローチで問題を分析し、効率的に解決してくれました。特に、本番環境での緊急対応において、冷静な判断と迅速な対応が印象的でした。",
                impact: "critical" as const,
                createdAt: "2024-02-01T09:15:00Z",
                isAnonymous: false,
                tags: ["問題解決", "緊急対応", "デバッグ"]
            },
            {
                id: "rec_5",
                fromEmployeeId: "5",
                toEmployeeId: "4",
                category: "team_support" as const,
                title: "チームメンバーのサポート",
                description: "高橋さんは常にチームメンバーのことを気にかけ、困っている人がいれば積極的にサポートしてくれます。特に、新しいメンバーが入った際のフォローアップが素晴らしく、チームの雰囲気を良くしてくれています。",
                impact: "medium" as const,
                createdAt: "2024-02-05T11:45:00Z",
                isAnonymous: false,
                tags: ["チームサポート", "フォローアップ", "チームビルディング"]
            },
            {
                id: "rec_6",
                fromEmployeeId: "6",
                toEmployeeId: "5",
                category: "innovation" as const,
                title: "開発プロセスの改善提案",
                description: "田中さんは既存の開発プロセスを分析し、効率化のための具体的な改善提案を行いました。提案された改善により、開発速度が20%向上し、品質も向上しました。",
                impact: "high" as const,
                createdAt: "2024-02-10T13:20:00Z",
                isAnonymous: false,
                tags: ["プロセス改善", "効率化", "品質向上"]
            },
            {
                id: "rec_7",
                fromEmployeeId: "7",
                toEmployeeId: "6",
                category: "leadership" as const,
                title: "プロジェクトリーダーとしての活躍",
                description: "伊藤さんはプロジェクトリーダーとして、チームをまとめ、目標を達成するために素晴らしいリーダーシップを発揮しました。特に、困難な状況でもチームの士気を保ち、成功に導いた手腕が印象的でした。",
                impact: "critical" as const,
                createdAt: "2024-02-15T15:30:00Z",
                isAnonymous: false,
                tags: ["リーダーシップ", "プロジェクト管理", "チームマネジメント"]
            },
            {
                id: "rec_8",
                fromEmployeeId: "8",
                toEmployeeId: "7",
                category: "knowledge_sharing" as const,
                title: "ドキュメント整備",
                description: "渡辺さんは技術ドキュメントの整備に積極的に取り組み、チーム全体の知識共有を促進してくれました。特に、初心者でも理解しやすいドキュメント作成能力が素晴らしいです。",
                impact: "medium" as const,
                createdAt: "2024-02-20T10:00:00Z",
                isAnonymous: false,
                tags: ["ドキュメント", "知識共有", "ナレッジ管理"]
            }
        ];

        sampleRecommendations.forEach(rec => {
            this.recommendations.set(rec.id, rec);
        });

        console.log(`Loaded ${this.recommendations.size} sample recommendations`);
    }

    async createRecommendation(recommendation: Omit<Recommendation, 'id' | 'createdAt'>): Promise<Recommendation> {
        const id = this.generateId();
        const createdAt = new Date().toISOString();
        
        const newRecommendation: Recommendation = {
            ...recommendation,
            id,
            createdAt,
        };

        // バリデーション
        const validation = RecommendationT.decode(newRecommendation);
        if (isLeft(validation)) {
            throw new Error(`Invalid recommendation data: ${JSON.stringify(validation.left)}`);
        }

        this.recommendations.set(id, newRecommendation);
        return newRecommendation;
    }

    async getRecommendationsForEmployee(employeeId: string): Promise<Recommendation[]> {
        return Array.from(this.recommendations.values())
            .filter(rec => rec.toEmployeeId === employeeId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getRecommendationsFromEmployee(employeeId: string): Promise<Recommendation[]> {
        return Array.from(this.recommendations.values())
            .filter(rec => rec.fromEmployeeId === employeeId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getRecommendation(id: string): Promise<Recommendation | undefined> {
        return this.recommendations.get(id);
    }

    async updateRecommendation(id: string, updates: Partial<Recommendation>): Promise<Recommendation | undefined> {
        const existing = this.recommendations.get(id);
        if (!existing) {
            return undefined;
        }

        const updatedRecommendation: Recommendation = {
            ...existing,
            ...updates,
            id, // IDは変更不可
        };

        // バリデーション
        const validation = RecommendationT.decode(updatedRecommendation);
        if (isLeft(validation)) {
            throw new Error(`Invalid recommendation data: ${JSON.stringify(validation.left)}`);
        }

        this.recommendations.set(id, updatedRecommendation);
        return updatedRecommendation;
    }

    async deleteRecommendation(id: string): Promise<boolean> {
        return this.recommendations.delete(id);
    }

    async getRecommendationsByCategory(category: Recommendation['category']): Promise<Recommendation[]> {
        return Array.from(this.recommendations.values())
            .filter(rec => rec.category === category)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getRecommendationsByImpact(impact: Recommendation['impact']): Promise<Recommendation[]> {
        return Array.from(this.recommendations.values())
            .filter(rec => rec.impact === impact)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async searchRecommendationsByTags(tags: string[]): Promise<Recommendation[]> {
        return Array.from(this.recommendations.values())
            .filter(rec => tags.some(tag => rec.tags.includes(tag)))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    async getAllRecommendations(): Promise<Recommendation[]> {
        return Array.from(this.recommendations.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    private generateId(): string {
        return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
} 