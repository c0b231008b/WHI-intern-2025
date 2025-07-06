import {
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandInput,
    ScanCommand,
    ScanCommandInput,
} from "@aws-sdk/client-dynamodb"; // AWS SDK を使用
import { isLeft } from "fp-ts/Either"; // io-ts のエラー処理のために使用
import { EmployeeDatabase } from "./EmployeeDatabase"; // EmployeeDatabase インターフェースをインポート
import { Employee, EmployeeT } from "./Employee"; // Employee 型と io-ts の定義をインポート

/**
 * DynamoDB を使用した EmployeeDatabase の実装
 * DynamoDB から従業員情報を取得するためのクラス
 */
// このクラスは AWS SDK を使用して DynamoDB からデータを取得
export class EmployeeDatabaseDynamoDB implements EmployeeDatabase {
    // DynamoDB クライアントとテーブル名を保持
    private client: DynamoDBClient;
    private tableName: string;

    /**
     * コンストラクタ
     * @param client DynamoDBClient インスタンス
     * @param tableName DynamoDB のテーブル名
     */
    // DynamoDBClient を受け取り、テーブル名を設定
    constructor(client: DynamoDBClient, tableName: string) {
        this.client = client;
        this.tableName = tableName;
    }

    /**
     * 指定された ID の従業員情報を取得
     * @param id 従業員の ID
     * @returns 従業員情報または undefined
     */
    // DynamoDB の GetItemCommand を使用して従業員情報を取得
    async getEmployee(id: string): Promise<Employee | undefined> {
        // GetItemCommandInput を作成
        const input: GetItemCommandInput = {
            TableName: this.tableName,
            Key: {
                id: { S: id },
            },
        };
        // DynamoDB からアイテムを取得
        const output = await this.client.send(new GetItemCommand(input));
        const item = output.Item;
        if (item == null) {
            return;
        }
        // アイテムから従業員情報を抽出
        const employee = {
            id: id,
            name: item["name"]?.S ?? "",
            age: mapNullable(item["age"]?.N, value => parseInt(value, 10)),
            department: item["department"]?.S ?? "", // 部署
            position: item["position"]?.S ?? "", // 役職
            techStacks: parseTechStacks(item["techStacks"]?.L), // 技術スタック
        };
        // io-ts を使用して従業員情報をデコード
        const decoded = EmployeeT.decode(employee);
        if (isLeft(decoded)) {
            throw new Error(`Employee ${id} is missing some fields. ${JSON.stringify(employee)}`);
        } else {
            return decoded.right;
        }
    }

    /**
     * 全従業員を検索（キーワードフィルターあり）
     * @param filterText 検索キーワード
     * @returns 従業員情報の配列
     */
    // DynamoDB の ScanCommand を使用して全従業員を取得
    async getEmployees(filterText: string): Promise<Employee[]> {
        // ScanCommandInput を作成
        const input: ScanCommandInput = {
            TableName: this.tableName,
        };
        // DynamoDB から全アイテムをスキャン
        const output = await this.client.send(new ScanCommand(input));
        const items = output.Items;
        if (items == null) return [];

        // フィルターが空でない場合はキーワードを正規化
        const keyword = filterText.trim().toLowerCase();

        return items
            .map(item => {
                const employee = {
                    id: item["id"]?.S ?? "",
                    name: item["name"]?.S ?? "",
                    age: mapNullable(item["age"]?.N, value => parseInt(value, 10)),
                    department: item["department"]?.S ?? "", // 部署
                    position: item["position"]?.S ?? "", // 役職
                    techStacks: parseTechStacks(item["techStacks"]?.L), // 技術スタック
                };
                // io-ts を使用して従業員情報をデコード
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

                // フィルター対象：名前、年齢、技術スタック
                const name = employee.name.toLowerCase();
                const ageStr = employee.age.toString();
                const techNames = employee.techStacks.map(stack => stack.name.toLowerCase());
                return name.includes(keyword) || ageStr.includes(keyword) || techNames.some(name => name.includes(keyword));
            });
    }
}

function mapNullable<T, U>(value: T | null | undefined, mapper: (value: T) => U): U | undefined {
    if (value != null) {
        return mapper(value);
    }
}

// techStacks（DynamoDBのList形式）を型に変換
function parseTechStacks(list: any): { name: string; level: number }[] {
    if (!Array.isArray(list)) return [];

    return list
        .map(entry => {
            const name = entry.M?.name?.S;
            const levelStr = entry.M?.level?.N;

            if (typeof name !== "string" || typeof levelStr !== "string") return undefined;

            return {
                name: name.trim(),
                level: Number(levelStr),
            };
        })
        .filter((v): v is { name: string; level: number } => v !== undefined);
}