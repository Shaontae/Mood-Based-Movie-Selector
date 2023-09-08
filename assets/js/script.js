let rootEl = document.querySelector(":root");
let bodyEl = document.querySelector("#body");
let stopEl = document.querySelector("#stop");
let pauseEl = document.querySelector("#pause");
let playEl = document.querySelector("#play");

class ColorVar {
    static instances = [];
    constructor(label, oCode) {
        this.label = label;
        this.oCode = oCode;
        ColorVar.instances.push(this);
        this.paused = false; // Add a 'paused' property to track the pause state
    }
    changeFn() {
        if (this.paused) return; // Check if the color change is paused
        let rVal = () => {
            return Math.floor(Math.random() * 255);
        };
        let r = rVal();
        let g = rVal();
        let b = rVal();
        let clrCode = "rgb(" + r + "," + g + "," + b + ")";
        document.body.style.setProperty(this.label, clrCode);
    }
    cResetFn() {
        document.body.style.setProperty(this.label, this.oCode);
    }
    togglePause() {
        this.paused = !this.paused; // Toggle the 'paused' state
    }
}

const color1 = new ColorVar("--color1", "#b4e8b4");
const color2 = new ColorVar("--color2", "#1f1f7c");
const color3 = new ColorVar("--color5", "#fc8eac");

const colorSwitch = document.getElementById('colorSwitch');
const pauseButton = document.getElementById('pauseButton'); // Add a pause button
const pauseLabel = document.getElementById('pauseLabel');

colorSwitch.addEventListener('change', () => {
    if (colorSwitch.checked) {
        // Show the pause button and label using Tailwind CSS classes
        pauseLabel.classList.remove('hidden');
        pauseButton.classList.remove('hidden');
        document.body.addEventListener('click', () => {
            ColorVar.instances.forEach(colorVar => colorVar.changeFn());
        });
    } else {
        ColorVar.instances.forEach(colorVar => colorVar.cResetFn());
        document.body.removeEventListener('click', () => {
            ColorVar.instances.forEach(colorVar => colorVar.changeFn());
        });
        // Hide the pause button and label using Tailwind CSS classes
        pauseLabel.classList.add('hidden');
        pauseButton.classList.add('hidden');
    }
});

pauseButton.addEventListener('click', () => {
    // Toggle the pause state for all ColorVar instances
    ColorVar.instances.forEach(colorVar => colorVar.togglePause());
});

let chosenEmojis = [];
let eligibleEmojis = [];
let keywordsRaw = [];
let keywordSluice = [];
let keywordsTrash = [];
let errorLogs = [];
let bugWords = ["CHRISTMAS", "SANTA", "ASIAN", "CHINESE", "JAPANESE"];
// let emojiNum = 0;
let stage = 0;
let stageArray = [renderStart, renderEmojis, renderInput];

let isLoading = false;



let container = document.querySelector("#container");
let containerHeader = document.querySelector("#container-header");
let headerTitle = document.querySelector("#container-h2");
let baseCard = document.querySelector("#base-card");
let resetButton = document.querySelector("#reset-button");

// // bodyEl.addEventListener("click", colorChange);
// stopEl.addEventListener("click",()=>{
//     for (let i=0; i<ColorVar.instances.length; i++){
//         ColorVar.instances[i].cResetFn();
//         bodyEl.removeEventListener("click", colorChange);
//     };
// })
// pauseEl.addEventListener("click",()=>{
//     for (let i=0; i<ColorVar.instances.length; i++){
//         bodyEl.removeEventListener("click", colorChange);
//     };
// });
// playEl.addEventListener("click",()=>{
//     for (let i=0; i<ColorVar.instances.length; i++){
//         bodyEl.addEventListener("click", colorChange);
//     };
// });

resetButton.addEventListener("click", resetButtonFn);


// renderEmojis();

stageFunction();

// Misc. FUnctions
function colorChange(){
    for (let i=0; i<ColorVar.instances.length; i++){
        ColorVar.instances[i].changeFn();
    };
};

function stageFunction(){
    let storedStage = JSON.parse(localStorage.getItem("stageMaster"));
    if (storedStage !== null){
        stage = ~~storedStage;
    };
    stageArray[stage]();
};

