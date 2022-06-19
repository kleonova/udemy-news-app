// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
// Init http module
const http = customHttp();

const newsService = (function () {
    const apiKey = "187b53afa2ae4d30ae4d63d29013a412";
    const apiUrl = "https://newsapi.org/v2";

    return {
        topHeadlines(country = "ru", cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        }
    }
})();

const searchForm = document.forms["searchNews"];
const searchFormCountry = searchForm.elements["country"];
const searchFormQuery = searchForm.elements["search"];

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    loadNews();
})

function loadNews() {
    const country = searchFormCountry.value;
    const searchQuery = searchFormQuery.value;

    if (!searchQuery) {
        newsService.topHeadlines(country, onGetResponse);
    } else {
        newsService.everything(searchQuery, onGetResponse);
    }

}

//  init selects
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});

function onGetResponse(error, response) {
    if (error) {
        console.error(error);
        return;
    }

    if (!response?.articles || !response.articles.length) {
        console.warn('news not found');
        return;
    }

    clearContainer();
    renderNews(response.articles);
}

function renderNews(articles) {
    const newsContainer = document.getElementById("newsContainer");
    articles.forEach(article => {
        const el = articleTemplate(article);
        newsContainer.appendChild(el)
    })
}

function clearContainer() {
    const newsContainer = document.getElementById("newsContainer");
    newsContainer.innerHTML = '';
}

function articleTemplate(article) {
    // console.log(article);
    const articleElement = document.createElement('div');
    articleElement.classList.add('card');

    const articleElementHeader = document.createElement('div');
    if (article?.author) {
        articleElementHeader.classList.add('article-card__header');
        articleElementHeader.appendChild(document.createElement('span').appendChild(document.createTextNode(article.author)));
    }
    // articleElementHeader.appendChild(document.createElement('span').appendChild(document.createTextNode(article.publishedAt)));

    const articleElementBody = document.createElement('div');
    articleElementBody.classList.add("card-body");

    if (article?.title) {
        const articleTitle = document.createElement("h5");
        articleTitle.classList.add("card-title");
        articleTitle.appendChild(document.createTextNode(article.title));
        articleElementBody.appendChild(articleTitle);
    }

    if (article?.description) {
        const articleDescriprion = document.createElement("p");
        articleDescriprion.classList.add("card-text");
        articleDescriprion.appendChild(document.createTextNode(article.description));
        articleElementBody.appendChild(articleDescriprion);
    }

    const articleElementFooter = document.createElement('div');
    articleElementFooter.classList.add("article-card__footer");

    if (article?.source?.name) {
        const articleLink = document.createElement("a");
        articleLink.href = article.url;
        articleLink.appendChild(document.createTextNode(article.source.name));
        articleElementFooter.appendChild(articleLink);
    }

    articleElement.appendChild(articleElementHeader);

    if (article?.urlToImage) {
        const articleElementImg = document.createElement('img');
        articleElementImg.src = article.urlToImage;
        articleElement.appendChild(articleElementImg);
    }

    articleElement.appendChild(articleElementBody);
    articleElement.appendChild(articleElementFooter);

    return articleElement;
}
