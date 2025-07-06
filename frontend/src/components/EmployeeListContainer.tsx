"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TableSortLabel,
  Box,
  Typography,
  Chip, 
  Stack
} from "@mui/material";
import { Employee, EmployeeT } from "../models/Employee";

export type EmployeesContainerProps = {
  filterText: string;
};

type SortField = 'name' | 'age' | 'id';
type SortDirection = 'asc' | 'desc';

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

const sortEmployees = (employees: Employee[], field: SortField, direction: SortDirection): Employee[] => {
  return [...employees].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (field) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'age':
        aValue = a.age;
        bValue = b.age;
        break;
      case 'id':
        // IDを数値として扱う（文字列の場合は数値に変換を試行）
        aValue = isNaN(Number(a.id)) ? a.id : Number(a.id);
        bValue = isNaN(Number(b.id)) ? b.id : Number(b.id);
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return direction === 'asc' ? comparison : -comparison;
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return direction === 'asc' ? comparison : -comparison;
    } else {
      // 片方が数値、片方が文字列の場合
      const aNum = typeof aValue === 'number' ? aValue : Number(aValue);
      const bNum = typeof bValue === 'number' ? bValue : Number(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        const comparison = aNum - bNum;
        return direction === 'asc' ? comparison : -comparison;
      } else {
        // 数値変換できない場合は文字列として比較
        const comparison = String(aValue).localeCompare(String(bValue));
        return direction === 'asc' ? comparison : -comparison;
      }
    }
  });
};

export function EmployeeListContainer({ filterText }: EmployeesContainerProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const encodedFilterText = encodeURIComponent(filterText);
  const { data, error, isLoading } = useSWR<Employee[], Error>(
    `/api/employees?filterText=${encodedFilterText}`,
    employeesFetcher
  );
  
  useEffect(() => {
    if (error != null) {
      console.error(`Failed to fetch employees filtered by filterText`, error);
    }
  }, [error, filterText]);
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  if (data != null) {
    const sortedData = sortEmployees(data, sortField, sortDirection);
    
    if (sortedData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <Typography>
            {filterText ? `「${filterText}」に一致する従業員が見つかりませんでした。` : '従業員データがありません。'}
          </Typography>
        </Box>
      );
    }
    
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
  <TableRow>
    <TableCell>
      <TableSortLabel
        active={sortField === 'id'}
        direction={sortField === 'id' ? sortDirection : 'asc'}
        onClick={() => handleSort('id')}
      >
        ID
      </TableSortLabel>
    </TableCell>
    <TableCell>
      <TableSortLabel
        active={sortField === 'name'}
        direction={sortField === 'name' ? sortDirection : 'asc'}
        onClick={() => handleSort('name')}
      >
        名前
      </TableSortLabel>
    </TableCell>
    <TableCell>
      <TableSortLabel
        active={sortField === 'age'}
        direction={sortField === 'age' ? sortDirection : 'asc'}
        onClick={() => handleSort('age')}
      >
        年齢
      </TableSortLabel>
    </TableCell>
    <TableCell>所属</TableCell>
    <TableCell>役職</TableCell>
    <TableCell>技術スタック</TableCell>
  </TableRow>
</TableHead>

<TableBody>
  {sortedData.map((employee) => (
    <TableRow
      key={employee.id}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
      onClick={() => window.location.href = `/employee/${employee.id}`}
    >
      <TableCell>{employee.id}</TableCell>
      <TableCell>{employee.name}</TableCell>
      <TableCell>{employee.age}</TableCell>
      <TableCell>{employee.department}</TableCell>
      <TableCell>{employee.position}</TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          {employee.techStacks.map((stack, index) => (
            <Chip key={index} label={`${stack.name}（レベル: ${stack.level}）`} />
          ))}
        </Stack>
      </TableCell>

    </TableRow>
  ))}
</TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>従業員データを読み込み中...</Typography>
      </Box>
    );
  }
  
  return null;
}
