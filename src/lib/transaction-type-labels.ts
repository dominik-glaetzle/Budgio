import { TransactionType } from "@/types/models";

export const transactionTypeLabelKeys: Record<TransactionType, string> = {
  INCOMING: "transactionType.incoming",
  OUTGOING: "transactionType.outgoing",
  SELF_TRANSFER: "transactionType.selfTransfer",
};
