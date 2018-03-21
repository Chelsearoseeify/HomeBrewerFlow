var addButton = document.getElementById("add");
var divideButton = document.getElementById("divide");
var mergeButton = document.getElementById("merge");
var deleteButton = document.getElementById("delete");
var lastCreatedStateId = 1;
var lastCreatedActivityId = 1;

var beginning = true;
var currentState={
    column:2,
    row:1,
}
var objSelected = {
    id: "id",
    column: 1,
    row: 1
}

function StackRecipe(id, first_action){
    this.id = id;
    this.stack = [first_action];

    this.addElementToStack = function(action){
        this.stack.push(action);
    }
}

function Recipe(id, recipe){
    this.id = id; //id corresponds to the row in which the recipe is setted
    this.flow = recipe;

}

var stackRecipe = new StackRecipe(1, "simple");

/*
var stackRecipe = {
    id : 1,
    stack :["simple"]
}
*/

var recipesActions = [];
recipesActions.push(stackRecipe);

var recipes = [];
var recipe;

initRecipe();



addButton.onclick = function() {
    addActivity();
}

divideButton.onclick = function(){
    splitActivities();

}

mergeButton.onclick = function () {
    mergeActvities();
}

deleteButton.onclick = function (){
   deleteActvity();
}

//inizializza una ricetta
function initRecipe (){
    recipe = new Recipe(1, homebrewlib.newRecipe());
    recipe.flow.reset();
    recipes[1] = recipe;
    //recipes.push(recipe);
}


//inizializza una nuova attività
function createActivity(id, row, column, type){
    var item;
    item = document.createElement("div");
    item.setAttribute("class", "grid-item-row"+row);
    item.setAttribute("id", "itemA"+id);
    item.setAttribute("onmouseover", "highlight(id)");
    item.setAttribute("onmouseleave", "unhighlight(id)");
    item.innerText = type;
    item.style.gridColumn = column +"/ "+column;
    //item.style.gridRow = row +"/ "+row;
    return item;
}

function createState(id, row, column, path){
    var item;
    var img;
    item = document.createElement("div");
    item.setAttribute("class", "grid-item-row"+row);
    item.setAttribute("id", "itemS"+id);
    item.setAttribute("onmouseover", "highlight(id)");
    item.setAttribute("onmouseleave", "unhighlight(id)");
    item.style.gridColumn = column +"/ "+column;
    //item.style.gridRow = row +"/ "+row;
    item.style.paddingRight = "5px";
    item.style.paddingLeft = "5px";
    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +id);
    img.style.paddingTop ="5px";

    item.appendChild(img);

    return item;
}
function addActivity(row, column, type){

    var container = document.getElementById("grid-container");
    switch(type){
        case "MASHING": {
            recipes[row].flow.mash();
            break;
        }
        case "BOILING": {
            recipes[row].flow.boil();
            break;
        }
        case "FERMENTING": {
            recipes[row].flow.ferment();
            break;
        }
        case "BOTTLING":{
            recipes[row].flow.bottle();
            break;
        }
    }
    if(beginning){
        container.removeChild(document.getElementById("itemA1"))
        var firstActivity = createActivity(lastCreatedActivityId, row, column, type);
        container.appendChild(firstActivity);
        beginning = false;
    }else {
        //crea un nuovo stato con id incrementato
        lastCreatedStateId += 1;
        var newState = createState(lastCreatedStateId, row, column + 1, "simbols/arrow.png");
        //crea una nuova attività con id incrementato
        lastCreatedActivityId += 1;

        var newActivity = createActivity(lastCreatedActivityId, row, column + 2, type);

        container.appendChild(newActivity);
        container.appendChild(newState);

        currentState.column += 2;
        stackRecipe.addElementToStack("simple");
        //stackRecipe.push("simple"); //aggiorna lo stackRecipe1
    }
}

