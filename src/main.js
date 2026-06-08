// System Date: 2026-06-08 | Active Systems: Online | Blind Level: Default
const SUPABASE_URL = 'https://cvhobyqvamlunzluzdei.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aG9ieXF2YW1sdW56bHV6ZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MDUyOTQsImV4cCI6MjA5NjI4MTI5NH0.5xtECHd--L3Uzy9P6ZJ7WHERU3LhdcF11DOsGAFd9Sc';

const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

async function fetchArticles(orderQuery = 'created_at.desc') {
    const container = document.getElementById('articlesContainer');
    
    try {
        const [column, direction] = orderQuery.split('.');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/article?select=*&order=${column}.${direction}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) throw new Error('Błąd pobierania');
        
        const articles = await response.json();
        container.innerHTML = '';

        if (articles.length === 0) {
            container.innerHTML = '<p class="text-center text-slate-500">Brak artykułów w bazie.</p>';
            return;
        }

        articles.forEach(article => {
            const formattedDate = dayjs(article.created_at).format('DD-MM-YYYY');
            
            // NOWE: Generowanie kolorowych tagów (jeśli istnieją)
            let tagsHtml = '';
            if (article.tags && article.tags.length > 0) {
                tagsHtml = article.tags.map(tag => 
                    `<span class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-2 mb-2">#${tag}</span>`
                ).join('');
            }

            // NOWE: Znaczek publikacji
            const publishBadge = article.is_published 
                ? `<span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">Opublikowany</span>`
                : `<span class="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">Szkic</span>`;

            const articleCard = document.createElement('article');
            articleCard.className = 'bg-white p-6 rounded-xl shadow-sm border border-slate-200';
            
            articleCard.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900">${article.title}</h2>
                        <h3 class="text-lg text-slate-600 font-medium">${article.subtitle}</h3>
                    </div>
                    <div>${publishBadge}</div>
                </div>
                <div class="mb-4">${tagsHtml}</div>
                <div class="text-slate-700 leading-relaxed mb-6">
                    ${article.content}
                </div>
                <div class="flex justify-between items-center text-sm text-slate-500 border-t border-slate-100 pt-4">
                    <span class="font-medium text-blue-600">Autor: ${article.author}</span>
                    <span>Utworzono: ${formattedDate}</span>
                </div>
            `;
            container.appendChild(articleCard);
        });

    } catch (error) {
        console.error('Błąd:', error);
        container.innerHTML = '<p class="text-center text-red-500">Błąd połączenia z Supabase.</p>';
    }
}

document.getElementById('sortSelect').addEventListener('change', (e) => {
    fetchArticles(e.target.value);
});

document.getElementById('addArticleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // NOWE: Zamiana tekstu wpisanego w pole tagów na tablicę (rozdzielanie po przecinku)
    const rawTags = document.getElementById('tags').value;
    const tagsArray = rawTags ? rawTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    const newArticle = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        author: document.getElementById('author').value,
        content: document.getElementById('content').value,
        created_at: document.getElementById('createdAt').value,
        is_published: document.getElementById('isPublished').checked, // Pobiera TRUE/FALSE
        tags: tagsArray // Wysyła tablicę do Supabase
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/article`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(newArticle)
        });

        if (!response.ok) throw new Error('Błąd zapisu');

        document.getElementById('addArticleForm').reset();
        fetchArticles(document.getElementById('sortSelect').value);
        alert('Artykuł dodany z nowymi polami!');

    } catch (error) {
        console.error('Błąd:', error);
        alert('Błąd dodawania. Sprawdź czy zaktualizowałaś kolumny w Supabase.');
    }
});

fetchArticles('created_at.desc');