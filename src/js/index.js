import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader, elementStrings} from './views/base';


/** Global state of the app
 * - Search Object
 * - Current recipe object
 * - Shopping List Objectss
 * - Liked recipes
 */
const state = {};

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

        //Search for recipes
        await state.search.getResults();

        //Render results from UI
        clearLoader(); 
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e=>{
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