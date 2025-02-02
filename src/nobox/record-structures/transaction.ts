import { Space } from "nobox-client";
import { createRowSchema } from "../config";

export enum TransactionType {
  RIDE_PAYMENT = "RIDE_PAYMENT",
  WALLET_FUNDING = "WALLET_FUNDING",
  WITHDRAWAL = "WITHDRAWAL",
  REFUND = "REFUND",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface Transaction {
  userId: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  reference: string;
  authorizationCode?: string;
  rideId?: string;
}

export const TransactionStructure: Space<Transaction> = {
  space: "Transaction",
  description: "A Record Space for User Transactions",
  structure: {
    userId: {
      description: "ID of the User making the transaction",
      required: true,
      type: String,
    },
    amount: {
      description: "Transaction amount (in lowest currency unit, e.g., kobo)",
      required: true,
      type: Number,
    },
    currency: {
      description: "Transaction currency (e.g., NGN, USD)",
      required: true,
      type: String,
    },
    type: {
      description: "Type of transaction (e.g., RIDE_PAYMENT, WALLET_FUNDING)",
      required: true,
      type: String,
    },
    status: {
      description: "Transaction status (PENDING, SUCCESS, FAILED)",
      required: true,
      type: String,
    },
    reference: {
      description: "Unique reference for this transaction",
      required: true,
      type: String,
    },
    authorizationCode: {
      description: "Authorization code for saved cards (if applicable)",
      required: false,
      type: String,
    },
    rideId: {
      description: "ID of the related ride (if applicable)",
      required: false,
      type: String,
    },
  },
};

export const TransactionModel = createRowSchema<Transaction>(TransactionStructure);
