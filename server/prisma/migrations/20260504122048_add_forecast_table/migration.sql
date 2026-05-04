-- CreateEnum
CREATE TYPE "ForecastType" AS ENUM ('STOCK_DEMAND', 'SALES_REVENUE', 'PURCHASE_COST');

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "ForecastType" NOT NULL,
    "forecastValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
