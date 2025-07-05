import { DynamoDBClient, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { EmployeeDatabaseDynamoDB } from './EmployeeDatabaseDynamoDB';

// Mock DynamoDB client
jest.mock('@aws-sdk/client-dynamodb');

describe('EmployeeDatabaseDynamoDB', () => {
  let database: EmployeeDatabaseDynamoDB;
  let mockClient: jest.Mocked<DynamoDBClient>;
  const tableName = 'test-employee-table';

  beforeEach(() => {
    mockClient = {
      send: jest.fn(),
    } as unknown as jest.Mocked<DynamoDBClient>;
    database = new EmployeeDatabaseDynamoDB(mockClient, tableName);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmployee', () => {
    it('should return employee when item exists', async () => {
      const mockItem = {
        id: { S: '1' },
        name: { S: 'Jane Doe' },
        age: { N: '22' }
      };

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Item: mockItem,
        $metadata: {}
      });

      const employee = await database.getEmployee('1');

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.any(GetItemCommand)
      );

      expect(employee).toEqual({
        id: '1',
        name: 'Jane Doe',
        age: 22
      });
    });

    it('should return undefined when item does not exist', async () => {
      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Item: undefined,
        $metadata: {}
      });

      const employee = await database.getEmployee('999');

      expect(employee).toBeUndefined();
    });

    it('should throw error when employee data is invalid', async () => {
      const mockItem = {
        id: { S: '1' },
        name: { S: 'Jane Doe' }
        // age is missing
      };

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Item: mockItem,
        $metadata: {}
      });

      await expect(database.getEmployee('1')).rejects.toThrow(
        'Cannot read properties of undefined'
      );
    });

    it('should handle null age value', async () => {
      const mockItem = {
        id: { S: '1' },
        name: { S: 'Jane Doe' },
        age: { N: null }
      };

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Item: mockItem,
        $metadata: {}
      });

      const employee = await database.getEmployee('1');

      expect(employee).toEqual({
        id: '1',
        name: 'Jane Doe',
        age: undefined
      });
    });
  });

  describe('getEmployees', () => {
    it('should return all employees when filterText is empty', async () => {
      const mockItems = [
        {
          id: { S: '1' },
          name: { S: 'Jane Doe' },
          age: { N: '22' }
        },
        {
          id: { S: '2' },
          name: { S: 'John Smith' },
          age: { N: '28' }
        }
      ];

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Items: mockItems,
        $metadata: {}
      });

      const employees = await database.getEmployees('');

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.any(ScanCommand)
      );

      expect(employees).toEqual([
        { id: '1', name: 'Jane Doe', age: 22 },
        { id: '2', name: 'John Smith', age: 28 }
      ]);
    });

    it('should return filtered employees when filterText matches', async () => {
      const mockItems = [
        {
          id: { S: '1' },
          name: { S: 'Jane Doe' },
          age: { N: '22' }
        },
        {
          id: { S: '2' },
          name: { S: 'John Smith' },
          age: { N: '28' }
        }
      ];

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Items: mockItems,
        $metadata: {}
      });

      const employees = await database.getEmployees('Jane Doe');

      expect(employees).toEqual([
        { id: '1', name: 'Jane Doe', age: 22 }
      ]);
    });

    it('should return empty array when no items exist', async () => {
      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Items: null,
        $metadata: {}
      });

      const employees = await database.getEmployees('');

      expect(employees).toEqual([]);
    });

    it('should skip invalid employee data and continue processing', async () => {
      const mockItems = [
        {
          id: { S: '1' },
          name: { S: 'Jane Doe' },
          age: { N: '22' }
        },
        {
          id: { S: '2' },
          name: { S: 'John Smith' }
          // age is missing - invalid
        },
        {
          id: { S: '3' },
          name: { S: '山田 太郎' },
          age: { N: '27' }
        }
      ];

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Items: mockItems,
        $metadata: {}
      });

      const employees = await database.getEmployees('');

      expect(employees).toEqual([
        { id: '1', name: 'Jane Doe', age: 22 },
        { id: '3', name: '山田 太郎', age: 27 }
      ]);
    });

    it('should handle null age values in items', async () => {
      const mockItems = [
        {
          id: { S: '1' },
          name: { S: 'Jane Doe' },
          age: { N: null }
        }
      ];

      (mockClient.send as jest.Mock).mockResolvedValueOnce({
        Items: mockItems,
        $metadata: {}
      });

      const employees = await database.getEmployees('');

      expect(employees).toEqual([
        { id: '1', name: 'Jane Doe', age: undefined }
      ]);
    });
  });
}); 