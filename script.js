var lastCreatedStateId = 1;
var lastCreatedActivityId = 1;

var state = Object.freeze({
    "MASH_WATER":"Mash water",
    "POST_MASH_WORT":"Post-mash wort",
    "POST_BOIL_WORT":"Post-boil wort",
    "FERMENTED_WORT":"Fermented wort",
    "BEER":"Beer"});

var activity = Object.freeze({
    "MASHING":"MASHING",
    "BOILING":"BOILING",
    "FERMENTATION":"FERMENTATION",
    "BOTTLING":"BOTTLING"});

var currentState={
    column:2,
    row:1,
}
var objSelected = {
    id: "id",
    column: 1,
    row: 1
}

function Recipe(id, recipe, first_action){
    this.id = id; //id corresponds to the row in which the recipe is setted
    this.flow = recipe;
    this.stack = [first_action];

    this.addElementToStack = function(action){
        this.stack.push(action);
    }

    this.removeLastElementFromStack = function(){
        this.stack.pop();
    }

}


var recipes = [];
var recipe;

initRecipe();


//inizializza una ricetta
function initRecipe (){
    recipe = new Recipe(1, homebrewlib.newRecipe(), state.MASH_WATER);
    recipe.flow.reset();
    recipes[1] = recipe;
}


function appear(id) {
    var obj;
    var style;
    obj = document.getElementById(id);
    objSelected.id = id;
    style = window.getComputedStyle(obj);
    objSelected.column = style.getPropertyValue('grid-column-start');
    objSelected.row = style.getPropertyValue('grid-row-Start');
    if(objSelected.id.indexOf("itemS")!== -1 && document.getElementById("state-button") == null){
        obj.appendChild(showStateButton(id, parseInt(objSelected.row), parseInt(objSelected.column)));
        obj.appendChild(showActivityButton(parseInt(objSelected.row), parseInt(objSelected.column),
            recipes[objSelected.row].stack[recipes[objSelected.row].stack.length -1]));
    }
    else if (objSelected.id.indexOf("itemA") !== -1 && document.getElementById("delete-button") == null){
        obj.appendChild(showDeleteButton(id, parseInt(objSelected.row), parseInt(objSelected.column)));
    }
}

function disappear(id){
    var obj;
    obj = document.getElementById(id);
    objSelected.id = id;
    obj.style.background = "none";
    if(objSelected.id.indexOf("itemS")!== -1){
        obj.removeChild(document.getElementById("state-button"));
        obj.removeChild(document.getElementById("activity-button"));
    }
    else if(objSelected.id.indexOf("itemA")!== -1) {
        obj.removeChild(document.getElementById("delete-button"));
    }

}

//mostra i pulsanti merge e split sullo stato
function showStateButton(stateId, row, column){
    var item = document.createElement("div");
    item.setAttribute("id", "state-button");
    item.style.gridColumn = (column+1) +"/ "+(column+1);
    item.style.gridRow = row +"/ "+row;
    item.style.display = "inline-block";
    var buttonSplit = document.createElement("button");
    var buttonMerge = document.createElement("button");
    var splitImg = document.createElement("img");
    var mergeImg = document.createElement("img");
    splitImg.setAttribute("src", "simbols/icon/split.png");
    splitImg.setAttribute("class", "icon");
    mergeImg.setAttribute("src", "simbols/icon/merge.png");
    mergeImg.setAttribute("class", "icon");
    buttonSplit.appendChild(splitImg);
    buttonMerge.appendChild(mergeImg);
    buttonSplit.setAttribute("class", "button");
    buttonSplit.onclick = function () { splitActivities(stateId, row, column); }
    buttonMerge.setAttribute("class", "button");
    buttonMerge.onclick = function () { mergeActvities(row, column); }

    item.appendChild(buttonSplit);
    item.appendChild(buttonMerge);
    return item;
}

