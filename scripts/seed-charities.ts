import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function seedCharities() {
  const charities = [
    {
      name: "The Golf Foundation",
      slug: "golf-foundation",
      description: "Changing the lives of young people by introducing them to golf.",
      featured: true,
      active: true,
    },
    {
      name: "Cancer Research UK",
      slug: "cancer-research-uk",
      description: "Pioneering research to bring forward the day when all cancers are cured.",
      featured: true,
      active: true,
    },
    {
      name: "WaterAid",
      slug: "wateraid",
      description: "Providing clean water, decent toilets and good hygiene to everyone, everywhere.",
      featured: false,
      active: true,
    }
  ];

  for (const charity of charities) {
    const { error } = await supabase
      .from("charities")
      .upsert(charity, { onConflict: "slug" });
      
    if (error) {
      console.error("Error inserting charity:", error);
    } else {
      console.log(`Successfully seeded charity: ${charity.name}`);
    }
  }
}

seedCharities();
