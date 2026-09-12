// config.js - Supabase Configuration

const SUPABASE_URL = 'https://mfybkukpbvxplltrnyoj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cU3-ciWABXgdJCsojGh3Ag_dkPO96qK';

// Create Supabase client from the loaded library
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Default data fallback
const DEFAULT_DATA = {
    basics: {
        name: 'Arush Raj Agarwal',
        email: 'arush@example.com',
        hero_sub: 'Building digital experiences with code & creativity.',
        about_text: 'I am a passionate developer focused on creating intuitive and scalable web applications.',
        about_details: [
            { label: 'Location', value: 'New Delhi, India' },
            { label: 'Experience', value: '3+ Years' }
        ],
        meta: {
            title: 'Arush Raj Agarwal | Portfolio',
            description: 'Portfolio of Arush Raj Agarwal'
        },
        socials: [
            { platform: 'GitHub', url: 'https://github.com' },
            { platform: 'LinkedIn', url: 'https://linkedin.com' },
            { platform: 'Twitter', url: 'https://twitter.com' }
        ]
    },
    education: [],
    experience: [],
    projects: [],
    shelf: {
        books: [],
        podcasts: [],
        music: []
    }
};
