import { DynamoDBClient, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { handle } from './handlers';

// Mock DynamoDB client
jest.mock('@aws-sdk/client-dynamodb');

// Mock environment variable
const originalEnv = process.env;

describe('handlers', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.EMPLOYEE_TABLE_NAME = 'test-table';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('handle', () => {
    it('should return 400 for invalid path', async () => {
      const event = {
        requestContext: {
          http: { path: '/invalid/path' }
        },
        queryStringParameters: null
      } as any;

      const result = await handle(event);
      expect((result as any).statusCode).toBe(400);
    });

    it('should return 500 when EMPLOYEE_TABLE_NAME is not set', async () => {
      delete process.env.EMPLOYEE_TABLE_NAME;
      const event = {
        requestContext: {
          http: { path: '/api/employees' }
        },
        queryStringParameters: null
      } as any;

      const result = await handle(event);
      expect((result as any).statusCode).toBe(500);
      expect((result as any).body).toContain('Internal Server Error');
    });

    describe('GET /api/employees', () => {
      beforeEach(() => {
        // Mock DynamoDB responses
        const mockSend = jest.fn();
        mockSend
          .mockResolvedValueOnce({
            Items: [
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
            ],
            $metadata: {}
          })
          .mockResolvedValueOnce({
            Items: [
              {
                id: { S: '1' },
                name: { S: 'Jane Doe' },
                age: { N: '22' }
              }
            ],
            $metadata: {}
          })
          .mockResolvedValueOnce({
            Items: [
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
            ],
            $metadata: {}
          });

        // Mock the DynamoDBClient constructor
        (DynamoDBClient as any).mockImplementation(() => ({
          send: mockSend
        }));
      });

      it('should return employees list with empty filter', async () => {
        const event = {
          requestContext: {
            http: { path: '/api/employees' }
          },
          queryStringParameters: null
        } as any;

        const result = await handle(event);
        expect((result as any).statusCode).toBe(200);
        expect((result as any).body).toBeDefined();
        
        const employees = JSON.parse((result as any).body);
        expect(Array.isArray(employees)).toBe(true);
      });

      it('should return employees list with filter', async () => {
        const event = {
          requestContext: {
            http: { path: '/api/employees' }
          },
          queryStringParameters: { filterText: 'Jane Doe' }
        } as any;

        const result = await handle(event);
        expect((result as any).statusCode).toBe(200);
        expect((result as any).body).toBeDefined();
        
        const employees = JSON.parse((result as any).body);
        expect(Array.isArray(employees)).toBe(true);
      });

      it('should handle path with trailing slash', async () => {
        const event = {
          requestContext: {
            http: { path: '/api/employees/' }
          },
          queryStringParameters: null
        } as any;

        const result = await handle(event);
        expect((result as any).statusCode).toBe(200);
        expect((result as any).body).toBeDefined();
      });
    });

    describe('GET /api/employees/:id', () => {
      beforeEach(() => {
        // Mock DynamoDB responses
        const mockSend = jest.fn();
        mockSend
          .mockResolvedValueOnce({
            Item: {
              id: { S: '1' },
              name: { S: 'Jane Doe' },
              age: { N: '22' }
            },
            $metadata: {}
          })
          .mockResolvedValueOnce({
            Item: undefined,
            $metadata: {}
          })
          .mockResolvedValueOnce({
            Item: {
              id: { S: '1' },
              name: { S: 'Jane Doe' },
              age: { N: '22' }
            },
            $metadata: {}
          });

        // Mock the DynamoDBClient constructor
        (DynamoDBClient as any).mockImplementation(() => ({
          send: mockSend
        }));
      });

      it('should return employee when found', async () => {
        const event = {
          requestContext: {
            http: { path: '/api/employees/1' }
          },
          queryStringParameters: null
        } as any;

        const result = await handle(event);
        expect((result as any).statusCode).toBe(200);
        expect((result as any).body).toBeDefined();
        
        const employee = JSON.parse((result as any).body);
        expect(employee).toHaveProperty('id');
        expect(employee).toHaveProperty('name');
        expect(employee).toHaveProperty('age');
      });

      it('should return 404 when employee not found', async () => {
        const event = {
          requestContext: {
            http: { path: '/api/employees/999' }
          },
          queryStringParameters: null
        } as any;

        const result = await handle(event);
        expect((result as any).statusCode).toBe(404);
      });

      it('should handle path with trailing slash', async () => {
        const event = {
          requestContext: {
            http: { path: '/api/employees/1/' }
          },
          queryStringParameters: null
        } as any;

        const result = await handle(event);
        expect((result as any).statusCode).toBe(200);
        expect((result as any).body).toBeDefined();
      });
    });
  });
}); 