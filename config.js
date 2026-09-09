// config.js
// Kept as a re-export so the screens that already do
// `import supabase from '../../config'` keep working unchanged.
//
// This file used to contain a ~230 line hand-rolled fake of the Supabase
// client: it matched students by email with no password check, wrote signups
// into AsyncStorage, and POSTed whole collections to mock-server.js on port
// 3001. All of that is now real — see lib/supabase.ts and lib/api.ts.
export { supabase, default } from './lib/supabase';
