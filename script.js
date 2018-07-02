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
    { name : '-', weight : 0, ebc  : 0 },
    { name : 'Pilsner', weight : 2, ebc  : 3 },
    { name : 'Maris Otter', weight : 6.2, ebc : 3.2 },
    { name : 'Crystal', weight : 0.4, ebc  : 160 },
    { name : 'Brown Malt', weight : 0.2, ebc  : 200 }
];

let hops = [
    {name : '-', type : 'Pellet', weight : 0, aa : 0, time :  0, after_hot_break : true},
    {name : 'Cascade', type : 'Pellet', weight : 20, aa : 5.5, time :  60, after_hot_break : true},
    {name : 'EKG', type : 'Pellet', weight : 55, aa : 5.9, time : 60, after_hot_break : true},
    {name : 'EKG', type : 'Pellet', weight : 25, aa : 5.9, time : 30, after_hot_break : true}

];

let yeasts = [
    { name: '-', type : '-', attenuation : 0},
    { name: 'WYeast London ESB', type : 'liquid', attenuation : 75}];

let isToMerged = false;
let flowToMerge;
//let areParamsVisible = false;

let lastCreatedElement = 0;
let lastMalt = 0;
let lastHop =0;
let lastYeast = 0;

let objSelected = {
    id: "id",
    column: 1,
    row: 1,
    type: "",
    position: "",
    about: ""
};

function MemorySplit(origin, destination, position, column){
    this.orRecipeId = origin;
    this.destRecipeId = destination;
    this.position = position;
    this.column = column
}

