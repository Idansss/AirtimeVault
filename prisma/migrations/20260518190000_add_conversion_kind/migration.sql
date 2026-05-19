CREATE TYPE "ConversionKind" AS ENUM ('AIRTIME', 'DATA');

ALTER TABLE "ConversionRequest"
  ADD COLUMN "kind" "ConversionKind" NOT NULL DEFAULT 'AIRTIME',
  ADD COLUMN "dataBundle" TEXT,
  ADD COLUMN "description" TEXT,
  ALTER COLUMN "airtimeAmount" SET DEFAULT 0,
  ALTER COLUMN "ratePercent" SET DEFAULT 0,
  ALTER COLUMN "walletAmount" SET DEFAULT 0;