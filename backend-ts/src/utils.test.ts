// ユーティリティ関数のテスト
// 現在のプロジェクトには独立したユーティリティ関数がないため、
// 一般的なユーティリティ関数のテスト例を作成します

describe('Utility Functions', () => {
  describe('String utilities', () => {
    it('should normalize path by removing trailing slash', () => {
      const normalizePath = (path: string): string => {
        return path.endsWith("/") ? path.slice(0, -1) : path;
      };

      expect(normalizePath('/api/employees')).toBe('/api/employees');
      expect(normalizePath('/api/employees/')).toBe('/api/employees');
      expect(normalizePath('/api/employees/1')).toBe('/api/employees/1');
      expect(normalizePath('/api/employees/1/')).toBe('/api/employees/1');
      expect(normalizePath('/')).toBe(''); // ルートパスの場合は空文字を返す
      expect(normalizePath('')).toBe('');
    });

    it('should validate employee data structure', () => {
      const isValidEmployee = (data: any): boolean => {
        return (
          typeof data === 'object' &&
          data !== null &&
          typeof data.id === 'string' &&
          typeof data.name === 'string' &&
          typeof data.age === 'number'
        );
      };

      expect(isValidEmployee({
        id: '1',
        name: 'Jane Doe',
        age: 22
      })).toBe(true);

      expect(isValidEmployee({
        id: '1',
        name: 'Jane Doe'
        // age missing
      })).toBe(false);

      expect(isValidEmployee({
        id: '1',
        name: 'Jane Doe',
        age: '22' // wrong type
      })).toBe(false);

      expect(isValidEmployee(null)).toBe(false);
      expect(isValidEmployee(undefined)).toBe(false);
      expect(isValidEmployee('string')).toBe(false);
    });

    it('should filter employees by name', () => {
      const filterEmployeesByName = (employees: any[], filterText: string): any[] => {
        if (filterText === '') {
          return employees;
        }
        return employees.filter(employee => employee.name === filterText);
      };

      const employees = [
        { id: '1', name: 'Jane Doe', age: 22 },
        { id: '2', name: 'John Smith', age: 28 },
        { id: '3', name: '山田 太郎', age: 27 }
      ];

      expect(filterEmployeesByName(employees, '')).toEqual(employees);
      expect(filterEmployeesByName(employees, 'Jane Doe')).toEqual([
        { id: '1', name: 'Jane Doe', age: 22 }
      ]);
      expect(filterEmployeesByName(employees, 'Non Existent')).toEqual([]);
      expect(filterEmployeesByName(employees, '山田 太郎')).toEqual([
        { id: '3', name: '山田 太郎', age: 27 }
      ]);
    });
  });

  describe('Query parameter validation', () => {
    it('should validate filterText parameter', () => {
      const validateFilterText = (filterText: any): boolean => {
        if (Array.isArray(filterText)) {
          return false;
        }
        if (typeof filterText !== "string") {
          return false;
        }
        return true;
      };

      expect(validateFilterText('')).toBe(true);
      expect(validateFilterText('Jane Doe')).toBe(true);
      expect(validateFilterText('山田 太郎')).toBe(true);
      expect(validateFilterText(['value1', 'value2'])).toBe(false);
      expect(validateFilterText({ key: 'value' })).toBe(false);
      expect(validateFilterText(123)).toBe(false);
      expect(validateFilterText(null)).toBe(false);
      expect(validateFilterText(undefined)).toBe(false);
    });

    it('should extract and validate query parameters', () => {
      const extractFilterText = (query: any): string => {
        const filterText = query?.filterText ?? "";
        if (Array.isArray(filterText)) {
          throw new Error('Multiple filterText is not supported');
        }
        if (typeof filterText !== "string") {
          throw new Error('Nested query object is not supported');
        }
        return filterText;
      };

      expect(extractFilterText({ filterText: 'Jane Doe' })).toBe('Jane Doe');
      expect(extractFilterText({})).toBe('');
      expect(extractFilterText(null)).toBe('');
      expect(extractFilterText(undefined)).toBe('');

      expect(() => extractFilterText({ filterText: ['value1', 'value2'] }))
        .toThrow('Multiple filterText is not supported');
      expect(() => extractFilterText({ filterText: { nested: 'value' } }))
        .toThrow('Nested query object is not supported');
    });
  });

  describe('Error handling utilities', () => {
    it('should create standardized error responses', () => {
      const createErrorResponse = (statusCode: number, message?: string) => {
        return {
          statusCode,
          body: message ? JSON.stringify({ message }) : undefined
        };
      };

      expect(createErrorResponse(400)).toEqual({
        statusCode: 400,
        body: undefined
      });

      expect(createErrorResponse(500, 'Internal Server Error')).toEqual({
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' })
      });

      expect(createErrorResponse(404, 'Not Found')).toEqual({
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
      });
    });

    it('should handle async operation errors', async () => {
      const safeAsyncOperation = async <T>(
        operation: () => Promise<T>,
        errorMessage: string
      ): Promise<T> => {
        try {
          return await operation();
        } catch (error) {
          // console.error(errorMessage, error); // テスト中はコンソール出力を抑制
          throw new Error(errorMessage);
        }
      };

      // Success case
      const successResult = await safeAsyncOperation(
        async () => 'success',
        'Operation failed'
      );
      expect(successResult).toBe('success');

      // Error case
      await expect(safeAsyncOperation(
        async () => {
          throw new Error('Original error');
        },
        'Operation failed'
      )).rejects.toThrow('Operation failed');
    });
  });
}); 