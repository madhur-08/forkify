import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import List from "./models/List";
import Recipe from './models/Recipe';
import {elements, renderLoader, clearLoader, elementStrings} from './views/base';
import Likes from './models/Likes';


/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping List Objectss
 * - Liked recipes
 */
const state = {};
window.state = state;

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    //Get query from the view
    const query = searchView.getInput();

    if(query) {
        //new Search object added to the state
        state.search = new Search(query);

        // Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            //Search for recipes
            await state.search.getResults();
    
            //Render results from UI
            clearLoader(); 
            searchView.renderResults(state.search.result);
        }
        catch(err) {
            alert('Error processing results!');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    controlSearch();
});

//TESTING
elements.searchForm.addEventListener('load', e=>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
   const btn = e.target.closest('.btn-inline');
   if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    } 
});


/**
 * RECIPE CONTROLLER
 */

 const controlRecipe = async() => {
    //Get ID from the url
    const id = window.location.hash.replace('#','');

    if(id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        searchView.highlightSelected(id);

        //Create new Recipe object
        state.recipe = new Recipe(id);

        try {
            //Get recipe data and parse Ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render the recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        }
        catch(err) {
            alert('Error processing recipe!');
        }
    }
 }
//  window.addEventListener('hashchange', controlRecipe);
//  window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/** 
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Handle deleted and update list item events
elements.shopping.addEventListener('click', e=> {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);
    }
    //Handle the count update
    else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value); 
        state.list.updateCount(id, val);
    }
});


/**
 * LIKES CONTROLLER
 */
state.likes = new Likes();
const controlLike = () => {
     if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has not liked current recipe
    if(!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true);
        //Add like to the UI list
        console.log(state.likes);
    }
    //User HAS liked current recipe
    else {
        //Remove like to the state
        state.likes.deleteLike(currentID);
        //Toggle the like button
        likesView.toggleLikeBtn(false);
        //Remove like from the UI list
        console.log(state.likes); 
    } 
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

//handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')&&state.recipe.servings > 1) {
        //Decrease button is clicked
        state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc'); 
        recipeView.updateServingsIngredients(state.recipe);

    }
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    }
    else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller 
        controlLike();
    }
});