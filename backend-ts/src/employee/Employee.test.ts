import { EmployeeT, Employee } from './Employee';

describe('Employee', () => {
  describe('EmployeeT', () => {
    it('should decode valid employee data', () => {
      const validEmployee = {
        id: "1",
        name: "Jane Doe",
        age: 22
      };

      const result = EmployeeT.decode(validEmployee);
      expect(result._tag).toBe('Right');
      if (result._tag === 'Right') {
        expect(result.right).toEqual(validEmployee);
      }
    });

    it('should reject invalid employee data with missing id', () => {
      const invalidEmployee = {
        name: "Jane Doe",
        age: 22
      };

      const result = EmployeeT.decode(invalidEmployee);
      expect(result._tag).toBe('Left');
    });

    it('should reject invalid employee data with missing name', () => {
      const invalidEmployee = {
        id: "1",
        age: 22
      };

      const result = EmployeeT.decode(invalidEmployee);
      expect(result._tag).toBe('Left');
    });

    it('should reject invalid employee data with missing age', () => {
      const invalidEmployee = {
        id: "1",
        name: "Jane Doe"
      };

      const result = EmployeeT.decode(invalidEmployee);
      expect(result._tag).toBe('Left');
    });

    it('should reject invalid employee data with wrong age type', () => {
      const invalidEmployee = {
        id: "1",
        name: "Jane Doe",
        age: "22"
      };

      const result = EmployeeT.decode(invalidEmployee);
      expect(result._tag).toBe('Left');
    });

    it('should reject invalid employee data with wrong id type', () => {
      const invalidEmployee = {
        id: 1,
        name: "Jane Doe",
        age: 22
      };

      const result = EmployeeT.decode(invalidEmployee);
      expect(result._tag).toBe('Left');
    });
  });
}); 