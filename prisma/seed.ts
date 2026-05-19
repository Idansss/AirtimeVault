import "dotenv/config";
import { Network, MembershipTier, ConversionStatus, WithdrawalStatus, TransactionType, TransactionStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter } as never);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const NETWORKS: Network[]        = ["MTN", "AIRTEL", "GLO", "NINEMOBILE"];
const TIERS: MembershipTier[]    = ["BASIC", "SILVER", "GOLD", "BUSINESS"];

// ─── Conversion rates ─────────────────────────────────────────────────────────

const RATES: Record<Network, Record<MembershipTier, number>> = {
  MTN:        { BASIC: 75, SILVER: 78, GOLD: 80, BUSINESS: 83 },
  AIRTEL:     { BASIC: 73, SILVER: 76, GOLD: 79, BUSINESS: 82 },
  GLO:        { BASIC: 70, SILVER: 73, GOLD: 76, BUSINESS: 80 },
  NINEMOBILE: { BASIC: 68, SILVER: 71, GOLD: 74, BUSINESS: 78 },
};

async function seedRates(adminId: string) {
  console.log("  Seeding conversion rates…");
  for (const network of NETWORKS) {
    for (const tier of TIERS) {
      await prisma.conversionRate.upsert({
        where:  { network_tier: { network, tier } },
        create: {
          network,
          tier,
          ratePercent: RATES[network][tier],
          minAmount:   500,
          maxAmount:   tier === "BASIC" ? 10000 : tier === "SILVER" ? 50000 : tier === "GOLD" ? 200000 : 1000000,
          updatedBy:   adminId,
        },
        update: { ratePercent: RATES[network][tier], updatedBy: adminId },
      });
    }
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

async function seedUsers() {
  console.log("  Seeding users…");

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const pinHash      = await bcrypt.hash("1234", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where:  { email: "admin@airtimevault.com" },
    create: {
      email:         "admin@airtimevault.com",
      phone:         "08000000001",
      username:      "superadmin",
      passwordHash,
      pin:           pinHash,
      role:          "SUPER_ADMIN",
      kycLevel:      "LEVEL_2",
      membershipTier:"BUSINESS",
      emailVerified: true,
      phoneVerified: true,
      referralCode:  "ADMIN001",
      profile: { create: { firstName: "Admin", lastName: "User" } },
      wallet:  { create: { availableBalance: 0 } },
    },
    update: {},
  });

  // Regular test user (gold)
  const alice = await prisma.user.upsert({
    where:  { email: "alice@example.com" },
    create: {
      email:         "alice@example.com",
      phone:         "08012340001",
      username:      "alice_ng",
      passwordHash,
      pin:           pinHash,
      role:          "USER",
      kycLevel:      "LEVEL_1",
      membershipTier:"GOLD",
      emailVerified: true,
      phoneVerified: true,
      referralCode:  "ALICE001",
      profile: { create: { firstName: "Alice", lastName: "Okafor", state: "Lagos" } },
      wallet:  { create: { availableBalance: 45200, totalConverted: 312000, totalWithdrawn: 150000 } },
    },
    update: {},
  });

  // Regular test user (silver)
  const bob = await prisma.user.upsert({
    where:  { email: "bob@example.com" },
    create: {
      email:         "bob@example.com",
      phone:         "08023450002",
      username:      "bob_abuja",
      passwordHash,
      pin:           pinHash,
      role:          "USER",
      kycLevel:      "LEVEL_1",
      membershipTier:"SILVER",
      emailVerified: true,
      phoneVerified: true,
      referralCode:  "BOB0001",
      referredBy:    alice.id,
      profile: { create: { firstName: "Bob", lastName: "Musa", state: "Abuja" } },
      wallet:  { create: { availableBalance: 12500, totalConverted: 89000, totalWithdrawn: 60000 } },
    },
    update: {},
  });

  // Basic (unverified) user
  const chidi = await prisma.user.upsert({
    where:  { email: "chidi@example.com" },
    create: {
      email:         "chidi@example.com",
      phone:         "08034560003",
      username:      "chidi_ph",
      passwordHash,
      pin:           pinHash,
      role:          "USER",
      kycLevel:      "LEVEL_0",
      membershipTier:"BASIC",
      emailVerified: false,
      phoneVerified: true,
      referralCode:  "CHIDI001",
      profile: { create: { firstName: "Chidi", lastName: "Eze", state: "Rivers" } },
      wallet:  { create: { availableBalance: 3200 } },
    },
    update: {},
  });

  // Frozen user
  const frozen = await prisma.user.upsert({
    where:  { email: "frozen@example.com" },
    create: {
      email:         "frozen@example.com",
      phone:         "08045670004",
      username:      "frozen_user",
      passwordHash,
      role:          "USER",
      isFrozen:      true,
      referralCode:  "FROZN001",
      profile: { create: { firstName: "Frozen", lastName: "Test" } },
      wallet:  { create: {} },
    },
    update: {},
  });

  // Referral record
  await prisma.referral.upsert({
    where:  { referredId: bob.id },
    create: { referrerId: alice.id, referredId: bob.id, rewardAmount: 500, isPaid: true, paidAt: daysAgo(10) },
    update: {},
  });

  return { admin, alice, bob, chidi, frozen };
}

// ─── Bank accounts ────────────────────────────────────────────────────────────

async function seedBankAccounts(alice: { id: string }, bob: { id: string }) {
  console.log("  Seeding bank accounts…");

  const aliceBank = await prisma.bankAccount.upsert({
    where:  { userId_accountNumber: { userId: alice.id, accountNumber: "0123456789" } },
    create: {
      userId:        alice.id,
      bankName:      "GTBank",
      bankCode:      "058",
      accountNumber: "0123456789",
      accountName:   "Alice Okafor",
      isDefault:     true,
    },
    update: {},
  });

  await prisma.bankAccount.upsert({
    where:  { userId_accountNumber: { userId: alice.id, accountNumber: "2034567890" } },
    create: {
      userId:        alice.id,
      bankName:      "Access Bank",
      bankCode:      "044",
      accountNumber: "2034567890",
      accountName:   "Alice Okafor",
      isDefault:     false,
    },
    update: {},
  });

  const bobBank = await prisma.bankAccount.upsert({
    where:  { userId_accountNumber: { userId: bob.id, accountNumber: "1023456789" } },
    create: {
      userId:        bob.id,
      bankName:      "Zenith Bank",
      bankCode:      "057",
      accountNumber: "1023456789",
      accountName:   "Bob Musa",
      isDefault:     true,
    },
    update: {},
  });

  return { aliceBank, bobBank };
}

// ─── Conversions ──────────────────────────────────────────────────────────────

async function seedConversions(
  alice: { id: string },
  bob:   { id: string },
  chidi: { id: string },
  adminId: string,
) {
  console.log("  Seeding conversions…");

  const conversions = [
    // Alice — recent successful
    { userId: alice.id, network: "MTN" as Network, phone: "08012345678", airtime: 5000, rate: 80, status: "SUCCESSFUL" as ConversionStatus, daysBack: 1 },
    { userId: alice.id, network: "AIRTEL" as Network, phone: "08112345678", airtime: 10000, rate: 79, status: "SUCCESSFUL" as ConversionStatus, daysBack: 3 },
    { userId: alice.id, network: "GLO" as Network, phone: "08132345678", airtime: 20000, rate: 76, status: "SUCCESSFUL" as ConversionStatus, daysBack: 7 },
    { userId: alice.id, network: "MTN" as Network, phone: "08012345678", airtime: 15000, rate: 80, status: "SUCCESSFUL" as ConversionStatus, daysBack: 14 },
    { userId: alice.id, network: "MTN" as Network, phone: "08012345678", airtime: 8000,  rate: 80, status: "PENDING" as ConversionStatus,    daysBack: 0 },
    { userId: alice.id, network: "AIRTEL" as Network, phone: "08112345678", airtime: 3000, rate: 79, status: "UNDER_REVIEW" as ConversionStatus, daysBack: 0 },
    // Bob
    { userId: bob.id, network: "MTN" as Network, phone: "08023456789", airtime: 7000, rate: 78, status: "SUCCESSFUL" as ConversionStatus, daysBack: 2 },
    { userId: bob.id, network: "GLO" as Network, phone: "08033456789", airtime: 4000, rate: 73, status: "SUCCESSFUL" as ConversionStatus, daysBack: 5 },
    { userId: bob.id, network: "MTN" as Network, phone: "08023456789", airtime: 2000, rate: 78, status: "REJECTED" as ConversionStatus,  daysBack: 1 },
    // Chidi
    { userId: chidi.id, network: "NINEMOBILE" as Network, phone: "08092345678", airtime: 1000, rate: 68, status: "SUCCESSFUL" as ConversionStatus, daysBack: 4 },
    { userId: chidi.id, network: "MTN" as Network, phone: "08034560003", airtime: 500,  rate: 75, status: "PENDING" as ConversionStatus, daysBack: 0 },
  ];

  for (const c of conversions) {
    const walletAmount = Math.floor((c.airtime * c.rate) / 100);
    const createdAt    = daysAgo(c.daysBack);

    await prisma.conversionRequest.create({
      data: {
        userId:        c.userId,
        network:       c.network,
        phoneNumber:   c.phone,
        airtimeAmount: c.airtime,
        ratePercent:   c.rate,
        walletAmount,
        status:        c.status,
        adminNote:     c.status === "REJECTED" ? "Transfer not received within the time window." : null,
        processedAt:   c.status === "SUCCESSFUL" ? new Date(createdAt.getTime() + 25 * 60 * 1000) : null,
        processedBy:   c.status === "SUCCESSFUL" ? adminId : null,
        createdAt,
        updatedAt:     createdAt,
      },
    });
  }
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────

async function seedWithdrawals(
  alice: { id: string },
  bob:   { id: string },
  aliceBankId: string,
  bobBankId:   string,
) {
  console.log("  Seeding withdrawals…");

  const withdrawals = [
    { userId: alice.id, bankId: aliceBankId, amount: 30000, fee: 100, status: "SUCCESSFUL" as WithdrawalStatus, daysBack: 5 },
    { userId: alice.id, bankId: aliceBankId, amount: 15000, fee: 100, status: "SUCCESSFUL" as WithdrawalStatus, daysBack: 12 },
    { userId: alice.id, bankId: aliceBankId, amount: 10000, fee: 50,  status: "PENDING"    as WithdrawalStatus, daysBack: 0 },
    { userId: bob.id,   bankId: bobBankId,   amount: 20000, fee: 100, status: "SUCCESSFUL" as WithdrawalStatus, daysBack: 3 },
    { userId: bob.id,   bankId: bobBankId,   amount: 5000,  fee: 50,  status: "FAILED"     as WithdrawalStatus, daysBack: 1 },
  ];

  for (const w of withdrawals) {
    const createdAt = daysAgo(w.daysBack);
    await prisma.withdrawal.create({
      data: {
        userId:        w.userId,
        bankAccountId: w.bankId,
        amount:        w.amount,
        fee:           w.fee,
        netAmount:     w.amount - w.fee,
        status:        w.status,
        failureReason: w.status === "FAILED" ? "Bank account validation failed." : null,
        processedAt:   w.status === "SUCCESSFUL" ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : null,
        createdAt,
        updatedAt:     createdAt,
      },
    });
  }
}

// ─── Ledger entries ───────────────────────────────────────────────────────────

async function seedLedger(alice: { id: string; wallet: { id: string } | null }) {
  console.log("  Seeding wallet ledger…");

  if (!alice.wallet) return;
  const walletId = alice.wallet.id;

  const entries = [
    { type: "AIRTIME_CONVERSION" as TransactionType, amount: 4000,  desc: "MTN airtime conversion — ₦5,000 @ 80%", daysBack: 14 },
    { type: "AIRTIME_CONVERSION" as TransactionType, amount: 7900,  desc: "Airtel airtime conversion — ₦10,000 @ 79%", daysBack: 10 },
    { type: "WITHDRAWAL"         as TransactionType, amount: -15000, desc: "Bank withdrawal to GTBank ****6789", daysBack: 12 },
    { type: "AIRTIME_CONVERSION" as TransactionType, amount: 15200, desc: "GLO airtime conversion — ₦20,000 @ 76%", daysBack: 7 },
    { type: "P2P_RECEIVE"        as TransactionType, amount: 2000,  desc: "Received from @chidi_ph", daysBack: 6 },
    { type: "WITHDRAWAL"         as TransactionType, amount: -30000, desc: "Bank withdrawal to GTBank ****6789", daysBack: 5 },
    { type: "BILL_PAYMENT"       as TransactionType, amount: -3500, desc: "EKEDC Electricity — Meter 04152345678", daysBack: 4 },
    { type: "AIRTIME_CONVERSION" as TransactionType, amount: 12000, desc: "MTN airtime conversion — ₦15,000 @ 80%", daysBack: 14 },
    { type: "REFERRAL_BONUS"     as TransactionType, amount: 500,   desc: "Referral bonus — @bob_abuja signed up", daysBack: 10 },
    { type: "CASHBACK"           as TransactionType, amount: 350,   desc: "Gold member cashback — 1% on conversion", daysBack: 7 },
  ];

  let runningBalance = 0;
  for (const e of entries) {
    const balanceBefore = runningBalance;
    runningBalance      = Math.max(0, runningBalance + e.amount);
    const createdAt     = daysAgo(e.daysBack);

    await prisma.walletLedger.create({
      data: {
        walletId,
        type:          e.type,
        status:        "COMPLETED" as TransactionStatus,
        amount:        Math.abs(e.amount),
        balanceBefore,
        balanceAfter:  runningBalance,
        description:   e.desc,
        createdAt,
      },
    });
  }
}

// ─── Bill payments ────────────────────────────────────────────────────────────

async function seedBillPayments(alice: { id: string }, bob: { id: string }) {
  console.log("  Seeding bill payments…");

  const bills = [
    { userId: alice.id, category: "ELECTRICITY", provider: "EKEDC",     recipient: "04152345678", amount: 3500, daysBack: 4  },
    { userId: alice.id, category: "CABLE_TV",    provider: "DSTV",      recipient: "7012345678",  amount: 8900, daysBack: 9  },
    { userId: alice.id, category: "DATA",        provider: "MTN",       recipient: "08012345678", amount: 1500, daysBack: 2  },
    { userId: bob.id,   category: "AIRTIME",     provider: "Airtel",    recipient: "08112345678", amount: 1000, daysBack: 1  },
    { userId: bob.id,   category: "ELECTRICITY", provider: "IKEDC",     recipient: "45012345678", amount: 5000, daysBack: 6  },
    { userId: bob.id,   category: "INTERNET",    provider: "Spectranet",recipient: "spec_123456", amount: 7500, daysBack: 15 },
  ];

  for (const b of bills) {
    const createdAt = daysAgo(b.daysBack);
    await prisma.billPayment.create({
      data: {
        userId:    b.userId,
        category:  b.category as never,
        provider:  b.provider,
        recipient: b.recipient,
        amount:    b.amount,
        status:    "COMPLETED" as TransactionStatus,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
}

// ─── P2P transfers ────────────────────────────────────────────────────────────

async function seedP2P(alice: { id: string }, bob: { id: string }, chidi: { id: string }) {
  console.log("  Seeding P2P transfers…");

  await prisma.p2PTransfer.create({
    data: {
      senderId:   chidi.id,
      receiverId: alice.id,
      amount:     2000,
      note:       "Thanks for the help!",
      status:     "COMPLETED" as TransactionStatus,
      createdAt:  daysAgo(6),
    },
  });

  await prisma.p2PTransfer.create({
    data: {
      senderId:   alice.id,
      receiverId: bob.id,
      amount:     5000,
      note:       "Owe you from last time",
      status:     "COMPLETED" as TransactionStatus,
      createdAt:  daysAgo(3),
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

async function seedNotifications(alice: { id: string }, bob: { id: string }) {
  console.log("  Seeding notifications…");

  const notes = [
    { userId: alice.id, title: "Conversion Successful",      body: "Your MTN airtime of ₦5,000 has been converted. ₦4,000 credited to your wallet.",  type: "CONVERSION_SUCCESS", isRead: true,  daysBack: 1 },
    { userId: alice.id, title: "Withdrawal Initiated",       body: "Your withdrawal of ₦10,000 is being processed. Funds land in 1–24 hours.",          type: "WITHDRAWAL_PENDING", isRead: false, daysBack: 0 },
    { userId: alice.id, title: "Referral Bonus Earned!",     body: "You earned ₦500 because @bob_abuja joined using your referral link.",               type: "REFERRAL_BONUS",     isRead: false, daysBack: 10 },
    { userId: alice.id, title: "Conversion Under Review",    body: "Your Airtel conversion of ₦3,000 is under review. We'll notify you shortly.",       type: "CONVERSION_REVIEW",  isRead: false, daysBack: 0 },
    { userId: bob.id,   title: "Conversion Successful",      body: "Your MTN airtime of ₦7,000 has been converted. ₦5,460 credited to your wallet.",    type: "CONVERSION_SUCCESS", isRead: true,  daysBack: 2 },
    { userId: bob.id,   title: "Withdrawal Failed",          body: "Your withdrawal of ₦5,000 failed due to bank validation issues. Funds returned.",   type: "WITHDRAWAL_FAILED",  isRead: false, daysBack: 1 },
    { userId: bob.id,   title: "Welcome to AirtimeVault!",   body: "Your account is ready. Convert your first airtime and earn cashback today.",        type: "WELCOME",            isRead: true,  daysBack: 15 },
  ];

  for (const n of notes) {
    await prisma.notification.create({
      data: {
        userId:    n.userId,
        title:     n.title,
        body:      n.body,
        type:      n.type,
        isRead:    n.isRead,
        createdAt: daysAgo(n.daysBack),
      },
    });
  }
}

// ─── Fraud flags & disputes ───────────────────────────────────────────────────

async function seedFraudAndDisputes(alice: { id: string }, bob: { id: string }, adminId: string) {
  console.log("  Seeding fraud flags & disputes…");

  await prisma.fraudFlag.create({
    data: {
      userId:      bob.id,
      type:        "MULTIPLE_FAILED_WITHDRAWALS",
      description: "User had 3 failed withdrawal attempts in 24 hours.",
      isResolved:  false,
      createdAt:   daysAgo(1),
    },
  });

  await prisma.dispute.create({
    data: {
      userId:      alice.id,
      type:        "CONVERSION_DELAY",
      subject:     "Airtime conversion not credited after 2 hours",
      description: "I sent ₦10,000 MTN airtime to the collection number but my wallet was not credited after 2 hours.",
      status:      "UNDER_REVIEW",
      createdAt:   daysAgo(2),
      updatedAt:   daysAgo(2),
    },
  });

  await prisma.dispute.create({
    data: {
      userId:      bob.id,
      type:        "WITHDRAWAL_ISSUE",
      subject:     "Withdrawal debited but not received in bank",
      description: "My wallet was debited ₦20,000 but funds have not arrived in my Zenith Bank account after 24 hours.",
      status:      "RESOLVED",
      resolution:  "Confirmed receipt with bank. Propagation delay — funds arrived after 26 hours.",
      resolvedAt:  daysAgo(1),
      resolvedBy:  adminId,
      createdAt:   daysAgo(5),
      updatedAt:   daysAgo(1),
    },
  });
}

// ─── Audit logs ───────────────────────────────────────────────────────────────

async function seedAuditLogs(adminId: string, aliceId: string) {
  console.log("  Seeding audit logs…");

  const logs = [
    { userId: adminId, action: "CONVERSION_APPROVED", entity: "ConversionRequest", daysBack: 1  },
    { userId: adminId, action: "CONVERSION_APPROVED", entity: "ConversionRequest", daysBack: 3  },
    { userId: adminId, action: "WITHDRAWAL_PROCESSED",entity: "Withdrawal",        daysBack: 5  },
    { userId: adminId, action: "USER_FROZEN",          entity: "User",             daysBack: 7  },
    { userId: adminId, action: "KYC_APPROVED",         entity: "KYCRecord",        daysBack: 10 },
    { userId: aliceId, action: "PROFILE_UPDATED",      entity: "Profile",          daysBack: 2  },
    { userId: aliceId, action: "PIN_CHANGED",           entity: "User",             daysBack: 8  },
  ];

  for (const l of logs) {
    await prisma.auditLog.create({
      data: {
        userId:    l.userId,
        action:    l.action,
        entity:    l.entity,
        entityId:  `seed_${Math.random().toString(36).slice(2, 10)}`,
        createdAt: daysAgo(l.daysBack),
      },
    });
  }
}

// ─── KYC records ─────────────────────────────────────────────────────────────

async function seedKYC(alice: { id: string }, bob: { id: string }) {
  console.log("  Seeding KYC records…");

  await prisma.kYCRecord.upsert({
    where:  { userId: alice.id },
    create: {
      userId:     alice.id,
      level:      "LEVEL_1",
      status:     "APPROVED",
      bvn:        "12345678901",
      verifiedAt: daysAgo(20),
    },
    update: {},
  });

  await prisma.kYCRecord.upsert({
    where:  { userId: bob.id },
    create: {
      userId:  bob.id,
      level:   "LEVEL_1",
      status:  "PENDING",
      nin:     "98765432101",
    },
    update: {},
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding AirtimeVault database…\n");

  const { admin, alice, bob, chidi } = await seedUsers();
  await seedRates(admin.id);

  const { aliceBank, bobBank } = await seedBankAccounts(alice, bob);
  await seedConversions(alice, bob, chidi, admin.id);
  await seedWithdrawals(alice, bob, aliceBank.id, bobBank.id);

  const aliceWithWallet = await prisma.user.findUnique({
    where:   { id: alice.id },
    include: { wallet: true },
  });
  await seedLedger(aliceWithWallet!);
  await seedBillPayments(alice, bob);
  await seedP2P(alice, bob, chidi);
  await seedNotifications(alice, bob);
  await seedFraudAndDisputes(alice, bob, admin.id);
  await seedAuditLogs(admin.id, alice.id);
  await seedKYC(alice, bob);

  console.log("\n✅ Seed complete!\n");
  console.log("Test accounts (password: Password123!, PIN: 1234):");
  console.log("  Super Admin  → admin@airtimevault.com");
  console.log("  Gold user    → alice@example.com");
  console.log("  Silver user  → bob@example.com");
  console.log("  Basic user   → chidi@example.com");
  console.log("  Frozen user  → frozen@example.com");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
