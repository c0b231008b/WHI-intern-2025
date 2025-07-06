"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  ToggleButton,
  ToggleButtonGroup,
  Chip, 
  Stack
} from "@mui/material";
import { Employee, EmployeeT } from "../models/Employee";

export type EmployeesContainerProps = {
  filterText: string;
};

type SortField = "name" | "age" | "id";
type SortDirection = "asc" | "desc";

const EmployeesT = t.array(EmployeeT);

const employeesFetcher = async (url: string): Promise<Employee[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch employees at ${url}`);
  }
  const body = await response.json();
  const decoded = EmployeesT.decode(body);
  if (isLeft(decoded)) {
    throw new Error(`Failed to decode employees ${JSON.stringify(body)}`);
  }
  return decoded.right;
};

const sortEmployees = (
  employees: Employee[],
  field: SortField,
  direction: SortDirection
): Employee[] => {
  return [...employees].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (field) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "age":
        aValue = a.age;
        bValue = b.age;
        break;
      case "id":
        aValue = isNaN(Number(a.id)) ? a.id : Number(a.id);
        bValue = isNaN(Number(b.id)) ? b.id : Number(b.id);
        break;
      default:
        return 0;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      const aNum = typeof aValue === "number" ? aValue : Number(aValue);
      const bNum = typeof bValue === "number" ? bValue : Number(bValue);
      return direction === "asc" ? aNum - bNum : bNum - aNum;
    }
  });
};

export function EmployeeCardContainer({ filterText }: EmployeesContainerProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const encodedFilterText = encodeURIComponent(filterText);
  const { data, error, isLoading } = useSWR<Employee[], Error>(
    `/api/employees?filterText=${encodedFilterText}`,
    employeesFetcher
  );

  useEffect(() => {
    if (error != null) {
      console.error("Failed to fetch employees", error);
    }
  }, [error, filterText]);

  const handleSortFieldChange = (
    event: React.MouseEvent<HTMLElement>,
    newField: SortField | null
  ) => {
    if (newField !== null) {
      setSortField(newField);
    }
  };

  const handleSortDirectionChange = (
    event: React.MouseEvent<HTMLElement>,
    newDirection: SortDirection | null
  ) => {
    if (newDirection !== null) {
      setSortDirection(newDirection);
    }
  };

  if (isLoading) {
    return (
      <Box p={3} textAlign="center">
        <Typography>従業員データを読み込み中...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography>
          {filterText
            ? `「${filterText}」に一致する従業員が見つかりませんでした。`
            : "従業員データがありません。"}
        </Typography>
      </Box>
    );
  }

  const sortedData = sortEmployees(data, sortField, sortDirection);

  return (
    <Box>
      <Box display="flex" justifyContent="center" gap={2} mb={2}>
        <ToggleButtonGroup
          value={sortField}
          exclusive
          onChange={handleSortFieldChange}
          size="small"
        >
          <ToggleButton value="id">ID</ToggleButton>
          <ToggleButton value="name">名前</ToggleButton>
          <ToggleButton value="age">年齢</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={sortDirection}
          exclusive
          onChange={handleSortDirectionChange}
          size="small"
        >
          <ToggleButton value="asc">昇順</ToggleButton>
          <ToggleButton value="desc">降順</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2}>
        {sortedData.map((employee) => (
          <Grid size={4} key={employee.id}>
            <Card variant="outlined">
              <CardActionArea
                onClick={() =>
                  (window.location.href = `/employee/${employee.id}`)
                }
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">{employee.name}</Typography>
                  <Typography color="text.secondary">ID: {employee.id}</Typography>
                  <Typography color="text.secondary">年齢: {employee.age}</Typography>
                  {/* タグ表示 */}
                    <Stack direction="column" spacing={1} mt={2} justifyContent="flex-start">
                      <Chip
                      label={employee.department}
                      variant="outlined"
                      sx={{
                        width: "fit-content",
                        backgroundColor: "#dbe9fe",
                        borderColor: "#bfdbfe",
                        color: "#1d40b0"
                      }}
                      />
                      <Chip
                      label={employee.position}
                      variant="outlined"
                      sx={{
                        width: "fit-content",
                        backgroundColor: "#f3e8ff",
                        borderColor: "#e9d5ff",
                        color: "#6b21a8"
                      }}
                      />
                    </Stack>
                    <Stack direction="column" spacing={1} mt={3} justifyContent="flex-start">

                        {employee.techStacks.map((stack, index) => (
                        <Chip
                          key={index}
                          label={`${stack.name}（レベル: ${stack.level}）`}
                          variant="outlined"
                          sx={{
                            width: "fit-content",
                            backgroundColor: "#dcfce7",
                            borderColor: "#bbf7d0",
                            color: "#166434"
                          }}
                        />
                        ))}
                    </Stack>
                  
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
