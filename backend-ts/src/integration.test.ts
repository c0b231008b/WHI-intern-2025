import { EmployeeDatabaseInMemory } from './employee/EmployeeDatabaseInMemory';
import { EmployeeT } from './employee/Employee';

describe('Integration Tests', () => {
  let database: EmployeeDatabaseInMemory;

  beforeEach(() => {
    database = new EmployeeDatabaseInMemory();
  });

  describe('Employee Data Flow', () => {
    it('should handle complete employee data flow', async () => {
      // 1. Get all employees
      const allEmployees = await database.getEmployees('');
      expect(allEmployees).toHaveLength(3);

      // 2. Get specific employee by ID
      const employee = await database.getEmployee('1');
      expect(employee).toBeDefined();
      expect(employee!.id).toBe('1');

      // 3. Validate employee data structure using io-ts
      const validationResult = EmployeeT.decode(employee);
      expect(validationResult._tag).toBe('Right');
      if (validationResult._tag === 'Right') {
        expect(validationResult.right).toEqual(employee);
      }

      // 4. Filter employees by name
      const filteredEmployees = await database.getEmployees('Jane Doe');
      expect(filteredEmployees).toHaveLength(1);
      expect(filteredEmployees[0].name).toBe('Jane Doe');

      // 5. Validate filtered results
      filteredEmployees.forEach(emp => {
        const result = EmployeeT.decode(emp);
        expect(result._tag).toBe('Right');
      });
    });

    it('should handle Japanese employee data correctly', async () => {
      // Get Japanese employee
      const japaneseEmployee = await database.getEmployee('3');
      expect(japaneseEmployee).toBeDefined();
      expect(japaneseEmployee!.name).toBe('山田 太郎');

      // Validate Japanese employee data
      const validationResult = EmployeeT.decode(japaneseEmployee);
      expect(validationResult._tag).toBe('Right');

      // Filter by Japanese name
      const filteredEmployees = await database.getEmployees('山田 太郎');
      expect(filteredEmployees).toHaveLength(1);
      expect(filteredEmployees[0].name).toBe('山田 太郎');
    });

    it('should handle non-existent employee gracefully', async () => {
      // Try to get non-existent employee
      const nonExistentEmployee = await database.getEmployee('999');
      expect(nonExistentEmployee).toBeUndefined();

      // Filter with non-existent name
      const filteredEmployees = await database.getEmployees('Non Existent');
      expect(filteredEmployees).toHaveLength(0);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      // Get all employees first
      const allEmployees = await database.getEmployees('');
      const initialCount = allEmployees.length;

      // Get each employee individually and verify they exist in the full list
      for (const employee of allEmployees) {
        const individualEmployee = await database.getEmployee(employee.id);
        expect(individualEmployee).toBeDefined();
        expect(individualEmployee).toEqual(employee);
      }

      // Verify the count hasn't changed
      const finalEmployees = await database.getEmployees('');
      expect(finalEmployees).toHaveLength(initialCount);
    });

    it('should handle case-sensitive filtering correctly', async () => {
      // Test case sensitivity
      const exactMatch = await database.getEmployees('Jane Doe');
      expect(exactMatch).toHaveLength(1);

      const caseMismatch = await database.getEmployees('jane doe');
      expect(caseMismatch).toHaveLength(0);

      const partialMatch = await database.getEmployees('Jane');
      expect(partialMatch).toHaveLength(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid employee data gracefully', () => {
      // Test with invalid data structure
      const invalidEmployee = {
        id: '1',
        name: 'Jane Doe'
        // age is missing
      };

      const validationResult = EmployeeT.decode(invalidEmployee);
      expect(validationResult._tag).toBe('Left');
    });

    it('should handle edge cases in filtering', async () => {
      // Test with empty string filter
      const emptyFilterResult = await database.getEmployees('');
      expect(emptyFilterResult).toHaveLength(3);

      // Test with whitespace filter
      const whitespaceFilterResult = await database.getEmployees('   ');
      expect(whitespaceFilterResult).toHaveLength(0);

      // Test with special characters
      const specialCharFilterResult = await database.getEmployees('Jane@Doe');
      expect(specialCharFilterResult).toHaveLength(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent operations', async () => {
      // Perform multiple operations concurrently
      const promises = [
        database.getEmployees(''),
        database.getEmployee('1'),
        database.getEmployee('2'),
        database.getEmployee('3'),
        database.getEmployees('Jane Doe'),
        database.getEmployees('John Smith'),
        database.getEmployees('山田 太郎')
      ];

      const results = await Promise.all(promises);

      // Verify all operations completed successfully
      expect(results).toHaveLength(7);
      expect(results[0]).toHaveLength(3); // all employees
      expect(results[1]).toBeDefined(); // employee 1
      expect(results[2]).toBeDefined(); // employee 2
      expect(results[3]).toBeDefined(); // employee 3
      expect(results[4]).toHaveLength(1); // filtered Jane Doe
      expect(results[5]).toHaveLength(1); // filtered John Smith
      expect(results[6]).toHaveLength(1); // filtered 山田 太郎
    });

    it('should maintain data integrity under load', async () => {
      // Simulate multiple read operations
      const readOperations = Array.from({ length: 10 }, (_, i) => 
        database.getEmployee((i % 3 + 1).toString())
      );

      const results = await Promise.all(readOperations);

      // Verify all results are consistent
      results.forEach((employee, index) => {
        expect(employee).toBeDefined();
        expect(employee!.id).toBe((index % 3 + 1).toString());
      });
    });
  });
}); 