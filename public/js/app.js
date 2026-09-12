// app.js - Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    const data = await loadData();
    
    // Check URL hash for routing
    const hash = window.location.hash;
    
    if (hash === '#/admin') {
        renderAdmin(data);
    } else {
        renderPortfolio(data);
    }

    // Handle hash changes (browser back/forward)
    window.addEventListener('hashchange', async () => {
        const newData = await loadData(); // Refresh data
        const newHash = window.location.hash;
        if (newHash === '#/admin') {
            renderAdmin(newData);
        } else {
            renderPortfolio(newData);
        }
    });
}

async function loadData() {
    try {
        // Fetch Basics
        const { data: basicsData, error: basicsError } = await supabaseClient
            .from('basics')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (basicsError && basicsError.code !== 'PGRST116') throw basicsError; // Ignore "not found"

        // Fetch Education
        const { data: educationData } = await supabaseClient
            .from('education')
            .select('*')
            .order('sort_order', { ascending: true });

        // Fetch Experience
        const { data: experienceData } = await supabaseClient
            .from('experience')
            .select('*')
            .order('sort_order', { ascending: true });

        // Fetch Projects
        const { data: projectsData } = await supabaseClient
            .from('projects')
            .select('*')
            .order('sort_order', { ascending: true });

        // Fetch Shelf Items
        const { data: booksData } = await supabaseClient.from('books').select('*').order('sort_order');
        const { data: podcastsData } = await supabaseClient.from('podcasts').select('*').order('sort_order');
        const { data: musicData } = await supabaseClient.from('music').select('*').order('sort_order');

        return {
            basics: basicsData || DEFAULT_DATA.basics,
            education: educationData || DEFAULT_DATA.education,
            experience: experienceData || DEFAULT_DATA.experience,
            projects: projectsData || DEFAULT_DATA.projects,
            shelf: {
                books: booksData || DEFAULT_DATA.shelf.books,
                podcasts: podcastsData || DEFAULT_DATA.shelf.podcasts,
                music: musicData || DEFAULT_DATA.shelf.music
            }
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return DEFAULT_DATA;
    }
}

function renderPortfolio(data) {
    const { basics, education, experience, projects, shelf } = data;

    // Hero Section
    document.getElementById('hero-name').textContent = basics.name || 'Arush Raj Agarwal';
    document.getElementById('hero-sub').textContent = basics.hero_sub || '';
    document.getElementById('contact-email').href = `mailto:${basics.email}`;
    document.getElementById('contact-email').textContent = basics.email;

    // Social Links
    const socialsContainer = document.getElementById('social-links');
    socialsContainer.innerHTML = '';
    if (basics.socials) {
        basics.socials.forEach(social => {
            const a = document.createElement('a');
            a.href = social.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = social.platform;
            socialsContainer.appendChild(a);
        });
    }

    // About Section
    document.getElementById('about-text').textContent = basics.about_text || '';
    
    const aboutDetailsContainer = document.getElementById('about-details');
    aboutDetailsContainer.innerHTML = '';
    if (basics.about_details) {
        basics.about_details.forEach(detail => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            div.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
            aboutDetailsContainer.appendChild(div);
        });
    }

    // Education Section
    const eduContainer = document.getElementById('education-list');
    eduContainer.innerHTML = '';
    if (education) {
        education.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            let tagsHtml = '';
            if (item.tags) {
                tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            }
            div.innerHTML = `
                <div class="timeline-year">${item.year}</div>
                <h3>${item.title}</h3>
                <div class="timeline-place">${item.place}</div>
                <p>${item.description}</p>
                <div class="tags">${tagsHtml}</div>
            `;
            eduContainer.appendChild(div);
        });
    }

    // Experience Section
    const expContainer = document.getElementById('experience-list');
    expContainer.innerHTML = '';
    if (experience) {
        experience.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <div class="timeline-year">${item.year}</div>
                <h3>${item.role}</h3>
                <div class="timeline-place">${item.company}</div>
                <p>${item.description}</p>
            `;
            expContainer.appendChild(div);
        });
    }

    // Projects Section
    const projContainer = document.getElementById('projects-grid');
    projContainer.innerHTML = '';
    if (projects) {
        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <img src="${proj.image}" alt="${proj.title}" loading="lazy">
                <div class="project-info">
                    <span class="project-tag">${proj.tag}</span>
                    <h3>${proj.title}</h3>
                    <p class="project-lede">${proj.lede}</p>
                    <div class="project-meta">
                        <span>${proj.year}</span> • <span>${proj.role}</span>
                    </div>
                </div>
            `;
            projContainer.appendChild(card);
        });
    }

    // Shelf Section (Currently Reading/Listening)
    const shelfContainer = document.getElementById('shelf-list');
    shelfContainer.innerHTML = '';
    
    const renderShelfItem = (item, type) => {
        const div = document.createElement('div');
        div.className = 'shelf-item';
        div.innerHTML = `
            <div class="shelf-icon">${type === 'book' ? '📚' : type === 'podcast' ? '🎧' : '🎵'}</div>
            <div class="shelf-content">
                <div class="shelf-name">${item.name}</div>
                <div class="shelf-meta">${item.meta}</div>
            </div>
        `;
        shelfContainer.appendChild(div);
    };

    if (shelf.books) shelf.books.forEach(b => renderShelfItem(b, 'book'));
    if (shelf.podcasts) shelf.podcasts.forEach(p => renderShelfItem(p, 'podcast'));
    if (shelf.music) shelf.music.forEach(m => renderShelfItem(m, 'music'));

    // Show Edit Button if not in admin
    const editBtn = document.getElementById('edit-btn');
    if (editBtn) {
        editBtn.style.display = 'block';
        editBtn.onclick = () => window.location.hash = '#/admin';
    }
}

