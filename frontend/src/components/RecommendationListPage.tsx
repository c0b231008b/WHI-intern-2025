"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
} from "@mui/material";
import { Recommendation, RecommendationT, CategoryLabels, ImpactLabels } from "../models/Recommendation";
import { RecommendationCard } from "./RecommendationCard";
import { Employee, EmployeeT } from "../models/Employee";

const RecommendationsT = t.array(RecommendationT);

const recommendationsFetcher = async (url: string): Promise<Recommendation[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations at ${url}`);
  }
  const body = await response.json();
  const decoded = RecommendationsT.decode(body);
  if (isLeft(decoded)) {
    throw new Error(`Failed to decode recommendations ${JSON.stringify(body)}`);
  }
  return decoded.right;
};

const employeeFetcher = async (url: string): Promise<Employee> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch employee at ${url}`);
  }
  const body = await response.json();
  const decoded = EmployeeT.decode(body);
  if (isLeft(decoded)) {
    throw new Error(`Failed to decode employee ${JSON.stringify(body)}`);
  }
  return decoded.right;
};

export function RecommendationListPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const { data: recommendations, error, isLoading } = useSWR<Recommendation[], Error>(
    "/api/recommendations",
    recommendationsFetcher
  );

  const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());

  useEffect(() => {
    if (recommendations) {
      const fetchEmployees = async () => {
        const employeeMap = new Map<string, Employee>();
        
        for (const recommendation of recommendations) {
          // 推薦者情報を取得
          if (!recommendation.isAnonymous && !employeeMap.has(recommendation.fromEmployeeId)) {
            try {
              const fromEmployee = await employeeFetcher(`/api/employees/${recommendation.fromEmployeeId}`);
              employeeMap.set(recommendation.fromEmployeeId, fromEmployee);
            } catch (error) {
              console.error(`Failed to fetch from employee ${recommendation.fromEmployeeId}:`, error);
            }
          }
          
          // 推薦される人情報を取得
          if (!employeeMap.has(recommendation.toEmployeeId)) {
            try {
              const toEmployee = await employeeFetcher(`/api/employees/${recommendation.toEmployeeId}`);
              employeeMap.set(recommendation.toEmployeeId, toEmployee);
            } catch (error) {
              console.error(`Failed to fetch to employee ${recommendation.toEmployeeId}:`, error);
            }
          }
        }
        
        setEmployees(employeeMap);
      };

      fetchEmployees();
    }
  }, [recommendations]);

  const filteredRecommendations = recommendations?.filter((recommendation) => {
    // カテゴリフィルター
    if (filterCategory !== "all" && recommendation.category !== filterCategory) {
      return false;
    }

    // 影響度フィルター
    if (filterImpact !== "all" && recommendation.impact !== filterImpact) {
      return false;
    }

    // テキスト検索
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const titleMatch = recommendation.title.toLowerCase().includes(searchLower);
      const descriptionMatch = recommendation.description.toLowerCase().includes(searchLower);
      const tagMatch = recommendation.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!titleMatch && !descriptionMatch && !tagMatch) {
        return false;
      }
    }

    return true;
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        推薦の取得に失敗しました: {error.message}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        推薦一覧
      </Typography>

      {/* フィルター */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>カテゴリ</InputLabel>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            label="カテゴリ"
          >
            <MenuItem value="all">すべて</MenuItem>
            {Object.entries(CategoryLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>影響度</InputLabel>
          <Select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value)}
            label="影響度"
          >
            <MenuItem value="all">すべて</MenuItem>
            {Object.entries(ImpactLabels).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="タイトル、説明、タグで検索"
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* 結果表示 */}
      {filteredRecommendations && filteredRecommendations.length > 0 ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {filteredRecommendations.length}件の推薦が見つかりました
          </Typography>
          
          {filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              fromEmployee={employees.get(recommendation.fromEmployeeId)}
              toEmployee={employees.get(recommendation.toEmployeeId)}
              showFromEmployee={true}
              showToEmployee={true}
            />
          ))}
        </Box>
      ) : (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography color="text.secondary">
            {recommendations && recommendations.length > 0
              ? "条件に一致する推薦がありません"
              : "まだ推薦がありません"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
} 