"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { Recommendation, CategoryLabels, ImpactLabels } from "../models/Recommendation";
import { Employee } from "../models/Employee";
import Link from "next/link";

interface DashboardStats {
  totalRecommendations: number;
  totalEmployees: number;
  topCategories: { category: string; count: number }[];
  topImpacts: { impact: string; count: number }[];
  recentRecommendations: Recommendation[];
  topEmployees: { employee: Employee; count: number }[];
}

export function RecommendationDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 推薦データを取得
        const recommendationsResponse = await fetch("/api/recommendations");
        if (!recommendationsResponse.ok) {
          throw new Error("推薦データの取得に失敗しました");
        }
        const recommendations: Recommendation[] = await recommendationsResponse.json();

        // エンジニアデータを取得
        const employeesResponse = await fetch("/api/employees");
        if (!employeesResponse.ok) {
          throw new Error("エンジニアデータの取得に失敗しました");
        }
        const employees: Employee[] = await employeesResponse.json();

        // 統計情報を計算
        const categoryCounts = recommendations.reduce((acc, rec) => {
          acc[rec.category] = (acc[rec.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const impactCounts = recommendations.reduce((acc, rec) => {
          acc[rec.impact] = (acc[rec.impact] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // エンジニア別推薦数を計算
        const employeeRecommendationCounts = employees.map(employee => {
          const count = recommendations.filter(rec => rec.toEmployeeId === employee.id).length;
          return { employee, count };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        const dashboardStats: DashboardStats = {
          totalRecommendations: recommendations.length,
          totalEmployees: employees.length,
          topCategories: Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3),
          topImpacts: Object.entries(impactCounts)
            .map(([impact, count]) => ({ impact, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3),
          recentRecommendations: recommendations
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3),
          topEmployees: employeeRecommendationCounts,
        };

        setStats(dashboardStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          エンジニア活躍ダッシュボード
        </Typography>
        <Link href="/recommendations" style={{ textDecoration: "none" }}>
          <Button variant="contained" startIcon={<ThumbUpIcon />}>
            推薦一覧を見る
          </Button>
        </Link>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 基本統計 */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ThumbUpIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalRecommendations}
                  </Typography>
                  <Typography color="text.secondary">
                    総推薦数
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalEmployees}
                  </Typography>
                  <Typography color="text.secondary">
                    エンジニア数
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalRecommendations > 0 ? (stats.totalRecommendations / stats.totalEmployees).toFixed(1) : 0}
                  </Typography>
                  <Typography color="text.secondary">
                    平均推薦数
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ flex: "1 1 200px", minWidth: "200px" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <StarIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.recentRecommendations.length}
                  </Typography>
                  <Typography color="text.secondary">
                    最近の推薦
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 詳細統計 */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* 人気カテゴリ */}
          <Card sx={{ flex: "1 1 300px", minWidth: "300px" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                人気カテゴリ
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {stats.topCategories.map(({ category, count }) => (
                  <Box key={category} display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={CategoryLabels[category as keyof typeof CategoryLabels]}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {count}件
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* 影響度分布 */}
          <Card sx={{ flex: "1 1 300px", minWidth: "300px" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                影響度分布
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {stats.topImpacts.map(({ impact, count }) => (
                  <Box key={impact} display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={ImpactLabels[impact as keyof typeof ImpactLabels]}
                      size="small"
                      color="primary"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {count}件
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 推薦が多いエンジニア */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              推薦が多いエンジニア
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {stats.topEmployees.map(({ employee, count }) => (
                <Box key={employee.id} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">
                    {employee.name} ({employee.age}歳)
                  </Typography>
                  <Chip
                    label={`${count}件の推薦`}
                    color="primary"
                    size="small"
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Paper>
  );
} 