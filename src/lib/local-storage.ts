import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";
import { useEffect, useState } from "react";
import { Account, Transaction } from "@/types/models";

const ACCOUNTS_KEY = "local:accounts";
const TRANSACTIONS_KEY = "local:transactions";
const USER_NAME_KEY = "local:userName";
const CATEGORY_ICONS_KEY = "local:categoryIcons";
const PROFILE_PICTURE_KEY = "local:profilePicture";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readList<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

async function writeList<T>(key: string, list: T[]) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

// Minimal pub/sub: every screen reading local data refetches automatically
// whenever any screen writes to it, instead of re-fetching speculatively on
// every focus event.
let version = 0;
const listeners = new Set<() => void>();

function notifyChange() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function useStoreVersion() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const listener = () => setTick((tick) => tick + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return version;
}

export async function getAccounts() {
  return readList<Account>(ACCOUNTS_KEY);
}

export async function createAccount(
  account: Omit<Account, "id" | "created_at">,
) {
  const accounts = await readList<Account>(ACCOUNTS_KEY);
  const newAccount: Account = {
    ...account,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  await writeList(ACCOUNTS_KEY, [...accounts, newAccount]);
  notifyChange();
  return newAccount;
}

export async function deleteAccount(accountId: string) {
  const accounts = await readList<Account>(ACCOUNTS_KEY);
  await writeList(
    ACCOUNTS_KEY,
    accounts.filter((account) => account.id !== accountId),
  );

  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  await writeList(
    TRANSACTIONS_KEY,
    transactions.filter(
      (transaction) =>
        transaction.account_id !== accountId &&
        transaction.target_account_id !== accountId,
    ),
  );

  notifyChange();
}

export async function getTransactions(accountId: string) {
  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  return transactions
    .filter((transaction) => transaction.account_id === accountId)
    .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : -1));
}

export async function addTransaction(
  transaction: Omit<Transaction, "id" | "created_at">,
) {
  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  await writeList(TRANSACTIONS_KEY, [newTransaction, ...transactions]);
  notifyChange();
  return newTransaction;
}

export async function addTransfer(transfer: {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  category: string | null;
  institution: string | null;
  occurred_at: string;
}) {
  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  const createdAt = new Date().toISOString();
  const absoluteAmount = Math.abs(transfer.amount);

  const outgoing: Transaction = {
    id: generateId(),
    account_id: transfer.from_account_id,
    target_account_id: transfer.to_account_id,
    amount: -absoluteAmount,
    transaction_type: "SELF_TRANSFER",
    category: transfer.category,
    institution: transfer.institution,
    occurred_at: transfer.occurred_at,
    created_at: createdAt,
  };
  const incoming: Transaction = {
    id: generateId(),
    account_id: transfer.to_account_id,
    target_account_id: transfer.from_account_id,
    amount: absoluteAmount,
    transaction_type: "SELF_TRANSFER",
    category: transfer.category,
    institution: transfer.institution,
    occurred_at: transfer.occurred_at,
    created_at: createdAt,
  };

  await writeList(TRANSACTIONS_KEY, [outgoing, incoming, ...transactions]);
  notifyChange();
  return [outgoing, incoming];
}

export function useAccounts() {
  const version = useStoreVersion();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAccounts().then((data) => {
      setAccounts(data);
      setLoading(false);
    });
  }, [version]);

  return { accounts, loading };
}

export function useAccount() {
  const { accounts, loading } = useAccounts();
  return { account: accounts[0] ?? null, loading };
}

// account.balance holds the starting balance set at account creation; the
// current balance is derived from it plus every transaction booked since.
export function useAccountBalance(account: Account | null) {
  const { transactions } = useTransactions(account?.id ?? null);
  if (!account) {
    return 0;
  }
  const net = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  return account.balance + net;
}

export function useTransactions(accountId: string | null) {
  const version = useStoreVersion();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTransactions(accountId).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [accountId, version]);

  return { transactions, loading };
}

export async function getAllTransactions() {
  return readList<Transaction>(TRANSACTIONS_KEY);
}

// Unscoped by account — used for cross-account totals (net worth, this
// month's flow across every account) where per-account useTransactions
// would mean calling a hook once per account.
export function useAllTransactions() {
  const version = useStoreVersion();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [version]);

  return { transactions, loading };
}

export async function getTransactionById(id: string) {
  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  return transactions.find((transaction) => transaction.id === id) ?? null;
}

export async function updateTransaction(
  id: string,
  patch: Partial<Omit<Transaction, "id" | "account_id" | "created_at">>,
) {
  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  const updated = transactions.map((transaction) =>
    transaction.id === id ? { ...transaction, ...patch } : transaction,
  );
  await writeList(TRANSACTIONS_KEY, updated);
  notifyChange();
  return updated.find((transaction) => transaction.id === id) ?? null;
}

