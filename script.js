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
    "vol","og","fg","abv","ebc","ibu","co2"]);

const equipment = {

    name: "Mini inox 8l",
    id: 2,

    mash_max_volume : 11.5,
    mash_efficiency_weight : 0.70,
    mash_false_bottom_volume: 2,
    mash_loss : 1,

    sparge_max_volume : 8,

    boil_max_volume : 14.5,
    boil_evaporation_rate : 2.1,
    boil_loss : 0.5,

    whirlpool_loss : 0,

    fermentation_max_volume: 15,
    fermentation_loss: 0.5,

};

let malts = [
    { name : 'Pilsner', weight : 2, ebc  : 3 },
    { name : 'Maris Otter', weight : 6.2, ebc : 3.2 },
    { name : 'Crystal', weight : 0.4, ebc  : 160 },
    { name : 'Brown Malt', weight : 0.2, ebc  : 200 }
];

let hops = [
    {name : 'Cascade', type : 'Pellet', weight : 20, aa : 5.5, time :  60, after_hot_break : true},
    {name : 'EKG', type : 'Pellet', weight : 55, aa : 5.9, time : 60, after_hot_break : true},
    {name : 'EKG', type : 'Pellet', weight : 25, aa : 5.9, time : 30, after_hot_break : true}

];

let yeasts = [{ name: 'WYeast London ESB', type : 'liquid', attenuation : 75}];

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
    let obj_flow = document.getElementById("flow-buttons-"+id);
    let obj_activity = document.getElementById("activity-buttons-"+id);
    let obj_delete =  document.getElementById("delete-buttons-"+id);
    let targetObj = setObjectSelected(id);

    if (targetObj.type === "flow" && document.getElementById("flow-button") == null) {
        obj_flow.appendChild(showFlowButton(targetObj));
        let shifter = document.getElementsByClassName("grid-item-row" + targetObj.row);
        if (parseInt(targetObj.position) === parseInt(shifter[shifter.length - 1].getAttribute("position"))){
            obj_activity.appendChild(showActivityButton(targetObj));
            let i = 1;
        }
    } else if (targetObj.type === "activity" && document.getElementById("delete-button") == null) {
        let temp = showDeleteButton(targetObj);
        obj_delete.appendChild(temp);
        let i = 1;
    }

}

function disappear(){
    let id = event.currentTarget.id;
    let obj_flow = document.getElementById("flow-buttons-"+id);
    let obj_activity = document.getElementById("activity-buttons-"+id);
    let obj_delete =  document.getElementById("delete-buttons-"+id);

    let targetObj = setObjectSelected(id);
    if (targetObj.type === "flow") {
        obj_flow.removeChild(document.getElementById("flow-button"));
        if (document.getElementById("activity-button") !== null)
            obj_activity.removeChild(document.getElementById("activity-button"));
    }
    else if (targetObj.type === "activity") {
        obj_delete.removeChild(document.getElementById("delete-button"));
    }


}

//mostra i pulsanti mergeActivities e split sullo stato
function showFlowButton(obj){
    let item = document.createElement("div");
    item.setAttribute("id", "flow-button");
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
    buttonSplit.setAttribute("class", "flow-button");
    buttonSplit.onclick = function () { splitActivities(obj); };
    buttonSplit.onmouseover = function (){
        splitImg.style.height = "35px";
        splitImg.style.width = "35px";

    };
    buttonSplit.onmouseleave = function (){
        splitImg.style.height = "30px";
        splitImg.style.width = "30px";

    };
    buttonMerge.setAttribute("class", "flow-button");
    buttonMerge.onclick = function () {
        flowToMerge = document.getElementById(obj.id);
        selectFlowsToMerge(obj.column, "#DC143C");
    };
    buttonMerge.onmouseover = function (){
        mergeImg.style.height = "35px";
        mergeImg.style.width = "35px";

    };
    buttonMerge.onmouseleave = function (){
        mergeImg.style.height = "30px";
        mergeImg.style.width = "30px";

    };

    buttonList.setAttribute("class", "flow-button");
    buttonList.onclick = function () { showParams(obj); };
    buttonList.onmouseover = function (){
        listImg.style.height = "35px";
        listImg.style.width = "35px";

    };
    buttonList.onmouseleave = function (){
        listImg.style.height = "30px";
        listImg.style.width = "30px";

    };

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
    button.onclick = function (){
        addActivity(obj, text);};
    button.onmouseover = function (){button.style.fontSize = "23px"};
    button.onmouseleave = function (){button.style.fontSize = "18px"};
    button.setAttribute("class", "activity-button");
    button.style.fontSize = "18px";

    return button;
}