//mostra i pulsanti che aggiungono attività
function showActivityButton(row, column, type){
    var item = document.createElement("div");
    item.setAttribute("id", "activity-button");
    item.style.gridColumn = (column+1) +"/ "+(column+1);
    item.style.gridRow = row +"/ "+row;
    item.style.display = "inline-block";
    /*
    if(column === 2 && row === 1)
        type= "MASHING";
        */
    switch(type){ // a seconda dell'attività si avranno più o meno scelte
        case state.MASH_WATER:
        case state.POST_MASH_WORT: {
            item.appendChild(createActivityButton(row, column, activity.MASHING));
            item.appendChild(createActivityButton(row, column, activity.BOILING));
            item.appendChild(createActivityButton(row, column, activity.FERMENTATION));
            item.appendChild(createActivityButton(row, column, activity.BOTTLING));
            break;
        }
        case state.POST_BOIL_WORT: {
            item.appendChild(createActivityButton(row, column, activity.BOILING));
            item.appendChild(createActivityButton(row, column, activity.FERMENTATION));
            item.appendChild(createActivityButton(row, column, activity.BOTTLING));
            break;
        }
        case state.FERMENTED_WORT: {
            item.appendChild(createActivityButton(row, column, activity.FERMENTATION));
            item.appendChild(createActivityButton(row, column, activity.BOTTLING));
            break;
        }
        case state.BEER:{
            item.appendChild(createActivityButton(row, column, activity.BOTTLING));
            break;
        }
    }
    return item;
}

function createActivityButton(row, column, text){
    var button = document.createElement("button");
    button.innerText = text;
    button.onclick = function (){addActivity(row, column, text);}
    button.setAttribute("class", "button");

    return button;
}

//mostra il pulsante 'elimina'
function showDeleteButton(id, row, column){
    var item = document.createElement("div");
    item.setAttribute("id", "delete-button");
    item.style.gridColumn = (column-1) + "/ " + (column -1);
    item.style.gridRow = row +"/ "+row;
    item.style.display = "inline-block";
    var buttonDelete = document.createElement("button");
    buttonDelete.innerText = "X";
    buttonDelete.onclick = function (){deleteActivity(id, row);}
    buttonDelete.setAttribute("class", "button");
    item.appendChild(buttonDelete);
    return item;
}


//aggiunge un'attività
function addActivity(row, column, type){

    var container = document.getElementById("grid-container");
    var recipe = recipes[row].flow;
    switch(type){
        case activity.MASHING: {
            recipe.mash();
            break;
        }
        case activity.BOILING: {
            recipes[row].flow.boil();
            break;
        }
        case activity.FERMENTATION: {
            recipes[row].flow.ferment();
            break;
        }
        case activity.BOTTLING:{
            recipes[row].flow.bottle();
            break;
        }
    }


    recipes[row].addElementToStack(recipe.state[recipe.state.length-1].name);

    //crea una nuova attività con id incrementato
    lastCreatedActivityId += 1;

    var newActivity = createActivity(lastCreatedActivityId, row, column + 1, type);
    //crea un nuovo stato con id incrementato
    lastCreatedStateId += 1;
    var newState = createState(lastCreatedStateId, row, column + 2, "simbols/arrow.png");

    container.appendChild(newActivity);
    container.appendChild(newState);

    currentState.column += 2;
    //stackRecipe.push("simple"); //aggiorna lo stackRecipe1

}

//unisce due attività
function mergeActvities(){
    if(stackRecipe[stackRecipe.length-1] === "divide") {
        var container = document.getElementById("grid-container");
        //crea il nuovo stato di merge
        lastCreatedActivityId += 1;
        var newActivity = createActivity(lastCreatedActivityId, currentState.row, currentState.column + 1);
        //modifica img stato merged riga secondaria

        document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow5.png";
        //modifica img stato merged riga principale

        document.getElementById("imgS" + (lastCreatedStateId-1)).src = "simbols/arrow2.png";
        //crea il nuovo stato di merge
        lastCreatedStateId += 1;
        var newState = createState(lastCreatedStateId, currentState.row, currentState.column + 2, "simbols/arrow.png");

        container.appendChild(newState);
        container.appendChild(newActivity);

        currentState.column += 2;
        //stackRecipe.addElementToStack("merge");
        //stackRecipe.push("merge"); //aggiorna lo stackRecipe1
    }
}

