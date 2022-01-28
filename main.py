import re
import mysql.connector
import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import csv
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity
import sys

def create_excels():
    cnx = mysql.connector.connect(user='root', password='',
                              host='127.0.0.1',
                              database='projet_pire')
    cursor = cnx.cursor(buffered=True)


    query = ("SELECT f.id, f.titre, GROUP_CONCAT(DISTINCT g.nom) AS genres, GROUP_CONCAT(DISTINCT p.nom) AS producteurs FROM films f LEFT JOIN genres g ON f.id=g.id_film LEFT JOIN producteurs p ON f.id=p.id_film GROUP BY f.id")
    cursor.execute(query)

    header = ['ID_FILM', 'TITRE', 'GENRES', 'TAGS']
    with open('movies2.csv', 'w', newline='', encoding='utf_8_sig') as f:
        writer = csv.writer(f)

        # write the header
        writer.writerow(header)

        for (id, titre, genres, producteurs) in cursor:
            writer.writerow([id, 
            titre.replace('\\', ''), 
            genres.replace('"', '').replace(',', '|') if genres is not None else '',
            genres.replace(' ', '').replace('"', '').replace("'", '').replace(',', ' ').lower() if genres is not None else '' + ' ' + (producteurs.replace(' ', '').replace('"', '').replace("'", '').replace(',', ' ').lower() if producteurs is not None else '')
            ])

    query = ("SELECT id_film, id_utilisateur, note FROM notes")
    cursor.execute(query)

    header = ['ID_FILM', 'ID_UTILISATEUR', 'NOTE']
    with open('ratings2.csv', 'w', newline='', encoding='utf_8_sig') as f:
        writer = csv.writer(f)
        
        # write the header
        writer.writerow(header)

        for (id_film, id_utilisateur, note) in cursor:
            writer.writerow([id_film, id_utilisateur, note])

    cursor.close()
    cnx.close()

create_excels()

movies = pd.read_csv("./movies2.csv")
ratings = pd.read_csv("./ratings2.csv")

def get_recommendations_collaborative_item_based(id_film, n = 5, addSimilarities = False):
    final_dataset = ratings.pivot(index='ID_FILM',columns='ID_UTILISATEUR',values='NOTE')
    final_dataset.fillna(0,inplace=True)

    # filtre nombre de users ayant voté par film
    no_user_voted = ratings.groupby('ID_FILM')['NOTE'].agg('count')

    # filtre nombre de films votés par user
    no_movies_voted = ratings.groupby('ID_UTILISATEUR')['NOTE'].agg('count')

    # on enleve les films qui n'ont pas au moins 10 notes
    final_dataset = final_dataset.loc[no_user_voted[no_user_voted > 10].index,:]

    # on enleve les utilisateurs qui n'ont pas voté pour au moins 50  films
    final_dataset=final_dataset.loc[:,no_movies_voted[no_movies_voted > 20].index]

    # on applique une méthode sparsity
    csr_data = csr_matrix(final_dataset.values)
    final_dataset.reset_index(inplace=True)

    # on applique la méthode du plus proche voisin
    knn = NearestNeighbors(algorithm='brute', metric='cosine', n_jobs=-1)
    knn.fit(csr_data)
    movie_idx = final_dataset[final_dataset['ID_FILM'] == id_film].index[0]

    distances, indices = knn.kneighbors(csr_data[movie_idx],n_neighbors=n+1)    
    rec_movie_indices = sorted(list(zip(indices.squeeze().tolist(),distances.squeeze().tolist())),key=lambda x: x[1])[:0:-1]
    recommendations = []
    for rec_movie_indice in rec_movie_indices:
        movie_idx = final_dataset.iloc[rec_movie_indice[0]]['ID_FILM']
        idx = movies[movies['ID_FILM'] == movie_idx].index
        recommendations.append([movies.iloc[idx]['ID_FILM'].values[0], 1.0 - rec_movie_indice[1]] if addSimilarities else movies.iloc[idx]['ID_FILM'].values[0])
    return recommendations[:n+1]

def get_recommendations_content_based(id_film, n = 5, addSimilarities = False):

    # On récupère la série de tous les IDs de films
    indexes = movies.iloc[:, 0]

    count = CountVectorizer()
    counts_matrix = count.fit_transform(movies['TAGS'])

    # On génère la matrice de similarité entre les TAGS de tous les films
    similarities_matrix = cosine_similarity(counts_matrix, counts_matrix)

    recommendations = []
    # On récupère l'indice excel du film dont l'id est passé en paramètres
    index = indexes[indexes == id_film].index[0]

    # On créée une série pandas en triant par ordre décroissant les similarités obtenues par la matrice de similarité
    similarities = pd.Series(similarities_matrix[index]).sort_values(ascending = False)

    # On récupère les indices excel des n films les plus similaires (On ignore le premier car c'est le film lui-même)
    top_indexes = list(similarities.iloc[0:n+1].index)
    
    # On ajoute à la liste les ids des films et leur similarité ayant la plus grande similarité
    for i in top_indexes:
        recommendations.append([list(movies.ID_FILM)[i], similarities[i]] if addSimilarities else list(movies.ID_FILM)[i])
    
    if id_film in recommendations:
        recommendations.remove(id_film)
    else:
        recommendations.pop()

    return recommendations

def get_recommendations_collaborative_user_based(id_utilisateur, n = 30, addSimilarities = False):
    random_sets = train_test_split(ratings, test_size = 0.30, random_state = 42)[0]
    ratings_data = random_sets.pivot(index = 'ID_UTILISATEUR', columns = 'ID_FILM', values = 'NOTE').fillna(0)

    tmp_sets = random_sets.copy()
    tmp_sets['NOTE'] = tmp_sets['NOTE'].apply(lambda x: 0 if x > 0 else 1)
    tmp_sets = tmp_sets.pivot(index = 'ID_UTILISATEUR', columns = 'ID_FILM', values = 'NOTE').fillna(1)

    user_similarities_matrix = cosine_similarity(ratings_data)
    user_similarities_matrix[np.isnan(user_similarities_matrix)] = 0
    ratings_predictions = np.dot(user_similarities_matrix, ratings_data)
    final_ratings = np.multiply(ratings_predictions, tmp_sets)
    l = list(final_ratings.loc[id_utilisateur].sort_values(ascending = False)[0:n].items())
    return [[t[0], t[1]] for t in l] if addSimilarities else [t[0] for t in l]

match sys.argv[1]:
    case '1':
        print(get_recommendations_content_based(int(sys.argv[2]), int(sys.argv[3])))
    case '2':
        print(get_recommendations_collaborative_item_based(int(sys.argv[2]), int(sys.argv[3])))
    case '3':
        print(get_recommendations_collaborative_user_based(int(sys.argv[2]), int(sys.argv[3])))

exit(0)