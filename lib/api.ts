// lib/api.ts
// Every database call the mobile app makes lives here.
//
// The database uses snake_case and normalised columns; the screens were
// written against the old camelCase mock shape (serviceType, selectedIssue,
// writtenDetails, submittedBy...). Rather than rewrite ~25 screens, the
// mappers below translate in both directions, so a report row looks exactly
// like it always did by the time a screen sees it.
import { File } from 'expo-file-system';
import supabase from './supabase';

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
export type ReportStatus = 'pending' | 'scheduled' | 'in-progress' | 'resolved';

export interface Hall {
  id: string;
  name: string;
  code: string;
  floors: number;
  rooms: number;
}

export interface Report {
  id: string;
  referenceId: string;
  // Both spellings of every field, because different screens read different ones.
  hall: string;
  hallName: string;
  hallId: string | null;
  location: string;
  serviceType: string;
  category: string;
  selectedIssue: string;
  issue: string;
  writtenDetails: string;
  description: string;
  photos: string[];
  video: string | null;
  status: ReportStatus;
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  submittedBy: string;
  studentName: string;
  studentEmail: string;
  assignedTo: string | null;
  assignedName: string | null;
  assignedSpecialty: string | null;
  technicianNotes: string;
  repairDate: string | null;
  resolvedAt: string | null;
  technician: { name: string; role: string } | null;
}

// ---------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------
const REPORT_COLUMNS =
  'id, reference_id, student_id, student_name, student_email, hall_id, hall_name, ' +
  'location, category, issue, description, status, priority, photos, video, ' +
  'assigned_to, assigned_name, assigned_specialty, technician_notes, repair_date, ' +
  'resolved_at, created_at, updated_at';

export const rowToReport = (row: any): Report => ({
  id: row.id,
  referenceId: row.reference_id,
  hall: row.hall_name ?? '',
  hallName: row.hall_name ?? '',
  hallId: row.hall_id ?? null,
  location: row.location ?? '',
  serviceType: row.category ?? '',
  category: row.category ?? '',
  selectedIssue: row.issue ?? '',
  issue: row.issue ?? '',
  writtenDetails: row.description ?? '',
  description: row.description ?? '',
  photos: Array.isArray(row.photos) ? row.photos : [],
  video: row.video ?? null,
  status: row.status ?? 'pending',
  priority: row.priority ?? 'medium',
  timestamp: row.created_at,
  submittedBy: row.student_name ?? '',
  studentName: row.student_name ?? '',
  studentEmail: row.student_email ?? '',
  assignedTo: row.assigned_to ?? null,
  assignedName: row.assigned_name ?? null,
  assignedSpecialty: row.assigned_specialty ?? null,
  technicianNotes: row.technician_notes ?? '',
  repairDate: row.repair_date ?? null,
  resolvedAt: row.resolved_at ?? null,
  // RequestDetailScreen renders a technician card from this.
  technician: row.assigned_name
    ? { name: row.assigned_name, role: row.assigned_specialty || 'Facilities Technician' }
    : null,
});

// The mobile app historically wrote 'in progress'; the database enum uses
// the hyphenated spelling the dashboard already used.
const normaliseStatus = (status?: string): ReportStatus => {
  const s = (status || 'pending').toLowerCase().replace(/\s+/g, '-');
  return (['pending', 'scheduled', 'in-progress', 'resolved'].includes(s) ? s : 'pending') as ReportStatus;
};

// ---------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  hallId: string | null;
  hallName: string | null;
  phone: string | null;
  floor: string | null;
  room: string | null;
  avatarUrl: string | null;
}

export const getMyProfile = async (): Promise<Profile | null> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;
  if (authError || !user) {
    if (authError) console.log('[api] getMyProfile auth check failed:', authError.message);
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, hall_id, phone, floor, room, avatar_url, halls(name)')
    .eq('id', user.id)
    .single();

  if (error || !data) {
    if (error) console.log('[api] getMyProfile failed:', error.message);
    // Fallback: If Supabase auth user exists but database profile record is missing/unreadable,
    // construct profile from auth metadata so reporting issues doesn't fail with "not signed in".
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: user.user_metadata?.full_name || user.email || 'Resident User',
      role: 'student',
      hallId: null,
      hallName: null,
      phone: null,
      floor: null,
      room: null,
      avatarUrl: null,
    };
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    hallId: data.hall_id,
    hallName: (data as any).halls?.name ?? null,
    phone: data.phone,
    // Floor lives on the profile row. It used to be omitted here, which meant
    // every screen had to fall back to the per-device AsyncStorage copy - and
    // a fresh install simply had no floor to show.
    floor: (data as any).floor ?? null,
    room: data.room,
    avatarUrl: data.avatar_url,
  };
};

