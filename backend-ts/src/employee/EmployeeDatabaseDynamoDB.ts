import {
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput,
    ScanCommand,
    ScanCommandInput,
} from "@aws-sdk/client-dynamodb";
import { isLeft } from "fp-ts/Either";
import { EmployeeDatabase } from "./EmployeeDatabase";
import { Employee, EmployeeT } from "./Employee";

export class EmployeeDatabaseDynamoDB implements EmployeeDatabase {
    private client: DynamoDBClient;
    private tableName: string;

    constructor(client: DynamoDBClient, tableName: string) {
        this.client = client;
        this.tableName = tableName;
    }

    async getEmployee(id: string): Promise<Employee | undefined> {
        const input: GetItemCommandInput = {
            TableName: this.tableName,
            Key: {
                id: { S: id },
            },
        };
        const output = await this.client.send(new GetItemCommand(input));
        const item = output.Item;
        if (item == null) {
            return;
        }
        const employee = {
            id: id,
            name: item["name"]?.S ?? "",
            age: mapNullable(item["age"]?.N, value => parseInt(value, 10)),
        };
        const decoded = EmployeeT.decode(employee);
        if (isLeft(decoded)) {
            throw new Error(`Employee ${id} is missing some fields. ${JSON.stringify(employee)}`);
        } else {
            return decoded.right;
        }
    }

    async getEmployees(filterText: string): Promise<Employee[]> {
        const input: ScanCommandInput = {
            TableName: this.tableName,
        };
        const output = await this.client.send(new ScanCommand(input));
        const items = output.Items;
        if (items == null) {
            return [];
        }

        const keyword = filterText.trim().toLowerCase();

        return items
            .map(item => {
                const employee = {
                    id: item["id"]?.S ?? "",
                    name: item["name"]?.S ?? "",
                    age: mapNullable(item["age"]?.N, value => parseInt(value, 10)),
                };

                const decoded = EmployeeT.decode(employee);
                if (isLeft(decoded)) {
                    console.error(`Employee ${employee.id} is missing some fields and skipped. ${JSON.stringify(employee)}`);
                    return undefined;
                }

                return decoded.right;
            })
            .filter((employee): employee is Employee => {
                if (!employee) return false;
                if (keyword === "") return true;

                const name = employee.name.toLowerCase();
                const ageStr = employee.age.toString();
                return name.includes(keyword) || ageStr.includes(keyword);
            });
    }
}

function mapNullable<T, U>(value: T | null | undefined, mapper: (value: T) => U): U | undefined {
    if (value != null) {
        return mapper(value);
    }
}