//mostra il pulsante 'elimina'
function showDeleteButton(obj){

    let item = document.createElement("div");
    item.setAttribute("id", "delete-button");
    let buttonDelete = document.createElement("button");
    let deleteImg = document.createElement("img");
    deleteImg.setAttribute("src", "symbols/icon/delete-black.png");
    deleteImg.setAttribute("class", "icon");
    buttonDelete.appendChild(deleteImg);
    buttonDelete.setAttribute("class", "delete-button");
    buttonDelete.onclick = function () {
        deleteActivity(obj); };
    buttonDelete.onmouseover = function (){
        deleteImg.style.height = "35px";
        deleteImg.style.width = "35px";

    };
    buttonDelete.onmouseleave = function (){
        deleteImg.style.height = "30px";
        deleteImg.style.width = "30px";

    };
    item.appendChild(buttonDelete);
    return item;
}

function showParams(obj){
    let paramsSpace = document.getElementById("params-" + obj.id);
    if(!areParamsVisible) {
        paramsSpace.style.display = "inline";
        document.getElementById("vol-"+obj.id).innerText = "Volume: " + Math.round(recipes[obj.row].flow.process[obj.position].plan.vol * 100) / 100;
        document.getElementById("og-"+obj.id).innerText = "Densità originale: " + Math.round(recipes[obj.row].flow.process[obj.position].plan.og * 100) / 100;
        document.getElementById("fg-"+obj.id).innerText = "Densità finale: " + Math.round(recipes[obj.row].flow.process[obj.position].plan.fg * 100) / 100;
        document.getElementById("abv-"+obj.id).innerText = "Alcol (vol): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.abv * 100) / 100;
        document.getElementById("ebc-"+obj.id).innerText = "Colore (EBC): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.ebc * 100) / 100;
        document.getElementById("ibu-"+obj.id).innerText = "Amarezza (IBU): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.ibu * 100) / 100;
        document.getElementById("co2-"+obj.id).innerText = "Carbonazione (g/l): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.co2 * 100) / 100;
        areParamsVisible=true;
    }else{
        paramsSpace.style.display = "none";
        areParamsVisible=false;
    }
}

function showData(ident, position, row){
    let wrapper = document.getElementById("wrapper_"+ident);
    if(position == null && row == null ){
        row = window.getComputedStyle(event.currentTarget).getPropertyValue('grid-row-start');
        position = event.currentTarget.getAttribute("position");
    }
    wrapper.setAttribute("ref-pos", position);
    wrapper.setAttribute("ref-row", row);
    var visible = wrapper.getAttribute("about");
    if(visible === "false") {
        let data = document.getElementById("data_"+ident);
        data.style.display = "inline";
        wrapper.setAttribute("about", "true");
    }

    let recipe = recipes[row].flow;

    switch(ident){
        case activity.MASHING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }
            document.getElementById(ident+"_mash_water").value = params.mash_water;
            document.getElementById(ident+"_sparge_water").value = params.sparge_water;
            document.getElementById(ident+"_efficiency").value = params.mash_efficiency_weight;
            document.getElementById(ident+"_mash_loss").value = params.mash_loss;

            let maltslist = document.getElementById(ident+"_malt0");
            for(let i=0; i<malts.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = malts[i].name;
                opt.value = malts[i].name;
                maltslist.appendChild(opt);
            }
            let selectedMaltName = maltslist.options[maltslist.selectedIndex].value;
            let selectedMalt;

            for(let i=0; i<malts.length;i++){
                if(malts[i].name == selectedMaltName){
                    selectedMalt = malts[i];
                }
            }
            document.getElementById(ident+"_EBC0").value = selectedMalt.ebc;
            document.getElementById(ident+"_weight0").value = selectedMalt.weight;
            break;
        }
        case activity.BOILING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }

            /*
            params.time = 70;
            params.whirlpool = 10;
            params.hops.push(hops[0]);
            recipe.brew();
            */

            document.getElementById(ident+"_time").value = params.time;
            document.getElementById(ident+"_whirpool").value = params.whirlpool;
            document.getElementById(ident+"_sugar").value = params.sugar_addition.qty;
            document.getElementById(ident+"_water").value = params.water_addition;
            document.getElementById(ident+"_boil_loss").value = params.boil_loss;
            let hopslist = document.getElementById(ident+"_hop0");
            for(let i=0; i<hops.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = hops[i].name;
                opt.value = hops[i].name;
                hopslist.appendChild(opt);
            }
            let selectedHopName = hopslist.options[hopslist.selectedIndex].value;
            let selectedHop;

            for(let i=0; i<hops.length;i++){
                if(hops[i].name == selectedHopName){
                    selectedHop = hops[i];
                }
            }
            document.getElementById(ident+"_aa0").value = selectedHop.aa;
            document.getElementById(ident+"_weight0").value = selectedHop.weight;
            document.getElementById(ident+"_time0").value = selectedHop.time;
            break;
        }
        case activity.FERMENTING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }
            /*
            params.temperature = 19;
            params.yeast = yeasts[0];
            recipe.brew();
            */

            let yeastslist = document.getElementById(ident+"_yeast0");
            for(let i=0; i<yeasts.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = yeasts[i].name;
                opt.value = yeasts[i].name;
                yeastslist.appendChild(opt);
            }
            let selectedYeastName = yeastslist.options[yeastslist.selectedIndex].value;
            let selectedYeast;

            for(let i=0; i<yeasts.length;i++){
                if(yeasts[i].name == selectedYeastName){
                    selectedYeast = yeasts[i];
                }
            }
            document.getElementById(ident+"_aa0").value = selectedYeast.attenuation;
            document.getElementById(ident+"_temp").value = params.temperature;
            document.getElementById(ident+"_water").value = params.water_addition;
            document.getElementById(ident+"_sugar").value = params.sugar_addition.qty;
            break;
        }
        case activity.BOTTLING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }
            break;
        }
    }
}

