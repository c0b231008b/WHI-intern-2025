import { Recommendation } from './Recommendation';

export interface RecommendationDatabase {
    // 推薦を作成
    createRecommendation(recommendation: Omit<Recommendation, 'id' | 'createdAt'>): Promise<Recommendation>;
    
    // 特定の従業員が受け取った推薦を取得
    getRecommendationsForEmployee(employeeId: string): Promise<Recommendation[]>;
    
    // 特定の従業員が送った推薦を取得
    getRecommendationsFromEmployee(employeeId: string): Promise<Recommendation[]>;
    
    // 特定の推薦を取得
    getRecommendation(id: string): Promise<Recommendation | undefined>;
    
    // 推薦を更新
    updateRecommendation(id: string, recommendation: Partial<Recommendation>): Promise<Recommendation | undefined>;
    
    // 推薦を削除
    deleteRecommendation(id: string): Promise<boolean>;
    
    // カテゴリ別の推薦を取得
    getRecommendationsByCategory(category: Recommendation['category']): Promise<Recommendation[]>;
    
    // 影響度別の推薦を取得
    getRecommendationsByImpact(impact: Recommendation['impact']): Promise<Recommendation[]>;
    
    // タグで推薦を検索
    searchRecommendationsByTags(tags: string[]): Promise<Recommendation[]>;
    
    // 全推薦を取得（管理者用）
    getAllRecommendations(): Promise<Recommendation[]>;
} 