function resetButtonFn(){
    
    // JSON List:
    // stage (number) - stageMaster
    // emojiNum (number) - eNumMaster
    // chosenEmojis (array) - emojisMaster
    // eligibleEmojis (array) - eligibleMaster
    // more to come

    baseCard.innerHTML = '';

    stage = 0;
    // emojiNum = 0;
    chosenEmojis = [];
    eligibleEmojis = [];
    keywordsRaw = [];
    
    
    localStorage.setItem("stageMaster", JSON.stringify(stage));
    // localStorage.setItem("eNumMaster", JSON.stringify(emojiNum));
    localStorage.setItem("emojisMaster", JSON.stringify(chosenEmojis));
    localStorage.setItem("eligibleMaster", JSON.stringify(eligibleEmojis));
    localStorage.setItem("keywordsMaster", JSON.stringify(keywordsRaw));


    // call startupFunction
    
    stageFunction();
};

function buttonCheck(element, condition, fn){
    if (!condition){
        element.setAttribute("class", "emoji-submit off");
        element.removeEventListener("click", fn);
    } else {
        element.setAttribute("class", "emoji-submit on");
        element.addEventListener("click", fn, { once:true });
    };
};


function stageUpFn(){
    baseCard.innerHTML='';
    stage++
    localStorage.setItem("stageMaster", JSON.stringify(stage));
    stageFunction();
};

async function wordParser(str){
    let keywordsFloat = [];
    let storedKeywords = JSON.parse(localStorage.getItem("keywordsMaster"));
    if (storedKeywords !== null){
        keywordsRaw = storedKeywords;
    };

    let puncFn = (word)=>{
        let newWord = "";
        for (let n=0; n<word.length; n++){
            if (word[n]!=="."&&word[n]!==","){
                newWord+=word[n];
            };
        };
        return newWord;
    };
    let splitArray = str.split(" ");
    
    for (let i=0; i<splitArray.length; i++){
        splitArray[i] = puncFn(splitArray[i]);
        if (bugWords.includes(splitArray[i].toUpperCase())){
            keywordSluice.push(splitArray[i].toUpperCase());
        } else {
            if (!keywordsRaw.includes(splitArray[i].toUpperCase())&&!stopwordsData.includes(splitArray[i].toLowerCase())&&!splitArray[i].includes("type-")&&!splitArray.includes("≊")){
                keywordsFloat.push(splitArray[i])
            } else {
                keywordsTrash.push(splitArray[i])
            }
        };
    };
    let promisesFloat = keywordsFloat.map(r => fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+r)
        .then((result)=>{
            if (result.status===200){
                return result.json();
            } else {
                let storedErrors = JSON.parse(localStorage.getItem("errorsMaster"));
                if (storedErrors!==null){
                    errorLogs = storedErrors;
                }
                errorLogs.push([r,result.status]);
                localStorage.setItem("errorsMaster", JSON.stringify(errorLogs));
                return "error";
            };
        }))

    // console.log(promisesFloat)

    const waitTest = await Promise.allSettled(promisesFloat).then((response)=>{
        let results = response.filter((el)=>{
            if (el.value==="error"){
                return false;
            } else {
                return true;
            };
        })
        // console.log(results)
        for (let i=0; i<results.length; i++){    
            for (let n=0; n<results[i].value[0].meanings.length; n++){
                let iLimit = 0;
                let shortcut = results[i].value[0].meanings[n]
                if (iLimit<5){
                    for (let x=0; x< shortcut.synonyms.length; x++){
                        if (iLimit<5){
                            keywordSluice.push(shortcut.synonyms[x]);
                            iLimit++;
                            // console.log(results[i].value[0].word+": "+shortcut.synonyms[x]+" "+iLimit);
                        } else {
                            break
                        }
                    };
                } else {
                    console.log("Lotta loops here")
                    break
                }
                
            };
        };
    })
    // console.log(waitTest)
    

    // const waitTest = await Promise.allSettled(promisesFloat).then((response)=>{
    //     let dataResult = [];
    //     for (let i=0; i<response.length; i++){
    //         if (response[i].value[0][0]==="error"){
    //             response.splice(i, 1);
    //         } else {
    //             dataResult.push(response[i].value[0])
    //             keywordSluice.push(keywordsFloat[i])
    //         }
    //     }
    //     Promise.allSettled(dataResult).then((results)=>{
            // for (let i=0; i<results.length; i++){
            //     let iLimit = 0;
            //     for (let n=0; n<results[i].value[0].meanings.length; n++){
            //         let shortcut = results[i].value[0].meanings[n]
            //         for (let x=0; x< shortcut.synonyms.length; x++){
            //             if (iLimit<5){
            //                 keywordSluice.push(shortcut.synonyms[x]);
            //             };
            //         };
            //     };
            // };
    //     })
    // })
};