function Recipe(id, recipe, first_action){
    this.id = id; //id corresponds to the row in which the recipe is setted
    this.flow = recipe;
    this.stack = [first_action];
    this.splitStack = [];


    this.setSplit = function(origin, destination, position, column){
        this.splitStack.push(new MemorySplit(origin, destination, position, column));
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

    objSelected.position = parseInt(obj.getAttribute("position"));
    if(!(objSelected.position === -1)){
        objSelected.id = id;
        objSelected.column = parseInt(style.getPropertyValue('grid-column-start'));
        objSelected.row = parseInt(style.getPropertyValue('grid-row-start'));
        objSelected.type = obj.getAttribute("type");
        objSelected.about = obj.getAttribute("about");
        if(!(objSelected.about === "Mash water") && objSelected.type === "flow" ){
            //objSelected.previousFlowAbout = recipes[objSelected.row].flow.process[objSelected.position - 2].name;
            let i=0;
            objSelected.previousFlowAbout = recipes[objSelected.row].flow.process[objSelected.position - 2-i].name;
            while(objSelected.previousFlowAbout.includes("Split flow")||objSelected.previousFlowAbout.includes("Start flow")){
                objSelected.previousFlowAbout = recipes[objSelected.row].flow.process[objSelected.position - 2-i].name;
                i +=2;
            }
        }
        return objSelected;
    }else
        return null;

}

function getRow(obj){
    return parseInt(window.getComputedStyle(obj).getPropertyValue("grid-row-start"));

}
function getColumn(obj){
    return parseInt(window.getComputedStyle(obj).getPropertyValue("grid-column-start"));
}

function getImage(obj){
    return document.getElementById("imgS"+obj.getAttribute("id").substring(2));
}


function appear() {
    let id = event.currentTarget.id;
    let targetObj = setObjectSelected(id);
    if(targetObj != null){
        let obj_flow = document.getElementById("flow-buttons-"+id);
        let obj_activity = document.getElementById("activity-buttons-"+id);
        let obj_delete =  document.getElementById("delete-buttons-"+id);


        if (targetObj.type === "flow" && document.getElementById("flow-button") == null) {
            obj_flow.appendChild(showFlowButton(targetObj));
            let shifter = document.getElementsByClassName("grid-item-row" + targetObj.row);
            let arr = [0];
            for(let i=0; i<shifter.length;i++){
                arr[i] = parseInt(shifter[i].getAttribute("position"));
            }
            let temp = Math.max.apply(Math, arr);
            if (parseInt(targetObj.position) === Math.max.apply(Math, arr)){
                obj_activity.style.display = "inline";
                obj_activity.appendChild(showActivityButton(targetObj));
                let i = 1;
            }
        } else if (targetObj.type === "activity" && document.getElementById("delete-button") == null) {
            let temp = showDeleteButton(targetObj);
            obj_delete.appendChild(temp);
            let i = 1;
        }
    }
}

function disappear(objId){
    let id;
    if(objId === undefined)
        id = event.currentTarget.id;
    else
        id = objId;
    let obj_flow = document.getElementById("flow-buttons-"+id);
    let obj_activity = document.getElementById("activity-buttons-"+id);
    let obj_delete =  document.getElementById("delete-buttons-"+id);

    let targetObj = setObjectSelected(id);
    if(targetObj != null){
        if (targetObj.type === "flow") {
            obj_flow.removeChild(document.getElementById("flow-button"));
            if (document.getElementById("activity-button") !== null){
                obj_activity.removeChild(document.getElementById("activity-button"));
                obj_activity.style.display = "none";
            }

        }
        else if (targetObj.type === "activity") {
            obj_delete.removeChild(document.getElementById("delete-button"));
        }
    }
}

//mostra i pulsanti mergeActivities e split sullo stato
function showFlowButton(obj){
    let item = document.createElement("div");
    item.setAttribute("id", "flow-button");
    item.setAttribute("class", "flow-buttons-container");

    if(!obj.about.includes("Split")){

        let buttonSplit = document.createElement("button");
        let splitImg = document.createElement("img");
        splitImg.setAttribute("src", "symbols/icon/split-black.png");
        splitImg.setAttribute("class", "icon");
        buttonSplit.appendChild(splitImg);
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

        item.appendChild(buttonSplit);
    }

    let temp = document.getElementById("imgS"+obj.id.substring(2)).src;
    if(!(temp.includes("corner") || obj.about.includes("Merged"))){
        let buttonMerge = document.createElement("button");
        let mergeImg = document.createElement("img");
        mergeImg.setAttribute("src", "symbols/icon/merge-black.png");
        mergeImg.setAttribute("class", "icon");
        buttonMerge.appendChild(mergeImg);
        buttonMerge.setAttribute("class", "flow-button");
        buttonMerge.onclick = function () {

            flowToMerge = document.getElementById(obj.id);
            colorFlowsToMerge(obj.column, true);
        };
        buttonMerge.onmouseover = function (){
            mergeImg.style.height = "35px";
            mergeImg.style.width = "35px";

        };
        buttonMerge.onmouseleave = function (){
            mergeImg.style.height = "30px";
            mergeImg.style.width = "30px";

        };

        item.appendChild(buttonMerge);
    }else{
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
    }

    let buttonList = document.createElement("button");
    let listImg = document.createElement("img");
    listImg.setAttribute("src", "symbols/icon/list-black.png");
    listImg.setAttribute("class", "icon");
    buttonList.appendChild(listImg);
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


    item.appendChild(buttonList);
    return item;
}

//mostra i pulsanti che aggiungono attivit‡
function showActivityButton(obj){
    let item = document.createElement("div");
    item.setAttribute("id", "activity-button");
    item.setAttribute("class", "activity-buttons-container");
    item.style.height = "120px";
    item.style.display = "table-cell";
    item.style.verticalAlign = "middle";
    let type;
    if(obj.about === "Start flow" || obj.about === "Split flow" || obj.about === "Merged flow")
         type = obj.previousFlowAbout;
    else
        type = obj.about;

    switch(type){ // a seconda dell'attivit‡ si avranno pi˘ o meno scelte
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
    button.style.display = "block";

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

    let buttonList = document.createElement("button");
    let listImg = document.createElement("img");
    listImg.setAttribute("src", "symbols/icon/list-black.png");
    listImg.setAttribute("class", "icon");
    buttonList.appendChild(listImg);
    buttonList.setAttribute("class", "flow-button");
    buttonList.onclick = function () {
        showWrapper(obj); };
    buttonList.onmouseover = function (){
        listImg.style.height = "35px";
        listImg.style.width = "35px";
    };
    buttonList.onmouseleave = function (){
        listImg.style.height = "30px";
        listImg.style.width = "30px";
    };

    item.appendChild(buttonList);
    return item;
}

function showParams(obj){
    let paramsSpace = document.getElementById("params-" + obj.id);
    let areParamsVisible = paramsSpace.getAttribute("about");
    if(areParamsVisible == "false") {
        paramsSpace.style.display = "inline";
        updateParams(obj);
        paramsSpace.setAttribute("about", "true");
    }else{
        paramsSpace.style.display = "none";
        paramsSpace.setAttribute("about", "false");
    }
}

function showWrapper(obj){
    let wrapper = document.getElementById("wrapper-" + obj.id);
    let isWrapperVisible = wrapper.getAttribute("about");
    if(isWrapperVisible == "false") {
        wrapper.style.display = "inline";
        showDataInActivity(obj.about, obj.position, obj.row, obj.id);
        wrapper.setAttribute("about", "true");
    }else{
        wrapper.style.display = "none";
        wrapper.setAttribute("about", "false");
    }
    update();
}

function updateParams(obj){
    document.getElementById("vol-"+obj.id).innerText = "Volume: " + Math.round(recipes[obj.row].flow.process[obj.position].plan.vol * 1000) / 1000;
    document.getElementById("og-"+obj.id).innerText = "Densità originale: " + Math.round(recipes[obj.row].flow.process[obj.position].plan.og * 1000) / 1000;
    document.getElementById("fg-"+obj.id).innerText = "Densità finale: " + Math.round(recipes[obj.row].flow.process[obj.position].plan.fg * 1000) / 1000;
    document.getElementById("abv-"+obj.id).innerText = "Alcol (vol): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.abv * 1000) / 1000;
    document.getElementById("ebc-"+obj.id).innerText = "Colore (EBC): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.ebc * 1000) / 1000;
    document.getElementById("ibu-"+obj.id).innerText = "Amarezza (IBU): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.ibu * 1000) / 1000;
    document.getElementById("co2-"+obj.id).innerText = "Carbonazione (g/l): " + Math.round(recipes[obj.row].flow.process[obj.position].plan.co2 * 1000) / 1000;

}

function showDataInActivity(type, position, row, id){
    let recipe = recipes[row].flow;

    switch(type){
        case activity.MASHING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }
            document.getElementById(id+"_mash_water").value = params.mash_water;
            document.getElementById(id+"_sparge_water").value = params.sparge_water;
            document.getElementById(id+"_efficiency").value = params.mash_efficiency_weight;
            document.getElementById(id+"_mash_loss").value = params.mash_loss;

            let maltslist = document.getElementById(id+"_"+type+"_malt0");
            if(maltslist.options[0] == null){
                for(let i=0; i<malts.length; i++){
                    var opt = document.createElement("option");
                    opt.innerHTML = malts[i].name;
                    opt.value = malts[i].name;
                    maltslist.appendChild(opt);
                }
            }

            let selectedMaltName = maltslist.options[maltslist.selectedIndex].value;
            let selectedMalt;

            for(let i=0; i<malts.length;i++){
                if(malts[i].name == selectedMaltName){
                    selectedMalt = malts[i];
                }
            }
            document.getElementById(id+"_malt_EBC0").value = selectedMalt.ebc;
            document.getElementById(id+"_malt_weight0").value = selectedMalt.weight;
            break;
        }
        case activity.BOILING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }

            document.getElementById(id+"_time").value = params.time;
            document.getElementById(id+"_whirpool").value = params.whirlpool;
            document.getElementById(id+"_sugar").value = params.sugar_addition.qty;
            document.getElementById(id+"_water").value = params.water_addition;
            document.getElementById(id+"_boil_loss").value = params.boil_loss;

            let hopslist = document.getElementById(id+"_"+type+"_hop0");
            for(let i=0; i<hops.length; i++){
                var opt = document.createElement("option");
                opt.innerHTML = hops[i].name;
                opt.value = hops[i].name;
                hopslist.appendChild(opt);
            }
            let selectedHopName = hopslist.options[hopslist.selectedIndex].value;
            let selectedHop;

            for(let i=0; i<hops.length;i++){
                if(hops[i].name === selectedHopName){
                    selectedHop = hops[i];
                }
            }
            document.getElementById(id+"_hop_aa0").value = selectedHop.aa;
            document.getElementById(id+"_hop_weight0").value = selectedHop.weight;
            document.getElementById(id+"_hop_time0").value = selectedHop.time;
            break;
        }
        case activity.FERMENTING:{
            let params;
            if(recipe.process[position].name === "Split"){
                params = recipe.process[position+2].params;
            } else{

                params = recipe.process[position].params;
            }

            let yeastslist = document.getElementById(id +"_"+type+"_yeast0");
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

            let hopslist = document.getElementById(id+"_"+type+"_hop0");
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
            document.getElementById(id+"_yeast_aa0").value = selectedYeast.attenuation;
            document.getElementById(id+"_hop_aa0").value = selectedHop.aa;
            document.getElementById(id+"_hop_weight0").value = selectedHop.weight;
            document.getElementById(id+"_hop_time0").value = selectedHop.time;
            document.getElementById(id+"_temp").value = params.temperature;
            document.getElementById(id+"_water").value = params.water_addition;
            document.getElementById(id+"_sugar").value = params.sugar_addition.qty;
            document.getElementById(id+"_boil_loss").value = params.fermentation_loss;
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

/*
function showData(ident, position, row){
    let wrapper = document.getElementById("wrapper_"+ident);
    if(position == null && row == null ){
        row = window.getComputedStyle(event.currentTarget).getPropertyValue('grid-row-start');
        position = event.currentTarget.getAttribute("position");
    }
    //wrapper.setAttribute("ref-pos", position);
    //wrapper.setAttribute("ref-row", row);
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
*/


//aggiunge un'attivit‡
function addActivity(obj, activityType){

    let container = document.getElementById("grid-container");
    let recipe = recipes[obj.row].flow;
    let flowType;
    let path;
    switch(activityType){
        case activity.MASHING: {
            recipe.add_mash();
            //showData(activity.MASHING, obj.position+1, obj.row);
            flowType = flow.POST_MASH_WORT;
            path = "symbols/tubingsmall/mash.png";
            break;
        }
        case activity.BOILING: {
            recipe.add_boil();
            //showData(activity.BOILING, obj.position+1, obj.row);
            flowType = flow.POST_BOIL_WORT;
            path = "symbols/tubingsmall/boil.png";
            break;
        }
        case activity.FERMENTING: {
            recipe.add_ferment();
            //showData(activity.FERMENTING, obj.position+1, obj.row);
            flowType = flow.FLAT_BEER;
            path = "symbols/tubingsmall/ferment.png";
            break;
        }
        case activity.BOTTLING:{
            recipe.add_bottle();
            //showData(activity.BOTTLING, obj.position+1, obj.row);
            flowType = flow.CARBONATED_BEER;
            path = "symbols/tubingsmall/bottle.png";
            break;
        }
    }


    recipes[obj.row].addElementToStack(recipe.process[recipe.process.length-1].name);

    //crea una nuova attività con id incrementato
    obj.position++;
    let newActivity = createActivity(obj.row, obj.column + 1, path,  activityType, obj.position);
    //crea un nuovo stato con id incrementato
    obj.position++;
    let newState = createFlow(obj.row, obj.column + 2, "symbols/tubingsmall/simpleSMALL.png", flowType, obj.position);

    container.appendChild(newActivity);
    container.appendChild(newState);
    disappear(obj.id);
}

//unisce due attivit‡
function colorFlowsToMerge(column, selection){
    let container = document.getElementById("grid-container");
    let targetFlows = [];
    let style;
    let complete = true;

    for(let i=1; i<recipes.length; i++ ){
        let elementsInARow = container.getElementsByClassName("grid-item-row"+i);
        for(let j =0; j<elementsInARow.length; j++){
            style = window.getComputedStyle(elementsInARow[j]);
            let columnToCheck = style.getPropertyValue('grid-column-start');

            if(parseInt(columnToCheck) === parseInt(column))
                targetFlows.push(elementsInARow[j]);
        }
    }

    for(let i=0; i<targetFlows.length; i++){
        if(targetFlows[i].getAttribute("about").includes("Split") || targetFlows.length == 1)
            complete = false;
    }

    if(complete) {
        isToMerged = true;
        for (let i = 0; i < targetFlows.length; i++) {
            let id = targetFlows[i].getAttribute("id").substring(2);
            if(selection)
                document.getElementById("imgS"+id).src = "symbols/tubingsmall/simpleSELECTED.png";
            else
                document.getElementById("imgS"+id).src = "symbols/tubingsmall/simpleSMALL.png";
        }
    }

}

function mergeActivities(){
    let id = event.currentTarget.id;
    let selectedFlow = document.getElementById(id);
    let container = document.getElementById("grid-container");

    /*
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


*/


    if(isToMerged===true && flowToMerge !== selectedFlow){
        let styleSelectedFlow = window.getComputedStyle(selectedFlow);
        let rowSelectedFlow = parseInt(styleSelectedFlow.getPropertyValue('grid-row-start'));
        let column = parseInt(styleSelectedFlow.getPropertyValue('grid-column-start'));
        //let container = document.getElementById("grid-container");
        let styleFlowToMerge = window.getComputedStyle(flowToMerge);
        let rowFlowToMerge = parseInt(styleFlowToMerge.getPropertyValue('grid-row-start'));
        //let newActivity = createActivity(row, parseInt(column) + 1, "symbols/tubingsmall/"+activityType+".png", parseInt(selectedFlow.getAttribute("position"))+1);

        colorFlowsToMerge(column, false);

        let shifter = document.getElementsByClassName('grid-item-row'+rowSelectedFlow);
        for(let i = 0; i< shifter.length; i++){
            let columnToChange = parseInt(window.getComputedStyle(shifter[i]).getPropertyValue('grid-column-start'));
            if(columnToChange > column){
                columnToChange +=2;
                shifter[i].style.gridColumn = columnToChange + "/ " + columnToChange;
            }
        }

        if(parseInt(rowSelectedFlow) < styleFlowToMerge.getPropertyValue('grid-row-start')){
            document.getElementById("imgS" + flowToMerge.getAttribute("id").substring(2)).src = "symbols/tubingsmall/leftcornerupSMALL.png";
            document.getElementById("imgS" + selectedFlow.getAttribute("id").substring(2)).src = "symbols/tubingsmall/singleintersectiondownSMALL.png";
            //let img = addBottomImg(selectedFlow, "symbols/tubingsmall/addedtube.png", selectedFlow.getAttribute("id").substring(2), 1);
            //img.style.marginLeft = "0px";
        }else{
            document.getElementById("imgS" + flowToMerge.getAttribute("id").substring(2)).src = "symbols/tubingsmall/leftcornerdownSMALL.png";
            document.getElementById("imgS" + selectedFlow.getAttribute("id").substring(2)).src = "symbols/tubingsmall/singleintersectionupSMALL.png";
        }
        if(Math.abs(rowSelectedFlow-rowFlowToMerge)>1){
            let min = Math.min(rowSelectedFlow, rowFlowToMerge)
            for(let i = 1; i< Math.max(rowFlowToMerge, rowSelectedFlow); i++){
                let currentRow = min+i;
                let elementsCurrentRow = document.getElementsByClassName("grid-item-row"+currentRow);
                for(let j= 0; j<elementsCurrentRow.length;j++){
                    if(parseInt(window.getComputedStyle(elementsCurrentRow[j]).getPropertyValue("grid-column-start")) === column){
                        let connection = createFlow(currentRow, column ,"symbols/tubingsmall/doubleintersectionSMALL.png", "connection", -1 );
                        container.appendChild(connection);
                    }else{
                        let connection = createFlow(currentRow, column ,"symbols/tubingsmall/verticalSMALL.png", "connection", -1 );
                        container.appendChild(connection);
                    }

                }
            }
        }
        let about = selectedFlow.getAttribute("about");
        flowToMerge.setAttribute("about", about + "_merged");
        flowToMerge.setAttribute("destination", selectedFlow.getAttribute("id"));


        //let newFlow = createFlow(row, parseInt(column) + 2, "symbols/tubingsmall/simpleSMALL.png",
            //selectedFlow.getAttribute("about"), parseInt(selectedFlow.getAttribute("position"))+2);
        recipes[window.getComputedStyle(flowToMerge).getPropertyValue('grid-row-start')].flow.add_merge(selectedFlow.getAttribute("position"), recipes[rowSelectedFlow].flow, selectedFlow.getAttribute("position"));
        recipes[window.getComputedStyle(flowToMerge).getPropertyValue('grid-row-start')].flow.brew();
        //container.appendChild(newActivity);
        //container.appendChild(newFlow);
        let newPos = parseInt(selectedFlow.getAttribute("position"))+2;
        selectedFlow.setAttribute("position", newPos);
        selectedFlow.setAttribute("about", recipes[window.getComputedStyle(selectedFlow).getPropertyValue('grid-row-start')].flow.process[newPos].name);


        isToMerged =false;

    }
}

//elimina un'attivit‡ e quelle successive sulla sua row
function deleteActivity(obj){

    let container = document.getElementById("grid-container");
    let elementsInARow = document.getElementsByClassName("grid-item-row"+obj.row);
    let sourceRecipe;
    let posOfSplit;
    let gridcontainer = document.getElementById("grid-container");
    let items = gridcontainer.children;


    if(document.getElementById("imgS"+obj.id.substring(2)).src.includes("corner")){
        for(let i = 1; i<recipes.length; i++){
            for(let j = 0; j<recipes[i].splitStack.length; j++){
                if(recipes[i].splitStack[j].destRecipeId === obj.row){
                    sourceRecipe = recipes[i].splitStack[j].orRecipeId;
                    posOfSplit = recipes[i].splitStack[j].position;
                    recipes[sourceRecipe].flow.delete(posOfSplit+1);
                }
            }
        }
        for(let i = elementsInARow.length-1; i>=0; i--) {
            //let currentPos = elementsInARow[i].getAttribute("position");
            //if(currentPos >= obj.position){
            container.removeChild(document.getElementById(elementsInARow[i].getAttribute("id")));
            /*
            if(i%2 === 0)
                recipes[obj.row].removeLastElementFromStack();
                */
            //}
        }
        recipes.splice(obj.row, 1);
        for(let i = 1; i<recipes.length; i++){
            if(recipes[i].id != i){
                let children = document.getElementsByClassName("grid-item-row"+(i+1));
                for(let j = 0; j<children.length;j++){
                    children[j].style.gridRow = i + "/ " + i;
                    children[j].setAttribute("class", "grid-item-row"+i);
                }
                recipes[i].id = i;
            }
        }
        for (let i = 0; i<items.length; i++){
            if(items[i].getAttribute("position") == posOfSplit+2){
                let id = items[i].getAttribute("id");
                let img = document.getElementById("imgS"+id.substring(2));
                if(img.src.includes("begin"))
                    img.src = "symbols/tubingsmall/beginSMALL.png";
                else if (img.src.includes("simple"))
                    img.src = "symbols/tubingsmall/simpleSMALL.png";
                else
                    img.src = "symbols/tubingsmall/rightcornerupSMALL.png";

            }
        }
        for (let i = 0; i<items.length; i++){
            if(items[i].getAttribute("position") >= posOfSplit+2 &&
                window.getComputedStyle(items[i]).getPropertyValue('grid-row-start') == sourceRecipe){
                items[i].setAttribute("position", parseInt(items[i].getAttribute("position"))-2);
                items[i].setAttribute("about", recipes[sourceRecipe].flow.process[parseInt(items[i].getAttribute("position"))].name);
            }
        }
    }

    if(recipes[obj.row] != null) {
        while (recipes[obj.row].flow.process[obj.position] != null) {
            recipes[obj.row].flow.delete(obj.position);
        }

        if (recipes[obj.row].splitStack.length !== 0) {
            for (let i = 0; i < recipes[obj.row].splitStack.length; i++) {
                let rowToDelete = recipes[obj.row].splitStack[i].destRecipeId;
                let posOfSplittedRecipe = recipes[obj.row].splitStack[i].position;
                if (obj.position <= posOfSplittedRecipe) {
                    recipes.splice(rowToDelete, 1);
                    let recipeToDelete = document.getElementsByClassName("grid-item-row" + rowToDelete);
                    for (let i = recipeToDelete.length - 1; i >= 0; i--) {
                        container.removeChild(document.getElementById(recipeToDelete[i].getAttribute("id")));
                    }

                    for (let i = rowToDelete + 1; i <= recipes.length; i++) {
                        let shifter = document.getElementsByClassName("grid-item-row" + i);
                        for (let j = 0; j < shifter.length; j) {
                            shifter[j].classList.add("grid-item-row" + (i - 1));
                            shifter[j].classList.remove("grid-item-row" + i);
                        }
                    }
                }
            }
        }
    }

    for(let i = 0; i<=items.length-1; i++){
        if(document.getElementById("imgS"+items[i].getAttribute("id").substring(2)).src.includes("leftcorner")){
            let el = document.getElementById(items[i].getAttribute("destination"));
            if(obj.row == window.getComputedStyle(items[i]).getPropertyValue('grid-row-start')){
                let img = document.getElementById("imgS"+el.getAttribute("id").substring(2));
                img.src = "symbols/tubingsmall/simpleSMALL.png"
            }
        }
    }

    for(let i = elementsInARow.length-1; i>=0; i--) {
        let currentPos = elementsInARow[i].getAttribute("position");
        if(currentPos >= obj.position){
        container.removeChild(document.getElementById(elementsInARow[i].getAttribute("id")));
        /*
        if(i%2 === 0)
            recipes[obj.row].removeLastElementFromStack();
            */
        }
    }


    recipes[1].flow.brew();
    update();
}

function fillTheGaps(){
    let container = document.getElementById("grid-container");
    let elements = container.children;

    for(let i = 0; i<elements.length; i++){
        if(document.getElementById("imgS"+elements[i].getAttribute("id").substring(2)).src.includes("singleintersection")){
            let column1 = parseInt(window.getComputedStyle(elements[i]).getPropertyValue("grid-column-start"));
            let row = parseInt(window.getComputedStyle(elements[i]).getPropertyValue("grid-row-start"));
            for(let j=0;j<elements.length;j++){
                let column2 = parseInt(window.getComputedStyle(elements[j]).getPropertyValue("grid-column-start"));
                //let row2 = parseInt(window.getComputedStyle(elements[j]).getPropertyValue("grid-row-start"));
                if(column1 === column2 && row === row+1+j){
                    if(elements[j] == null){
                        let connection = createFlow(row+1, column1 ,"symbols/tubingsmall/verticalSMALL.png", "connection", -1 );
                        container.appendChild(connection);
                    }else if(document.getElementById("imgS" +elements[j].getAttribute("id").substring(2)).src.includes("simple")){
                        let connection = createFlow(row+1, column1 ,"symbols/tubingsmall/doubleintersectionSMALL.png", "connection", -1 );
                        container.appendChild(connection);
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
    let rowprec = obj.row+1;
    let columnprec;
    let rowaft ;
    let columnaft;
    let newRow;


    for(let i = 0; i<splitStack.length; i++){
        if(splitStack[i].column<obj.column){ //c'è uno split prima
            rowprec = splitStack[i].destRecipeId;
            columnprec = splitStack[i].column;
        }
    }
    for(let i = splitStack.length-1; i>=0; i--){
        if(splitStack[i].column>obj.column){ //c'è uno split dopo
            rowaft = splitStack[i].destRecipeId;
            columnaft = splitStack[i].column;
        }
    }
    if(rowaft != null && columnaft != null){
        newRow = rowaft+1;
    }else {
        newRow = rowprec;
    }

    let newRecipe = homebrewlib.newRecipe();
    recipes[obj.row].flow.add_split(obj.position, newRecipe);
    recipes[obj.row].setSplit(obj.row, newRow, obj.position, obj.column);

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
    for(let i=0; i<=shifterPosition.length-1; i++){
        let newPosition = parseInt(shifterPosition[i].getAttribute("position"));
        newPosition +=2;
        shifterPosition[i].setAttribute("position", newPosition);
    }

    let img = document.getElementById("imgS" + obj.id.substring(2));
    if(img.src.includes("simple")) {
        img.src = "symbols/tubingsmall/singleintersectiondownSMALL.png";
        //addBottomImg(document.getElementById(obj.id), "symbols/tubingsmall/addedtube.png", obj.id.substring(2,3), 1);

    }else if(img.src.includes("begin")){
        img.src = "symbols/tubingsmall/splittedbeginSMALL.png";
    }
    else
        img.src = "symbols/tubingsmall/doublesplitSMALL.png";
    img.style.height = "280px";

    let splitFlow = createFlow(newRow, obj.column, "symbols/tubingsmall/rightcornerupSMALL.png", "Start flow", obj.position+2);

    container.appendChild(splitFlow);

    let sourceFlow = document.getElementById(obj.id);
    let about = sourceFlow.getAttribute("about");

    if(!(sourceFlow.getAttribute("about") === "Start flow"))
        splitFlow.setAttribute("source", obj.id);

    else
        splitFlow.setAttribute("source", sourceFlow.getAttribute("source"));

    fillTheGaps();

    /*
    for (let i = 0; i<splitStack.length; i++){
        if(splitStack[i].destRecipeId > newRow && splitStack[i].column <= obj.column){
            let shifter = document.getElementsByClassName("grid-item-row"+newRow);
            for(let j=0; j<shifter.length; j++){
                if(parseInt(window.getComputedStyle(shifter[j]).getPropertyValue('grid-column-start')) > splitStack[i].column){
                    //let column = window.getComputedStyle(shifter[j]).getPropertyValue('grid-column-start');
                    let connection = createFlow(newRow, splitStack[i].column ,"symbols/tubingsmall/verticalSMALL.png", "connection", -1 );
                    container.appendChild(connection);
                }
            }
        }
    }
*/
    /*
    let items = document.getElementsByClassName("grid-item-row"+obj.row);
    for(let i = items.length-1; i>=0; i--){
        if(items[i].getAttribute("position") >= obj.position)
            items[i].setAttribute("position", parseInt(items[i].getAttribute("position"))+2);
            items[i].setAttribute("about", recipes[obj.row].flow.process[parseInt(items[i].getAttribute("position"))].name);
    }
    */
    //sourceFlow.setAttribute("position",obj.position +2);
    //sourceFlow.setAttribute("about", recipes[obj.row].flow.process[obj.position +2].name);
    disappear(obj.id);


}


//inizializza una nuova attivit‡
function createActivity(row, column, path, about, pos){
    lastCreatedElement+=1;
    let grid_item;
    let elem_container;
    let img;
    let delete_buttons;
    let wrapper;

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
    img.setAttribute("height", "280px");

    img.style.marginLeft = "-1px";
    img.style.marginRight = "-1px";
    img.style.marginBottom = "-1px";
    img.style.marginTop = "-1px";

    elem_container.appendChild(img);

    wrapper = createWrapper(about, pos, row, "el"+lastCreatedElement);

    elem_container.appendChild(wrapper);

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

    grid_item.style.gridColumn = column +"/ "+ column;
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
    img.setAttribute("height", "280px");

    img.style.marginLeft = "-1px";
    img.style.marginRight = "-1px";
    img.style.marginBottom = "-1px";
    img.style.marginTop = "-1px";


    elem_container.appendChild(img);

    params = document.createElement("div");
    params.setAttribute("class", "params");
    params.setAttribute("id", "params-el"+lastCreatedElement);
    params.setAttribute("about", "false");
    setParams(params, lastCreatedElement);
    params.style.display = "none";
    elem_container.appendChild(params);

    activity_buttons = document.createElement("div");
    activity_buttons.setAttribute("class", "activity-buttons");
    activity_buttons.setAttribute("id", "activity-buttons-el"+lastCreatedElement);
    activity_buttons.style.zIndex = "+3";
    elem_container.appendChild(activity_buttons);

    if(path.includes("rightcornerup")){
        elem_container.style.position = "relative";
        let split_amount = document.createElement("input");
        split_amount.setAttribute("type", "number");
        split_amount.setAttribute("step", "0.1");
        split_amount.setAttribute("id", "split_amount"+lastCreatedElement);
        split_amount.style.position = "absolute";
        split_amount.style.zIndex = "+4";
        split_amount.style.width = "3em";
        split_amount.style.right = "31px";
        split_amount.style.top ="62px";
        split_amount.onchange = function () {
            setSplitAmount();
        };

        elem_container.appendChild(split_amount);
    }

    grid_item.appendChild(elem_container);

    return grid_item;
}

function addBottomImg(elem_container, path, id, n){
    img = document.createElement("img");
    img.setAttribute("src", path);
    img.setAttribute("id", "imgS" +id+"_add"+n);
    img.setAttribute("class", "img");
    img.setAttribute("height", "106px");

    img.style.marginLeft = "-1px";
    img.style.marginRight = "-1px";
    img.style.marginBottom = "-8px";
    img.style.marginTop = "-1px";

    elem_container.appendChild(img);

    return img;

}

function setSplitAmount(){
    let el = event.currentTarget;
    let gridItem = el.parentElement.parentElement;
    let source_element = document.getElementById(gridItem.getAttribute("source"));
    let targetObj = setObjectSelected(source_element.getAttribute("id"));
    recipes[targetObj.row].flow.process[targetObj.position-1].params.vol = el.value;

    recipes[targetObj.row].flow.brew();
    update();
}

function setParams(item, id){
    for(let i=0; i<params.length; i++){
        let p = document.createElement("p");
        p.setAttribute("id", paramsId[i] + "-el"+id);
        p.setAttribute("class","param");
        item.appendChild(p);
    }

}

function update(){
    recipes[1].flow.brew();
    let gridcontainer = document.getElementById("grid-container");
    let items = gridcontainer.children;

    for(let i=0; i<items.length;i++){
        if(items[i].getAttribute("type") ==="flow"){
            let id = items[i].getAttribute("id");
            let targetObj = setObjectSelected(id);
            let params = document.getElementById("params-"+id);
            if(params.getAttribute("about")=="true")
                updateParams(targetObj);
        }
    }

}

function saveMash(idElement){
    let row = parseInt(window.getComputedStyle(document.getElementById(idElement)).getPropertyValue('grid-row-start'));
    let position = document.getElementById(idElement).getAttribute("position");

    let recipe = recipes[row].flow;
    let params = recipe.process[position].params;
    params.mash_water = parseFloat(document.getElementById(idElement+"_mash_water").value);
    params.sparge_water = parseFloat(document.getElementById(idElement+"_sparge_water").value);
    params.mash_efficiency_weight = parseFloat(document.getElementById(idElement+"_efficiency").value);
    params.mash_loss = parseFloat(document.getElementById(idElement+"_mash_loss").value);

    for(let n=0; n<=lastMalt; n++){
        let maltslist = document.getElementById(idElement+"_mash_malt"+n);
        let selectedMaltName = maltslist.options[maltslist.selectedIndex].value;

        for(let i=0; i<malts.length;i++){
            if(malts[i].name == selectedMaltName){
                params.malts[n] = malts[i];
                let temp1 = idElement+"_malt_EBC"+n;
                let temp = document.getElementById(idElement+"_malt_EBC"+n).value;
                let temp3 = parseFloat(temp);
                params.malts[n].ebc = temp3;
                params.malts[n].weight = parseFloat(document.getElementById(idElement+"_malt_weight"+n).value);
            }
        }
    }
    if(row=1){
        recipes[row].flow.process[0].plan.vol = parseFloat(document.getElementById(idElement+"_mash_water").value);
    }


    recipe.brew();
    update();

}

function saveBoil(idElement){
    let row = parseInt(window.getComputedStyle(document.getElementById(idElement)).getPropertyValue('grid-row-start'));
    let position = document.getElementById(idElement).getAttribute("position");


    let recipe = recipes[row].flow;
    let params = recipe.process[position].params;

    params.time = parseFloat(document.getElementById(idElement+"_time").value);
    params.whirlpool = parseFloat(document.getElementById(idElement+"_whirpool").value);
    params.sugar_addition = parseFloat(document.getElementById(idElement+"_sugar").value);
    params.water_addition= parseFloat(document.getElementById(idElement+"_water").value);
    params.boil_loss = parseFloat(document.getElementById(idElement+"_boil_loss").value);

    for(let n=0; n<=lastHop; n++) {
        let hopslist = document.getElementById(idElement + "_boil_hop"+n);
        let selectedHopName = hopslist.options[hopslist.selectedIndex].value;

        for (let i = 0; i < hops.length; i++) {
            if (hops[i].name == selectedHopName) {
                params.hops[n] = hops[i];
                params.hops[n].aa = parseFloat(document.getElementById(idElement+"_hop_aa"+n).value);
                params.hops[n].weight = parseFloat(document.getElementById(idElement+"_hop_weight"+n).value);
                params.hops[n].time = parseFloat(document.getElementById(idElement+"_hop_time"+n).value);
            }
        }
    }

    recipe.brew();
    update();

}

function saveFerment(idElement){
    let row = parseInt(window.getComputedStyle(document.getElementById(idElement)).getPropertyValue('grid-row-start'));
    let position = document.getElementById(idElement).getAttribute("position");

    let recipe = recipes[row].flow;
    let params = recipe.process[position].params;

    params.temperature = parseFloat(document.getElementById(idElement+"_temp").value);
    params.water_addition = parseFloat(document.getElementById(idElement+"_water").value);
    params.sugar_addition.qty = parseFloat(document.getElementById(idElement+"_sugar").value);

    let yeastslist = document.getElementById(idElement+"_ferment_yeast0");
    let selectedYeastName = yeastslist.options[yeastslist.selectedIndex].value;

    for(let i=0; i<yeasts.length;i++){
        if(yeasts[i].name == selectedYeastName){
            params.yeast[0] = yeasts[i];
            params.yeast[i].attenuation = parseFloat(document.getElementById(idElement+"_yeast_aa0").value);
        }
    }

    for(let n=0; n<=lastHop; n++) {
        let hopslist = document.getElementById(idElement + "_ferment_hop"+n);
        let selectedHopName = hopslist.options[hopslist.selectedIndex].value;

        for (let i = 0; i < hops.length; i++) {
            if (hops[i].name == selectedHopName) {
                params.hops[n] = hops[i];
                params.hops[n].aa = parseFloat(document.getElementById(idElement+"_hop_aa"+n).value);
                params.hops[n].weight = parseFloat(document.getElementById(idElement+"_hop_weight"+n).value);
                params.hops[n].time = parseFloat(document.getElementById(idElement+"_hop_time"+n).value);
            }
        }
    }

    recipe.brew();
    update();
}

function saveBottle(){
    let row = parseInt(window.getComputedStyle(document.getElementById(idElement)).getPropertyValue('grid-row-start'));
    let position = document.getElementById(idElement).getAttribute("position");

    let recipe = recipes[row].flow;
    let params = recipe.process[position].params;
}

function updateData(){

    let el = event.currentTarget;
    let id = el.getAttribute("id").substring(0,3);
    let wrapper = document.getElementById("wrapper-"+id);
    let type = document.getElementById(id).getAttribute("about");
    let row = parseInt(window.getComputedStyle(document.getElementById(id)).getPropertyValue('grid-row-start'));
    let position = document.getElementById(id).getAttribute("position");

    //let id = wrapper.getAttribute("ref-row");
    //let position = wrapper.getAttribute("ref-pos");
    let recipe = recipes[row].flow;
    let params = recipe.process[position].params;

    switch(type){
        case activity.MASHING:{
            saveMash(id);
            break;
        }
        case activity.BOILING:{
            saveBoil(id);
            break;
        }
        case activity.FERMENTING:{
            saveFerment(id);
            break;
        }
        case activity.BOTTLING:{
            saveBottle(id);
            break;
        }
    }
}

function fillMaltsList(idMalt, idEl){
    let maltslist = document.getElementById(idEl+"_mash_malt"+idMalt);
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
    document.getElementById(idEl+"_malt_EBC"+idMalt).value = selectedMalt.ebc;
    document.getElementById(idEl+"_malt_weight"+idMalt).value = selectedMalt.weight;
}

function fillBoilHopsList(idHop, idEl){
    let hopslist = document.getElementById(idEl+"_boil_hop"+idHop);
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
    let temp = idEl+"_hop_aa"+idHop;
    document.getElementById(idEl+"_hop_aa"+idHop).value = selectedHop.aa;
    document.getElementById(idEl+"_hop_weight"+idHop).value = selectedHop.weight;
    document.getElementById(idEl+"_hop_time"+idHop).value = selectedHop.time;

}

function fillFermentHopsList(idHop, idEl){

    let hopslist = document.getElementById(idEl+"_ferment_hop"+idHop);
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
    document.getElementById(idEl+"_hop_aa"+idHop).value = selectedHop.aa;
    document.getElementById(idEl+"_hop_weight"+idHop).value = selectedHop.weight;
    document.getElementById(idEl+"_hop_time"+idHop).value = selectedHop.time;
}

function setOptionParams(id){

    let el = event.currentTarget;
    let idContainer = el.getAttribute("id").substring(0,3);
    if(el.getAttribute("id").includes("malt")){

        let selectedMaltName = el.options[el.selectedIndex].value;
        let selectedMalt;

        for(let i=0; i<malts.length;i++){
            if(malts[i].name == selectedMaltName){
                selectedMalt = malts[i];
            }
        }


        document.getElementById(idContainer+"_malt_EBC"+id).value = selectedMalt.ebc;
        document.getElementById(idContainer+"_malt_weight"+id).value = selectedMalt.weight;

    } else if(el.getAttribute("id").includes("boil") || el.getAttribute("id").includes("ferment_hop")){

        let selectedHopName = el.options[el.selectedIndex].value;
        let selectedHop;

        for(let i=0; i<hops.length;i++){
            if(hops[i].name == selectedHopName){
                selectedHop = hops[i];
            }
        }
        document.getElementById(idContainer+"_hop_aa"+id).value = selectedHop.aa;
        document.getElementById(idContainer+"_hop_weight"+id).value = selectedHop.weight;
        document.getElementById(idContainer+"_hop_time"+id).value = selectedHop.time;

    } else if(el.getAttribute("id").includes("ferment_yeast")){
        let selectedYeastName = el.options[el.selectedIndex].value;
        let selectedYeast;

        for(let i=0; i<yeasts.length;i++){
            if(yeasts[i].name == selectedYeastName){
                selectedYeast = yeasts[i];
            }
        }
        document.getElementById(idContainer+"_yeast_aa"+id).value = selectedYeast.attenuation;
    }

    recipes[1].flow.brew();
    updateData();
    update();

}

function addElement() {
    let el = event.currentTarget;
    let id = el.getAttribute("id").substring(0,3);
    if(el.getAttribute("id").includes("malt")){
        let maltsDiv = document.getElementById("mash_malts_"+id);
        lastMalt +=1;
        let newMalt = document.createElement("div");
        newMalt.setAttribute("id", id+"_malt"+lastMalt+"DIV");

        let select = document.createElement("select");
        select.setAttribute("name", "malt"+lastMalt);
        select.setAttribute("id", id+"_mash_malt"+lastMalt);
        select.setAttribute("num", lastMalt);
        select.onchange= function(){
            setOptionParams(select.getAttribute("num"));
        };

        let labelButton = document.createElement("label");
        let buttonDelete = document.createElement("button");
        buttonDelete.setAttribute("id", id+"_remove_malt"+lastMalt);
        buttonDelete.innerText = "-";
        buttonDelete.onclick = function (){
            removeElement();
        };

        labelButton.appendChild(buttonDelete);


        newMalt.appendChild(select);
        newMalt.appendChild(document.createElement("br"));
        newMalt.appendChild(createOtherLabel("EBC", "EBC"+lastMalt, id, "malt"));
        newMalt.appendChild(createOtherLabel("kg", "weight"+lastMalt, id, "malt"));
        newMalt.appendChild(labelButton);

        maltsDiv.appendChild(newMalt);

        fillMaltsList(lastMalt, id);
    }
    else if(el.getAttribute("id").includes("boil_hop")){
        let hopsDiv = document.getElementById("boil_hops_"+id);
        lastHop +=1;
        let newHop = document.createElement("div");
        newHop.setAttribute("id", id+"_boil_hop"+lastHop+"DIV");

        let select = document.createElement("select");
        select.setAttribute("name", "hop"+lastHop);
        select.setAttribute("id", id+"_boil_hop"+lastHop);
        select.setAttribute("num", lastMalt);
        select.onchange= function(){
            setOptionParams(select.getAttribute("num"));
        };

        let labelButton = document.createElement("label");
        let buttonDelete = document.createElement("button");
        buttonDelete.setAttribute("id", id+"_remove_boil_hop"+lastHop);
        buttonDelete.innerText = "-";
        buttonDelete.onclick = function (){
            removeElement();
        };

        labelButton.appendChild(buttonDelete);


        newHop.appendChild(select);
        newHop.appendChild(document.createElement("br"));
        newHop.appendChild(createOtherLabel("AA%", "aa"+lastHop, id, "hop"));
        newHop.appendChild(createOtherLabel("min", "time"+lastHop, id, "hop"));
        newHop.appendChild(createOtherLabel("g", "weight"+lastHop, id, "hop"));
        newHop.appendChild(labelButton);

        hopsDiv.appendChild(newHop);

        fillBoilHopsList(lastHop, id);
    }else if(el.getAttribute("id").includes("ferment_hop")){
        let hopsDiv = document.getElementById("ferment_hops_"+id);
        lastHop +=1;
        let newHop = document.createElement("div");
        newHop.setAttribute("id", id+"_ferment_hop"+lastHop+"DIV");

        let select = document.createElement("select");
        select.setAttribute("name", "hop"+lastHop);
        select.setAttribute("id", id+"_ferment_hop"+lastHop);
        select.setAttribute("num", lastMalt);
        select.onchange= function(){
            setOptionParams(select.getAttribute("num"));
        };

        let labelButton = document.createElement("label");
        let buttonDelete = document.createElement("button");
        buttonDelete.setAttribute("id", id+"_remove_ferment_hop"+lastHop);
        buttonDelete.innerText = "-";
        buttonDelete.onclick = function (){
            removeElement();
        };

        labelButton.appendChild(buttonDelete);


        newHop.appendChild(select);
        newHop.appendChild(document.createElement("br"));
        newHop.appendChild(createOtherLabel("AA%", "aa"+lastHop, id, "hop"));
        newHop.appendChild(createOtherLabel("giorni", "time"+lastHop, id, "hop"));
        newHop.appendChild(createOtherLabel("g", "weight"+lastHop, id, "hop"));
        newHop.appendChild(labelButton);

        hopsDiv.appendChild(newHop);

        fillFermentHopsList(lastHop, id);
    }

}

function createSelectLabel(id, elemName, unit, lastElCreated){
    let label = document.createElement("label");
    let elem = document.createElement("input");
    elem.setAttribute("type", "number");
    elem.setAttribute("step", "0.1");
    elem.setAttribute("id", id+"_"+elemName+lastElCreated);
    elem.style.width = "3em";
    elem.onchange = function () {
        updateData();
    };
    label.innerText = unit;
    label.appendChild(elem);

    return label;
}

function createLabel(name, id, element, unit){
    let label = document.createElement("label");
    label.innerText = name+":";
    let input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("step", "0.1");
    input.style.width = "3em";
    input.setAttribute("id", element+"_"+id);
    input.onchange = function () {
        updateData();
    };
    label.appendChild(input);
    return label;
}

function createOtherLabel(name, id, element, type, unit){
    let label = document.createElement("label");
    label.innerText = name+":";
    let input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("step", "0.1");
    input.style.width = "3em";
    input.setAttribute("id", element+"_"+type+"_"+id);
    input.onchange = function () {
        updateData();
    };
    label.appendChild(input);
    return label;
}

function removeElement (){
    let el = event.currentTarget;
    let id = el.getAttribute("id");
    let gridEl = document.getElementById(id.substring(0,3));
    let rowEl = getRow(gridEl);
    let divToDelete = document.getElementById(id.substring(0,3)+"_"+id.substring(11)+"DIV");
    if(id.includes("malt")){
        document.getElementById("mash_malts_"+id.substring(0,3)).removeChild(divToDelete);
        recipes[rowEl].flow.process[parseInt(gridEl.getAttribute("position"))].params.malts.splice([parseInt(id.substring(11))],1);
        lastMalt--;
    }else if(id.includes("boil_hop")){
        document.getElementById("boil_hops_"+id.substring(0,3)).removeChild(divToDelete);
        recipes[rowEl].flow.process[parseInt(gridEl.getAttribute("position"))].params.hops.splice([parseInt(id.substring(11))],1);
        lastHop--;
    }else if(id.includes("ferment_hop")){
        document.getElementById("ferment_hops_"+id.substring(0,3)).removeChild(divToDelete);
        recipes[rowEl].flow.process[parseInt(gridEl.getAttribute("position"))].params.hops.splice([parseInt(id.substring(11))],1);
        lastHop--;
    }

    recipes[1].flow.brew();
    updateData();
    update();

}

function createWrapper(type, pos, row, id){
    let wrapper = document.createElement("div");
    wrapper.setAttribute("id", "wrapper-"+id);
    wrapper.setAttribute("class", "wrapper");
    wrapper.setAttribute("about", "false");
    wrapper.setAttribute("ref-pos", pos);
    wrapper.setAttribute("ref-row", row);

    let data = document.createElement("div");
    data.style.zIndex = "+3";

    switch (type){
        case activity.MASHING:{
            createMashElements(data, id, type);
            break;
        }
        case activity.BOILING:{
            createBoilElements(data, id, type);
            break;
        }
        case activity.FERMENTING:{
            createFermentElements(data, id, type);
            break;
        }
        case activity.BOTTLING:{
            createBottleElements(data, id);
            break;
        }
    }

    wrapper.appendChild(data);
    return wrapper;
}

function createMashElements(data, id, type){
    data.appendChild(createLabel("Acqua mashing", "mash_water", id,  "l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Acqua sparging", "sparge_water", id,  "l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Efficienza", "efficiency", id, "%"));

    let malts = document.createElement("div");
    malts.setAttribute("id", type+"_malts_"+id);
    let p = document.createElement("p");
    p.innerText = "Malti";
    malts.appendChild(p);
    let malt0 = document.createElement("div");
    malt0.setAttribute("id", id+"_malt0DIV");
    let select = document.createElement("select");
    select.setAttribute("name", "malt0");
    select.setAttribute("id", id+"_"+type+"_malt0");
    select.setAttribute("num", 0);
    select.onchange = function (){ setOptionParams(select.getAttribute("num"))};
    malt0.appendChild(select);
    malt0.appendChild(document.createElement("br"));
    malt0.appendChild(createOtherLabel("EBC", "EBC0", id, "malt"));
    malt0.appendChild(createOtherLabel("kg", "weight0", id,"malt"));
    let labelButton = document.createElement("label");
    let buttonRemove = document.createElement("button");
    buttonRemove.setAttribute("id", id+"_remove_malt0");
    buttonRemove.onclick = function () {
        removeElement();
    };
    buttonRemove.innerText = "-";
    labelButton.appendChild(buttonRemove);
    malt0.appendChild(labelButton);
    malts.appendChild(malt0);
    data.appendChild(malts);
    let divAddButton = document.createElement("div");
    let buttonAdd = document.createElement("button");
    buttonAdd.setAttribute("id", id+"_add_malt");
    buttonAdd.onclick = function () {
        addElement();
    };

    buttonAdd.innerText = "+";
    divAddButton.appendChild(buttonAdd);
    data.appendChild(divAddButton);

    data.appendChild(createLabel("Perdite", "mash_loss", id, "l"));
}

function createBoilElements(data, id, type){
    data.appendChild(createLabel("Durata", "time", id, "min"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Whirpool", "whirpool", id, "min"));


    let hops = document.createElement("div");
    hops.setAttribute("id", type+"_hops_"+id);
    let p = document.createElement("p");
    p.innerText = "Luppoli";
    hops.appendChild(p);
    let hop0 = document.createElement("div");
    hop0.setAttribute("id", id+"_boil_hop0DIV");
    let select = document.createElement("select");
    select.setAttribute("name", "hop0");
    select.setAttribute("id", id+"_"+type+"_hop0");
    select.setAttribute("num", 0);
    select.onchange = function (){ setOptionParams(select.getAttribute("num"))};
    hop0.appendChild(select);
    hop0.appendChild(document.createElement("br"));
    hop0.appendChild(createOtherLabel("AA%", "aa0", id, "hop"));
    hop0.appendChild(createOtherLabel("min", "time0", id,"hop"));
    hop0.appendChild(createOtherLabel("g", "weight0", id, "hop"));
    let labelButton = document.createElement("label");
    let buttonRemove = document.createElement("button");
    buttonRemove.setAttribute("id", id+"_remove_boil_hop0");
    buttonRemove.onclick = function () {
        removeElement();
    };
    buttonRemove.innerText = "-";
    labelButton.appendChild(buttonRemove);
    hop0.appendChild(labelButton);
    hops.appendChild(hop0);
    data.appendChild(hops);
    let divAddButton = document.createElement("div");
    let buttonAdd = document.createElement("button");
    buttonAdd.setAttribute("id", id+"_add_boil_hop");
    buttonAdd.onclick = function () {
        addElement();
    };

    buttonAdd.innerText = "+";
    divAddButton.appendChild(buttonAdd);
    data.appendChild(divAddButton);

    data.appendChild(createLabel("Zucchero", "sugar", id, "kg"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Acqua", "water", id, "l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Perdite", "boil_loss", id, "l"));
}

function createFermentElements(data, id, type){

    data.appendChild(createLabel("Temperatura", "temp", id, "°C"));

    let yeasts = document.createElement("div");
    yeasts.setAttribute("id", type+"_yeast_"+id);
    let p1 = document.createElement("p");
    p1.innerText = "Lievito";
    yeasts.appendChild(p1);
    let yeast0 = document.createElement("div");
    yeast0.setAttribute("id", id+"_yeast0DIV");
    let select1 = document.createElement("select");
    select1.setAttribute("name", "yeast0");
    select1.setAttribute("id", id+"_"+type+"_yeast0");
    select1.setAttribute("num", 0);
    select1.onchange = function (){ setOptionParams(select1.getAttribute("num"))};
    yeast0.appendChild(select1);
    yeast0.appendChild(document.createElement("br"));
    yeast0.appendChild(createOtherLabel("AA%", "aa0", id, "yeast"));
    yeasts.appendChild(yeast0);
    data.appendChild(yeasts);

    let hops = document.createElement("div");
    hops.setAttribute("id", type+"_hops_"+id);
    let p2 = document.createElement("p");
    p2.innerText = "Luppoli in dry hopping";
    hops.appendChild(p2);
    let hop0 = document.createElement("div");
    hop0.setAttribute("id", id+"_fermentadd_hop0DIV");
    let select2 = document.createElement("select");
    select2.setAttribute("name", "hop0");
    select2.setAttribute("id", id+"_"+type+"_hop0");
    select2.setAttribute("num", 0);
    select2.onchange = function (){ setOptionParams(select2.getAttribute("num"))};
    hop0.appendChild(select2);
    hop0.appendChild(document.createElement("br"));
    hop0.appendChild(createOtherLabel("AA%", "aa0", id, "hop"));
    hop0.appendChild(createOtherLabel("giorni", "time0", id, "hop"));
    hop0.appendChild(createOtherLabel("g", "weight0", id, "hop"));
    let labelButton = document.createElement("label");
    let buttonRemove = document.createElement("button");
    buttonRemove.setAttribute("id", id+"_remove_ferment_hop0");
    buttonRemove.onclick = function () {
        removeElement();
    };
    buttonRemove.innerText = "-";
    labelButton.appendChild(buttonRemove);
    hop0.appendChild(labelButton);
    hops.appendChild(hop0);
    data.appendChild(hops);
    let divAddButton = document.createElement("div");
    let buttonAdd = document.createElement("button");
    buttonAdd.setAttribute("id", id+"_add_ferment_hop");
    buttonAdd.onclick = function () {
        addElement();
    };

    buttonAdd.innerText = "+";
    divAddButton.appendChild(buttonAdd);
    data.appendChild(divAddButton);

    data.appendChild(createLabel("Zucchero", "sugar", id, "kg"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Acqua", "water", id, "l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Perdite", "boil_loss", id, "l"));
}

function createBottleElements(data, id){
    data.appendChild(createLabel("Sucrose", "temp", id, "g/l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Dextrose", "temp", id, "g/l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Extract", "temp", id, "g/l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Speise", "temp", id, "l"));
    data.appendChild(document.createElement("br"));
    data.appendChild(createLabel("Perdite", "boil_loss", id, "l"));
}




