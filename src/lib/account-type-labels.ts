import { Account } from "@/types/models";

export const accountTypeLabelKeys: Record<Account["account_type"], string> = {
  CHECKING: "accountType.checking",
  SAVINGS: "accountType.savings",
};
