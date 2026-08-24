import * as http from 'node:http';
import { AddressInfo } from 'node:net';
import { ProjectContext } from '../../types/context.js';
import { TestCatalog } from '../../types/catalogue.js';

export type HarnessMode = 'ALL_PASS' | 'SIMULATE_FAILURES';

export class MockTargetApiHarness {
  private server: http.Server | null = null;
  private mode: HarnessMode = 'ALL_PASS';
  private port: number = 0;
  private baseUrl: string = '';
  private failedRoutes: Set<string> = new Set();
  private deletedIds: Set<string> = new Set();
  private createdFunctions: Set<string> = new Set();
  private context?: ProjectContext;
  private catalog?: TestCatalog;

  constructor(mode: HarnessMode = 'ALL_PASS', context?: ProjectContext, catalog?: TestCatalog) {
    this.mode = mode;
    this.context = context;
    this.catalog = catalog;
  }

  public setContext(context?: ProjectContext, catalog?: TestCatalog): void {
    this.context = context;
    this.catalog = catalog;
  }

  public resetState(): void {
    this.deletedIds.clear();
    this.createdFunctions.clear();
    this.failedRoutes.clear();
  }

  public setMode(mode: HarnessMode): void {
    this.mode = mode;
    this.resetState();
  }

  public setRouteFailure(routePath: string, shouldFail: boolean): void {
    if (shouldFail) {
      this.failedRoutes.add(routePath);
    } else {
      this.failedRoutes.delete(routePath);
    }
  }

  public async start(requestedPort: number = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', () => {
          let parsedPayload: any = {};
          try {
            if (body) parsedPayload = JSON.parse(body);
          } catch {
            // Keep empty if invalid JSON
          }

          // 1. Explicit route failure override check
          if (this.failedRoutes.has(pathname)) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Simulated Server Failure for route ' + pathname }));
            return;
          }

