import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation constants
const MAX_TEXT_LENGTH = 100;
const MAX_LONG_TEXT_LENGTH = 200;
const MAX_EMAIL_LENGTH = 255;
const MAX_CODE_LENGTH = 20;

// Room validation schema
const roomSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(MAX_TEXT_LENGTH),
  type: z.enum(["lecture", "lab", "seminar", "auditorium"]),
  capacity: z.coerce.number().min(1).max(1000),
  building: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  floor: z.coerce.number().min(0).max(50),
  hasProjector: z.boolean(),
  hasSmartBoard: z.boolean(),
  hasAC: z.boolean(),
  status: z.enum(["available", "occupied", "maintenance"]),
});

// Faculty validation schema
const facultySchema = z.object({
  name: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  email: z.string().trim().email().max(MAX_EMAIL_LENGTH),
  department: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  subjects: z.array(z.string().trim().min(1).max(MAX_TEXT_LENGTH)),
  maxLoad: z.coerce.number().min(1).max(40),
  currentLoad: z.coerce.number().min(0).max(40),
  status: z.enum(["available", "on-leave", "busy"]),
});

// Staff validation schema
const staffSchema = z.object({
  name: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  email: z.string().trim().email().max(MAX_EMAIL_LENGTH).optional().or(z.literal("")),
  department: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  role: z.enum(["lab-assistant", "technician", "admin"]),
  shift: z.enum(["morning", "afternoon", "full-day"]),
  status: z.enum(["available", "assigned", "on-leave"]),
});

// Course validation schema
const courseSchema = z.object({
  code: z.string().trim().min(1).max(MAX_CODE_LENGTH).regex(/^[A-Za-z0-9-]+$/),
  name: z.string().trim().min(1).max(MAX_LONG_TEXT_LENGTH),
  department: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  weeklyHours: z.coerce.number().min(1).max(20),
  creditHours: z.coerce.number().min(1).max(10),
  requiresLab: z.boolean(),
  requiresProjector: z.boolean(),
});

// Batch validation schema
const currentYear = new Date().getFullYear();
const batchSchema = z.object({
  name: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  stream: z.string().trim().min(1).max(MAX_TEXT_LENGTH),
  discipline: z.string().trim().optional().default('B.Tech'),
  branch: z.string().trim().optional().default(''),
  sub_branch: z.string().trim().optional().nullable(),
  section: z.string().trim().optional().default('A'),
  semester: z.coerce.number().min(1).max(8),
  size: z.coerce.number().min(1).max(500),
  year: z.coerce.number().min(2000).max(currentYear + 5),
  class_start_time: z.string().optional().nullable(),
  class_end_time: z.string().optional().nullable(),
});

// Resource type to schema mapping
const schemas: Record<string, z.ZodSchema> = {
  rooms: roomSchema,
  faculty: facultySchema,
  staff: staffSchema,
  courses: courseSchema,
  batches: batchSchema,
};

// Transform frontend format to database format
const transformToDb = {
  rooms: (data: z.infer<typeof roomSchema>) => ({
    name: data.name,
    code: data.name.replace(/\s+/g, '-').toUpperCase(),
    type: data.type,
    capacity: data.capacity,
    building: data.building,
    floor: data.floor,
    has_projector: data.hasProjector,
    has_smart_board: data.hasSmartBoard,
    has_ac: data.hasAC,
    status: data.status,
  }),
  faculty: (data: z.infer<typeof facultySchema>) => ({
    name: data.name,
    email: data.email,
    department: data.department,
    subjects: data.subjects,
    max_load: data.maxLoad,
    current_load: data.currentLoad,
    status: data.status === 'on-leave' ? 'on_leave' : data.status,
  }),
  staff: (data: z.infer<typeof staffSchema>) => ({
    name: data.name,
    email: data.email || null,
    department: data.department,
    role: data.role === 'lab-assistant' ? 'lab_assistant' : data.role === 'admin' ? 'admin_staff' : data.role,
    shift: data.shift === 'full-day' ? 'full_day' : data.shift,
    status: data.status === 'on-leave' ? 'on_leave' : data.status,
  }),
  courses: (data: z.infer<typeof courseSchema>) => ({
    code: data.code.toUpperCase(),
    name: data.name,
    department: data.department,
    weekly_hours: data.weeklyHours,
    credit_hours: data.creditHours,
    requires_lab: data.requiresLab,
    requires_projector: data.requiresProjector,
  }),
  batches: (data: z.infer<typeof batchSchema>) => {
    // Generate a stable, collision-resistant code
    const slug = (value: string) =>
      value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');

    const code = [
      slug(data.discipline || 'B.TECH'),
      slug(data.branch || 'GENERAL'),
      slug(data.name),
      slug(data.section || 'A'),
      String(data.year),
      String(data.semester),
    ].join('-');

    return {
      name: data.name,
      code,
      stream: data.stream,
      discipline: data.discipline || 'B.Tech',
      branch: data.branch || '',
      sub_branch: data.sub_branch || null,
      section: data.section || 'A',
      semester: data.semester,
      size: data.size,
      year: data.year,
      class_start_time: data.class_start_time || null,
      class_end_time: data.class_end_time || null,
    };
  },
};

