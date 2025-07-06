import { EmployeeDatabase } from "./EmployeeDatabase";
import { Employee } from "./Employee";
import { TechStack } from "./Employee"; // 追加
import { normalizeName } from "../utils/normalize"; // 追加
import fs from "fs";
import path from "path";

import { parse } from "csv-parse/sync"; // ← 要インストール: npm install csv-parse

function parseCSV(filePath: string): Employee[] {
    const content = fs.readFileSync(filePath, "utf-8");

    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    return records.map((row: any) => {
        const techStacks: TechStack[] = (row.techStacks || "")
            .split(";")
            .filter((pair: string) => pair.trim() !== "")
            .map((pair: string) => {
                const [tech, levelStr] = pair.split(":");
                return {
                    name: tech.trim(),
                    level: Number(levelStr) || 0,
                };
            });

        const employee: Employee = {
            id: row.id,
            name: row.name,
            age: Number(row.age),
            department: row.department || "",
            position: row.position || "",
            techStacks: techStacks,
        };

        return employee;
    });
}

export class EmployeeDatabaseInMemory implements EmployeeDatabase {
    private employees: Map<string, Employee>;

    constructor() {
        this.employees = new Map<string, Employee>();
        const csvPath = path.join(__dirname, "../../data/employees.csv");

        const employeesFromCSV = parseCSV(csvPath);

        for (const employee of employeesFromCSV) {
            this.employees.set(employee.id, employee);
        }

        console.log(`Loaded ${this.employees.size} employees from CSV`);
    }

    async getEmployee(id: string): Promise<Employee | undefined> {
        return this.employees.get(id);
    }

    async getEmployees(filterText: string): Promise<Employee[]> {
        const employees = Array.from(this.employees.values());

        if (filterText === "") {
            return employees;
        }

        const normalizedKeyword = normalizeName(filterText);

        return employees.filter((employee) => {
            const normalizedName = normalizeName(employee.name);
            const ageString = employee.age.toString();
            const techNames = employee.techStacks.map(ts => normalizeName(ts.name));
            return (
                normalizedName.includes(normalizedKeyword) ||
                ageString.includes(filterText) ||
                techNames.some(name => name.includes(normalizedKeyword))
            );
        });
    }
}