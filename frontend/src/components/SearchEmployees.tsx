"use client";
import { Paper, TextField, ToggleButtonGroup, ToggleButton, Box } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { useState } from "react";
import { EmployeeListContainer } from "./EmployeeListContainer";
import { EmployeeCardContainer } from "./EmployeeCardContainer";

export function SearchEmployees() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">("card");

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "list" | "card" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        p: 2,
      }}
    >
      <TextField
        placeholder="検索キーワードを入力してください"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />

      {/* 表示切替ボタン */}
      <Box display="flex" justifyContent="flex-end">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleChange}
          aria-label="表示モード切替"
          size="small"
        >
          <ToggleButton value="list" aria-label="リスト表示">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="card" aria-label="カード表示">
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 表示切替 */}
      {viewMode === "list" ? (
        <EmployeeListContainer key="list" filterText={searchKeyword} />
      ) : (
        <EmployeeCardContainer key="card" filterText={searchKeyword} />
      )}
    </Paper>
  );
}
