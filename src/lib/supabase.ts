import "react-native-url-polyfill/auto";
import { useCallback, useEffect, useState } from "react";
import { User, createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account, Transaction } from "@/types/models";

export const supabaseClient = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);

export async function signUpNewUser(
  email: string,
  password: string,
  displayName: string,
) {
  return supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "budgio://",
      data: { display_name: displayName },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabaseClient.auth.signInWithPassword({ email, password });
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function getDisplayName(user: User | null) {
  return (user?.user_metadata?.display_name as string | undefined) ?? null;
}

export function useAccounts() {
  const { user } = useCurrentUser();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getAccounts(user.id).then(({ data }) => {
      setAccounts(data ?? []);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { accounts, loading, refetch };
}

export function useAccount() {
  const { accounts, loading } = useAccounts();
  return { account: accounts[0] ?? null, loading };
}

export async function createAccount(
  account: Omit<Account, "id" | "created_at">,
) {
  const { data, error } = await supabaseClient
    .from("account")
    .insert(account)
    .select()
    .single();

  return { data: data as Account | null, error };
}

export async function addTransaction(
  transaction: Omit<Transaction, "id" | "created_at">,
) {
  const { data, error } = await supabaseClient
    .from("transactions")
    .insert(transaction)
    .select()
    .single();

  return { data: data as Transaction | null, error };
}

export async function getAccounts(userId: string) {
  const { data, error } = await supabaseClient
    .from("account")
    .select("*")
    .eq("user_id", userId);

  return { data: data as Account[] | null, error };
}

export async function getTransactions(accountId: string) {
  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("occurred_at", { ascending: false });

  return { data: data as Transaction[] | null, error };
}

export async function getSpendingByCategory(accountId: string) {
  const { data, error } = await supabaseClient
    .from("transactions")
    .select("category, amount")
    .eq("account_id", accountId)
    .eq("transaction_type", "OUTGOING")
    .not("category", "is", null);

  if (error || !data) {
    return { data: null, error };
  }

  const totals = new Map<string, number>();
  for (const row of data as Pick<Transaction, "category" | "amount">[]) {
    if (!row.category) {
      continue;
    }
    const current = totals.get(row.category) ?? 0;
    totals.set(row.category, current + Math.abs(row.amount));
  }

  const spending = Array.from(totals, ([category, total]) => ({
    category,
    total,
  })).sort((a, b) => b.total - a.total);

  return { data: spending, error: null };
}

export async function signOut() {
  return supabaseClient.auth.signOut();
}
