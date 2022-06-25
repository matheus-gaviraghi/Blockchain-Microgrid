function identitiesGET(){ 
    var request = new XMLHttpRequest();
    request.addEventListener("readystatechange", processRequest, false);

    if (document.getElementById("ORG").value == "Solar") {
        request.open('GET', "https://u0miw00e6f-u0m1xl8pkg-connect.us0-aws-ws.kaleido.io/identities",true);
        request.setRequestHeader("Authorization", "Basic dTBvY3hicGkzMjpwR0xFV0E3VnlXRTNFR0E3VFFPaWFpemdTYWxQbFc0SERObWJSWUxPRGNv");
        request.send();
    }

    else if (document.getElementById("ORG").value == "Maintenance") {
        request.open('GET', "https://u0miw00e6f-u0hytrfppt-connect.us0-aws-ws.kaleido.io/identities",true);
        request.setRequestHeader("Authorization", "Basic dTBua3c1aHJuazpWYXRDREltUUZmZmVXQnhkTS1icjUzdzNrYzREV2oxeUdRYkZ3TGlWRDNn");
        request.send();
    }

    alert("Pressione OK para obter os resultados");

    function processRequest(e){
        if (request.readyState == 4 && request.status == 200){
            var response = JSON.parse(request.responseText);
            if (response.length>0){
                document.write("<p> Total Objects Returned =" + response.length + "</p>");
                for (var i=0; i<response.length; i++){
                    printObject(response[i]);
                }
            }

            else if (request.readyState == 4 && request.status == 500){
                document.write("<p>Error: " + request.status + "," + request.statusText);
            }
        }
    }

    function printObject(jsonObject){
        document.write("<hr/>");
        document.writeln("Name: " + jsonObject.name);
        document.write("<p>");
        document.writeln("Type: " + jsonObject.type);
    }
}

function identitiesGETbyUsername(){ 
    var request = new XMLHttpRequest();
    var nome = document.getElementById("nome").value;
      
    request.addEventListener("readystatechange", processRequest, false);

    if (document.getElementById("ORG_Identity").value == "Solar") {
        request.open('GET', "https://u0miw00e6f-u0m1xl8pkg-connect.us0-aws-ws.kaleido.io/identities/"+nome,true);
        request.setRequestHeader("Authorization", "Basic dTBvY3hicGkzMjpwR0xFV0E3VnlXRTNFR0E3VFFPaWFpemdTYWxQbFc0SERObWJSWUxPRGNv");
        request.setRequestHeader("Content-Type", "application/json");
        request.send();
    }

    else if (document.getElementById("ORG_Identity").value == "Maintenance") {
        request.open('GET', "https://u0miw00e6f-u0hytrfppt-connect.us0-aws-ws.kaleido.io/identities/"+nome,true);
        request.setRequestHeader("Authorization", "Basic dTBua3c1aHJuazpWYXRDREltUUZmZmVXQnhkTS1icjUzdzNrYzREV2oxeUdRYkZ3TGlWRDNn");
        request.setRequestHeader("Content-Type", "application/json");
        request.send();
    }
   
    alert("Pressione OK para obter os resultados");
    
    function processRequest(e){
        if (request.readyState == 4 && request.status == 200){

            var response = JSON.parse(request.responseText);

            if (response.organization == "u0czw7q3wi") var organization = "Solar Power Plant";
            else if (response.organization == "u0oxdpgxoi") var organization = "Maintenance";
            document.write("<hr/>");
            document.writeln("Name: " + response.name);
            document.write("<p>");
            document.writeln("Type: " + response.type);
            document.write("<p>");
            document.writeln("Organization: " + organization);     
        
        }
        else if (request.readyState == 4 && request.status == 500){
            
            document.write("<p>Error: " + request.status + " - Usuário inexistente"); }
    }
}

