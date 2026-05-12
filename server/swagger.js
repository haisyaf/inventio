const swaggerJSDoc = require("swagger-jsdoc");

const port = process.env.BE_PORT || 5000;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Inventio API",
      version: "1.0.0",
      description: "Inventio backend API documentation",
    },
    servers: [{ url: `http://localhost:${port}` }],
    tags: [
      { name: "Auth" },
      { name: "Tenants" },
      { name: "Invites" },
      { name: "Categories" },
      { name: "Warehouses" },
      { name: "Suppliers" },
      { name: "Products" },
      { name: "Transactions" },
      { name: "Stocks" },
      { name: "Stock Movements" },
      { name: "Forecasts" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        BadRequestError: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        UnauthorizedError: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ForbiddenError: {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFoundError: {
          description: "Not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ConflictError: {
          description: "Conflict",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            detail: { type: "string" },
          },
          additionalProperties: true,
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: { type: "string" },
            userId: { type: "string" },
            tenantId: { type: "string" },
            role: { type: "string" },
          },
          additionalProperties: true,
        },
        TenantRegisterRequest: {
          type: "object",
          required: [
            "tenantName",
            "tenantSlug",
            "userEmail",
            "userName",
            "password",
          ],
          properties: {
            tenantName: { type: "string" },
            tenantSlug: { type: "string" },
            userEmail: { type: "string", format: "email" },
            userName: { type: "string" },
            password: { type: "string", format: "password" },
          },
        },
        TenantRegisterResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: { type: "string" },
            userId: { type: "string" },
            tenantId: { type: "string" },
          },
          additionalProperties: true,
        },
        InviteCreateRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
        InviteAcceptRequest: {
          type: "object",
          required: ["token", "name", "password"],
          properties: {
            token: { type: "string" },
            name: { type: "string" },
            password: { type: "string", format: "password" },
          },
        },
        Invite: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            token: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
            used: { type: "boolean" },
            tenantId: { type: "string" },
          },
          additionalProperties: true,
        },
        CategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            tenantId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        WarehouseRequest: {
          type: "object",
          required: ["name", "location"],
          properties: {
            name: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
          },
        },
        Warehouse: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
            tenantId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        SupplierRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
          },
        },
        Supplier: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            address: { type: "string" },
            tenantId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        ProductRequest: {
          type: "object",
          required: ["name", "price", "categoryId"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            categoryId: { type: "string" },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            categoryId: { type: "string" },
            tenantId: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        TransactionType: {
          type: "object",
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            name: { type: "string" },
            code: { type: "string" },
            direction: { type: "string" },
            affectsStock: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        TransactionItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            transactionId: { type: "string" },
            productId: { type: "string" },
            quantity: { type: "integer" },
            price: { type: "number" },
            subtotal: { type: "number" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            product: { $ref: "#/components/schemas/Product" },
          },
          additionalProperties: true,
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            warehouseId: { type: "string" },
            supplierId: { type: "string" },
            typeId: { type: "string" },
            createdBy: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/TransactionItem" },
            },
            type: { $ref: "#/components/schemas/TransactionType" },
            warehouse: { $ref: "#/components/schemas/Warehouse" },
            supplier: { $ref: "#/components/schemas/Supplier" },
          },
          additionalProperties: true,
        },
        TransactionCreateRequest: {
          type: "object",
          required: ["typeId", "warehouseId", "items"],
          properties: {
            typeId: { type: "string" },
            warehouseId: { type: "string" },
            supplierId: { type: "string" },
            description: { type: "string" },
            date: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "quantity", "price"],
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "integer" },
                  price: { type: "number" },
                },
                additionalProperties: true,
              },
            },
          },
          additionalProperties: true,
        },
        TransactionCreateResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            transactionId: { type: "string" },
          },
          additionalProperties: true,
        },
        Stock: {
          type: "object",
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            productId: { type: "string" },
            warehouseId: { type: "string" },
            quantity: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            product: { $ref: "#/components/schemas/Product" },
            warehouse: { $ref: "#/components/schemas/Warehouse" },
          },
          additionalProperties: true,
        },
        StockSummaryEntry: {
          type: "object",
          properties: {
            productId: { type: "string" },
            _sum: {
              type: "object",
              properties: {
                quantity: { type: "integer" },
              },
              additionalProperties: true,
            },
          },
          additionalProperties: true,
        },
        StockMovement: {
          type: "object",
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            transactionId: { type: "string" },
            warehouseId: { type: "string" },
            productId: { type: "string" },
            quantity: { type: "integer" },
            type: { type: "string" },
            beforeQuantity: { type: "integer" },
            afterQuantity: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            product: { $ref: "#/components/schemas/Product" },
            warehouse: { $ref: "#/components/schemas/Warehouse" },
            transaction: { $ref: "#/components/schemas/Transaction" },
          },
          additionalProperties: true,
        },
        ForecastRequest: {
          type: "object",
          required: ["forecastType", "items"],
          properties: {
            forecastType: {
              type: "string",
              enum: ["stock_demand", "sales_revenue", "purchase_cost"],
            },
            forecastParameters: {
              type: "object",
              additionalProperties: true,
            },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["itemId"],
                properties: {
                  itemId: { type: "string" },
                  filters: { $ref: "#/components/schemas/ForecastFilters" },
                },
                additionalProperties: true,
              },
            },
            filters: { $ref: "#/components/schemas/ForecastFilters" },
          },
        },
        ForecastFilters: {
          type: "object",
          properties: {
            transactionTypeCodes: {
              type: "array",
              items: { type: "string" },
            },
            direction: { type: "string" },
            fromDate: { type: "string", format: "date-time" },
            toDate: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        ForecastResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            jobId: { type: "string", nullable: true },
            results: {
              type: "array",
              items: { $ref: "#/components/schemas/ForecastResult" },
            },
            savedCount: { type: "number" },
          },
          additionalProperties: true,
        },
        ForecastResult: {
          type: "object",
          properties: {
            itemId: { type: "string" },
            status: { type: "string" },
            forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  forecastDate: { type: "string", format: "date-time" },
                  forecastValue: { type: "number" },
                  unit: { type: "string" },
                },
                additionalProperties: true,
              },
            },
          },
          additionalProperties: true,
        },
        ForecastEntry: {
          type: "object",
          properties: {
            id: { type: "string" },
            tenantId: { type: "string" },
            productId: { type: "string" },
            type: { type: "string" },
            forecastValue: { type: "number" },
            unit: { type: "string" },
            forecastDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          additionalProperties: true,
        },
        ForecastListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/ForecastEntry" },
            },
          },
          additionalProperties: true,
        },
      },
    },
  },
  apis: ["./routes/*.js"],
});

module.exports = swaggerSpec;
