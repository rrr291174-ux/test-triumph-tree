import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useApproval() {
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsApproved(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      // Admins are always approved
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsApproved(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("approved_users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsApproved(!!data);
      setLoading(false);
    };

    check();
  }, [user]);

  return { isApproved, loading };
}
