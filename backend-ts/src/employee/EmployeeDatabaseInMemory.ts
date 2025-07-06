import { EmployeeDatabase } from "./EmployeeDatabase";
import { Employee } from "./Employee";
import { TechStack } from "./Employee"; // 追加
import { normalizeName } from "../utils/normalize"; // 追加
import fs from "fs";
import path from "path";

// CSVを簡単にパースするための関数
function parseCSV(filePath: string): Employee[] {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n");
    const headers = lines[0].split(",");
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
        const values = line.split(",");
        const employee: Employee = {
            id: values[0],
            name: values[1],
            age: Number(values[2]),
            department: values[3] || "", // 部署がない場合は空文字列
            position: values[4] || "", // 役職がない場合は空文字列
            techStacks: (values[5] || "").split(";").filter(pair => pair.trim() !== "").map(pair => {
                const [tech, levelStr] = pair.split(":");
                return {
                    name: tech.trim().replace(/^"+|"+$/g, "").replace(/"/g, "") || "", // ダブルクオートを削除
                    level: Number(levelStr) || 0,
                };
            }),
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
            return (
                normalizedName.includes(normalizedKeyword) ||
                ageString.includes(filterText)
            );
        });
    }
}