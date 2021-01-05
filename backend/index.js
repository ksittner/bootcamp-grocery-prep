const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const mongoose = require('mongoose')
const uri = "mongodb+srv://bootcamp:x8g46zRa@cluster0.cecdq.mongodb.net/BootcampGroceryPrep?retryWrites=true&w=majority"

mongoose.connect(uri, {useNewUrlParser: true,  useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("Successfully connected to the database.")
});

const recipeSchema = new mongoose.Schema({
    title: String,
    description: String, 
    image: String, 
    ratings: [Number],
    servings: Number,
    ingredients: Map,
    instructions: [String]
    }, {collection : "Recipes"}
)

const Recipe = mongoose.model('Recipe', recipeSchema);

app.use(bodyParser.json())

app.get('/api/recipe', async (request, response) => {
    const recipes = await Recipe.find({})
    console.log('Successful request for all recipe data')
    response.status(200)
    response.json(recipes)
})

app.get('/api/recipe/:name', async (request, response) => {
    // Current endpoint setup prevents the possibility of null or undefined name
    const name = request.params.name
    const recipe = await Recipe.findOne({title: name})
    if (recipe === null) {
        console.log(`Unable to find ${name} recipe data`)
        response.status(204)
        response.end()
    }
    else {
        console.log(`Successful request for ${name} recipe data`)
        response.status(200)
        response.json(recipe)
    }
})

app.post('/api/rating', async (request, response) => {
    const id = request.body.id
    const rating = request.body.rating
    if ((typeof id !== 'string' || id.length !== 24) || 
        (typeof rating !== 'number' || rating < 0 || rating > 5)) {
            console.log("Improperly formatted body received")
            response.status(400)
            response.end()
    }
    else {
        const recipe = await Recipe.findById(id)
        if (recipe === null) {
            console.log(`Unable to add rating for recipe ${id}`)
            response.status(422)
            response.end()
        }
        else {
            recipe.ratings.push(rating)
            recipe.save()
            console.log(`Sucessfully added rating of ${rating} to recipe ${id}`)
            response.status(200)
            response.end()
        }
    }
})

app.listen(port)