// Table name mapping
const tableNames: Record<string, string> = {
  rooms: 'rooms',
  faculty: 'faculty',
  staff: 'support_staff',
  courses: 'courses',
  batches: 'batches',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get authorization header for user context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth token for scoped reads
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Service client for privileged writes that must bypass RLS safely
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resource, action, data, id } = await req.json();
    
    console.log(`Processing ${action} for ${resource}:`, { userId: user.id, dataKeys: Object.keys(data || {}) });

    // Validate resource type
    if (!schemas[resource]) {
      console.error('Invalid resource type:', resource);
      return new Response(
        JSON.stringify({ error: `Invalid resource type: ${resource}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate action
    if (!['create', 'update'].includes(action)) {
      console.error('Invalid action:', action);
      return new Response(
        JSON.stringify({ error: `Invalid action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate data against schema
    const schema = schemas[resource];
    const validationResult = schema.safeParse(data);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      console.error('Validation failed:', errors);
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform to database format
    const transformer = transformToDb[resource as keyof typeof transformToDb];
    const dbData = transformer(validationResult.data);
    const tableName = tableNames[resource];

    console.log(`Transformed data for ${tableName}:`, dbData);

    let result;

    if (action === 'create') {
      if (resource === 'batches') {
        // Idempotent create for batches: avoids duplicate key failures on retries
        const { data: upsertedData, error: upsertError } = await supabase
          .from(tableName)
          .upsert(dbData, { onConflict: 'code' })
          .select()
          .single();

        if (upsertError) {
          console.error('Upsert error:', upsertError);
          return new Response(
            JSON.stringify({ error: upsertError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        result = upsertedData;

        // Ensure coordinators can immediately see batches they create in scoped views
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Role lookup error during batch auto-assignment:', rolesError);
        } else {
          const isCoordinator =
            (roles ?? []).some((r: { role: string }) => r.role === 'admin') &&
            !(roles ?? []).some((r: { role: string }) => r.role === 'super_admin');

          if (isCoordinator && result?.id) {
            const { data: existingAssignment, error: assignmentLookupError } = await serviceClient
              .from('coordinator_assignments')
              .select('id')
              .eq('user_id', user.id)
              .eq('batch_id', result.id)
              .maybeSingle();

            if (assignmentLookupError) {
              console.error('Assignment lookup error during batch auto-assignment:', assignmentLookupError);
            } else if (!existingAssignment) {
              const { error: assignmentInsertError } = await serviceClient
                .from('coordinator_assignments')
                .insert({ user_id: user.id, batch_id: result.id });

              if (assignmentInsertError && assignmentInsertError.code !== '23505') {
                console.error('Assignment insert error during batch auto-assignment:', assignmentInsertError);
              }
            }
          }
        }
      } else {
        const resourcesWithCodeConflictHandling = new Set(['courses', 'rooms']);

        if (resourcesWithCodeConflictHandling.has(resource)) {
          const { data: upsertedData, error: upsertError } = await supabase
            .from(tableName)
            .upsert(dbData, { onConflict: 'code' })
            .select()
            .single();

          if (upsertError) {
            console.error('Upsert error:', upsertError);
            return new Response(
              JSON.stringify({ error: upsertError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          result = upsertedData;
        } else {
          const { data: insertedData, error: insertError } = await supabase
            .from(tableName)
            .insert(dbData)
            .select()
            .single();

          if (insertError) {
            console.error('Insert error:', insertError);
            return new Response(
              JSON.stringify({ error: insertError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          result = insertedData;
        }
      }
    } else if (action === 'update') {
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'ID is required for update' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: updatedData, error: updateError } = await supabase
        .from(tableName)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = updatedData;
    }

    console.log(`${action} successful for ${resource}:`, result?.id);

    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in validate-and-insert function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
