var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/scrape", (req, res) => {
  request("https://readwrite.com/", (error, response, html) => {
    var $ = cheerio.load(html);

    
    $("div article").each((i, element) => {
      var result = {};

      result.title = $(element).find("h2").text();
      result.url = $(element).find("h2").find("a").attr("href");
      result.summary = $(element).find("p").text();

      db.Article.create(result)
        .then((dbArticle) => {
          console.log(dbArticle);
        })
        .catch((err) => {
          return res.json(err);
        });
    });

    res.send("Scrape Complete");
  });
});

app.get("/articles", (req, res) => {
  db.Article.find({})
    .then((dbArticle) => {
      res.json(dbArticle);
    })
    .catch((err) => {
      res.json(err);
    });
});

app.listen(PORT, function() {
  console.log("App running on http:localhost:" + PORT);
})