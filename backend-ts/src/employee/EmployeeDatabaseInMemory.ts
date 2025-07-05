import { EmployeeDatabase } from "./EmployeeDatabase";
import { Employee } from "./Employee";
import { normalizeName } from "../utils/normalize"; // 追加

export class EmployeeDatabaseInMemory implements EmployeeDatabase {
    private employees: Map<string, Employee>;

    constructor() {
        this.employees = new Map<string, Employee>();
        this.employees.set("1", { id: "1", name: "Jane Doe", age: 22 });
        this.employees.set("2", { id: "2", name: "John Smith", age: 28 });
        this.employees.set("3", { id: "3", name: "山田 太郎", age: 27 });
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
            return normalizedName.includes(normalizedKeyword);
        });
    }
}