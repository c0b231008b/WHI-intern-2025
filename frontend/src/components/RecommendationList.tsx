"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { Recommendation, RecommendationT } from "../models/Recommendation";
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

interface RecommendationListProps {
  employeeId: string;
}

export function RecommendationList({ employeeId }: RecommendationListProps) {
  const { data: recommendations, error, isLoading } = useSWR<Recommendation[], Error>(
    `/api/employees/${employeeId}/recommendations`,
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

  if (error) {
    return (
      <Alert severity="error">
        推薦の取得に失敗しました: {error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography color="text.secondary">
          まだ推薦がありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {recommendations.length}件の推薦
      </Typography>
      
      {recommendations.map((recommendation) => (
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
  );
} 