import * as t from "io-ts";

export const RecommendationT = t.type({
  id: t.string,
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
  createdAt: t.string,
  isAnonymous: t.boolean,
  tags: t.array(t.string),
});

export type Recommendation = t.TypeOf<typeof RecommendationT>;

export const RecommendationCategory = {
  MENTORING: 'mentoring' as const,
  CODE_REVIEW: 'code_review' as const,
  KNOWLEDGE_SHARING: 'knowledge_sharing' as const,
  TEAM_SUPPORT: 'team_support' as const,
  PROBLEM_SOLVING: 'problem_solving' as const,
  INNOVATION: 'innovation' as const,
  LEADERSHIP: 'leadership' as const,
  OTHER: 'other' as const,
} as const;

export const RecommendationImpact = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
} as const;

export const CategoryLabels: Record<Recommendation['category'], string> = {
  mentoring: 'メンタリング',
  code_review: 'コードレビュー',
  knowledge_sharing: 'ナレッジ共有',
  team_support: 'チームサポート',
  problem_solving: '問題解決',
  innovation: 'イノベーション',
  leadership: 'リーダーシップ',
  other: 'その他',
};

export const ImpactLabels: Record<Recommendation['impact'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '重要',
};

export const ImpactColors: Record<Recommendation['impact'], string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#9c27b0',
}; 