function keywordSifter(){
    for (let i=0; i<keywordSluice.length; i++){
        // console.log(keywordsRaw.includes(keywordSluice[i])+": "+keywordSluice[i])
        if (!keywordsRaw.includes(keywordSluice[i])){
            keywordsRaw.push(keywordSluice[i]);
        } else {
            keywordsTrash.push(keywordSluice[i]);
        };
    };
    keywordSluice=[];
    localStorage.setItem("keywordsMaster", JSON.stringify(keywordsRaw));
};


// Render Functions

function renderStart(){
    let emojiNum = 0;

    let randoTitle = document.createElement("h3");
    let randoInput = document.createElement("input");
    let button = document.createElement("div");
    let contentCard = document.createElement("div");
    let emptyBox = document.createElement("div");

    let limitVal = ()=>{
        // if (~~randoInput.value>=25&&~~randoInput.value<=1089&&~~randoInput.value!==''){
        if (~~randoInput.value>=25&&~~randoInput.value<=1089){
            return true
        } else {
            return false
        };
    };

    randoInput.setAttribute("class", "randoInput");
    randoInput.setAttribute("placeholder", "25-1089");
    randoInput.setAttribute("value", "");

    contentCard.setAttribute("class", "contentCard");
    emptyBox.setAttribute("class", "emptyBox");

    headerTitle.textContent = "Start";
    randoTitle.textContent = "Choose the number of Emoji choices you want."
    button.textContent = "NEXT";

    buttonCheck(button, limitVal());

    contentCard.append(randoTitle);
    contentCard.append(randoInput);
    contentCard.append(button);
    baseCard.append(contentCard);
    baseCard.append(emptyBox);

    randoInput.addEventListener("keydown", numeric)

    function numeric (event){
        
        element = event.target;
        let key = event.keyCode || event.charCode;
        
        if (isNaN(event.key)&&key !== 8&&key !== 46){
            event.preventDefault();
        } else {
            element.addEventListener("keyup", ()=>{
                buttonCheck(button, limitVal(), startStageUp);
            }, { once:true });
        };
        buttonCheck(button, limitVal(), startStageUp);
    };

    function startStageUp(){
        randoInput.removeEventListener("keydown", numeric);
        emojiNum = randoInput.value;
        // localStorage.setItem("eNumMaster", JSON.stringify(emojiNum));
        emojiRandomizer(emojiNum);
        stageUpFn();
    };

}

function emojiRandomizer(eNum){
    // let storedENum = JSON.parse(localStorage.getItem("eNumMaster"));
    // if (storedENum!==null){
    //     emojiNum = ~~storedENum;
    // };
    for (let i=0; i<eNum; i++){
        let randoFn=()=>{
            return Math.floor(Math.random()*emojiData.length);
        };
        let rando = randoFn();
        while (eligibleEmojis.includes(emojiData[rando])){
            rando=randoFn();
        };
        eligibleEmojis.push(emojiData[rando]);
    };
    for (let i=0; i<eligibleEmojis.length; i++){
        eligibleEmojis[i]["index"]=i;
    };
    localStorage.setItem("eligibleMaster", JSON.stringify(eligibleEmojis));
};


