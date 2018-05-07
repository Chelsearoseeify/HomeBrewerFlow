const flow = Object.freeze({
    "MASH_WATER":"Mash water",
    "POST_MASH_WORT":"Post-mash wort",
    "POST_BOIL_WORT":"Post-boil wort",
    "FLAT_BEER":"Flat beer",
    "CARBONATED_BEER":"Carbonated beer"});

const activity = Object.freeze({
    "MASHING":"mash",
    "BOILING":"boil",
    "FERMENTING":"ferment",
    "BOTTLING":"bottle"});

const params = Object.freeze([
    "Volume:","Densità originale:","Densità finale:","Alcol (vol):",
    "Colore (EBC):","Amarezza (IBU):","Carbonazione (g/l):"]);

const paramsId = Object.freeze([
    "abv","og","fg","vol","ebc","ibu","co2"]);

const equipment = {

    mash_max_volume : 50,
    mash_efficiency_weight : 0.751,
    mash_efficiency_potential : 0.91,
    mash_false_bottom_volume: 5,
    mash_loss : 0,

    sparge_max_volume : 50,

    boil_max_volume : 70,
    boil_evaporation_rate : 8.3,
    boil_loss : 2,

    whirlpool_loss : 0,

    fermentation_max_volume: 60,
    fermentation_loss: 1.5,

};

let malts = [
    { name:'Maris Otter', weight : 6.2, ebc : 3.2 },
    { name : 'Crystal', weight : 0.4, ebc  : 160 },
    { name : 'Brown Malt', weight : 0.2, ebc  : 200 }
];

let hops = [
    {name : 'EKG', type : 'Pellet', weight : 55, aa : 5.9, time : 60, after_hot_break : true},
    {name : 'EKG', type : 'Pellet', weight : 25, aa : 5.9, time : 30, after_hot_break : true},
    {name : 'EKG', type : 'Pellet', weight : 20, aa : 5.9, time :  1, after_hot_break : true},
];

let isToMerged = false;
let flowToMerge;
let areParamsVisible = false;

let lastCreatedElement = 0;

let objSelected = {
    id: "id",
    column: 1,
    row: 1,
    type: "",
    position: "",
    about: ""
};

function MemorySplit(origin, destination, position){
    this.orRecipeId = origin;
    this.destRecipeId = destination;
    this.position = position;
}

function Recipe(id, recipe, first_action){
    this.id = id; //id corresponds to the row in which the recipe is setted
    this.flow = recipe;
    this.stack = [first_action];
    this.splitStack = [];


    this.setSplit = function(origin, destination, position){
        this.splitStack.push(new MemorySplit(origin, destination, position));
    };

    this.addElementToStack = function(action){
        this.stack.push(action);
    };

    this.removeLastElementFromStack = function(){
        this.stack.pop();
    }

}


let recipes = [];
let recipe;

initRecipe();


//inizializza una ricetta
function initRecipe (){
    recipe = new Recipe(1, homebrewlib.newRecipe(), flow.MASH_WATER);
    recipes[1] = recipe;
    recipes[1].flow.set_equipment(equipment);
    recipes[1].flow.brew();
}

function setRecipeName(){
    let title = document.getElementById("recipe_name").value;
    recipes[0] = title;
}

function setObjectSelected(id){
    let obj = document.getElementById(id);
    let style = window.getComputedStyle(obj);

    objSelected.id = id;
    objSelected.column = parseInt(style.getPropertyValue('grid-column-start'));
    objSelected.row = parseInt(style.getPropertyValue('grid-row-start'));
    objSelected.type = obj.getAttribute("type");
    objSelected.position = parseInt(obj.getAttribute("position"));
    objSelected.about = obj.getAttribute("about");

    return objSelected;
}


