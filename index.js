
window.addEventListener('load', function () {
    document.querySelector('#input_search').addEventListener("keyup",
        function () { searchContent() }, false);
    readDefaultFile();
})

function showData(data) {
    let content = document.getElementById("content");
    content.innerHTML = '';
    data.forEach(item => {
        let itemDiv = document.createElement("div");
        itemDiv.classList.add("item");
        let nameDiv = document.createElement("div");
        nameDiv.classList.add("item_title");
        let descriptionDiv = document.createElement("div");
        descriptionDiv.classList.add("item_description");
        nameDiv.innerHTML = item.name;
        descriptionDiv.innerHTML = item.description;
        itemDiv.appendChild(nameDiv);
        itemDiv.appendChild(descriptionDiv);
        content.appendChild(itemDiv);
        item.parameters.forEach(param => {
            let parameterDiv = document.createElement("div");
            parameterDiv.classList.add("parameters");
            let nameSpan = document.createElement("span");
            nameSpan.classList.add("name_span");
            let valueSpan = document.createElement("span");
            valueSpan.classList.add("value_span");
            if (param.copy) {
                valueSpan.addEventListener("click", function () { copyToClipboard(param.value) }, false);
            }
            nameSpan.innerHTML = param.name;
            valueSpan.innerHTML = param.value;
            parameterDiv.appendChild(nameSpan);
            parameterDiv.appendChild(valueSpan);
            itemDiv.appendChild(parameterDiv);
        });
    });
    document.querySelector('#hidenTextArea').value = JSON.stringify(data);
}

function copyToClipboard(valueToCopy) {
    let textArea = document.createElement("textarea");
    textArea.value = valueToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("Copy");
    console.log("copied: " + valueToCopy);
    textArea.remove();
    alert("copied");
}

function addedAnotherParameter() {
    let parametersContainerDiv = document.querySelector("#parameters_container");
    let newParameterContainerDiv = document.createElement("div");
    newParameterContainerDiv.appendChild(createParameterLabel("parameter_key", "parameter key"));
    newParameterContainerDiv.appendChild(createParameterInput("text", "parameter_key"));
    newParameterContainerDiv.appendChild(createParameterLabel("parameter_value", "parameter value"));
    newParameterContainerDiv.appendChild(createParameterInput("text", "parameter_value"));
    newParameterContainerDiv.appendChild(createParameterInput("checkbox", "copiable"));
    newParameterContainerDiv.appendChild(createParameterLabel("copiable", "copiable"));
    newParameterContainerDiv.appendChild(createParameterInput("checkbox", "isALink"));
    newParameterContainerDiv.appendChild(createParameterLabel("isALink", "isALink"));
    parametersContainerDiv.appendChild(document.createElement("br"));
    parametersContainerDiv.appendChild(newParameterContainerDiv);
}

function createParameterLabel(forName, text) {
    let parameterLabel = document.createElement("label");
    parameterLabel.setAttribute("for", forName);
    parameterLabel.innerHTML = `${text}: `;
    return parameterLabel;
}
function createParameterInput(type, className) {
    let parameterInput = document.createElement("input");
    parameterInput.setAttribute("type", type);
    parameterInput.classList.add(className);
    return parameterInput;
}

function createHtmlElement(type, name) {
    let htmlElement = document.createElement(type);
    htmlElement.setAttribute("id", name);
    htmlElement.setAttribute("name", name);
    return htmlElement;
}

let GetFileBlobUsingURL = function (url, convertBlob) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener('load', function () {
        convertBlob(xhr.response);
    });
    xhr.send();
};

let blobToFile = function (blob, name) {
    blob.lastModifiedDate = new Date();
    blob.name = name;
    return blob;
};

let GetFileObjectFromURL = function (filePathOrUrl, convertBlob) {
    return GetFileBlobUsingURL(filePathOrUrl, function (blob) {
        convertBlob(blobToFile(blob, 'data.json'));
    });
};

function saveNewInformation() {
    let componentName = document.getElementById('component_name').value;
    let componentDescription = document.getElementById('component_desc').value;
    const parameterKeyInputs = document.querySelectorAll('.parameter_key');
    const parameterValueInputs = document.querySelectorAll('.parameter_value');
    const isCopiableInputs = document.querySelectorAll('.copiable');
    const IsALinkInputs = document.querySelectorAll('.isALink');
    const newComponent = {
        name: componentName,
        description: componentDescription,
        parameters: []
    }
    for (i = 0; parameterKeyInputs.length > i; i++) {
        newComponent.parameters.push({
            name: parameterKeyInputs[i].value,
            value: parameterValueInputs[i].value,
            copy: isCopiableInputs[i].checked,
            go_to: IsALinkInputs[i].checked
        });
    }
    const hidenTextArea = document.querySelector('#hidenTextArea');
    console.log(hidenTextArea.value);
    const data = JSON.parse(hidenTextArea.value);
    data.push(newComponent);
    hidenTextArea.value = JSON.stringify(data);
    showData(data);
    cleanInputs();
}

function download() {
    let link = document.querySelector('#downloadlink');
    link.href = makeTextFile(document.querySelector('#hidenTextArea').value);
    link.style.display = 'block';
}

const makeTextFile = function (text) {
    let data = new Blob([text], { type: 'text/plain' });
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    let textFile = window.URL.createObjectURL(data);
    // returns a URL you can use as a href
    return textFile;
}

function cleanInputs() {
    let newComponentDiv = document.querySelector('#new_component_container');
    newComponentDiv.querySelectorAll('input').forEach(item => item.value = '');
    newComponentDiv.querySelectorAll('input').forEach(item => item.checked = false);
}

function searchContent() {
    let input = document.querySelector('#input_search').value.trim();
    let contentDiv = document.querySelector('#content');
    contentDiv.querySelectorAll('.item')
        .forEach(item => {
            if (item.querySelector('.item_title').innerHTML.includes(input)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
}

function readFile(dataText) {
    let FileURL = "data.json";
    GetFileObjectFromURL(FileURL, function (fileObject) {
        let reader = new FileReader();
        reader.onload = function () {
            let text = reader.result;
            if (dataText === undefined) {
                document.querySelector('#hidenTextArea').value = '';
                showData(JSON.parse(text));
            } else if (dataText.localeCompare('hiden') === 0) {
                document.querySelector('#hidenTextArea').value = text;
            }
        };
        reader.readAsText(fileObject);
    });
}

function readDefaultFile() {
    const fileSelector = document.getElementById('file_selector');
    fileSelector.addEventListener('change', (event) => {
        const fileList = event.target.files;
        let reader = new FileReader();
        reader.onload = function () {
            let text = reader.result;
            document.querySelector('#hidenTextArea').value = '';
            showData(JSON.parse(text));
        };
        reader.readAsText(fileList[0]);
    });
}