function renderEmojis(){
    let storedEligible = JSON.parse(localStorage.getItem("eligibleMaster"));
    let storedEmojis = JSON.parse(localStorage.getItem("emojisMaster"));
    if (storedEligible!==null){
        eligibleEmojis=storedEligible;
    };
    if (storedEmojis!==null){
        chosenEmojis=storedEmojis;
    };


    let emojiFloor=5;
    let emojiCeiling=emojiFloor;
    let activeCheck = ()=>{
        if (chosenEmojis.length<emojiFloor){
            return false;
        } else {
            return true;
        }
    };

    let codeGrab = (checkObj)=>{
        if (typeof checkObj.htmlCode==="string"){
            return checkObj.htmlCode;
        } else {
            return checkObj.htmlCode[0];
        }
    }

    let eChoiceCard = document.createElement("div")
    let emojiTitle = document.createElement("h3");
    let choiceBox = document.createElement("div");
    let button = document.createElement("div");
    let choiceList = document.createElement("ul");

    let gridCard = document.createElement("div");
    let emojiRules = document.createElement("h3");
    let emojisContainer = document.createElement("div");
    let fullUl = document.createElement("ul");

    
    eChoiceCard.setAttribute("class", "eChoiceCard")
    choiceList.setAttribute("class", "emoji-choice-list");
    choiceBox.setAttribute("class", "emoji-choice-box");

    gridCard.setAttribute("class", "gridCard")
    emojisContainer.setAttribute("class", "emoji-container");
    fullUl.setAttribute("class", "fullUl");
    
    headerTitle.textContent = "Make Your Choice";
    emojiTitle.textContent = "Which emojis call out to you?"
    button.textContent = "NEXT";

    emojiRules.textContent = "Choose 5 Emojis"
    

    renderEmojiGrid();
    renderChoices();
    

    emojisContainer.appendChild(fullUl);
    gridCard.appendChild(emojiRules);
    gridCard.appendChild(emojisContainer)
    choiceBox.appendChild(choiceList);
    eChoiceCard.appendChild(emojiTitle);
    eChoiceCard.appendChild(choiceBox);
    eChoiceCard.appendChild(button);

    baseCard.appendChild(eChoiceCard);
    baseCard.appendChild(gridCard);
    
    buttonCheck(button, activeCheck(), emojiButtonFn);

    async function emojiButtonFn(){
        
        let gridList = document.getElementsByClassName("emojiGrid");
        let choiceSlots = document.getElementsByClassName("choiceSlot");
        isLoading = true;
        renderLoad();
        for (let i=0; i<gridList.length; i++){
            gridList[i].removeEventListener("click", addEmoji);
        };
        for (let i=0; i<choiceSlots.length; i++){
            choiceSlots[i].removeEventListener("click", removeEmoji);
        };
        const loadTest =  await new Promise(resolve => setTimeout(resolve, 5000));

        for (let i=0; i<chosenEmojis.length; i++){
            const wait1 = await wordParser(chosenEmojis[i].name);
            const wait2 = await wordParser(chosenEmojis[i].group);
        };
        // console.log(errorLogs)
        // console.log(keywordSluice)
        keywordSifter();
        // console.log(keywordsRaw)
        // console.log(keywordsTrash)
        isLoading = false;
        // stageUpFn();
    };

    function renderEmojiGrid(){
        let n=0;
        let emojiRows = [];
        let subUls = [];
        // Add conditions in case of perfect square, because the +1 in
        // perfect square would produce overflow
        // Ref(1)
        let sqr = ()=>{
            let intCheck = Math.sqrt(eligibleEmojis.length)
            if (Number.isInteger(intCheck)){
                return intCheck;
            }
            else{
                return Math.floor(intCheck)+1;
            }; 
        };


        
        let emojiRowRem = eligibleEmojis.length%sqr();
        // --(1)
        let emojiRowN = ()=>{
            if (emojiRowRem>0){
                return ((eligibleEmojis.length-emojiRowRem)/sqr())+1;
            } else {
                return ((eligibleEmojis.length-emojiRowRem)/sqr());
            };
        };

        for (let i=0; i<emojiRowN(); i++){
            let li = document.createElement("li");
            let ul = document.createElement("ul");
            ul.setAttribute("class", "emoji-row");
            li.setAttribute("class", "emojiEl");
            emojiRows.push(li);
            subUls.push(ul);
        };

        
        for (let i = 0; i < eligibleEmojis.length; i++) {
            let li = document.createElement('li');
            let p = document.createElement('p');
            li.setAttribute("class", "emojiBox");
            
            p.setAttribute("data-index", eligibleEmojis[i].index);
            gridCheck(p, false);
            
            p.innerHTML = codeGrab(eligibleEmojis[i]);
            if (subUls[n].childElementCount===sqr()){
                emojiRows[n].appendChild(subUls[n]);
                fullUl.appendChild(emojiRows[n]);
                n++;
            };
            li.appendChild(p);
            subUls[n].appendChild(li);
            let x=n+1;
            if (x===emojiRowN()&&i+1===eligibleEmojis.length){
                emojiRows[n].appendChild(subUls[n]);
                fullUl.appendChild(emojiRows[n]);
            };
            // p.addEventListener("click", addEmoji, { once:true })
            emojiListener(p);
        };
    };

    function renderChoices(){
        let storedEmojis = JSON.parse(localStorage.getItem("emojisMaster"));
        if (storedEmojis!==null){
            chosenEmojis=storedEmojis;
        };
        choiceList.innerHTML='';
        for (let i=0; i<chosenEmojis.length; i++){
            let li = document.createElement("li");
            let p = document.createElement("p");
            // let emojiMatch = ()=>{

            // };
            p.setAttribute("data-index", chosenEmojis[i].index);
            
            li.setAttribute("class", "emojiBox");
            p.setAttribute("class", "choiceSlot emojiImg on");
            p.innerHTML = codeGrab(chosenEmojis[i]);
            li.appendChild(p);
            choiceList.appendChild(li);
            p.addEventListener("click", removeEmoji, { once:true });
            
        };
    };

    function addEmoji(event){
        let emoji = null;
        element = event.target;
        
        for (let i=0; i<eligibleEmojis.length; i++){
            if (~~element.dataset.index===eligibleEmojis[i].index){
                emoji=eligibleEmojis[i];
            };
        };
        let storedEmojis = JSON.parse(localStorage.getItem("emojisMaster"));
        if (storedEmojis!==null){
            chosenEmojis=storedEmojis;
        };
        chosenEmojis.push(emoji);
        localStorage.setItem("emojisMaster", JSON.stringify(chosenEmojis));
        // check all children of parent to delete event listeners
        addDropChange();
        renderChoices();
        buttonCheck(button, activeCheck(), emojiButtonFn);
    };

    function removeEmoji(event){
        let emoji = null;
        let storedEmojis = JSON.parse(localStorage.getItem("emojisMaster"));
        if (storedEmojis!==null){
            chosenEmojis=storedEmojis;
        };
        
        element = event.target;
        for (let i=0; i<eligibleEmojis.length; i++){
            if (~~element.dataset.index===eligibleEmojis[i].index){
                
                emoji=eligibleEmojis[i];
            };
        };
        for (let i=0; i<chosenEmojis.length; i++){
            if (chosenEmojis[i].index===emoji.index){ 
                chosenEmojis.splice(i, 1);
            };
        };
        localStorage.setItem("emojisMaster", JSON.stringify(chosenEmojis));
        addDropChange()
        renderChoices();
        buttonCheck(button, activeCheck(), emojiButtonFn);
    }

    function addDropChange(){
        let gridList = document.getElementsByClassName("emojiGrid");
        for (let i=0; i<gridList.length; i++){
            gridCheck(gridList[i], true);
        };
    };

    function gridCheck(element, isBundled){
        let isIncludes = false;
        for (let ix=0; ix<chosenEmojis.length; ix++){
            if (~~element.dataset.index===chosenEmojis[ix].index){
                    isIncludes=true;
                }
        };
        if (isIncludes){
            element.setAttribute("data-active", "false");
            element.setAttribute("class", "emojiGrid emojiImg off");
        } else{
            element.setAttribute("data-active", "true");
            element.setAttribute("class", "emojiGrid emojiImg on");
        };

        if (isBundled){
            emojiListener(element)
        };
    };

    function emojiListener(element){
        if (element.dataset.active==="true"&&chosenEmojis.length<emojiCeiling){
            element.addEventListener("click", addEmoji, { once:true });
        } else {
            element.removeEventListener("click", addEmoji);
        };
    };

};