function appear() {
    let id = event.currentTarget.id;
    let obj = document.getElementById("buttons-"+id);
    let targetObj = setObjectSelected(id);

    if (targetObj.type === "flow" && document.getElementById("flow-button") == null) {
        obj.appendChild(showFlowButton(targetObj));
        let shifter = document.getElementsByClassName("grid-item-row" + targetObj.row);
        if (parseInt(targetObj.position) === parseInt(shifter[shifter.length - 1].getAttribute("position")))
            obj.appendChild(showActivityButton(targetObj));
    } else if (targetObj.type === "activity" && document.getElementById("delete-button") == null) {
        obj.appendChild(showDeleteButton(targetObj));
    }

}

function disappear(){
    let id = event.currentTarget.id;
    let obj = document.getElementById("buttons-"+id);
    let targetObj = setObjectSelected(id);
    if (targetObj.type === "flow") {
        obj.removeChild(document.getElementById("flow-button"));
        if (document.getElementById("activity-button") !== null)
            obj.removeChild(document.getElementById("activity-button"));
    }
    else if (targetObj.type === "activity") {
        obj.removeChild(document.getElementById("delete-button"));
    }


}

//mostra i pulsanti mergeActivities e split sullo stato
function showFlowButton(obj){
    let item = document.createElement("div");
    item.setAttribute("id", "flow-button");
    item.style.display = "inline-block";
    let buttonSplit = document.createElement("button");
    let buttonMerge = document.createElement("button");
    let buttonList = document.createElement("button");
    let splitImg = document.createElement("img");
    let mergeImg = document.createElement("img");
    let listImg = document.createElement("img");
    splitImg.setAttribute("src", "symbols/icon/split-black.png");
    splitImg.setAttribute("class", "icon");
    mergeImg.setAttribute("src", "symbols/icon/merge-black.png");
    mergeImg.setAttribute("class", "icon");
    listImg.setAttribute("src", "symbols/icon/list-black.png");
    listImg.setAttribute("class", "icon");
    buttonSplit.appendChild(splitImg);
    buttonMerge.appendChild(mergeImg);
    buttonList.appendChild(listImg);
    buttonSplit.setAttribute("class", "button");
    buttonSplit.onclick = function () { splitActivities(obj); }
    buttonMerge.setAttribute("class", "button");
    buttonMerge.onclick = function () {
        flowToMerge = document.getElementById(obj.id);
        selectFlowsToMerge(obj.column, "#DC143C");
    };

    buttonList.setAttribute("class", "button");
    buttonList.onclick = function () { showParams(obj); }

    item.appendChild(buttonSplit);
    item.appendChild(buttonMerge);
    item.appendChild(buttonList);
    return item;
}

//mostra i pulsanti che aggiungono attivit‡
function showActivityButton(obj){
    let item = document.createElement("div");
    item.setAttribute("id", "activity-button");
    item.style.display = "inline-block";

    switch(obj.about){ // a seconda dell'attivit‡ si avranno pi˘ o meno scelte
        case flow.MASH_WATER:
        case flow.POST_MASH_WORT: {
            item.appendChild(createActivityButton(obj, activity.MASHING));
            item.appendChild(createActivityButton(obj, activity.BOILING));
            item.appendChild(createActivityButton(obj, activity.FERMENTING));
            item.appendChild(createActivityButton(obj, activity.BOTTLING));
            break;
        }
        case flow.POST_BOIL_WORT: {
            item.appendChild(createActivityButton(obj, activity.BOILING));
            item.appendChild(createActivityButton(obj, activity.FERMENTING));
            item.appendChild(createActivityButton(obj, activity.BOTTLING));
            break;
        }
        case flow.FLAT_BEER: {
            item.appendChild(createActivityButton(obj, activity.FERMENTING));
            item.appendChild(createActivityButton(obj, activity.BOTTLING));
            break;
        }
        case flow.CARBONATED_BEER:{
            item.appendChild(createActivityButton(obj, activity.BOTTLING));
            break;
        }
    }
    return item;
}

