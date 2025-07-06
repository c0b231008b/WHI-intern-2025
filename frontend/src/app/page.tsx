"use client";
import { useState } from "react";
import { GlobalContainer } from "../components/GlobalContainer";
import { EmployeeListContainer } from "../components/EmployeeListContainer";
import { RecommendationDashboard } from "../components/RecommendationDashboard";
import { SearchEmployees } from "../components/SearchEmployees";
import { Box, Typography } from "@mui/material";

export default function HomePage() {
  const [filterText, setFilterText] = useState("");

  return (
    <GlobalContainer pageTitle="タレントマネジメント">
      <RecommendationDashboard />
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          エンジニア一覧
        </Typography>
        <SearchEmployees onFilterChange={setFilterText} />
      </Box>
      <EmployeeListContainer filterText={filterText} />
    </GlobalContainer>
  );
}