function renderInput(){
    // let charN = 0;
    let inputBox = document.createElement("div");
    let userForm = document.createElement("form");
    // let question = document.createElement("label");
    let question = document.createElement("h3");
    let userInput = document.createElement("textarea");
    let charMax = document.createElement("p");
    let button = document.createElement("div");
    
    

    inputBox.setAttribute("class", "inputBox");
    charMax.setAttribute("class", "charMax");
    userForm.setAttribute("class", "userForm");
    // question.setAttribute("class", "question");
    userInput.setAttribute("class", "userInput");
    button.setAttribute("class", "emoji-submit");

    userInput.setAttribute("maxLength", "500");
    button.setAttribute("style", "align-self: end")

    headerTitle.textContent="Time to Type"
    question.textContent = "What kind of movies are you into?"
    charMax.textContent = userInput.value.trim().length+"/"+userInput.maxLength+" Characters"
    button.textContent = "NEXT"

    userForm.appendChild(question);
    userForm.appendChild(userInput);
    userForm.appendChild(charMax);
    userForm.appendChild(button);
    inputBox.appendChild(userForm);
    baseCard.appendChild(inputBox);

    userInput.addEventListener("keydown", charCounter);

    function charCounter(event){
        if (~~~userInput.maxLength<=userInput.value.trim().length){
            charMax.textContent= userInput.value.trim().length+"/"+userInput.maxLength+" Characters";
            
        } else {
            let key = event.keyCode || event.charCode;
        
            if (key !== 8&&key !== 46){
                console.log("coming soon.")
            };
        }
    }
    
};