function createActivityButton(obj, text){
    let button = document.createElement("button");
    button.innerText = text;
    button.onclick = function (){ addActivity(obj, text);}
    button.setAttribute("class", "button");
    button.style.fontSize = "18px";

    return button;
}

//mostra il pulsante 'elimina'
function showDeleteButton(obj){
    let item = document.createElement("div");
    item.setAttribute("id", "delete-button");
    item.style.gridColumn = (obj.column-1) + "/ " + (obj.column -1);
    item.style.gridRow = obj.row +"/ "+ obj.row;
    item.style.display = "inline-block";
    let buttonDelete = document.createElement("button");
    //buttonDelete.innerText = "X";
    buttonDelete.onclick = function (){deleteActivity(obj);}
    buttonDelete.setAttribute("class", "button");
    let deleteImg = document.createElement("img");
    deleteImg.setAttribute("src", "symbols/icon/delete-black.png");
    deleteImg.setAttribute("class", "icon");
    buttonDelete.appendChild(deleteImg);
    item.appendChild(buttonDelete);
    return item;
}

function showParams(obj){
    let paramsSpace = document.getElementById("params-" + obj.id);
    if(!areParamsVisible) {
        paramsSpace.style.display = "inline";
        document.getElementById("abv-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.abv;
        document.getElementById("og-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.og;
        document.getElementById("fg-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.fg;
        document.getElementById("vol-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.vol;
        document.getElementById("ebc-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.ebc;
        document.getElementById("ibu-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.ibu;
        document.getElementById("co2-"+obj.id).value = recipes[obj.row].flow.process[obj.position].plan.co2;
        areParamsVisible=true;
    }else{
        paramsSpace.style.display = "none";
        areParamsVisible=false;
    }
}

function showData(ident){
    let wrapper = document.getElementById("wrapper_"+ident);
    var visible = wrapper.getAttribute("about");
    if(visible === "false") {
        let data = document.getElementById("data_"+ident);
        data.style.display = "inline";
        wrapper.setAttribute("about", "true");
    }
}

function hideData(){
    let space = event.currentTarget;
    let id= space.getAttribute("id").substring(8);
    var visible = space.getAttribute("about");
    if(visible === "true") {
        let data = document.getElementById("data_"+id);
        data.style.display = "none";
        space.setAttribute("about", "false");
    }
}


//aggiunge un'attivit‡
function addActivity(obj, activityType){

    let container = document.getElementById("grid-container");
    let recipe = recipes[obj.row].flow;
    let flowType;
    switch(activityType){
        case activity.MASHING: {
            recipe.add_mash();
            showData(activity.MASHING);
            document.getElementById(activityType+"_mash_water").value = recipe.process[obj.position+1].params.mash_water;
            document.getElementById(activityType+"_sparge_water").value = recipe.process[obj.position+1].params.sparge_water;
            document.getElementById(activityType+"_efficiency").value = recipe.process[obj.position+1].params.mash_efficiency_weight;
            document.getElementById(activityType+"_mash_loss").value = recipe.process[obj.position+1].params.mash_loss;
            recipe.process[obj.position+1].params.malts = malts[0];
            recipe.brew();
            flowType = flow.POST_MASH_WORT;
            break;
        }
        case activity.BOILING: {
            recipe.add_boil();
            showData(activity.BOILING);
            document.getElementById(activityType+"_time").value = recipe.process[obj.position+1].params.time;
            document.getElementById(activityType+"_whirpool").value = recipe.process[obj.position+1].params.whirlpool;
            document.getElementById(activityType+"_sugar").value = recipe.process[obj.position+1].params.sugar_addition;
            document.getElementById(activityType+"_water").value = recipe.process[obj.position+1].params.water_addition;
            flowType = flow.POST_BOIL_WORT;
            break;
        }
        case activity.FERMENTING: {
            recipe.add_ferment();
            showData(activity.FERMENTING);
            document.getElementById(activityType+"_temp").value = recipe.process[obj.position+1].params.temperature;
            document.getElementById(activityType+"_water").value = recipe.process[obj.position+1].params.water_addition;
            document.getElementById(activityType+"_sugar").value = recipe.process[obj.position+1].params.sugar_addition;
            flowType = flow.FLAT_BEER;
            break;
        }
        case activity.BOTTLING:{
            recipe.add_bottle();
            showData(activity.BOTTLING);
            flowType = flow.CARBONATED_BEER;
            break;
        }
    }


    recipes[obj.row].addElementToStack(recipe.process[recipe.process.length-1].name);

    //crea una nuova attività con id incrementato
    obj.position++;
    let newActivity = createActivity(obj.row, obj.column + 1, activityType, obj.position);
    //crea un nuovo stato con id incrementato
    obj.position++;
    let newState = createFlow(obj.row, obj.column + 2, "symbols/arrow.png", flowType, obj.position);

    container.appendChild(newActivity);
    container.appendChild(newState);
}

//unisce due attivit‡
function selectFlowsToMerge(column, color){
    let container = document.getElementById("grid-container");
    let targetFlows = [];
    let style

    for(let i=1; i<recipes.length; i++ ){
        let elementsInARow = container.getElementsByClassName("grid-item-row"+i);
        for(let j =0; j<elementsInARow.length; j++){
            style = window.getComputedStyle(elementsInARow[j]);
            let columnToCheck = style.getPropertyValue('grid-column-start');

            if(parseInt(columnToCheck) === parseInt(column))
                targetFlows.push(elementsInARow[j]);
        }
    }

    isToMerged = true;
    for(let i=0; i<targetFlows.length; i++){
        targetFlows[i].style.backgroundColor = color;
    }

}

function mergeActivities(){
    let id = event.currentTarget.id;
    let selectedFlow = document.getElementById(id);
    let style = window.getComputedStyle(selectedFlow);
    let row = style.getPropertyValue('grid-row-start');
    let column = style.getPropertyValue('grid-column-start');
    let activityType;

    switch(selectedFlow.getAttribute("about")){
        case flow.MASH_WATER:
        case flow.POST_MASH_WORT: {
            activityType = activity.MASHING;
            break;
        }
        case flow.POST_BOIL_WORT: {
            activityType = activity.BOILING;
            break;
        }
        case flow.FLAT_BEER: {
            activityType = activity.FERMENTING;
            break;
        }
        case flow.CARBONATED_BEER:{
            activityType = activity.BOTTLING;
            break;
        }

    }

    if(isToMerged===true && flowToMerge !== selectedFlow){
        let container = document.getElementById("grid-container");
        let styleFlowToMerge = window.getComputedStyle(flowToMerge);
        let newActivity = createActivity(row, parseInt(column) + 1, activityType, parseInt(selectedFlow.getAttribute("position"))+1);

        let shifter = document.getElementsByClassName('grid-item-row'+row);
        for(let i = 0; i< shifter.length; i++){
            let columnToChange = parseInt(window.getComputedStyle(shifter[i]).getPropertyValue('grid-column-start'));
            if(columnToChange > column){
                columnToChange +=2;
                shifter[i].style.gridColumn = columnToChange + "/ " + columnToChange;
            }
        }

        if(parseInt(row) < styleFlowToMerge.getPropertyValue('grid-row-start')){
            document.getElementById("imgS" + flowToMerge.getAttribute("id").substring(2)).src = "symbols/arrow5.png";
            document.getElementById("imgS" + selectedFlow.getAttribute("id").substring(2)).src = "symbols/arrow2.png";
        }else{
            document.getElementById("imgS" + flowToMerge.getAttribute("id").substring(2)).src = "symbols/arrow6.png";
            document.getElementById("imgS" + selectedFlow.getAttribute("id").substring(2)).src = "symbols/arrow3.png";
        }
        let newFlow = createFlow(row, parseInt(column) + 2, "symbols/arrow.png",
            selectedFlow.getAttribute("about"), parseInt(selectedFlow.getAttribute("position"))+2);
        recipes[window.getComputedStyle(flowToMerge).getPropertyValue('grid-row-start')].flow.add_merge(selectedFlow.getAttribute("position"), recipes[row].flow, selectedFlow.getAttribute("position"));
        container.appendChild(newActivity);
        container.appendChild(newFlow);

        selectFlowsToMerge(column, "#f5f5f5");
        isToMerged =false;

    }
}

//elimina un'attivit‡ e quelle successive sulla sua row
function deleteActivity(obj){

    let container = document.getElementById("grid-container");
    let elementsInARow = document.getElementsByClassName("grid-item-row"+obj.row);

    for(let i = elementsInARow.length-1; i>=0; i--) {
        let currentPos = elementsInARow[i].getAttribute("position");
        if(currentPos >= obj.position){
            container.removeChild(document.getElementById(elementsInARow[i].getAttribute("id")));

            if(i%2 === 0)
                recipes[obj.row].removeLastElementFromStack();
        }
    }
    recipes[obj.row].flow.delete(obj.position);

    if(recipes[obj.row].splitStack.length !== 0){
        for(let i=0; i<recipes[obj.row].splitStack.length; i++){
            let rowToDelete = recipes[obj.row].splitStack[i].destRecipeId;
            let posOfSplittedRecipe = recipes[obj.row].splitStack[i].position;
            if(obj.position <= posOfSplittedRecipe){
                recipes.splice(rowToDelete,1);
                let recipeToDelete = document.getElementsByClassName("grid-item-row"+rowToDelete);
                for(let i = recipeToDelete.length-1; i>=0; i--){
                    container.removeChild(document.getElementById(recipeToDelete[i].getAttribute("id")));
                }

                for(let i=rowToDelete+1; i<=recipes.length; i++){
                    let shifter = document.getElementsByClassName("grid-item-row"+i);
                    for(let j=0; j<shifter.length; j){
                        shifter[j].classList.add("grid-item-row"+(i-1));
                        shifter[j].classList.remove("grid-item-row"+i);
                    }
                }
            }
        }
    }

}

//divide la ricetta dando origine ad una nuova
function splitActivities(obj){
    let container = document.getElementById("grid-container");
    //crea due nuove attivit‡
    let newRow = obj.row+1;
    let newRecipe = homebrewlib.newRecipe();
    recipes[obj.row].flow.add_split(obj.position, newRecipe);
    recipes[obj.row].setSplit(obj.row, newRow, obj.position);
    //var newRecipe = recipes[row].flow.split(5);
    if(recipes.length === obj.row+1) // se l'array contiene come ultimo elemento la ricetta corrente
        recipes[newRow] = new Recipe(parseInt(recipes[obj.row].id) + 1, newRecipe, flow.MASH_WATER);

    else{ //altrimenti shifta in basso le altre ricette per lasciar spazio a quella nuova
        for(let i=newRow; i<recipes.length; i++){
            let shifter = document.getElementsByClassName("grid-item-row"+i);
            for(let j=0; j<shifter.length; j){
                shifter[j].classList.add("grid-item-row"+(i+1));
                shifter[j].classList.remove("grid-item-row"+i);
            }
            for(let j=0; j<recipes[obj.row].splitStack.length-1; j++){
                if(recipes[obj.row].splitStack[j].destRecipeId === newRow)
                    recipes[obj.row].splitStack[j].destRecipeId +=1;
            }
        }
        //recipes[newRow]= new Recipe(parseInt(recipes[row].id)+1, newRecipe);
        for(let i=newRow; i<recipes.length; i++){
            recipes[i].id +=1;
        }
        recipes.splice(newRow, 0, new Recipe(parseInt(recipes[obj.row].id)+1, newRecipe, flow.MASH_WATER));
    }

    //var originStack = recipes[row].stack;
    for( let i = 1; i<=obj.position; i++){
        let temp = recipes[obj.row].flow.process[i];
        if(temp.type === "flow" && temp.name !== "Split flow")
            recipes[newRow].addElementToStack(temp.name);
    }

    let shifterPosition = document.getElementsByClassName("grid-item-row"+obj.row);
    for(let i=obj.position+1; i<shifterPosition.length; i++){
        let newPosition = parseInt(shifterPosition[i].getAttribute("position"));
        newPosition +=2;
        shifterPosition[i].setAttribute("position", newPosition);
    }

    document.getElementById("imgS" + obj.id.substring(2, 3)).src = "symbols/arrow2.png";

    let splitState = createFlow(newRow, obj.column, "symbols/arrow3.png",obj.about, obj.position+2);

    container.appendChild(splitState);

}


//inizializza una nuova attivit‡
function createActivity(row, column, about, pos){
    lastCreatedElement+=1;
    let grid_item;
    let elem_container;
    let buttons;
    grid_item = document.createElement("div");
    grid_item.setAttribute("class", "grid-item-row"+row);
    grid_item.setAttribute("id", "el"+lastCreatedElement);
    grid_item.setAttribute("type", "activity");
    grid_item.setAttribute("position", pos);
    grid_item.setAttribute("about", about);
    grid_item.onmouseover = function () { appear(); };
    grid_item.onmouseleave = function () { disappear();};
    grid_item.innerText = about;
    grid_item.style.gridColumn = column +"/ "+column;

    elem_container = document.createElement("div");
    elem_container.setAttribute("class", "elem-container");

    buttons = document.createElement("div");
    buttons.setAttribute("class", "buttons");
    buttons.setAttribute("id", "buttons-el"+lastCreatedElement);
    elem_container.appendChild(buttons);

    grid_item.appendChild(elem_container);

    return grid_item;
}

//inizializza un nuovo stato
function createFlow(row, column, path, about,  pos){
    lastCreatedElement+=1;
    let grid_item;
    let elem_container;
    let img;
    let params;
    let buttons;

    grid_item = document.createElement("div");

    grid_item.setAttribute("class", "grid-item-row"+row);

    grid_item.setAttribute("id", "el"+lastCreatedElement);
    grid_item.setAttribute("type", "flow");
    grid_item.setAttribute("position", pos);
    grid_item.setAttribute("about", about);

    grid_item.onmouseover = function () { appear(); };
    grid_item.onmouseleave = function () { disappear();};
    grid_item.onclick = function (){ mergeActivities();};

    grid_item.style.gridColumn = column +"/ "+column;
    //grid_item.style.paddingRight = "5px";
    //grid_item.style.paddingLeft = "5px";

    elem_container = document.createElement("div");
    elem_container.setAttribute("class", "elem-container");

    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +lastCreatedElement);
    //img.style.paddingTop ="5px";

    elem_container.appendChild(img);

    params = document.createElement("div");
    params.setAttribute("class", "params");
    params.setAttribute("id", "params-el"+lastCreatedElement);
    setParams(params, lastCreatedElement);
    params.style.display = "none";
    elem_container.appendChild(params);

    buttons = document.createElement("div");
    buttons.setAttribute("class", "buttons");
    buttons.setAttribute("id", "buttons-el"+lastCreatedElement);
    elem_container.appendChild(buttons);

    grid_item.appendChild(elem_container);

    return grid_item;
}

function setParams(item, id){
    for(let i=0; i<params.length; i++){
        let p = document.createElement("p");
        p.innerText = params[i];
        let param = document.createElement("input");
        param.setAttribute("id", paramsId[i] + "-el"+id);
        param.setAttribute("class","param");
        param.setAttribute("type", "number");
        param.style.width = "3em";
        p.appendChild(param);
        item.appendChild(p);
    }

}

