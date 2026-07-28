import { createClient } from '@supabase/supabase-js';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let supabase;

// Helper to resolve the mock backend server URL dynamically
const getBackendApiUrl = () => {
  // Extract host IP dynamically from bundle script URL (so it works on physical phones over Wi-Fi)
  const scriptURL = NativeModules.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/^https?:\/\/([^:/]+)(:\d+)?\//);
  const host = match && match[1] ? match[1] : 'localhost';
  return `http://${host}:3001/api`;
};

// Initial default student records in db.json (matching mock-server.js initial data)
const DEFAULT_STUDENTS = [
  { id: '1', name: 'John Mensah', email: 'john@st.knust.edu.gh' },
  { id: '2', name: 'Ama Serwaa', email: 'ama@st.knust.edu.gh' },
  { id: '3', name: 'Kwame Asante', email: 'kwame@st.knust.edu.gh' },
  { id: '4', name: 'Esi Ampofo', email: 'esi@st.knust.edu.gh' },
  { id: '5', name: 'Kofi Annan', email: 'kofi@st.knust.edu.gh' },
  { id: '6', name: 'Akua Manu', email: 'akua@st.knust.edu.gh' },
  { id: '7', name: 'Yaw Boakye', email: 'yaw@st.knust.edu.gh' }
];

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl === '') {
  console.log('[Supabase Client] Environment variables missing; using local mock database auth client.');
  
  supabase = {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        console.log("[Mock Supabase] Attempting signInWithPassword:", email);
        const lowerEmail = email.trim().toLowerCase();

        let students = [...DEFAULT_STUDENTS];
        
        // 1. Try to fetch students from the mock backend API
        try {
          const res = await fetch(`${getBackendApiUrl()}/students`, {
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              students = data;
            }
          }
        } catch (e) {
          console.log('[Mock Supabase] Backend server unreachable, using local storage/fallback');
        }

        // 2. Also load locally signed up students from AsyncStorage
        try {
          const localData = await AsyncStorage.getItem('mock_registered_students');
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              students = [...students, ...parsed];
            }
          }
        } catch (e) {
          console.log('[Mock Supabase] Failed to read mock_registered_students from AsyncStorage');
        }

        // 3. Find the student
        const student = students.find(s => s.email.trim().toLowerCase() === lowerEmail);

        if (!student) {
          return {
            data: { user: null },
            error: { message: `Access denied. Email '${email}' is not a registered student account. Please sign up first.` }
          };
        }

        // Store the current user's email in AsyncStorage for getUser()
        await AsyncStorage.setItem('mock_current_user_email', lowerEmail);
        await AsyncStorage.setItem('mock_current_user_id', student.id);
        await AsyncStorage.setItem('userName', student.name);

        return { data: { user: { id: student.id, email: student.email } }, error: null };
      },

      signUp: async ({ email, password, options }) => {
        console.log("[Mock Supabase] Attempting signUp:", email);
        const lowerEmail = email.trim().toLowerCase();
        const fullName = options?.data?.full_name || 'Student User';

        let students = [...DEFAULT_STUDENTS];
        let backendSucceeded = false;

        // 1. Try to fetch existing students from the mock backend API
        try {
          const res = await fetch(`${getBackendApiUrl()}/students`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              students = data;
              backendSucceeded = true;
            }
          }
        } catch (e) {
          console.log('[Mock Supabase] Backend server unreachable during signup, saving locally.');
        }

        // 2. Load locally signed up students from AsyncStorage
        let localSignedUp = [];
        try {
          const localData = await AsyncStorage.getItem('mock_registered_students');
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              localSignedUp = parsed;
              students = [...students, ...localSignedUp];
            }
          }
        } catch (e) {}

        // 3. Check if email already exists
        const exists = students.some(s => s.email.trim().toLowerCase() === lowerEmail);
        if (exists) {
          return {
            data: { user: null },
            error: { message: "An account with this email address already exists." }
          };
        }

        // 4. Create new student object
        const newStudent = {
          id: String(Date.now()),
          name: fullName,
          email: email,
          hallId: "1",
          hallName: "Unity Hall",
          reports: 0
        };

        // 5. Update backend if available
        if (backendSucceeded) {
          try {
            await fetch(`${getBackendApiUrl()}/students`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify([...students, newStudent])
            });
          } catch (e) {
            console.log('[Mock Supabase] Failed to write signup to backend:', e);
          }
        }

        // 6. Save locally to AsyncStorage
        try {
          localSignedUp.push(newStudent);
          await AsyncStorage.setItem('mock_registered_students', JSON.stringify(localSignedUp));
        } catch (e) {
          console.log('[Mock Supabase] Failed to save signup to AsyncStorage:', e);
        }

        // Store the current user's email in AsyncStorage for getUser()
        await AsyncStorage.setItem('mock_current_user_email', lowerEmail);
        await AsyncStorage.setItem('mock_current_user_id', newStudent.id);
        await AsyncStorage.setItem('userName', fullName);

        return { data: { user: { id: newStudent.id, email: newStudent.email } }, error: null };
      },

      getUser: async () => {
        const email = await AsyncStorage.getItem('mock_current_user_email') || 'student@st.knust.edu.gh';
        const id = await AsyncStorage.getItem('mock_current_user_id') || 'mock-student-id';
        return { data: { user: { id, email } }, error: null };
      },

      signOut: async () => {
        await AsyncStorage.removeItem('mock_current_user_email');
        await AsyncStorage.removeItem('mock_current_user_id');
        return { error: null };
      },

      resetPasswordForEmail: async (email, options) => {
        console.log("[Mock Supabase] Attempting resetPasswordForEmail:", email);
        const lowerEmail = email.trim().toLowerCase();

        let students = [...DEFAULT_STUDENTS];

        // 1. Try to fetch students from the mock backend API
        try {
          const res = await fetch(`${getBackendApiUrl()}/students`, {
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              students = data;
            }
          }
        } catch (e) {
          console.log('[Mock Supabase] Backend server unreachable, using local storage/fallback');
        }

        // 2. Also load locally signed up students from AsyncStorage
        try {
          const localData = await AsyncStorage.getItem('mock_registered_students');
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              students = [...students, ...parsed];
            }
          }
        } catch (e) {
          console.log('[Mock Supabase] Failed to read mock_registered_students from AsyncStorage');
        }

        // 3. Find the student
        const student = students.find(s => s.email.trim().toLowerCase() === lowerEmail);

        if (!student) {
          return {
            data: null,
            error: { message: `Account with email '${email}' not found.` }
          };
        }

        return { data: {}, error: null };
      }
    },
    from: (table) => {
      const chain = {
        select: () => chain,
        eq: () => chain,
        single: async () => {
          return { data: null, error: null };
        },
        insert: async (data) => {
          console.log(`[Mock Supabase] Insert into ${table}:`, data);
          return { data, error: null };
        }
      };
      return chain;
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;