function renderLoad(){
    setTimeout(()=>{
        if (isLoading){
            baseCard.innerHTML="";
            // let h3 = document.createElement("h3");
            let waitDiv = document.createElement("div");
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            // let svg = document.createElement("svg");
            let path1 = document.createElement("path");
            let path2 = document.createElement("path");
            let span = document.createElement("span");

            waitDiv.setAttribute("role", "status");

            svg.setAttribute("aria-hidden", "true");
            svg.setAttribute("class", "inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600");
            // svg.setAttributeNS("", "viewBox", "0 0 100 101");
            svg.setAttribute("viewBox", "0 0 100 101");
            svg.setAttribute("fill", "none");
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

            path1.setAttribute("d", "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z");
            path1.setAttribute("fill", "currentColor");

            path2.setAttribute("d", "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z");
            path2.setAttribute("fill", "currentFill");

            span.setAttribute("class", "sr-only");
            span.textContent = "Loading..."


            // <div role="status">
            //     <svg aria-hidden="true" class="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-pink-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            //         <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            //         <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            //     </svg>
            //     <span class="sr-only">Loading...</span>
            // </div>

            svg.appendChild(path1);
            svg.appendChild(path2);

            waitDiv.appendChild(svg);
            waitDiv.appendChild(span);

            baseCard.appendChild(waitDiv);
        }
    }, 500);
};



// fetch("https://emojihub.yurace.pro/api/all")
//     .then((response)=>{
//         if (response.status===200){
//             return response.json();
//         }
//     })
//     .then((data)=>{
//         console.log(data);
//     })
// let bub = [];
// let testVar=0;
let omdbTest=[];
let rtUrl = null;
let omdbUrl = "http://www.omdbapi.com/?apikey=1aa15ab1&type=movie&plot=full&s=$comedy";
// omdbUrl = "http://www.omdbapi.com/?apikey=1aa15ab1&type=movie&plot=full&s=$comedy";
// fetch(omdbUrl)
//     .then((response)=>{
//         if (response.status===200){
//             return response.json();
//         }
//     })
//     .then((data)=>{
//         console.log(data)
//         let w =0;
//         for (let i=0; i<data.Search.length; i++){
//             let titleFix = data.Search[i].Title.replace(/\s/g, '+');
//             fetch("http://www.omdbapi.com/?apikey=1aa15ab1&type=movie&plot=full&t="+titleFix)
//             .then((response)=>{
//                 if (response.status===200){
//                     return response.json();
//                 } else{
//                     console.log("Ya fucked it.")
//                 }
//             })
//             .then((data)=>{
//                 if (data.Plot.includes("not")){
//                     omdbTest.push(data);
                    
