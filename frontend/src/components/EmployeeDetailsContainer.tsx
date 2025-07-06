// src/components/EmployeeDetailsContainer.tsx
"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import { Employee, EmployeeT } from "@/models/Employee";
import { isLeft } from "fp-ts/Either";
import { Box, Typography } from "@mui/material";
import { SimilarEmployees } from "./SimilarEmployees";

const employeeFetcher = async (url: string): Promise<Employee> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch employee");
  const body = await response.json();
  const decoded = EmployeeT.decode(body);
  if (isLeft(decoded)) throw new Error("Failed to decode employee");
  return decoded.right;
};

export function EmployeeDetailsContainer() {
  const params = useParams(); // 動的ルーティングのID取得
  const id = params?.id as string;

  const {
    data: employee,
    error,
    isLoading,
  } = useSWR<Employee>(id ? `/api/employees/${id}` : null, employeeFetcher);

  if (isLoading) return <Typography>社員情報を読み込み中...</Typography>;
  if (!employee || error)
    return <Typography>社員が見つかりませんでした</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {employee.name}
      </Typography>
      <Typography>ID: {employee.id}</Typography>
      <Typography>年齢: {employee.age}</Typography>

      {/* 類似社員表示 */}
      <SimilarEmployees currentEmployee={employee} />
    </Box>
  );
}
