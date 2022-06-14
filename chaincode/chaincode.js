'use strict';

const { Contract } = require('fabric-contract-api');

class Chaincode_Contract extends Contract {

// Require Maintenance: permite o registro de uma Work Order mais simples, contendo menos campos e informações.
async requireMaintenance(ctx, x){

  registro = JSON.parse(x)

  var newWorkOrder = {
    solarPowerPanelNumber: registro.panelNumber,
    solarInverterNumber: registro.inverterNumber,
    typeOfWork: registro.workType,
    requirementDescription: registro.requirement
  }

  var data = new Date();
  var dia = String(data.getDate()).padStart(2, '0');
  var mes = String(data.getMonth() + 1).padStart(2, '0');
  var ano = data.getFullYear();
  var hour = String(data.getHours()).padStart(2, '0');
  var min =  String(data.getMinutes()).padStart(2, '0');
  var seconds =  String(data.getSeconds()).padStart(2, '0');
  var workOrderNumber = ano + mes + dia + hour + min + seconds;

  var indexName = "W.O."
  var indexKey = ctx.stub.GetStub().CreateCompositeKey(indexName, workOrderNumber)
	
  await ctx.stub.putState(indexKey, Buffer.from(JSON.stringify(newWorkOrder)));

}

// ====================================================================================

// Maintenance Records: mostra todas as ordens de produção
async maintenanceRecords(ctx){
  var indexName = "W.O."

  let allResults = [];
  let res = { done: false, value: null };
  let jsonRes = {};
  res = await ctx.stub.getStateByPartialCompositeKey(this.name, indexName);
    
  while (!res.done) {
    jsonRes.Key = res.value.key;

    try {
        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
        allResults.push(jsonRes);
        res = await iterator.next();
      }
      catch (err) {
        console.log(err);
        return {}
    }

  }
  await iterator.close();
  
  return allResults;
}

// ====================================================================================


// Status Work Orders: função que contabiliza as W.Os (Done, Doing, Pending to Start)


// ====================================================================================

// Log a Work Order: registro de uma Work Order mais completa, manualmente.


// ====================================================================================


// Update a Work Order: a partir do número da W.O., realiza a pesquisa no Ledger e fornece os dados que já foram preenchidos


// ====================================================================================

}    
module.exports = Chaincode_Contract;