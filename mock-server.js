// mock-server.js
//
// DEPRECATED — nothing runs this any more.
//
// The app now talks to Supabase (see lib/supabase.ts and lib/api.ts), which
// is the same backend the admin dashboard uses. This file and db.json are
// left here only so the old demo data is still readable; you can delete both.
//
// Note the shape of the API below if you are comparing: POST /api/<resource>
// replaced an entire collection, which is why the phone and the dashboard
// could never safely share data through it.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// Helper to make a POST request (for Expo push notification API)
const postRequest = (url, body) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', err => reject(err));
      req.write(JSON.stringify(body));
      req.end();
    } catch (e) {
      reject(e);
    }
  });
};

// Send Expo Push Notification to all registered Admin tokens
const sendPushToAdmins = async (db, report) => {
  const tokens = db.pushTokens || [];
  const adminTokens = tokens.filter(t => t.role === 'admin').map(t => t.token);

  if (adminTokens.length === 0) {
    console.log('[Push Notifications] No admin push tokens registered.');
    return;
  }

  console.log(`[Push Notifications] Sending alert to ${adminTokens.length} admin(s) for report #${report.referenceId || report.id}`);

  for (const token of adminTokens) {
    const message = {
      to: token,
      sound: 'default',
      title: 'New Maintenance Issue Reported',
      body: `${report.submittedBy || 'A student'} reported: "${report.selectedIssue || report.issue}" at ${report.location}`,
      data: { reportId: report.id },
    };

    try {
      const res = await postRequest('https://exp.host/--/api/v2/push/send', message);
      console.log(`[Push Notifications] Sent to ${token}, status: ${res.status}`);
    } catch (e) {
      console.log(`[Push Notifications] Failed to send to ${token}:`, e.message);
    }
  }
};

// Helper to write JSON response
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
};

// Helper to read request body
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve(null);
      }
    });
    req.on('error', err => reject(err));
  });
};

// Default seed data
const getInitialData = () => {
  return {
    reports: [
      {
        id: '1',
        submittedBy: 'John Mensah',
        studentName: 'John Mensah',
        studentEmail: 'john@st.knust.edu.gh',
        serviceType: 'Electrical',
        category: 'Electrical',
        selectedIssue: 'Bulb not lighting up',
        issue: 'Bulb not lighting up',
        hall: 'Unity Hall',
        hallName: 'Unity Hall',
        hallId: '1',
        location: 'Unity Hall, Floor 2, Room 205',
        status: 'pending',
        priority: 'high',
        timestamp: '2024-06-20T10:30:00Z',
        writtenDetails: 'The fluorescent tube in my room has been flickering for 2 days and now completely dead.',
        description: 'The fluorescent tube in my room has been flickering for 2 days and now completely dead.',
        imageUri: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&q=80',
        photos: ['https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&q=80'],
        assignedTo: null,
        assignedName: null,
        assignedSpecialty: null,
        technicianNotes: '',
        repairDate: null
      },
      {
        id: '2',
        submittedBy: 'Ama Serwaa',
        studentName: 'Ama Serwaa',
        studentEmail: 'ama@st.knust.edu.gh',
        serviceType: 'Plumbing',
        category: 'Plumbing',
        selectedIssue: 'Leaking tap',
        issue: 'Leaking tap',
        hall: 'Independence Hall',
        hallName: 'Independence Hall',
        hallId: '2',
        location: 'Independence Hall, Floor 1, Room 104',
        status: 'pending',
        priority: 'medium',
        timestamp: '2024-06-19T14:20:00Z',
        writtenDetails: 'The bathroom tap is leaking constantly and wasting water.',
        description: 'The bathroom tap is leaking constantly and wasting water.',
        imageUri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        assignedTo: null,
        assignedName: null,
        assignedSpecialty: null,
        technicianNotes: '',
        repairDate: null
      }
    ],
    chats: {},
    news: [
      {
        id: 'n1',
        hallId: '1',
        title: 'Water Supply Maintenance',
        content: 'Please note that the main water valve will be shut down for maintenance on Sunday from 8:00 AM to 12:00 PM. Kindly store enough water.',
        date: '2026-06-25T08:00:00Z',
        author: 'Unity Admin'
      },
      {
        id: 'n2',
        hallId: '2',
        title: 'New WiFi Routers Installed',
        content: 'We have upgraded the WiFi infrastructure in Block B. High-speed connectivity is now available. Let us know if you face issues.',
        date: '2026-06-24T10:00:00Z',
        author: 'Indece Admin'
      }
    ],
    admins: [
      {
        id: '7',
        email: 'admin@snapfix.com',
        password: 'admin123',
        name: 'Super Admin',
        role: 'super_admin',
        hallId: null,
        hallName: 'All Halls'
      }
    ],
    staff: [],
    students: [
      { id: '1', name: 'John Mensah', email: 'john@st.knust.edu.gh', hallId: '1', hallName: 'Unity Hall', reports: 5 },
      { id: '2', name: 'Ama Serwaa', email: 'ama@st.knust.edu.gh', hallId: '2', hallName: 'Independence Hall', reports: 3 },
      { id: '3', name: 'Kwame Asante', email: 'kwame@st.knust.edu.gh', hallId: '3', hallName: 'Republic Hall', reports: 7 },
      { id: '4', name: 'Esi Ampofo', email: 'esi@st.knust.edu.gh', hallId: '4', hallName: 'Africa Hall', reports: 2 },
      { id: '5', name: 'Kofi Annan', email: 'kofi@st.knust.edu.gh', hallId: '1', hallName: 'Unity Hall', reports: 4 },
      { id: '6', name: 'Akua Manu', email: 'akua@st.knust.edu.gh', hallId: '5', hallName: 'University Hall', reports: 6 },
      { id: '7', name: 'Yaw Boakye', email: 'yaw@st.knust.edu.gh', hallId: '6', hallName: 'Queen Elizabeth II Hall', reports: 3 },
    ],
    halls: [
      { id: '1', name: 'Unity Hall', code: 'unity', floors: 5, rooms: 50 },
      { id: '2', name: 'Independence Hall', code: 'independence', floors: 4, rooms: 40 },
      { id: '3', name: 'Republic Hall', code: 'republic', floors: 6, rooms: 60 },
      { id: '4', name: 'Africa Hall', code: 'africa', floors: 3, rooms: 30 },
      { id: '5', name: 'University Hall', code: 'university', floors: 4, rooms: 45 },
      { id: '6', name: 'Queen Elizabeth II Hall', code: 'queens', floors: 5, rooms: 55 }
    ]
  };
};