//                 }
                
//             })
//             // console.log(w)
//         }
        
//     }).then(()=>{console.log(omdbTest);})

// function allResultsOMDB(object){
//     let remainder = object.totalResults%10;
//     let pages = ()=>{
//         if (remainder===0){
//             return object.totalResults/10;
//         } else {
//             return ((object.totalResults-remainder)/10)+1
//         };
//     };

//     let promiseList1 =[]
//     let promiseList2 =[]
//     for (let i=0; i<pages(); i++){
        
//         let x = i+1;
//         omdbUrl = "http://www.omdbapi.com/?apikey=1aa15ab1&type=movie&plot=full&tomatoes=true&page="+x+"&s=$comedy";
//         let testPromise = fetch(omdbUrl)
//             .then((response)=>{
//                 if (response.status===200){
//                     return response.json();
//                 }
//             })
//             .then((data)=>{
//                 // omdbTest.push(data.response);
//                 promiseList1.push(testPromise);
//             })
//     }
//     return new Promise((resolve) => {
//         Promise.all(promiseList1)
//           .then((proms) =>
//             proms.forEach((p) => promiseList2.push({
//               results: p.results
//             }))
//           )
//           .then(() => resolve(promiseList2));
//       });
// };

// fetch("https://emojihub.yurace.pro/api/random/category/smileys-and-people")
//     .then((response)=>{
//         if (response.status===200){
//             return response.json();
//         }
//     })
//     .then((data)=>{
//         console.log(data);
//     })

// moviedb key=654175309f8dda54d6e0ea0c7706fa04

// let mdbUrl = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_keywords=horror&api_key=654175309f8dda54d6e0ea0c7706fa04';
// let mdbUrl = 'https://api.themoviedb.org/3/discover/movie?api_key=654175309f8dda54d6e0ea0c7706fa04&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&page=1';
// let mdbUrl = "https://api.themoviedb.org/3/search/keyword?api_key=654175309f8dda54d6e0ea0c7706fa04&query=alligator"
// mdbUrl='https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=654175309f8dda54d6e0ea0c7706fa04'
// mdbUrl='https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&api_key=654175309f8dda54d6e0ea0c7706fa04'
// mdbUrl = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=10770%2C53&api_key=654175309f8dda54d6e0ea0c7706fa04'
// mdbUrl = "https://api.themoviedb.org/3/discover/movie?query=alligator&include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&api_key=654175309f8dda54d6e0ea0c7706fa04"
// let testArray = [];
// fetch(mdbUrl)
//     .then((response)=>{
//         if (response.status===200){
//             return response.json();
//         }
//     })
//     .then((data)=>{
//         testArray.push(data)
//         mdbParseResults(data.total_pages, testArray, "prison", "https://api.themoviedb.org/3/discover/movie?api_key=654175309f8dda54d6e0ea0c7706fa04&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&with_genres=10770%2C53&page=")
//     })
// function mdbParseResults(pages, array, keyword, url){
//     let x=0;
//     for (let i=0; i<pages; i++){
//         x = i+1;
//         genUrl = url+x;
//         fetch(genUrl)
//             .then((response)=>{
//                 if (response.status===200){
//                     return response.json();
//                 };
//             })
//             .then((data)=>{
//                 array.push("bub")
//             })
//     }
// };

// function mdbParseResults(pages, array, keyword, url){
//     let x=0;
//     for (let i=0; i<pages; i++){
//         x = i+1;
//         genUrl = url+x;
//         fetch(genUrl)
//             .then((response)=>{
//                 if (response.status===200){
//                     return response.json();
//                 };
//             })
//             .then((data)=>{
//                 array.push("bub")
                
