"use client";
import { Paper, TextField } from "@mui/material";
import { useState, useEffect } from "react";

interface SearchEmployeesProps {
  onFilterChange?: (filterText: string) => void;
}

export function SearchEmployees({ onFilterChange }: SearchEmployeesProps) {
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(searchKeyword);
    }
  }, [searchKeyword, onFilterChange]);

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
        fullWidth
      />
    </Paper>
  );
}
