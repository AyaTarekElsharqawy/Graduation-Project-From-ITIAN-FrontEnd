import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3"

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { current_user_id } = await req.json()

    if (!current_user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json','Access-Control-Allow-Origin': '*', } }
      )
    }

    const userId = parseInt(current_user_id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID format');
    }

    // جلب آخر الرسائل
    const { data: messagesData, error } = await supabase.rpc('get_latest_messages_per_contact', {
      user_id_input: userId
    })

    if (error) throw error

    // إثراء البيانات بمعلومات المستخدمين
    const enrichedData = await Promise.all(messagesData.map(async (msg) => {
      const contactId = msg.from_id === userId ? msg.to_id : msg.from_id;
      
      // جلب معلومات المستخدم
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', contactId)
        .single();

      // جلب معلومات ITI Profile
      const { data: itiData } = await supabase
        .from('itian_profiles')
        .select('first_name, last_name, profile_picture')
        .eq('user_id', contactId)
        .single();

      // جلب معلومات Employer Profile
      const { data: empData } = await supabase
        .from('employer_profiles')
        .select('company_name, company_logo')
        .eq('user_id', contactId)
        .single();

      // تحديد الاسم والصورة
      let contact_name = `User ${contactId}`;
      let contact_avatar = null;

      if (itiData) {
        contact_name = `${itiData.first_name || ''} ${itiData.last_name || ''}`.trim();
        contact_avatar = itiData.profile_picture;
      } else if (empData) {
        contact_name = empData.company_name || contact_name;
        contact_avatar = empData.company_logo;
      } else if (userData) {
        contact_name = userData.name || userData.email || contact_name;
      }

      return {
        ...msg,
        contact_name,
        contact_avatar
      };
    }));

    return new Response(JSON.stringify(enrichedData), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.details || 'No additional details'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})