export async function deleteTransaction(id: string) {
  const transactions = await readList<Transaction>(TRANSACTIONS_KEY);
  await writeList(
    TRANSACTIONS_KEY,
    transactions.filter((transaction) => transaction.id !== id),
  );
  notifyChange();
}

export async function importTransactions(
  accountId: string,
  transactions: Array<Omit<Transaction, "id" | "account_id" | "created_at">>,
) {
  const existing = await readList<Transaction>(TRANSACTIONS_KEY);
  const now = new Date().toISOString();
  const imported: Transaction[] = transactions.map((transaction) => ({
    ...transaction,
    id: generateId(),
    account_id: accountId,
    created_at: now,
  }));
  await writeList(TRANSACTIONS_KEY, [...imported, ...existing]);
  notifyChange();
  return imported.length;
}

export function useTransaction(id: string | null) {
  const version = useStoreVersion();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setTransaction(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getTransactionById(id).then((data) => {
      setTransaction(data);
      setLoading(false);
    });
  }, [id, version]);

  return { transaction, loading };
}

export async function getUserName() {
  return AsyncStorage.getItem(USER_NAME_KEY);
}

export async function setUserName(name: string) {
  await AsyncStorage.setItem(USER_NAME_KEY, name);
  notifyChange();
}

export function useUserName() {
  const version = useStoreVersion();
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getUserName().then((value) => {
      setName(value);
      setLoading(false);
    });
  }, [version]);

  return { name, loading };
}

// The image picker hands back a URI in a cache directory that the OS may purge.
// We copy the picked file into the app's document directory (which survives) and
// persist that stable URI. A timestamped filename sidesteps any image caching on
// the old path when the picture is replaced.
export async function getProfilePicture() {
  return AsyncStorage.getItem(PROFILE_PICTURE_KEY);
}

function deleteProfilePictureFile(uri: string | null) {
  if (!uri) {
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // A missing or already-removed file is fine to ignore.
  }
}

export async function setProfilePicture(sourceUri: string | null) {
  const previous = await AsyncStorage.getItem(PROFILE_PICTURE_KEY);

  if (!sourceUri) {
    deleteProfilePictureFile(previous);
    await AsyncStorage.removeItem(PROFILE_PICTURE_KEY);
    notifyChange();
    return null;
  }

  const source = new File(sourceUri);
  const extension = source.extension || ".jpg";
  const destination = new File(Paths.document, `profile-${Date.now()}${extension}`);
  await source.copy(destination);

  if (previous && previous !== destination.uri) {
    deleteProfilePictureFile(previous);
  }

  await AsyncStorage.setItem(PROFILE_PICTURE_KEY, destination.uri);
  notifyChange();
  return destination.uri;
}

export function useProfilePicture() {
  const version = useStoreVersion();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProfilePicture().then((value) => {
      setUri(value);
      setLoading(false);
    });
  }, [version]);

  return { uri, loading };
}

export async function getCategoryIconOverrides() {
  const raw = await AsyncStorage.getItem(CATEGORY_ICONS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, string>) : {};
}

export async function setCategoryIcon(categoryKey: string, icon: string) {
  const overrides = await getCategoryIconOverrides();
  overrides[categoryKey] = icon;
  await AsyncStorage.setItem(CATEGORY_ICONS_KEY, JSON.stringify(overrides));
  notifyChange();
}

export function useCategoryIconOverrides() {
  const version = useStoreVersion();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCategoryIconOverrides().then((data) => {
      setOverrides(data);
      setLoading(false);
    });
  }, [version]);

  return { overrides, loading };
}

export const BACKUP_FORMAT_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  accounts: Account[];
  transactions: Transaction[];
  categoryIcons: Record<string, string>;
  userName: string | null;
  profilePicture: string | null;
}

export async function exportBackupData(): Promise<BackupData> {
  const [accounts, transactions, categoryIcons, userName, profilePicture] =
    await Promise.all([
      readList<Account>(ACCOUNTS_KEY),
      readList<Transaction>(TRANSACTIONS_KEY),
      getCategoryIconOverrides(),
      getUserName(),
      getProfilePicture(),
    ]);

  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    accounts,
    transactions,
    categoryIcons,
    userName,
    profilePicture,
  };
}

// Restoring a backup fully replaces local data rather than merging it, so
// callers should confirm with the user before calling this.
export async function importBackupData(data: BackupData) {
  await writeList(ACCOUNTS_KEY, data.accounts ?? []);
  await writeList(TRANSACTIONS_KEY, data.transactions ?? []);
  await AsyncStorage.setItem(
    CATEGORY_ICONS_KEY,
    JSON.stringify(data.categoryIcons ?? {}),
  );
  if (data.userName) {
    await AsyncStorage.setItem(USER_NAME_KEY, data.userName);
  }
  if (data.profilePicture) {
    await AsyncStorage.setItem(PROFILE_PICTURE_KEY, data.profilePicture);
  } else {
    await AsyncStorage.removeItem(PROFILE_PICTURE_KEY);
  }
  notifyChange();
}