// Initialize DB file
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(getInitialData(), null, 2));
}

// Read DB from disk
const readDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return getInitialData();
  }
};

// Write DB to disk
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathParts = url.pathname.split('/').filter(Boolean); // e.g. ["api", "reports"]

  if (pathParts[0] !== 'api') {
    sendJSON(res, 404, { error: 'Not Found' });
    return;
  }

  const db = readDB();
  const resource = pathParts[1];

  // GET /api/ping
  if (resource === 'ping' && req.method === 'GET') {
    sendJSON(res, 200, { status: 'ok' });
    return;
  }

  // GET or POST on collections
  // e.g. /api/reports, /api/news, /api/admins, /api/staff, /api/students, /api/halls
  if (['reports', 'news', 'admins', 'staff', 'students', 'halls'].includes(resource)) {
    if (req.method === 'GET') {
      sendJSON(res, 200, db[resource] || []);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      if (body) {
        // Send push notification to admin if a new report is added
        if (resource === 'reports' && Array.isArray(body)) {
          const oldReports = db.reports || [];
          if (body.length > oldReports.length) {
            const addedReports = body.filter(nr => !oldReports.some(or => or.id === nr.id));
            for (const report of addedReports) {
              sendPushToAdmins(db, report);
            }
          }
        }

        db[resource] = body;
        writeDB(db);
        sendJSON(res, 200, { success: true, count: db[resource].length });
      } else {
        sendJSON(res, 400, { error: 'Invalid JSON body' });
      }
      return;
    }
  }

  // POST /api/register-push-token
  if (resource === 'register-push-token' && req.method === 'POST') {
    const body = await getRequestBody(req);
    if (body && body.token) {
      db.pushTokens = db.pushTokens || [];
      // Remove duplicate token registrations
      db.pushTokens = db.pushTokens.filter(t => t.token !== body.token);
      db.pushTokens.push({
        token: body.token,
        email: body.email || '',
        role: body.role || 'student',
        timestamp: new Date().toISOString()
      });
      writeDB(db);
      sendJSON(res, 200, { success: true });
    } else {
      sendJSON(res, 400, { error: 'Invalid body, token required' });
    }
    return;
  }

  // Chats endpoints:
  // GET /api/chats/:id
  // POST /api/chats/:id
  if (resource === 'chats' && pathParts[2]) {
    const chatId = pathParts[2];

    if (req.method === 'GET') {
      const chat = db.chats[chatId] || { messages: [] };
      sendJSON(res, 200, chat);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      if (body) {
        db.chats[chatId] = body;
        writeDB(db);
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 400, { error: 'Invalid JSON body' });
      }
      return;
    }
  }

  sendJSON(res, 404, { error: 'Endpoint Not Found' });
});

server.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});