//elimina un'attività e quelle successive sulla sua row
function deleteActivity(objToDeleteId, row){

    var container = document.getElementById("grid-container");
    var elementsInARow = document.getElementsByClassName("grid-item-row"+row);
    var objToDelete = document.getElementById(objToDeleteId);
    var objToDeleteStyle = window.getComputedStyle(objToDelete);
    var columnObjToDelete = objToDeleteStyle.getPropertyValue('grid-column-start');
    for(var i = elementsInARow.length-1; i>=0; i--) {
        var otherObjStyle = window.getComputedStyle(elementsInARow[i]);
        var columnOtherObject = otherObjStyle.getPropertyValue('grid-column-start');
        if ((columnObjToDelete - 1) < columnOtherObject && columnOtherObject != 1) {
            container.removeChild(document.getElementById(elementsInARow[i].getAttribute("id")));
            lastCreatedActivityId--;
            if(i%2 == 0){
                recipes[row].flow.undo();
                recipes[row].removeLastElementFromStack();
            }
        }
        currentState.column --;

    }
}

//divide la ricetta dando origine ad una nuova
function splitActivities(stateId, row, column){
    var container = document.getElementById("grid-container");
    //crea due nuove attività
    var newRow = row+1;

    var newRecipe = recipes[row].flow.split(5);
    if(recipes.length === row+1) // se l'array contiene come ultimo elemento la ricetta corrente
        recipes[newRow] = new Recipe(parseInt(recipes[row].id) + 1, newRecipe);

    else{ //altrimenti shifta in basso le altre ricette per lasciar spazio a quella nuova
        for(var i=newRow; i<recipes.length; i++){
            var shifter = document.getElementsByClassName("grid-item-row"+i);
            for(var j=0; j<shifter.length; j){
                shifter[j].classList.add("grid-item-row"+(i+1));
                shifter[j].classList.remove("grid-item-row"+i);
            }
        }
        //recipes[newRow]= new Recipe(parseInt(recipes[row].id)+1, newRecipe);
        for(var i=newRow; i<recipes.length; i++){
            recipes[i].id +=1;
        }
        recipes.splice(newRow, 0, new Recipe(parseInt(recipes[row].id)+1, newRecipe));
    }


    var name = recipes[row].flow.state[(column-1)/2].name
    recipes[newRow].addElementToStack(name);

    document.getElementById("imgS" + stateId.slice(5,6)).src = "simbols/arrow2.png";

    lastCreatedStateId += 1;
    var splitState = createState(lastCreatedStateId, newRow, column, "simbols/arrow3.png");
    container.appendChild(splitState);

}


//inizializza una nuova attività
function createActivity(id, row, column, type){
    var item;
    item = document.createElement("div");
    item.setAttribute("class", "grid-item-row"+row);
    item.setAttribute("id", "itemA"+id);
    item.setAttribute("onmouseover", "appear(id)");
    item.setAttribute("onmouseleave", "disappear(id)");
    item.innerText = type;
    item.style.gridColumn = column +"/ "+column;
    //item.style.gridRow = row +"/ "+row;
    return item;
}

//inizializza un nuovo stato
function createState(id, row, column, path){
    var item;
    var img;
    item = document.createElement("div");
    item.setAttribute("class", "grid-item-row"+row);
    item.setAttribute("id", "itemS"+id);
    item.setAttribute("onmouseover", "appear(id)");
    item.setAttribute("onmouseleave", "disappear(id)");
    item.style.gridColumn = column +"/ "+column;
    item.style.paddingRight = "5px";
    item.style.paddingLeft = "5px";
    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +id);
    img.style.paddingTop ="5px";

    item.appendChild(img);

    return item;
}