          // 2. SIMULATE_FAILURES mode failure simulation
          if (this.mode === 'SIMULATE_FAILURES' && (pathname.includes('formUpdate') || pathname.endsWith('/update'))) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error during formUpdate' }));
            return;
          }

          // 3. Validation error simulation for negative test scenarios
          if (parsedPayload.price !== undefined && typeof parsedPayload.price === 'number' && parsedPayload.price < 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Validation Error: price must be non-negative' }));
            return;
          }

          if (parsedPayload.supportPhone !== undefined && (parsedPayload.supportPhone === 'INVALID-PHONE' || String(parsedPayload.supportPhone).includes('invalid-phone'))) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Validation Error: Invalid phone format' }));
            return;
          }

          if (parsedPayload.supplierWebsite !== undefined && String(parsedPayload.supplierWebsite).includes('invalid-url')) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Validation Error: Invalid URL format for supplierWebsite' }));
            return;
          }

          // 4. Form Create / Entity Creation
          if (pathname.includes('formCreate') || pathname.endsWith('/create')) {
            if (
              parsedPayload.schemaName === 'NON_EXISTENT_ENTITY' ||
              parsedPayload.entity === 'NON_EXISTENT_ENTITY' ||
              pathname.includes('NON_EXISTENT')
            ) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Schema or entity not found' }));
              return;
            }

            // Omitted mandatory field checks with explicit field name in error message
            if (parsedPayload.itemName !== undefined && (parsedPayload.itemCode === undefined || parsedPayload.itemCode === '')) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Validation Error: Missing mandatory field: itemCode' }));
              return;
            }

            if (parsedPayload.itemId !== undefined && (parsedPayload.orderId === undefined || parsedPayload.orderId === '')) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Validation Error: Missing mandatory field: orderId' }));
              return;
            }

            if (parsedPayload.quantity !== undefined && (parsedPayload.customerEmail === undefined || parsedPayload.customerEmail === '')) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Validation Error: Missing mandatory field: customerEmail' }));
              return;
            }

            // Wrong type validation checks (e.g., string passed for numeric field)
            const isWrongType =
              (parsedPayload.price !== undefined && typeof parsedPayload.price === 'string') ||
              (parsedPayload.quantity !== undefined && typeof parsedPayload.quantity === 'string') ||
              (parsedPayload.stockQuantity !== undefined && typeof parsedPayload.stockQuantity === 'string');

            if (isWrongType) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Validation Error: Invalid data type provided for field' }));
              return;
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                id: '65d1a2b3c4d5e6f7a8b9c0d1',
                _id: '65d1a2b3c4d5e6f7a8b9c0d1',
                status: 'CREATED',
                message: 'Record created successfully'
              })
            );
            return;
          }

          // 5. Form Get / Read by ID or List
          if (pathname.includes('formGet') || pathname.endsWith('/get') || pathname.includes('/get/')) {
            const schema = parsedPayload.schemaName || parsedPayload.targetEntity || 'items';
            const recordId = parsedPayload.id || parsedPayload._id;
            const delKey = `${schema}:${recordId}`;

            if (
              (recordId && this.deletedIds.has(delKey)) ||
              pathname.includes('DELETED') ||
              recordId === 'DELETED_ID' ||
              recordId === 'NON_EXISTENT_ID' ||
              recordId === '65d1a2b3c4d5e6f7a8b9c0d1_DELETED'
            ) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Record not found or deleted' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                id: recordId || '65d1a2b3c4d5e6f7a8b9c0d1',
                status: 'ACTIVE',
                data: parsedPayload
              })
            );
            return;
          }

          // 6. Form Update
          if (pathname.includes('formUpdate') || pathname.endsWith('/update')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'UPDATED', message: 'Record updated successfully' }));
            return;
          }

          // 7. Form Delete
          if (pathname.includes('formDelete') || pathname.endsWith('/delete')) {
            const schema = parsedPayload.schemaName || parsedPayload.targetEntity || 'items';
            const recordId = parsedPayload.id || parsedPayload._id || '65d1a2b3c4d5e6f7a8b9c0d1';
            this.deletedIds.add(`${schema}:${recordId}`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'DELETED', message: 'Record deleted successfully' }));
            return;
          }

          // 8. Bulk Upload
          if (pathname.includes('formBulkupload') || pathname.endsWith('/bulkupload')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'SUCCESS', count: 10 }));
            return;
          }

          // 9. Query & Filter
          if (pathname.includes('query')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([{ id: '65d1a2b3c4d5e6f7a8b9c0d1', itemCode: 'ITM-1001' }]));
            return;
          }

          // 10. Custom Function & Function Registry Routes
          if (pathname.includes('/function/')) {
            const lowerPath = pathname.toLowerCase();
            if (lowerPath.includes('createfunction')) {
              if (this.createdFunctions.has(parsedPayload.name)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Function already exists' }));
                return;
              }
              if (parsedPayload.name) {
                this.createdFunctions.add(parsedPayload.name);
              }
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'CREATED', name: parsedPayload.name }));
              return;
            } else if (lowerPath.includes('getallfunction')) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify([{ name: 'calculateDiscount' }]));
              return;
            } else if (
              lowerPath.includes('unknown') ||
              lowerPath.includes('nonexistent') ||
              lowerPath.includes('non_existent')
            ) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Function not found' }));
              return;
            } else if (parsedPayload._testType === 'PROJECT_MISMATCH' || parsedPayload.projectName === 'INVALID_PROJECT_NAME_XYZ') {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Project Mismatch' }));
              return;
            } else if (
              parsedPayload._testType === 'MISSING_PARAM' ||
              (parsedPayload.discountPercentage !== undefined && !parsedPayload.itemCode)
            ) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Missing required parameter: itemCode' }));
              return;
            } else {
              // Custom function happy path execution
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  discountedPrice: 134.99,
                  savingsAmount: 15.0,
                  status: 'SUCCESS'
                })
              );
              return;
            }
          }

          // Fallback Endpoint 404
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        });
      });

      this.server.listen(requestedPort, '127.0.0.1', () => {
        const addr = this.server!.address() as AddressInfo;
        this.port = addr.port;
        this.baseUrl = `http://127.0.0.1:${this.port}`;
        resolve(this.baseUrl);
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close(err => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