//                 // This is also specific to themoviedb because object keys can't be passed as arguments
//                 for (let n=0; n<data.results.length; n++){
//                     // genArray(data.results[i]);
//                     // if (data.results[n].overview!==undefined&&data.results[n].hasOwnProperty("overview")){
//                     // }
                    
//                     if (data.results[n].overview.includes(keyword)){
//                         // testArray.push(data.results[n]);
//                         // testArray.push("bub");
//                     }
//                 };
//             })
//     }
//     // function genArray(object){
//     //     // Gotta get specific for each api call
//         // if (object.overview.includes(keyword)){
//         //     array.push(object);
//         // }
//     // }
// };



// function tabulateResults(data, totalResults, limit, array, keyword, url){
//     let remainder = data.%limit;
//     let pages = ()=>{
//         if (remainder===0){
//             return data.totalResults/limit;
//         } else {
//             return ((data.totalResults-remainder)/limit)+1
//         };
//     };

//     for (let i=0; i<pages(); i++){
//         let x = i+1;
//         genUrl = url+x;
//         fetch(genUrl)
//             .then((response)=>{
//                 if (response.status===200){
//                     return response.json();
//                 }
//             })
//             .then((data)=>{
                
//                 // This is also specific to themoviedb because object keys can't be passed as arguments
//                 for (let i=0; i<limit; i++)
//                     genArray(data.results[i]);
//             })
//     }
//     function genArray(object){
//         // Gotta get specific for each api call
//         if (object.overview.includes(keyword)){
//             array.push(object);
//         }
//     }
// };




// fetch("https://api.dictionaryapi.dev/api/v2/entries/en/punch")
//     .then((response)=>{
//         if (response.status ===200){
//             return response.json()
//         };
        
//         })
//     .then((data)=>{console.log(data)})

let testWords = ["apple", "orange", "sparrow", "fork"];
let testPush =[];

function testFetch(word){
    fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+word)
        .then((response)=>{
            if (response.status===200){
                return response.json();
            }
        })
        .then((data)=>{
            console.log(data)
            return data;
            // testPush.push(data)
        });
}
async function testFn(){
    // const result = await testFetch(testWords[0]);
    // console.log(testPush)
    for (let i=0; i<testWords.length; i++){
        const result = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/"+testWords[i])
            .then((response)=>{
                if (response.status===200){
                    return response.json();
                };
            })
            .then((data)=>{
                // console.log(data)
                // return data;
                testPush.push(data)
            });
    }
    
    // console.log(testPush.length)
};
testFn();

// function movieFetch(movie){
//     let movieTitle = ()=>{
//         if (movie.includes(" ")){
//             return movie.replace((/\s/g, '%2B'));
//         } else{
//             return movie;
//         }
//     };
//     fetch('https://api.themoviedb.org/3/search/movie?api_key=654175309f8dda54d6e0ea0c7706fa04&include_adult=false&language=en-US&page=1&query='+movieTitle())
//     .then((response)=>{
//         if (response.status===200){
//             return response.json();
//         }
//     })
//     .then((data)=>{
//         console.log(data)
//     });
// };
// movieFetch("##Your Movie");




















































































































































































































































































function fetchTMDB() {
    fetch("https://api.themoviedb.org/3/movie/1491?api_key=654175309f8dda54d6e0ea0c7706fa04&language=en-US")
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error("Failed to fetch data from TMDb");
        }
      })
      .then((data) => {
        renderTMDB(data); // Call the renderTMDB function with the fetched data
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  function renderTMDB(movieData) {
    let { title, poster_path, overview } = movieData;
    //this is the base url for all posters... it adds poster_path data to the end and grabs the poster for the movie
    let basePosterURL = 'https://image.tmdb.org/t/p/w500';
    let tmdbContainer = document.createElement('div');
    document.body.appendChild(tmdbContainer); // Append to the document body
  
    tmdbContainer.classList.add('container', 'movie');
    tmdbContainer.innerHTML = `
      <img src="${basePosterURL + poster_path}" alt="${title}">
      <div class='movie-title'>
        <h1>${title}</h1>
      </div>
      <div class="overview">
        <h2>Plot</h2>
        ${overview}
      </div>
    `;
  }



