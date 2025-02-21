## 🎬 Film Shelf (Movie Curation App)

# 📌 Overview

It is a movie curation app where users can search for movies using the TMDB API, add them to a watchlist, wishlist, or curated lists, and provide reviews and ratings. The app also includes features like sorting, searching by genre/actor/director, and displaying top-rated movies.

# 🚀 Features

🔍 Search movies from the TMDB API  
📂 Create and manage curated movie lists  
❤️ Save movies in wishlist and watchlist  
⭐ Add reviews and ratings for movies  
🎭 Filter movies by genre and actor  
📊 Sort movies in lists by rating or release year  
🏆 Display the top 5 movies by rating

# 🛠️ Tech Stack

| Technology             | Purpose                      |
| ---------------------- | ---------------------------- |
| Node.js + Express      | Backend API                  |
| Sequelize + PostgreSQL | Database & ORM               |
| TMDB API               | Fetch movies and its details |
| Jest                   | Testing                      |

# 📦 Creating account on TMDB and getting API keys

1. Create an account on TMDB website(https://www.themoviedb.org/)
2. Once you’ve logged in, visit the API section(https://www.themoviedb.org/settings/api)
3. Get your API Key under Settings > API > API Key
4. You can read their API documentation for endpoints from here(https://developer.themoviedb.org/docs/getting-started)

# 📦 Installation

1️⃣ Clone the Repository

git clone https://github.com/y-jaga/Film-Shelf.git  
cd Film-Shelf

2️⃣ Install Dependencies

npm install

3️⃣ Set Up Environment Variables

Create a .env file and add the following:

You will find supabase details in your supabase project, at top click on "Connect"

Supabase Database Connection

- DB_USER=your_supbase_project_username  
- DB_NAME=postgres  
- DB_HOST=your_supbase_project_hostname  
- DB_PORT=5432  
- DB_PASSWORD=your_supabase_project_password

TMDB CONFIG  
- TMDB_USERNAME = your_tmdb_username
- TMDB_PASSWORD = your_tmdb_password
- TMDB_API_KEY = your_tmdb_api_key
- TMDB_BASE_URL = your_tmdb_base_url

4️⃣ Run the Server

    npm run start

# or

    npm run dev

# 🔗 API Endpoints


- 🔎 Search Movies

Endpoint: GET /api/movies/search?query=Inception

Description: Searches for movies from TMDB API based on the query.

- 📝 Create Curated List

Endpoint: POST /api/curated-lists

Description: Creates a new curated list with a name, description, and slug.

- ✏️ Update Curated List

Endpoint: PUT /api/curated-lists/:curatedListId

Description: Renames a list and updates its short description.

-  Save Movie in Wishlist

Endpoint: POST /api/movies/wishlist

Description: Saves a movie in the wishlist if it exists in Movie DB, otherwise creates a new entry.

- 📺 Save Movie in Watchlist

Endpoint: POST /api/movies/watchlist

Description: Saves a movie in the watchlist if it exists in Movie DB, otherwise creates a new entry.

- 📜 Save Movie in Curated List

Endpoint: POST /api/movies/curated-list

Description: Saves a movie in a curated list if it exists in Movie DB, otherwise creates a new entry.

- ⭐ Add Review and Rating

Endpoint: POST /api/movies/:movieId/reviews

Description: Adds a review and rating to a specific movie.

- 🎭 Filter Movies by Genre and Actor

Endpoint: GET /api/movies/searchByGenreAndActor?genre=Action&actor=Leonardo DiCaprio

Description: Filters movies based on genre and actor.

- 📊 Sort Movies in Lists

Endpoint: GET /api/movies/sort?list=watchlist&sortBy=rating&order=ASC

Description: Allows users to sort movies in their lists by rating or year of release.

- 🏆 Get Top 5 Movies

Endpoint: GET /api/movies/top5

Description: Retrieves the top 5 movies by rating and displays their detailed reviews.

# 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request