function hideData(ident){
    if(ident == null) {
        let button = event.currentTarget;
        ident = button.getAttribute("id").substring(6);
    }
    let space = document.getElementById("wrapper_"+ident);
    var visible = space.getAttribute("about");
    if(visible === "true") {
        let data = document.getElementById("data_"+ident);
        data.style.display = "none";
        space.setAttribute("about", "false");
    }
}



//aggiunge un'attivit‡
function addActivity(obj, activityType){

    let container = document.getElementById("grid-container");
    let recipe = recipes[obj.row].flow;
    let flowType;
    let path;
    switch(activityType){
        case activity.MASHING: {
            let params;
            recipe.add_mash();
            /*
            if(recipe.process[obj.position+1].name === "Split"){
                params = recipe.process[obj.position+3].params;
            } else{

                params = recipe.process[obj.position+1].params;
            }*/
            showData(activity.MASHING, obj.position+1, obj.row);

            /*
            params.mash_water = 8;
            params.sparge_water = 7;
            params.mash_efficiency_weight = recipe.equipment.mash_efficiency_weight;
            params.mash_loss = equipment.mash_loss;
            params.malts.push(malts[0]);
            recipe.brew();
            */

            /*
            document.getElementById(activityType+"_mash_water").value = params.mash_water;
            document.getElementById(activityType+"_sparge_water").value = params.sparge_water;
            document.getElementById(activityType+"_efficiency").value = params.mash_efficiency_weight;
            document.getElementById(activityType+"_mash_loss").value = params.mash_loss;

            let maltslist = document.getElementById(activityType+"_malt0");
            for(let i=0; i<malts.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = malts[i].name;
                opt.value = malts[i].name;
                maltslist.appendChild(opt);
            }
            let selectedMaltName = maltslist.options[maltslist.selectedIndex].value;
            let selectedMalt;

            for(let i=0; i<malts.length;i++){
                if(malts[i].name == selectedMaltName){
                    selectedMalt = malts[i];
                }
            }
            document.getElementById(activityType+"_EBC0").value = selectedMalt.ebc;
            document.getElementById(activityType+"_weight0").value = selectedMalt.weight;
*/
            flowType = flow.POST_MASH_WORT;
            path = "symbols/tubing/mash.png";
            break;
        }
        case activity.BOILING: {
            recipe.add_boil();
            /*
            let params;
            if(recipe.process[obj.position+1].name === "Split"){
                params = recipe.process[obj.position+3].params;
            } else{

                params = recipe.process[obj.position+1].params;
            }
            */
            showData(activity.BOILING, obj.position+1, obj.row);

            /*
            params.time = 70;
            params.whirlpool = 10;
            params.hops.push(hops[0]);
            recipe.brew();


            document.getElementById(activityType+"_time").value = params.time;
            document.getElementById(activityType+"_whirpool").value = params.whirlpool;
            document.getElementById(activityType+"_sugar").value = params.sugar_addition.qty;
            document.getElementById(activityType+"_water").value = params.water_addition;
            document.getElementById(activityType+"_boil_loss").value = params.boil_loss;
            let hopslist = document.getElementById(activityType+"_hop0");
            for(let i=0; i<hops.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = hops[i].name;
                opt.value = hops[i].name;
                hopslist.appendChild(opt);
            }
            let selectedHopName = hopslist.options[hopslist.selectedIndex].value;
            let selectedHop;

            for(let i=0; i<hops.length;i++){
                if(hops[i].name == selectedHopName){
                    selectedHop = hops[i];
                }
            }
            document.getElementById(activityType+"_aa0").value = selectedHop.aa;
            document.getElementById(activityType+"_weight0").value = selectedHop.weight;
            document.getElementById(activityType+"_time0").value = selectedHop.time;
            */
            flowType = flow.POST_BOIL_WORT;
            path = "symbols/tubing/boil.png";
            break;
        }
        case activity.FERMENTING: {
            recipe.add_ferment();
            /*
            let params;
            if(recipe.process[obj.position+1].name === "Split"){
                params = recipe.process[obj.position+3].params;
            } else{

                params = recipe.process[obj.position+1].params;
            }*/
            showData(activity.FERMENTING, obj.position+1, obj.row);
            /*
            params.temperature = 19;
            params.yeast = yeasts[0];
            recipe.brew();


            let yeastslist = document.getElementById(activityType+"_yeast0");
            for(let i=0; i<yeasts.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = yeasts[i].name;
                opt.value = yeasts[i].name;
                yeastslist.appendChild(opt);
            }
            let selectedYeastName = yeastslist.options[yeastslist.selectedIndex].value;
            let selectedYeast;

            for(let i=0; i<yeasts.length;i++){
                if(yeasts[i].name == selectedYeastName){
                    selectedYeast = yeasts[i];
                }
            }
            document.getElementById(activityType+"_aa0").value = selectedYeast.attenuation;
            document.getElementById(activityType+"_temp").value = params.temperature;
            document.getElementById(activityType+"_water").value = params.water_addition;
            document.getElementById(activityType+"_sugar").value = params.sugar_addition.qty;
            */
            flowType = flow.FLAT_BEER;
            path = "symbols/tubing/ferment.png";
            break;
        }
        case activity.BOTTLING:{
            recipe.add_bottle();
            /*
            let params;
            if(recipe.process[obj.position+1].name === "Split"){
                params = recipe.process[obj.position+3].params;
            } else{

                params = recipe.process[obj.position+1].params;
            }*/
            showData(activity.BOTTLING, obj.position+1, obj.row);
            flowType = flow.CARBONATED_BEER;
            path = "symbols/tubing/bottle.png";
            break;
        }
    }


    recipes[obj.row].addElementToStack(recipe.process[recipe.process.length-1].name);

    //crea una nuova attività con id incrementato
    obj.position++;
    let newActivity = createActivity(obj.row, obj.column + 1, path,  activityType, obj.position);
    //crea un nuovo stato con id incrementato
    obj.position++;
    let newState = createFlow(obj.row, obj.column + 2, "symbols/tubing/simple.png", flowType, obj.position);

    container.appendChild(newActivity);
    container.appendChild(newState);
}

