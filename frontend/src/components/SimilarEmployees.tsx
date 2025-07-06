"use client";

import useSWR from "swr";
import { Employee, EmployeeT } from "@/models/Employee";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { Box, Typography } from "@mui/material";

type Props = {
  currentEmployee: Employee;
};

const EmployeesT = t.array(EmployeeT);

const employeesFetcher = async (url: string): Promise<Employee[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch employees at ${url}`);
  const body = await response.json();
  const decoded = EmployeesT.decode(body);
  if (isLeft(decoded)) throw new Error("Failed to decode employees");
  return decoded.right;
};

// 類似度スコア（小さいほど近い）
function computeSimilarityScore(a: Employee, b: Employee): number {
  const ageDiff = Math.abs(a.age - b.age);

  const departmentDiff = a.department === b.department ? 0 : 1;
  const positionDiff = a.position === b.position ? 0 : 1;

  // techStacks: スキルの重複度とレベルの差
  const techA = a.techStacks ?? [];
  const techB = b.techStacks ?? [];

  let totalSkillDiff = 0;
  let matchedCount = 0;

  for (const skillA of techA) {
    const matched = techB.find((skillB) => skillA.name === skillB.name);
    if (matched) {
      matchedCount++;
      totalSkillDiff += Math.abs(skillA.level - matched.level);
    }
  }

  const unmatchedPenalty = techA.length + techB.length - 2 * matchedCount;
  const skillScore = totalSkillDiff + unmatchedPenalty;

  // 重みづけ（調整可能）
  return (
    ageDiff * 0.3 + departmentDiff * 0.2 + positionDiff * 0.2 + skillScore * 0.3
  );
}

export const SimilarEmployees: React.FC<Props> = ({ currentEmployee }) => {
  const {
    data: allEmployees,
    error,
    isLoading,
  } = useSWR<Employee[]>("/api/employees", employeesFetcher);

  if (isLoading) return <Typography>類似社員を検索中...</Typography>;
  if (error || !allEmployees) return null;

  const similar = allEmployees
    .filter((e) => e.id !== currentEmployee.id)
    .map((e) => ({
      ...e,
      similarityScore: computeSimilarityScore(currentEmployee, e),
    }))
    .sort((a, b) => a.similarityScore - b.similarityScore)
    .slice(0, 10);

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        似ている社員
      </Typography>
      <ul>
        {similar.map((e) => (
          <li key={e.id}>
            {e.name}（{e.age}歳 / {e.position} / {e.department}）<br />
            スコア: {e.similarityScore.toFixed(2)}
          </li>
        ))}
      </ul>
    </Box>
  );
};
