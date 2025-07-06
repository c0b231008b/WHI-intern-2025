// src/components/SimilarEmployees.tsx
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
      ageDiff: Math.abs(e.age - currentEmployee.age),
    }))
    .sort((a, b) => a.ageDiff - b.ageDiff)
    .slice(0, 10);

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        似ている社員
      </Typography>
      <ul>
        {similar.map((e) => (
          <li key={e.id}>
            {e.name}（{e.age}歳） - 差: {Math.abs(e.age - currentEmployee.age)}
            歳
          </li>
        ))}
      </ul>
    </Box>
  );
};
