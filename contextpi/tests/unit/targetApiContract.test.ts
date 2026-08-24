import { describe, it } from 'node:test';
import assert from 'node:assert';

import { TargetApiContract } from '../../src/types/contract.js';
import { DEFAULT_PS10_CONTRACT } from '../../src/contract/defaultPs10Contract.js';
import { RouteResolver, RouteResolutionError } from '../../src/contract/TargetApiContract.js';

describe('Target API Contract & Route Resolution Engine', () => {
  it('should initialize with DEFAULT_PS10_CONTRACT and return valid default routes', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);
    const contract = resolver.getContract();

    assert.strictEqual(contract.baseUrl, 'http://localhost:3000');
    assert.strictEqual(contract.formRoutes.formCreate, '/forms/formCreate');
    assert.strictEqual(contract.formRoutes.formGet, '/forms/formGet');
    assert.strictEqual(contract.functionRoutes.executeFunction, '/function/:name');
    assert.strictEqual(contract.functionRoutes.createFunction, '/function/createfunction');
    assert.strictEqual(contract.functionRoutes.getAllFunction, '/function/getAllfunction');
  });

  it('should resolve Form routes correctly without schema placeholder', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);

    assert.strictEqual(resolver.resolveFormRoute('formGet'), 'http://localhost:3000/forms/formGet');
    assert.strictEqual(resolver.resolveFormRoute('formCreate'), 'http://localhost:3000/forms/formCreate');
    assert.strictEqual(resolver.resolveFormRoute('formUpdate'), 'http://localhost:3000/forms/formUpdate');
    assert.strictEqual(resolver.resolveFormRoute('formDelete'), 'http://localhost:3000/forms/formDelete');
    assert.strictEqual(resolver.resolveFormRoute('formBulkupload'), 'http://localhost:3000/forms/formBulkupload');
    assert.strictEqual(resolver.resolveFormRoute('query'), 'http://localhost:3000/forms/query');
  });

  it('should append query parameters to resolved form URLs', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);
    const url = resolver.resolveFormRoute('formGet', {
      queryParams: { formId: 'products', limit: 10, active: true }
    });

    assert.strictEqual(url, 'http://localhost:3000/forms/formGet?formId=products&limit=10&active=true');
  });

  it('should resolve Custom Form Route Contracts with schema substitution', () => {
    const customContract: TargetApiContract = {
      baseUrl: 'https://api.example.com',
      formRoutes: {
        formGet: '/api/v1/forms/:schemaName/get',
        formCreate: '/api/v1/forms/:schemaName/create',
        formUpdate: '/api/v1/forms/:schemaName/update',
        formDelete: '/api/v1/forms/:schemaName/delete',
        formBulkupload: '/api/v1/forms/:schemaName/bulk',
        query: '/api/v1/forms/:schemaName/query'
      },
      functionRoutes: {
        executeFunction: '/api/v1/fn/:name',
        createFunction: '/api/v1/fn/create',
        getAllFunction: '/api/v1/fn/all'
      }
    };

    const resolver = new RouteResolver(customContract);
    const resolvedUrl = resolver.resolveFormRoute('formCreate', { schemaName: 'orders' });

    assert.strictEqual(resolvedUrl, 'https://api.example.com/api/v1/forms/orders/create');
  });

  it('should resolve Function routes with function name substitution', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);
    const url = resolver.resolveFunctionRoute('executeFunction', { functionName: 'calculateDiscount' });

    assert.strictEqual(url, 'http://localhost:3000/function/calculateDiscount');
  });

  it('should resolve Function routes that do not require functionName parameter', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);

    assert.strictEqual(resolver.resolveFunctionRoute('createFunction'), 'http://localhost:3000/function/createfunction');
    assert.strictEqual(resolver.resolveFunctionRoute('getAllFunction'), 'http://localhost:3000/function/getAllfunction');
  });

  it('should reject missing functionName when resolving function routes containing :name', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction');
    }, RouteResolutionError);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction', { functionName: '   ' });
    }, RouteResolutionError);
  });

  it('should reject path traversal attempts in schemaName or functionName', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction', { functionName: '../adminSecret' });
    }, RouteResolutionError);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction', { functionName: 'dir/fn' });
    }, RouteResolutionError);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction', { functionName: '..\\winPath' });
    }, RouteResolutionError);
  });

  it('should reject invalid characters in schemaName or functionName', () => {
    const resolver = new RouteResolver(DEFAULT_PS10_CONTRACT);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction', { functionName: 'calc&discount' });
    }, RouteResolutionError);

    assert.throws(() => {
      resolver.resolveFunctionRoute('executeFunction', { functionName: '<script>' });
    }, RouteResolutionError);
  });

  it('should reject malformed or invalid contract objects during initialization', () => {
    assert.throws(() => {
      new RouteResolver({} as any);
    }, Error);

    assert.throws(() => {
      new RouteResolver({
        baseUrl: '',
        formRoutes: DEFAULT_PS10_CONTRACT.formRoutes,
        functionRoutes: DEFAULT_PS10_CONTRACT.functionRoutes
      });
    }, Error);
  });

  it('should throw error if placeholder remains in resolved path', () => {
    const brokenContract: TargetApiContract = {
      baseUrl: 'http://localhost:3000',
      formRoutes: {
        formGet: '/forms/:unresolvedKey/get',
        formCreate: '/forms/formCreate',
        formUpdate: '/forms/formUpdate',
        formDelete: '/forms/formDelete',
        formBulkupload: '/forms/formBulkupload',
        query: '/forms/query'
      },
      functionRoutes: DEFAULT_PS10_CONTRACT.functionRoutes
    };

    const resolver = new RouteResolver(brokenContract);

    assert.throws(() => {
      resolver.resolveFormRoute('formGet');
    }, RouteResolutionError);
  });
});
