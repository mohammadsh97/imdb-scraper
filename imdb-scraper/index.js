const fetch = require('node-fetch');
const cheerio = require('cheerio');
// const { contains } = require('cheerio/lib/static');
const prompt = require('prompt');

// search movie IMDB URL
const searchUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';

// movie IMDB URL
const movieUrl = 'https://www.imdb.com/title/';

// To get data from movie URL
function getMovie(imdbID) {
    return fetch(`${movieUrl}${imdbID}`)
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body);

            const title = $('div.TitleBlock__TitleContainer-sc-1nlhx7j-1.jxsVNt.shortenTop.ratingBarHidden h1').text().trim();

            // To check if you have rating and run time and genres data
            if ($('div.TitleBlock__TitleMetaDataContainer-sc-1nlhx7j-2.hWHMKr ul').children().length == 3) {

                // to get rating data
                const rating = $('div.TitleBlock__TitleMetaDataContainer-sc-1nlhx7j-2.hWHMKr ul li:nth-child(2)').text().trim();

                // to get run time data
                const runTime = $('div.TitleBlock__TitleMetaDataContainer-sc-1nlhx7j-2.hWHMKr ul li:last-child').text().trim();

                // to get genres data
                const genres = [];
                $('span.ipc-chip__text').each(function (i, element) {
                    const genre = $(element).text();
                    genres.push(' ' + genre);
                });

                // to get all of data from table
                function getItems(itemArray) {
                    return function (i, element) {
                        const item = $(element).text().trim();
                        itemArray.push(' ' + item);
                    };
                }

                // to get directors data
                const directors = [];
                // $('span[itemProp="director"]').each(getItems(directors));
                $('section.ipc-page-section.ipc-page-section--base.StyledComponents__CastSection-y9ygcu-0.fswvJC.title-cast.title-cast--movie li div ul').each(getItems(directors));

                // to get stars data
                const stars = [];
                $('li.ipc-metadata-list__item.ipc-metadata-list-item--link div.ipc-metadata-list-item__content-container ul.ipc-inline-list.ipc-inline-list--show-dividers.ipc-inline-list--inline.ipc-metadata-list-item__list-content.baseAlt').each(getItems(stars));

                // Save all of data to list
                const movies = [];
                const movie = {
                    title,
                    genres,
                    rating,
                    runTime,
                    directors,
                    stars
                };

                // Print all data as required
                console.log(title + ' |' + genres + ' | ' + rating + ' | ' + runTime + ' |' + directors + ' |' + stars + '.\n');

                movies.push(movie);
                return movies;
            }
            return null;
        });
}

// Get data when searching for movies
function searchMovies(searchTerm) {
    return fetch(`${searchUrl}${searchTerm}`)
        .then(response => response.text())
        .then(body => {
            const movies = [];
            const $ = cheerio.load(body);

            if ($('html p b').text().includes('Error')) {
                console.log($('html p b').text() + '\nPlease try again');
                return;
            }
            $('.findResult').each(function (i, element) {
                const $element = $(element);
                const $title = $element.find('td.result_text a');

                const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];

                if ($title.text().toLocaleLowerCase().includes(searchTerm)) {
                    getMovie(imdbID);
                }
            });
            return movies;
        });

}
// Initialization
function init() {
    prompt.start();

    console.log('Enter name of movie please:');

    prompt.get(['movieName'], function (err, res) {
        const searchTerm = res.movieName.toLocaleLowerCase();
        const result = searchMovies(searchTerm);

    });
}

// Initialization call
init();