// app/employees/[id]/page.tsx
import { GlobalContainer } from "@/components/GlobalContainer";
import { EmployeeDetailsContainer } from "@/components/EmployeeDetailsContainer";
import { DynamicTitle } from "@/components/DynamicTitle";
import { Suspense } from "react";

export default function EmployeePage() {
  return (
    <GlobalContainer pageTitle="社員詳細">
      <DynamicTitle />
      <Suspense>
        <EmployeeDetailsContainer />
      </Suspense>
    </GlobalContainer>
  );
}
