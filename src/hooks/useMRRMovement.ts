import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMRRMovement() {
  return useQuery({
    queryKey: ["mrr-movement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_mrr_movement")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      return {
        newMrr: Number(data?.new_mrr ?? 0),
        expansionMrr: Number(data?.expansion_mrr ?? 0),
        contractionMrr: Number(data?.contraction_mrr ?? 0),
        churnedMrr: Number(data?.churned_mrr ?? 0),
      };
    },
  });
}
