/**
 * Default Target API Routing Contract for PS10
 * Target Application: PS10-compliant Node.js API (e.g. NexaSupply)
 */

import { TargetApiContract } from '../types/contract.js';

export const DEFAULT_PS10_CONTRACT: TargetApiContract = {
  baseUrl: 'http://localhost:3000',
  formRoutes: {
    formGet: '/forms/formGet',
    formCreate: '/forms/formCreate',
    formUpdate: '/forms/formUpdate',
    formDelete: '/forms/formDelete',
    formBulkupload: '/forms/formBulkupload',
    query: '/forms/query'
  },
  functionRoutes: {
    executeFunction: '/function/:name',
    createFunction: '/function/createfunction',
    getAllFunction: '/function/getAllfunction'
  }
};
