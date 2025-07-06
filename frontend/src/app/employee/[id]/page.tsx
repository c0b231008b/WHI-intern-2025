"use client";

// app/employees/[id]/page.tsx
import { GlobalContainer } from "@/components/GlobalContainer";
import { DynamicTitle } from "@/components/DynamicTitle";
import { EmployeeDetails } from "../../../components/EmployeeDetails";
// import { getEmployeeById } from "../../../utils/employeeApi"; // これは使わない or 修正

// 仮の社員データ取得（本番はAPIやSWRで取得する）
const dummyEmployee = {
  id: "112",
  name: "Ashley White",
  age: 34,
  department: "データアナリティクス部",
  position: "データアナリスト",
  techStacks: [
    { name: "Python", level: 4 },
    { name: "SQL", level: 3 }
  ],
  similarEmployees: [
    { id: "201", name: "佐藤 花子", age: 34, department: "データアナリティクス部", position: "データアナリスト", score: 0.95 },
    { id: "202", name: "大野 美咲", age: 34, department: "データアナリティクス部", position: "データアナリスト", score: 0.90 }
  ]
};

export default function EmployeePage() {
  // 本来はAPIから取得する
  // const employee = await getEmployeeById(params.id);
  const employee = dummyEmployee; // 仮データ

  return (
    <GlobalContainer pageTitle="社員詳細">
      <DynamicTitle />
      <EmployeeDetails employee={employee} />
    </GlobalContainer>
  );
}
