import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import Recipe from './models/Recipe';
import {elements, renderLoader, clearLoader, elementStrings} from './views/base';


/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping List Objectss
 * - Liked recipes
 */
const state = {};


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
        console.log(goToPage);
   } 
});


/**
 * RECIPE CONTROLLER
 */

 const controlRecipe = async() => {
    //Get ID from the url
    const id = window.location.hash.replace('#','');
    console.log(id);

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
            recipeView.renderRecipe(state.recipe);
        }
        catch(err) {
            alert('Error processing recipe!');
        }
    }
 }
//  window.addEventListener('hashchange', controlRecipe);
//  window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

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

});