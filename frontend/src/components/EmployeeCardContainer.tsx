"use client";
import { useEffect } from "react";
import useSWR from "swr";
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";
import { EmployeeListItem } from "./EmployeeListItem";
import { Employee, EmployeeT } from "../models/Employee";
import Grid from "@mui/material/Grid";

import {Typography, Box } from "@mui/material";

export type EmployeesContainerProps = {
  filterText: string;
};

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

export function EmployeeCardContainer({ filterText }: EmployeesContainerProps) {
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

  if (data != null) {
    return (
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2}>
          {data.map((employee) => (
            <Grid size={4} key={employee.id}>
                  <EmployeeListItem employee={employee} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
  
  if (isLoading) {
    return <Typography>Loading employees...</Typography>;
  }
}
