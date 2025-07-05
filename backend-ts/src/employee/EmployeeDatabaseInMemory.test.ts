import { EmployeeDatabaseInMemory } from './EmployeeDatabaseInMemory';
import { Employee } from './Employee';

describe('EmployeeDatabaseInMemory', () => {
  let database: EmployeeDatabaseInMemory;

  beforeEach(() => {
    database = new EmployeeDatabaseInMemory();
  });

  describe('getEmployee', () => {
    it('should return employee when id exists', async () => {
      const employee = await database.getEmployee('1');
      
      expect(employee).toEqual({
        id: '1',
        name: 'Jane Doe',
        age: 22
      });
    });

    it('should return undefined when id does not exist', async () => {
      const employee = await database.getEmployee('999');
      
      expect(employee).toBeUndefined();
    });

    it('should return different employees for different ids', async () => {
      const employee1 = await database.getEmployee('1');
      const employee2 = await database.getEmployee('2');
      const employee3 = await database.getEmployee('3');
      
      expect(employee1).toEqual({
        id: '1',
        name: 'Jane Doe',
        age: 22
      });
      expect(employee2).toEqual({
        id: '2',
        name: 'John Smith',
        age: 28
      });
      expect(employee3).toEqual({
        id: '3',
        name: '山田 太郎',
        age: 27
      });
    });
  });

  describe('getEmployees', () => {
    it('should return all employees when filterText is empty', async () => {
      const employees = await database.getEmployees('');
      
      expect(employees).toHaveLength(3);
      expect(employees).toEqual([
        { id: '1', name: 'Jane Doe', age: 22 },
        { id: '2', name: 'John Smith', age: 28 },
        { id: '3', name: '山田 太郎', age: 27 }
      ]);
    });

    it('should return filtered employees when filterText matches', async () => {
      const employees = await database.getEmployees('Jane Doe');
      
      expect(employees).toHaveLength(1);
      expect(employees).toEqual([
        { id: '1', name: 'Jane Doe', age: 22 }
      ]);
    });

    it('should return empty array when filterText does not match', async () => {
      const employees = await database.getEmployees('Non Existent');
      
      expect(employees).toHaveLength(0);
      expect(employees).toEqual([]);
    });

    it('should return filtered employees for Japanese names', async () => {
      const employees = await database.getEmployees('山田 太郎');
      
      expect(employees).toHaveLength(1);
      expect(employees).toEqual([
        { id: '3', name: '山田 太郎', age: 27 }
      ]);
    });

    it('should be case sensitive', async () => {
      const employees = await database.getEmployees('jane doe');
      
      expect(employees).toHaveLength(0);
      expect(employees).toEqual([]);
    });
  });
}); 