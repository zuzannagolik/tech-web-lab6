import './style.css'
import dayjs from 'dayjs';

const SUPABASE_URL = 'https://cvhobyqvamlunzluzdei.supabase.co/rest/v1/';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aG9ieXF2YW1sdW56bHV6ZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MDUyOTQsImV4cCI6MjA5NjI4MTI5NH0.5xtECHd--L3Uzy9P6ZJ7WHERU3LhdcF11DOsGAFd9Sc';


const API_URL = `${SUPABASE_URL}article`;

async function fetchArticles(){
    try {
        const sortSelect = document.getElementById("sort-articles");
        const sortValue = sortSelect ? sortSelect.value : "created_at.asc";
        
   
        const sortedApiUrl = `${API_URL}?order=${sortValue}`;

        const response = await fetch(sortedApiUrl, {
            method: 'GET',
            headers: {
                'apiKey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}` 
            }
        });
        
        if (!response.ok) {
            throw new Error(`Błąd: ${response.status}`);
        }
        
        const data = await response.json();
        displayArticles(data); 
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

function displayArticles(articles) {
    const listContainer = document.getElementById("list-of-articles");
    const template = document.getElementById("article-template");
    
    if (!listContainer || !template) return;
    listContainer.innerHTML= ""; 

    articles.forEach(article => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector(".tail-title").textContent = article.title;
        clone.querySelector(".tail-subtitle").textContent = article.subtitle || '';
        clone.querySelector(".tail-author").textContent = article.author;
        clone.querySelector(".tail-date").textContent = dayjs(article.created_at).format('DD-MM-YYYY');
        clone.querySelector(".tail-content").textContent = article.content;
        
        listContainer.appendChild(clone);
    });
}

document.getElementById("add-article").addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const dateInput = document.getElementById("created_at").value;

    const newArticle = {
        title: document.getElementById("title").value,
        subtitle: document.getElementById("subtitle").value,
        author: document.getElementById("author").value,
        content: document.getElementById("content").value
    };

    if (dateInput) {
        newArticle.created_at = new Date(dateInput).toISOString();
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'apiKey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`, // Dodany autoryzator również tutaj
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(newArticle)
        });

        if (response.ok) {
            alert("Artykuł został dodany.");
            document.getElementById("add-article").reset(); 
            fetchArticles();
        } else {
            alert("Błąd podczas dodawania.");
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
});

document.getElementById("sort-articles").addEventListener("change", fetchArticles);

fetchArticles();