function transactionPOST(){           
   
    var panelNumberValue = document.getElementById("panelNumber").value
    var inverterNumberValue = document.getElementById("inverterNumber").value
    var signer = document.getElementById("signer").value
    var workTypeValue = document.getElementById("workType").value
    var requirementValue = document.getElementById("requirement").value
    // // Isso aqui seria se preenchermos como MensagemX para o idMensagem, onde nMensagem seria X
    // var nMensagem = idMensagem.substr(8)  
    // alert(nMensagem)
    var argsJSON = 
    { "panelNumber": panelNumberValue,
      "inverterNumber": inverterNumberValue,
      "workType": workTypeValue,
      "requirement": requirementValue }

    var argumentos = JSON.stringify(argsJSON )

    body = {
        "headers": {
            "type": "SendTransaction",
            "signer": "",
            "channel": "canal-chaincode",
            "chaincode": "chaincode"
        },
        "func": "requireMaintenance",
        "args": [ argumentos
        ],
        "init": false
    }

    console.log("Body=", body)    

    let request = new XMLHttpRequest()

    var org = document.getElementById("organization").value
    if (org == "Solar") {
        var url = "https://u0miw00e6f-u0m1xl8pkg-connect.us0-aws-ws.kaleido.io/transactions";
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/json");
        request.setRequestHeader("Authorization", "Basic dTBvY3hicGkzMjpwR0xFV0E3VnlXRTNFR0E3VFFPaWFpemdTYWxQbFc0SERObWJSWUxPRGNv");
        
        if (signer != null) body.headers.signer = signer;
        else body.headers.signer = "Matheus";

        request.send(JSON.stringify(body));
    }
    else if (org == "Maintenance"){
        var url = "https://u0miw00e6f-u0hytrfppt-connect.us0-aws-ws.kaleido.io/transactions";
        request.open("POST", url, true);
        request.setRequestHeader("Content-type", "application/json");
        request.setRequestHeader("Authorization", "Basic dTBua3c1aHJuazpWYXRDREltUUZmZmVXQnhkTS1icjUzdzNrYzREV2oxeUdRYkZ3TGlWRDNn");
        
        if (signer != null) body.headers.signer = signer;
        else body.headers.signer = "Eduardo";

        request.send(JSON.stringify(body));
    }
    
    alert("Pressione OK para obter os resultados");

    request.onload = function() {
        var respostaTransaction = JSON.parse(this.responseText);
        console.log(this.responseText);
        document.write("<div id='areaImpressao'>")
        document.write("<hr/>");
        document.write("<strong>TRANSAÇÃO EFETUADA:</strong>")
        document.write("<p/>");
        document.write("Organização utilizada: ", org)
        document.write("<p/>");
        document.write("Signer: ", body.headers.signer)
        document.write("<p/>");
        document.write("Panel Number: ", argsJSON.panelNumber)
        document.write("<p/>");
        document.write("Inverter Number: ", argsJSON.inverterNumber)
        document.write("<p/>");
        document.write("Work Type: ", argsJSON.workType)
        document.write("<p/>");
        document.write("Requirement Description: ", argsJSON.requirement)
        document.write("<hr/>");
        document.write("<strong>RESPOSTA DE ENVIO DA TRANSAÇÃO:</strong>")
        document.write("<p/>");
        document.writeln("ID: " + respostaTransaction.headers.id);
        document.write("<p/>");
        document.writeln("Type: " + respostaTransaction.headers.type);
        document.write("<p/>");
        document.writeln("Time Received: " + respostaTransaction.headers.timeReceived);
        document.write("<p/>");
        document.writeln("Time Elapsed: " + respostaTransaction.headers.timeElapsed);
        document.write("<p/>");
        document.writeln("Block Number: " + respostaTransaction.blockNumber);
        document.write("<p/>");
        document.writeln("Signer MSP: " + respostaTransaction.signerMSP);
        document.write("<p/>");
        document.writeln("Signer: " + respostaTransaction.signer);
        document.write("<p/>");
        document.writeln("Transaction ID: " + respostaTransaction.transactionID);
        document.write("<p/>");
        document.writeln("Status: " + respostaTransaction.status);
        document.write("<hr/>");
        document.write("</div>")
        document.writeln("Para imprimir o recibo da mensagem clique <a onclick='imprimirReciboMensagem(areaImpressao)'>AQUI</a>")
    }
    

}