export const updateMyProfile = async (changes: {
  fullName?: string;
  phone?: string;
  floor?: string;
  room?: string;
  hallId?: string | null;
  avatarUrl?: string | null;
}): Promise<{ error: string | null; code?: string }> => {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not signed in' };

  const patch: Record<string, any> = {};
  if (changes.fullName !== undefined) patch.full_name = changes.fullName;
  if (changes.phone !== undefined) patch.phone = changes.phone;
  if (changes.floor !== undefined) patch.floor = changes.floor;
  if (changes.room !== undefined) patch.room = changes.room;
  if (changes.hallId !== undefined) patch.hall_id = changes.hallId;
  if (changes.avatarUrl !== undefined) patch.avatar_url = changes.avatarUrl;

  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  // The error code matters as much as the message: 42501 is the database
  // refusing to change an address that is already registered, which is a very
  // different situation from being unable to reach the server at all.
  return { error: error ? error.message : null, code: error?.code };
};

// ---------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------
export interface OpenRoomReport {
  referenceId: string;
  issue: string;
  status: string;
  createdAt: string;
  reportedBy: string;
  isMine: boolean;
}

/**
 * Is this fault already reported for the caller's own room?
 *
 * Rooms are shared, so four residents can file the same broken light. RLS
 * hides a roommate's report from the app, so this goes through a database
 * function that checks the caller's registered room and returns only a
 * summary — reference, fault, status, date and the reporter's first name.
 *
 * The room comes from the caller's profile inside the function, so no student
 * can use this to look into another room.
 */
export const findOpenReportForMyRoom = async (
  category: string,
  issue?: string
): Promise<OpenRoomReport[]> => {
  const { data, error } = await supabase.rpc('find_open_report_for_my_room', {
    p_category: category,
    p_issue: issue ?? null,
  });

  if (error) {
    // Never block a submission because the check failed — a duplicate is a
    // nuisance, an unreportable fault is a real problem.
    console.log('[api] duplicate check failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    referenceId: row.reference_id,
    issue: row.issue ?? '',
    status: row.status ?? 'pending',
    createdAt: row.created_at,
    reportedBy: row.reported_by ?? '',
    isMine: row.is_mine === true,
  }));
};

// ---------------------------------------------------------------------
// Halls
// ---------------------------------------------------------------------
export const getHalls = async (): Promise<Hall[]> => {
  const { data, error } = await supabase.from('halls').select('*').order('name');
  if (error) {
    console.log('[api] getHalls failed:', error.message);
    return [];
  }
  return data as Hall[];
};

// ---------------------------------------------------------------------
// Media upload
//
// Report photos and videos used to be local file:// URIs, which meant the
// dashboard could never display them. They now go to the report-media
// bucket and the row stores the public URL.
// ---------------------------------------------------------------------
const guessContentType = (uri: string): string => {
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png':  return 'image/png';
    case 'webp': return 'image/webp';
    case 'heic': return 'image/heic';
    case 'mp4':  return 'video/mp4';
    case 'mov':  return 'video/quicktime';
    default:     return 'image/jpeg';
  }
};