function renderAdmin(data) {
    const container = document.getElementById('admin-panel');
    container.style.display = 'block';
    document.getElementById('portfolio-content').style.display = 'none';
    document.getElementById('edit-btn').style.display = 'none';

    // Simple Password Check
    const password = prompt("Enter Admin Password:");
    if (password !== 'arush-admin') {
        alert("Incorrect password");
        window.location.hash = '';
        return;
    }

    let html = `
        <div class="admin-header">
            <h2>Edit Portfolio Content</h2>
            <button id="close-admin" class="btn-secondary">Back to Site</button>
        </div>
        <form id="admin-form">
            
            <!-- Basics -->
            <section class="admin-section">
                <h3>Basics</h3>
                <label>Email: <input type="email" name="email" value="${data.basics.email || ''}"></label>
                <label>Hero Subtitle: <input type="text" name="hero_sub" value="${data.basics.hero_sub || ''}"></label>
                <label>About Text: <textarea name="about_text">${data.basics.about_text || ''}</textarea></label>
            </section>

            <!-- Education (Simplified for demo: JSON Text Area) -->
            <section class="admin-section">
                <h3>Education (JSON Format)</h3>
                <p class="hint">Edit as JSON array. Example: [{"year":"2020","title":"Degree"}]</p>
                <textarea name="education_json" rows="10">${JSON.stringify(data.education, null, 2)}</textarea>
            </section>

            <!-- Experience -->
            <section class="admin-section">
                <h3>Experience (JSON Format)</h3>
                <textarea name="experience_json" rows="10">${JSON.stringify(data.experience, null, 2)}</textarea>
            </section>

            <!-- Projects -->
            <section class="admin-section">
                <h3>Projects (JSON Format)</h3>
                <textarea name="projects_json" rows="15">${JSON.stringify(data.projects, null, 2)}</textarea>
            </section>

            <!-- Shelf -->
            <section class="admin-section">
                <h3>Shelf - Books (JSON)</h3>
                <textarea name="books_json" rows="5">${JSON.stringify(data.shelf.books, null, 2)}</textarea>
                
                <h3>Shelf - Podcasts (JSON)</h3>
                <textarea name="podcasts_json" rows="5">${JSON.stringify(data.shelf.podcasts, null, 2)}</textarea>
                
                <h3>Shelf - Music (JSON)</h3>
                <textarea name="music_json" rows="5">${JSON.stringify(data.shelf.music, null, 2)}</textarea>
            </section>

            <button type="submit" class="btn-primary">Save Changes to Supabase</button>
        </form>
    `;

    container.innerHTML = html;

    // Event Listeners for Admin
    document.getElementById('close-admin').addEventListener('click', () => {
        window.location.hash = '';
    });

    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const updatedData = {
            basics: {
                ...data.basics,
                email: formData.get('email'),
                hero_sub: formData.get('hero_sub'),
                about_text: formData.get('about_text')
            },
            education: JSON.parse(formData.get('education_json')),
            experience: JSON.parse(formData.get('experience_json')),
            projects: JSON.parse(formData.get('projects_json')),
            shelf: {
                books: JSON.parse(formData.get('books_json')),
                podcasts: JSON.parse(formData.get('podcasts_json')),
                music: JSON.parse(formData.get('music_json'))
            }
        };

        await saveData(updatedData);
    });
}

async function saveData(data) {
    const btn = document.querySelector('#admin-form button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        // Save Basics
        await supabaseClient.from('basics').upsert({ ...data.basics, id: 1 });

        // Helper to sync list items (delete missing, insert/update existing)
        const syncTable = async (table, items) => {
            // Clear existing (simple approach for now)
            await supabaseClient.from(table).delete().neq('id', 0); 
            // Insert new
            if (items && items.length > 0) {
                await supabaseClient.from(table).insert(items);
            }
        };

        await syncTable('education', data.education);
        await syncTable('experience', data.experience);
        await syncTable('projects', data.projects);
        await syncTable('books', data.shelf.books);
        await syncTable('podcasts', data.shelf.podcasts);
        await syncTable('music', data.shelf.music);

        alert('Saved successfully!');
        window.location.hash = ''; // Redirect back to site
    } catch (error) {
        console.error('Save error:', error);
        alert('Error saving: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}
