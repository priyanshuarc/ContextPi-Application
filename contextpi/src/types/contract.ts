/**
 * Target API Contract & Route Strategy
 * Decouples Contextπ from hardcoded application endpoints.
 * Supports PS10 `/forms/*` and `/function/*` routes.
 */

export interface FormRoutesContract {
  formGet: string;
  formCreate: string;
  formUpdate: string;
  formDelete: string;
  formBulkupload: string;
  query: string;
}

export interface FunctionRoutesContract {
  executeFunction: string;
  createFunction: string;
  getAllFunction: string;
}

export interface TargetApiContract {
  baseUrl: string;
  formRoutes: FormRoutesContract;
  functionRoutes: FunctionRoutesContract;
}

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
