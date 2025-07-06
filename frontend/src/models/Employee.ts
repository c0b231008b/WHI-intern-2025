import * as t from "io-ts";

export const TechStackT = t.type({
    name: t.string,
    level: t.number,
});

export const EmployeeT = t.type({
  id: t.string,
  name: t.string,
  age: t.number,
  department: t.string, // 部署
  position: t.string, // 役職
  techStacks: t.array(TechStackT), // 技術スタック
});

export type Employee = t.TypeOf<typeof EmployeeT>;
export type TechStack = t.TypeOf<typeof TechStackT>;