//unisce due attivit‡
function selectFlowsToMerge(column, color){
    let container = document.getElementById("grid-container");
    let targetFlows = [];
    let style;

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
        let newActivity = createActivity(row, parseInt(column) + 1, "symbols/tubing/"+activityType+".png", parseInt(selectedFlow.getAttribute("position"))+1);

        let shifter = document.getElementsByClassName('grid-item-row'+row);
        for(let i = 0; i< shifter.length; i++){
            let columnToChange = parseInt(window.getComputedStyle(shifter[i]).getPropertyValue('grid-column-start'));
            if(columnToChange > column){
                columnToChange +=2;
                shifter[i].style.gridColumn = columnToChange + "/ " + columnToChange;
            }
        }

        if(parseInt(row) < styleFlowToMerge.getPropertyValue('grid-row-start')){
            document.getElementById("imgS" + flowToMerge.getAttribute("id").substring(2)).src = "symbols/tubing/leftcornerup.png";
            document.getElementById("imgS" + selectedFlow.getAttribute("id").substring(2)).src = "symbols/tubing/singleintersectiondown.png";
        }else{
            document.getElementById("imgS" + flowToMerge.getAttribute("id").substring(2)).src = "symbols/tubing/leftcornerup.png";
            document.getElementById("imgS" + selectedFlow.getAttribute("id").substring(2)).src = "symbols/tubing/singleintersectionup.png";
        }
        let newFlow = createFlow(row, parseInt(column) + 2, "symbols/tubing/simple.png",
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
    let splitStack = recipes[obj.row].splitStack;

    let newRow = obj.row+1;
    let newRecipe = homebrewlib.newRecipe();
    recipes[obj.row].flow.add_split(obj.position, newRecipe);
    recipes[obj.row].setSplit(obj.row, newRow, obj.position);

    if(recipes.length === obj.row+1) // se l'array contiene come ultimo elemento la ricetta corrente
        recipes[newRow] = new Recipe(parseInt(recipes[obj.row].id) + 1, newRecipe, flow.MASH_WATER);

    else{ //altrimenti shifta in basso le altre ricette per lasciar spazio a quella nuova
        for(let i=recipes.length-1; i>=newRow; i--){
            let shifter = document.getElementsByClassName("grid-item-row"+i);
            for(let j=shifter.length-1; j>=0; j--){
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

    let img = document.getElementById("imgS" + obj.id.substring(2, 3));
    if(img.src.includes("simple") || img.src.includes("begin"))
        img.src = "symbols/tubing/singleintersectiondown.png";
    else
        img.src = "symbols/tubing/doublesplit.png";
    img.style.height = "200px";

    let splitState = createFlow(newRow, obj.column, "symbols/tubing/rightcornerup.png", obj.about, obj.position+2);


    for (let i = 0; i<splitStack.length; i++){
        if(splitStack[i].destRecipeId > newRow && splitStack[i].position < obj.position+2){
            let shifter = document.getElementsByClassName("grid-item-row"+obj.row);
            for(let j=0; j<shifter.length; j++){
                if(parseInt(shifter[j].getAttribute("position")) === splitStack[i].position){
                    let column = window.getComputedStyle(shifter[j]).getPropertyValue('grid-column-start');
                    let connection = createFlow(newRow, column ,"symbols/tubing/vertical.png", "connection", -1 );
                    container.appendChild(connection);
                }
            }
        }
    }


    container.appendChild(splitState);

}


//inizializza una nuova attivit‡
function createActivity(row, column, path, about, pos){
    lastCreatedElement+=1;
    let grid_item;
    let elem_container;
    let img;
    let delete_buttons;

    grid_item = document.createElement("div");
    grid_item.setAttribute("class", "grid-item-row"+row);
    grid_item.setAttribute("id", "el"+lastCreatedElement);
    grid_item.setAttribute("type", "activity");
    grid_item.setAttribute("position", pos);
    grid_item.setAttribute("about", about);

    grid_item.onmouseover = function () { appear(); };
    grid_item.onmouseleave = function () { disappear();};
    grid_item.ondblclick = function () {showData(about);};


    grid_item.style.gridColumn = column +"/ "+column;

    elem_container = document.createElement("div");
    elem_container.setAttribute("class", "elem-container");

    delete_buttons = document.createElement("div");
    delete_buttons.setAttribute("class", "delete-buttons");
    delete_buttons.setAttribute("id", "delete-buttons-el"+lastCreatedElement);
    elem_container.appendChild(delete_buttons);

    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +lastCreatedElement);
    img.setAttribute("class", "img");
    img.setAttribute("height", "200px");

    img.style.marginLeft = "-1px";
    img.style.marginRight = "-1px";
    img.style.marginBottom = "-1px";
    img.style.marginTop = "-1px";

    elem_container.appendChild(img);

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
    let activity_buttons;
    let flow_buttons;

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
    grid_item.style.marginLeft = "0px";
    grid_item.style.marginRight = "0px";

    elem_container = document.createElement("div");
    elem_container.setAttribute("class", "elem-container");

    flow_buttons = document.createElement("div");
    flow_buttons.setAttribute("class", "flow-buttons");
    flow_buttons.setAttribute("id", "flow-buttons-el"+lastCreatedElement);
    flow_buttons.style.zIndex = "+2";
    elem_container.appendChild(flow_buttons);

    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +lastCreatedElement);
    img.setAttribute("class", "img");
    img.setAttribute("height", "200px");

    img.style.marginLeft = "-1px";
    img.style.marginRight = "-1px";
    img.style.marginBottom = "-1px";
    img.style.marginTop = "-1px";


    elem_container.appendChild(img);

    params = document.createElement("div");
    params.setAttribute("class", "params");
    params.setAttribute("id", "params-el"+lastCreatedElement);
    setParams(params, lastCreatedElement);
    params.style.display = "none";
    elem_container.appendChild(params);

    activity_buttons = document.createElement("div");
    activity_buttons.setAttribute("class", "activity-buttons");
    activity_buttons.setAttribute("id", "activity-buttons-el"+lastCreatedElement);
    elem_container.appendChild(activity_buttons);

    grid_item.appendChild(elem_container);

    return grid_item;
}

function setParams(item, id){
    for(let i=0; i<params.length; i++){
        let p = document.createElement("p");
        p.setAttribute("id", paramsId[i] + "-el"+id);
        p.setAttribute("class","param");
        item.appendChild(p);
    }

}

function saveMash(){
    let wrapper = document.getElementById("wrapper_mash");
    let id = wrapper.getAttribute("ref-row");
    let position = wrapper.getAttribute("ref-pos");
    let recipe = recipes[id].flow;
    let params = recipe.process[position].params;
    params.mash_water = parseInt(document.getElementById("mash_mash_water").value);
    params.sparge_water = parseInt(document.getElementById("mash_sparge_water").value);
    params.mash_efficiency_weight = parseInt(document.getElementById("mash_efficiency").value);
    params.mash_loss = parseFloat(document.getElementById("mash_mash_loss").value);


    let maltslist = document.getElementById("mash_malt0");
    let selectedMaltName = maltslist.options[maltslist.selectedIndex].value;


    for(let i=0; i<malts.length;i++){
        if(malts[i].name == selectedMaltName){
            params.malts.push(malts[i]);
            params.malts[i].ebc = parseInt(document.getElementById("mash_EBC0").value);
            params.malts[i].weight = parseInt(document.getElementById("mash_weight0").value);
        }
    }


    recipe.brew();
    hideData("mash");

}

function saveBoil(){
    let wrapper = document.getElementById("wrapper_boil");
    let id = wrapper.getAttribute("ref-row");
    let position = wrapper.getAttribute("ref-pos");
    let recipe = recipes[id].flow;
    let params = recipe.process[position].params;

    params.time = parseInt(document.getElementById("boil_time").value);
    params.whirlpool = parseInt(document.getElementById("boil_whirpool").value);
    params.sugar_addition = parseInt(document.getElementById("boil_sugar").value);
    params.water_addition= parseInt(document.getElementById("boil_water").value);
    params.boil_loss = parseInt(document.getElementById("boil_boil_loss").value);

    let hopslist = document.getElementById("boil_hop0");
    let selectedHopName = hopslist.options[hopslist.selectedIndex].value;

    for(let i=0; i<hops.length;i++){
        if(hops[i].name == selectedHopName){
            params.hops.push(hops[i]);
            params.hops[i].aa = parseInt(document.getElementById("boil_aa0").value);
            params.hops[i].weight = parseInt(document.getElementById("boil_weight0").value);
            params.hops[i].time = parseInt(document.getElementById("boil_time0").value);
        }
    }


    recipe.brew();
    hideData("boil");

}

function saveFerment(){
    let wrapper = document.getElementById("wrapper_ferment");
    let id = wrapper.getAttribute("ref-row");
    let position = wrapper.getAttribute("ref-pos");
    let recipe = recipes[id].flow;
    let params = recipe.process[position].params;

    params.temperature = parseInt(document.getElementById("ferment_temp").value);
    params.water_addition = parseInt(document.getElementById("ferment_water").value);
    params.sugar_addition.qty = parseInt(document.getElementById("ferment_sugar").value);

    let yeastslist = document.getElementById("ferment_yeast0");
    let selectedYeastName = yeastslist.options[yeastslist.selectedIndex].value;

    for(let i=0; i<yeasts.length;i++){
        if(yeasts[i].name == selectedYeastName){
            params.yeast.push(yeasts[i]);
            params.yeast[i].attenuation = parseInt(document.getElementById("ferment_aa0").value);
        }
    }

    recipe.brew();
    hideData("ferment");
}

function saveBottle(){

}