function mergeActvities(row, column){
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

        container.appendChild(newActivity);
        container.appendChild(newState);

        currentState.column += 2;
        stackRecipe.addElementToStack("merge");
        //stackRecipe.push("merge"); //aggiorna lo stackRecipe1
    }
}

function deleteActivity(){
    if(currentState.column>1) {
        var container = document.getElementById("grid-container");
        switch (stackRecipe.stack[stackRecipe.stack.length-1]){
            case "simple":{
                container.removeChild(container.lastChild);
                lastCreatedStateId -= 1;
                container.removeChild(container.lastChild);
                lastCreatedActivityId -= 1;
                document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow.png";
                currentState.column -= 2;
                stackRecipe.stack.pop();
                break;
            }
            case "divide":{
                for (var i = 0; i < 5; i++) {
                    container.removeChild(container.lastChild);
                }
                currentState.column -= 2;
                lastCreatedStateId -= 3;
                lastCreatedActivityId -= 2;
                document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow.png";
                stackRecipe.stack.pop();
                break;
            }
            case "merge":{
                container.removeChild(container.lastChild);
                container.removeChild(container.lastChild);
                currentState.column -= 2;
                lastCreatedStateId -= 1;
                lastCreatedActivityId -= 1;
                document.getElementById("imgS" + lastCreatedStateId).src = "simbols/arrow.png";
                document.getElementById("imgS" + (lastCreatedStateId-1)).src = "simbols/arrow.png";
                stackRecipe.stack.pop();
                break;
            }


        }
    }
}

function splitActivities(stateId, row, column){
    if(!(stackRecipe[stackRecipe.length-1] === "merge")) { //se l'ultima azione fatta non è merge
        var container = document.getElementById("grid-container");
        //crea due nuove attività

        var newRow = row+1;

        var newRecipe = recipes[row].flow.split(5);
        if(recipes.length === row+1) // se l'array contiene come ultimo elemento la ricetta corrente
            recipes[newRow]= new Recipe(parseInt(recipes[row].id)+1, newRecipe);
        else{
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
            //addInTheMiddle(newRow, recipes, newRecipe);
        }

        lastCreatedActivityId += 1;
        var type = document.getElementById("itemA"+stateId.slice(5,6)).innerText;
        var newActivity2 = createActivity(lastCreatedActivityId, newRow, column + 1, type);
        //aggiorna img ultimo stato
        document.getElementById("imgS" + stateId.slice(5,6)).src = "simbols/arrow2.png";
        //crea tre nuovi stati
        lastCreatedStateId += 1;
        var splitState = createState(lastCreatedStateId, newRow, column, "simbols/arrow3.png");

        container.appendChild(newActivity2);
        container.appendChild(splitState);

        currentState.column += 2;
        stackRecipe.addElementToStack("divide");

    }
}

function highlight(id) {
    var obj;
    var style;
    obj = document.getElementById(id);
    objSelected.id = id;
    //obj.style.backgroundColor = "white";
    //obj.style.borderColor = "red";
    style = window.getComputedStyle(obj);
    objSelected.column = style.getPropertyValue('grid-column-start');
    objSelected.row = style.getPropertyValue('grid-row-start');
    if(objSelected.id.indexOf("itemS")!== -1 && document.getElementById("state-button") == null){
        obj.appendChild(showStateButton(id, parseInt(objSelected.row), parseInt(objSelected.column)));
    }
    else if (objSelected.id.indexOf("itemA") !== -1 && document.getElementById("activity-button") == null){
        obj.appendChild(showActivityButton(parseInt(objSelected.row), parseInt(objSelected.column), obj.innerText));
        obj.appendChild(showDeleteButton(parseInt(objSelected.row), parseInt(objSelected.column)));
    }


}

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

