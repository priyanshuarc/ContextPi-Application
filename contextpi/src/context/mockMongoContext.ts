/**
 * Synthetic Mock MongoDB Context Provider
 * Used ONLY for local developer unit testing and offline demo scaffolding.
 * Does NOT contain NexaSupply-specific hardcoded application logic.
 */

import { ProjectContext } from '../types/context.js';

export function getMockProjectContext(
  projectName: string = 'SyntheticDemoProject',
  requirement?: string
): ProjectContext {
  return {
    projectName,
    useMock: true,
    isAdapterMode: true,
    requirement: requirement || 'price must be non-negative number; itemCode length must be exactly 8 characters',
    schemas: [
      {
        schemaName: 'items',
        active: true,
        fields: [
          {
            name: 'itemCode',
            dataType: 'String',
            mandatoryField: true,
            inputType: 'text'
          },
          {
            name: 'itemName',
            dataType: 'String',
            mandatoryField: true,
            inputType: 'text'
          },
          {
            name: 'price',
            dataType: 'Number',
            mandatoryField: true,
            inputType: 'number'
          },
          {
            name: 'category',
            dataType: 'String',
            mandatoryField: true,
            inputType: 'select',
            enum: ['electronics', 'apparel', 'food', 'office']
          },
          {
            name: 'stockQuantity',
            dataType: 'Number',
            mandatoryField: false,
            inputType: 'number',
            defaultValue: 0
          },
          {
            name: 'tags',
            dataType: 'Array',
            mandatoryField: false,
            inputType: 'multiselect',
            multipleSelect: true
          },
          {
            name: 'supplierWebsite',
            dataType: 'String',
            mandatoryField: false,
            inputType: 'url'
          },
          {
            name: 'supportPhone',
            dataType: 'String',
            mandatoryField: false,
            inputType: 'phone'
          }
        ],
        sampleRecord: {
          itemCode: 'ITM-1001',
          itemName: 'Synthetic Industrial Sensor',
          price: 149.99,
          category: 'electronics',
          stockQuantity: 50,
          tags: ['sensor', 'industrial'],
          supplierWebsite: 'https://supplier.example.com',
          supportPhone: '9876543210'
        }
      },
      {
        schemaName: 'orders',
        active: true,
        fields: [
          {
            name: 'orderId',
            dataType: 'String',
            mandatoryField: true,
            inputType: 'text'
          },
          {
            name: 'itemId',
            dataType: 'ObjectId',
            mandatoryField: true,
            inputType: 'text',
            mappedTableRef: 'items'
          },
          {
            name: 'quantity',
            dataType: 'Number',
            mandatoryField: true,
            inputType: 'number',
            defaultValue: 1
          },
          {
            name: 'customerEmail',
            dataType: 'String',
            mandatoryField: true,
            inputType: 'email'
          },
          {
            name: 'orderDate',
            dataType: 'Date',
            mandatoryField: false,
            inputType: 'date'
          }
        ],
        sampleRecord: {
          orderId: 'ORD-5001',
          itemId: '65d1a2b3c4d5e6f7a8b9c0d1',
          quantity: 2,
          customerEmail: 'customer@example.com',
          orderDate: '2026-08-23T12:00:00Z'
        }
      }
    ],
    functions: [
      {
        name: 'calculateDiscount',
        isActive: true,
        parameters: [
          {
            name: 'itemCode',
            type: 'string',
            isActive: true,
            required: true
          },
          {
            name: 'discountPercentage',
            type: 'number',
            isActive: true,
            required: true
          }
        ],
        expectedResponseFields: [
          {
            name: 'discountedPrice',
            type: 'number',
            required: true
          },
          {
            name: 'savingsAmount',
            type: 'number',
            required: true
          },
          {
            name: 'status',
            type: 'string',
            required: true
          }
        ]
      }
    ],
    sampleData: {
      items: [
        {
          itemCode: 'ITM-1001',
          itemName: 'Synthetic Industrial Sensor',
          price: 149.99,
          category: 'electronics',
          stockQuantity: 50
        }
      ],
      orders: [
        {
          orderId: 'ORD-5001',
          itemId: '65d1a2b3c4d5e6f7a8b9c0d1',
          quantity: 2,
          customerEmail: 'customer@example.com'
        }
      ]
    }
  };
}
