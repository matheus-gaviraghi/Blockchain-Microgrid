'use strict';

const { Contract } = require('fabric-contract-api');

class Chaincode_Contract extends Contract {

// Require Maintenance: permite o registro de uma Work Order mais simples, contendo menos campos e informações.
async requireMaintenance(ctx, x){

  let registro = JSON.parse(x)

  let newWorkOrder = {
    solarPowerPanelNumber: registro.panelNumber,
    solarInverterNumber: registro.inverterNumber,
    typeOfWork: registro.workType,
    requirementDescription: registro.requirement
  }

  let data = new Date();
  let dia = String(data.getDate()).padStart(2, '0');
  let mes = String(data.getMonth() + 1).padStart(2, '0');
  let ano = String(data.getFullYear());
  let hour = String(data.getHours()).padStart(2, '0');
  let min =  String(data.getMinutes()).padStart(2, '0');
  let seconds =  String(data.getSeconds()).padStart(2, '0');
  let workOrderNumber = ano + mes + dia + hour + min + seconds;

  let indexName = "W.O."
  let indexKey = indexName + workOrderNumber
	
  await ctx.stub.putState(indexKey, Buffer.from(JSON.stringify(newWorkOrder)));

}

// ====================================================================================

// Maintenance Records: mostra todas as ordens de produção
async maintenanceRecords(ctx){

  const resultados = [];
    const iterador = await ctx.stub.getStateByRange(" ", " ");
    let result = await iterador.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        //record = strValue;
      }
      resultados.push(record);
      
      result = await iterador.next();
    }
    return JSON.stringify(resultados);

}

// IT WORKSSSSSSS
async getHistoryKey(ctx, key){
  
  let iterator = await ctx.stub.getHistoryForKey(key);
  let result = [];
  let res = await iterator.next();
  while (!res.done) {
    if (res.value) {
      console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
      const obj = JSON.parse(res.value.value.toString('utf8'));
      result.push(obj);
    }
    res = await iterator.next();
  }
  await iterator.close();
  return result;  
}

// ========================================================================================

async requireMaintenanceTeste(ctx, x){

  let registro = JSON.parse(x)

  let newWorkOrder = {
    solarPowerPanelNumber: registro.panelNumber,
    solarInverterNumber: registro.inverterNumber,
    typeOfWork: registro.workType,
    requirementDescription: registro.requirement
  }

  let data = new Date();
  let dia = String(data.getDate()).padStart(2, '0');
  let mes = String(data.getMonth() + 1).padStart(2, '0');
  let ano = String(data.getFullYear());
  // let hour = String(data.getHours()).padStart(2, '0');
  // let min =  String(data.getMinutes()).padStart(2, '0');
  // let seconds =  String(data.getSeconds()).padStart(2, '0');
  let number = 1
  let workOrderNumber = ano + mes + dia + "-" + String(number);
  let indexKey = "W.O." + workOrderNumber;

  const startKey = '';
  const endKey = '';
  const allResults = [];
  for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
      const strValue = Buffer.from(value).toString('utf8');
      let record;
      try {
          record = JSON.parse(strValue);
      } catch (err) {
          console.log(err);
          record = strValue;
      }
      allResults.push({ Key: key, Record: record });
  }

  //let exists = JSON.parse(await this.queryAll())

  for (let i = 0; i < allResults.length; i++){
    if (allResults[i].Key == indexKey){
      number += 1;
      workOrderNumber = ano + mes + dia + "-" + String(number);
      indexKey = "W.O." + workOrderNumber;    
    }
  }
  // TypeError: Cannot read properties of undefined (reading 'stub')"


  // ideia para testar: ao inves de colocar horas, min, segundos
  // colocar W.O. + ano + mes + dia + Nº da W.O do dia
  // para isso fazer um sistema que pesquise no ledger se ja existe um registro
  // caso houver, add +1 e pesquisa de novo. E assim segue, até que não exista
  // aí usa esse valor para gerar a nova

  // let indexName = "W.O."
  // let indexKey = await ctx.stub.createCompositeKey(indexName,[workOrderNumber]);
	
  await ctx.stub.putState(indexKey, Buffer.from(JSON.stringify(newWorkOrder)));

}

async queryAll(ctx) {
  const startKey = '';
  const endKey = '';
  const allResults = [];
  for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
      const strValue = Buffer.from(value).toString('utf8');
      let record;
      try {
          record = JSON.parse(strValue);
      } catch (err) {
          console.log(err);
          record = strValue;
      }
      allResults.push({ Key: key, Record: record });
  }
  console.info(allResults);
  return JSON.stringify(allResults);
}

async maintenanceRecordsCK(ctx){
  let indexName = "W.O."
  const resultados = [];
    const iterador = await ctx.stub.getStateByPartialCompositeKey(" ", [indexName]);
    let result = await iterador.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        //record = strValue;
      }
      resultados.push(record);
      
      result = await iterador.next();
    }
    return JSON.stringify(resultados);

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