export const uploadMedia = async (localUri: string, folder = 'reports'): Promise<string | null> => {
  // Anything already hosted (seed data, or a re-submitted report) passes through.
  if (!localUri || /^https?:\/\//i.test(localUri)) return localUri || null;

  const userId = await getCurrentUserId();
  if (!userId) return null;

  try {
    // Expo SDK 54's File API hands back an ArrayBuffer directly, which the
    // storage client accepts — no base64 round trip, so a 10 MB video does
    // not become a 13 MB string in memory first.
    const bytes = await new File(localUri).arrayBuffer();

    const contentType = guessContentType(localUri);
    const ext = localUri.split('?')[0].split('.').pop() || 'jpg';
    // The RLS policy on storage.objects requires the first path segment to
    // be the uploader's user id.
    const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('report-media')
      .upload(path, bytes, { contentType, upsert: false });

    if (error) {
      console.log('[api] uploadMedia failed:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('report-media').getPublicUrl(path);
    return data.publicUrl;
  } catch (e: any) {
    console.log('[api] uploadMedia threw:', e?.message ?? e);
    return null;
  }
};

// ---------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------
export const fetchMyReports = async (): Promise<Report[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_COLUMNS)
    .eq('student_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('[api] fetchMyReports failed:', error.message);
    return [];
  }
  return (data ?? []).map(rowToReport);
};

export const fetchReport = async (id: string): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_COLUMNS)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToReport(data);
};

export interface NewReportInput {
  serviceType: string;
  selectedIssue: string;
  writtenDetails?: string;
  location: string;
  hallName?: string;
  hallId?: string | null;
  priority?: 'low' | 'medium' | 'high';
  photos?: string[];
  video?: string | null;
}

/**
 * Files a report. Media is uploaded first so the row is only written once
 * every attachment has a durable URL — a half-uploaded report would show
 * broken images in the dashboard forever.
 */
export const createReport = async (
  input: NewReportInput
): Promise<{ report: Report | null; error: string | null }> => {
  const profile = await getMyProfile();
  if (!profile) return { report: null, error: 'You are not signed in.' };

  const photoUrls: string[] = [];
  for (const uri of input.photos ?? []) {
    const url = await uploadMedia(uri);
    if (url) photoUrls.push(url);
  }
  const videoUrl = input.video ? await uploadMedia(input.video) : null;

  const { data, error } = await supabase
    .from('reports')
    .insert({
      student_id: profile.id,
      student_name: profile.fullName || profile.email,
      student_email: profile.email,
      hall_id: input.hallId ?? profile.hallId,
      hall_name: input.hallName ?? profile.hallName ?? '',
      location: input.location,
      category: input.serviceType,
      issue: input.selectedIssue,
      description: input.writtenDetails ?? '',
      priority: input.priority ?? 'medium',
      photos: photoUrls,
      video: videoUrl,
    })
    .select(REPORT_COLUMNS)
    .single();

  if (error) {
    console.log('[api] createReport failed:', error.message);
    return { report: null, error: error.message };
  }

  return { report: rowToReport(data), error: null };
};

