import { createClient } from "@/lib/supabase/server";

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
}

export interface UserCharity {
  id: string;
  charity_id: string;
  contribution_percentage: number;
  charities?: Charity;
}

export class CharityService {
  /**
   * Get all active charities
   */
  static async getCharities(): Promise<Charity[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Get the current user's charity selection
   */
  static async getUserCharity(): Promise<UserCharity | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("user_charities")
      .select("*, charities(*)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Set or update the user's charity selection
   */
  static async setUserCharity(charityId: string, percentage: number): Promise<UserCharity> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    if (percentage < 10 || percentage > 100) {
      throw new Error("Percentage must be between 10 and 100");
    }

    const { data, error } = await supabase
      .from("user_charities")
      .upsert({
        user_id: user.id,
        charity_id: charityId,
        contribution_percentage: percentage
      }, { onConflict: "user_id" })
      .select("*, charities(*)")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