function showActivityButton(row, column, type){
    var item = document.createElement("div");
    item.setAttribute("id", "activity-button");
    item.style.gridColumn = (column+1) +"/ "+(column+1);
    item.style.gridRow = row +"/ "+row;
    item.style.display = "inline-block";
    if(column === 2 && row === 1)
        type= "MASHING";
    switch(type){
        case "MASHING": {
            item.appendChild(createActivityButton(row, column, "MASHING"));
            item.appendChild(createActivityButton(row, column, "BOILING"));
            item.appendChild(createActivityButton(row, column, "FERMENTATION"));
            item.appendChild(createActivityButton(row, column, "BOTTLING"));
            break;
        }
        case "BOILING": {
            item.appendChild(createActivityButton(row, column, "BOILING"));
            item.appendChild(createActivityButton(row, column, "FERMENTATION"));
            item.appendChild(createActivityButton(row, column, "BOTTLING"));
            break;
        }
        case "FERMENTING": {
            item.appendChild(createActivityButton(row, column, "FERMENTATION"));
            item.appendChild(createActivityButton(row, column, "BOTTLING"));
            break;
        }
        case "BOTTLING":{
            item.appendChild(createActivityButton(row, column, "BOTTLING"));
            break;
        }
    }
    /*
    var buttonAddMashing = document.createElement("button");
    var buttonAddBoiling = document.createElement("button");
    var buttonAddFermentation = document.createElement("button");
    var buttonAddBottling = document.createElement("button");
    buttonAddMashing.innerText = " ADD MASHING";
    buttonAddBoiling.innerText = "ADD BOILING";
    buttonAddFermentation.innerText = "ADD FERMENTATION";
    buttonAddBottling.innerText = "ADD BOTTLING";
    buttonAddMashing.onclick = function () { addActivity(row, column, "MASHING"); }
    buttonAddMashing.setAttribute("class", "button");
    buttonAddBoiling.onclick = function () { addActivity(row, column, "BOILING"); }
    buttonAddBoiling.setAttribute("class", "button");
    buttonAddFermentation.onclick = function (ev) { addActivity(row, column, "FERMENTATION"); }
    buttonAddFermentation.setAttribute("class", "button");
    buttonAddBottling.onclick = function () { addActivity(row, column, "BOTTLING"); }
    buttonAddBottling.setAttribute("class", "button");
    item.appendChild(buttonAddMashing);
    item.appendChild(buttonAddBoiling);
    item.appendChild(buttonAddFermentation);
    item.appendChild(buttonAddBottling);
    */
    return item;
}

function createActivityButton(row, column, text){
    var button = document.createElement("button");
    button.innerText = text;
    button.onclick = function (){addActivity(row, column, text);}
    button.setAttribute("class", "button");

    return button;
}

function showDeleteButton(row, column){
    var item = document.createElement("div");
    item.setAttribute("id", "delete-button");
    item.style.gridColumn = (column-1) + "/ " + (column -1);
    item.style.gridRow = row +"/ "+row;
    item.style.display = "inline-block";
    var buttonDelete = document.createElement("button");
    buttonDelete.innerText = "X";
    //buttonDelete.setAttribute("onclick", "deleteActivity();");
    buttonDelete.onclick = function (){deleteActivity();}
    buttonDelete.setAttribute("class", "button");
    item.appendChild(buttonDelete);
    return item;
}

function unhighlight(id){
    var obj;
    obj = document.getElementById(id);
    objSelected.id = id;
    obj.style.background = "none";
    if(objSelected.id.indexOf("itemS")!== -1)
        obj.removeChild(document.getElementById("state-button"));
    else if(objSelected.id.indexOf("itemA")!== -1) {
        obj.removeChild(document.getElementById("delete-button"));
        obj.removeChild(document.getElementById("activity-button"));
    }

}

function addInTheMiddle(position, array, elementToAdd){
    var newArray=[];

    for(var i=position; i<array.length; i++){
        newArray.push(array[i]);
        array.splice(position)
    }

    array.push(elementToAdd);

    for(var i=0; i<array.length; i++){
        array.push(newArray[i]);
    }


}
