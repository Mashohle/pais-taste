// setup-business.js - Run this with: node setup-business.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBusiness() {
  try {
    console.log('🚀 Setting up test business...');

    // First, let's get your user ID
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'mashohle1810@gmail.com');

    if (usersError || !users.length) {
      console.error('❌ Could not find user profile:', usersError);
      return;
    }

    const userProfile = users[0];
    console.log('✅ Found user profile:', userProfile.email);

    // Get business categories
    const { data: categories, error: catError } = await supabase
      .from('business_categories')
      .select('*')
      .limit(1);

    if (catError || !categories.length) {
      console.error('❌ Could not find business categories:', catError);
      return;
    }

    const category = categories[0];
    console.log('✅ Found business category:', category.name);

    // Create a test business
    const businessData = {
      name: "Pai's Taste Test Restaurant",
      slug: "pais-taste-test",
      description: "Test restaurant for menu management",
      category_id: category.id,
      email: "test@paistaste.com",
      phone: "+27123456789",
      address_line1: "123 Test Street",
      city: "Test City",
      state: "Test Province",
      postal_code: "1234",
      country: "ZA",
      currency: "ZAR",
      timezone: "Africa/Johannesburg",
      primary_color: "#8B4513",
      accent_color: "#CD853F",
      is_active: true,
      is_verified: true,
      setup_completed: true,
      settings: {}
    };

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single();

    if (businessError) {
      console.error('❌ Could not create business:', businessError);
      return;
    }

    console.log('✅ Created business:', business.name, 'with ID:', business.id);

    // Associate user with business
    const businessUserData = {
      business_id: business.id,
      user_id: userProfile.id,
      role: 'owner',
      permissions: {},
      is_active: true
    };

    const { data: businessUser, error: businessUserError } = await supabase
      .from('business_users')
      .insert([businessUserData])
      .select()
      .single();

    if (businessUserError) {
      console.error('❌ Could not associate user with business:', businessUserError);
      return;
    }

    console.log('✅ Associated user with business as:', businessUser.role);
    console.log('🎉 Setup complete! You can now access /admin/menu');

  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

setupBusiness();