/** Live updates while a screen is mounted. Returns an unsubscribe function. */
export const subscribeToMyReports = (
  userId: string,
  onChange: (report: Report, event: 'INSERT' | 'UPDATE' | 'DELETE') => void
): (() => void) => {
  const channel = supabase
    .channel(`reports:student:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reports', filter: `student_id=eq.${userId}` },
      payload => {
        const row = (payload.new ?? payload.old) as any;
        if (row) onChange(rowToReport(row), payload.eventType as any);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ---------------------------------------------------------------------
// News
// ---------------------------------------------------------------------
export const fetchNews = async () => {
  const { data, error } = await supabase
    .from('news')
    .select('id, hall_id, title, content, author, image_url, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('[api] fetchNews failed:', error.message);
    return [];
  }

  return (data ?? []).map(n => ({
    id: n.id,
    hallId: n.hall_id,
    title: n.title,
    content: n.content,
    author: n.author,
    image: n.image_url,
    date: n.created_at,
  }));
};

// ---------------------------------------------------------------------
// Notifications — the in-app feed, written by a database trigger whenever
// a report changes status or gains an assignee.
// ---------------------------------------------------------------------
export const fetchNotifications = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.log('[api] fetchNotifications failed:', error.message);
    return [];
  }

  return (data ?? []).map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.body,
    description: n.body,
    category: n.category,
    icon: n.icon || '🔔',
    isRead: n.is_read,
    isNew: !n.is_read,
    createdAt: n.created_at,
    time: n.created_at,
    reportId: n.report_id,
  }));
};

export const markNotificationRead = async (id: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
};

export const markAllNotificationsRead = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
};

export const deleteNotification = async (id: string) => {
  await supabase.from('notifications').delete().eq('id', id);
};

export const subscribeToMyNotifications = (userId: string, onInsert: () => void) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      () => onInsert()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ---------------------------------------------------------------------
// Push tokens — replaces POST /api/register-push-token on the mock server.
// ---------------------------------------------------------------------
export const registerPushToken = async (token: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId || !token) return;

  const { error } = await supabase
    .from('push_tokens')
    .upsert({ token, user_id: userId, role: 'student' }, { onConflict: 'token' });

  if (error) console.log('[api] registerPushToken failed:', error.message);
};

// ---------------------------------------------------------------------
// Support chat
// ---------------------------------------------------------------------
export const getOrCreateConversation = async (reportId?: string | null): Promise<string | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  let query = supabase.from('conversations').select('id').eq('student_id', userId);
  query = reportId ? query.eq('report_id', reportId) : query.is('report_id', null);

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('conversations')
    .insert({ student_id: userId, report_id: reportId ?? null })
    .select('id')
    .single();

  if (error) {
    console.log('[api] getOrCreateConversation failed:', error.message);
    return null;
  }
  return data.id;
};

export const fetchMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, sender_name, sender_role, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at');

  if (error) {
    console.log('[api] fetchMessages failed:', error.message);
    return [];
  }
  return data ?? [];
};

export const sendMessage = async (conversationId: string, body: string) => {
  const profile = await getMyProfile();
  if (!profile) return { error: 'Not signed in' };

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    sender_name: profile.fullName || profile.email,
    sender_role: profile.role,
    body,
  });

  return { error: error ? error.message : null };
};

export const subscribeToMessages = (conversationId: string, onMessage: (m: any) => void) => {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      payload => onMessage(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ---------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------
export const fetchMyAppointments = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select('id, title, scheduled_for, status, report_id')
    .eq('student_id', userId)
    .order('scheduled_for');

  if (error) {
    console.log('[api] fetchMyAppointments failed:', error.message);
    return [];
  }

  return (data ?? []).map(a => ({
    id: a.id,
    title: a.title,
    date: a.scheduled_for,
    status: a.status,
    reportId: a.report_id,
  }));
};

export const createAppointment = async (input: {
  title: string;
  scheduledFor: string;
  reportId?: string | null;
}) => {
  const userId = await getCurrentUserId();
  if (!userId) return { error: 'Not signed in' };

  const { error } = await supabase.from('appointments').insert({
    student_id: userId,
    report_id: input.reportId ?? null,
    title: input.title,
    scheduled_for: input.scheduledFor,
  });

  return { error: error ? error.message : null };
};


// ---------------------------------------------------------------------------
// KNUST university news
//
// public.knust_news is a cache of the headlines on https://www.knust.edu.gh/news,
// refilled by the `knust-news-sync` edge function. Only the headline, excerpt,
// thumbnail and a link are stored - the article itself stays on KNUST's site,
// and the app opens it there.
// ---------------------------------------------------------------------------

export interface KnustArticle {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  category: string;
  publishedAt: string | null;
}

export const getKnustNews = async (limit = 50): Promise<KnustArticle[]> => {
  const { data, error } = await supabase
    .from('knust_news')
    .select('id, url, title, excerpt, image_url, category, published_at, position')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('position', { ascending: true })
    .limit(limit);

  if (error) {
    console.log('[api] getKnustNews failed:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    url: row.url,
    title: row.title ?? '',
    excerpt: row.excerpt ?? '',
    imageUrl: row.image_url ?? null,
    category: row.category ?? 'News',
    publishedAt: row.published_at ?? null,
  }));
};

/**
 * Asks the sync function to re-read knust.edu.gh. It rate-limits itself
 * server-side, so calling this on every pull-to-refresh is safe; a call inside
 * the cooldown returns immediately without touching the university's site.
 * Failure is not surfaced - the cached articles are still worth showing.
 */
export const refreshKnustNews = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('knust-news-sync', { body: {} });
    if (error) {
      console.log('[api] knust-news-sync failed:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.log('[api] knust-news-sync threw:', err?.message ?? err);
    return false;
  }
};
