'use strict';

// SDK Library to asset with writing the logic 
const { Contract } = require('fabric-contract-api');

class Chaincode_Contract extends Contract {

  async requireMaintenance(ctx, x) {

    let registro = JSON.parse(x)
    this.TxId = ctx.stub.getTxID();

    let newWorkOrder = {
      solarPowerPanelNumber: registro.panelNumber,
      solarInverterNumber: registro.inverterNumber,
      typeOfWork: registro.workType,
      requirementDescription: registro.requirement,
      txId: this.TxId }

    try {
      let data = new Date();
      let dia = String(data.getDate()).padStart(2, '0');
      let mes = String(data.getMonth() + 1).padStart(2, '0');
      let ano = String(data.getFullYear());
      let number = 1
      let workOrderNumber = ano + "-" + mes + "-" + dia + "-" + String(number);
      let indexKey = "W.O." + "-" + workOrderNumber;
      
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
      for (let i = 0; i < allResults.length; i++){
        if (allResults[i].Key == indexKey){
          number += 1;
          workOrderNumber = ano + "-" + mes + "-" + dia + "-" + String(number);
          indexKey = "W.O." + "-" + workOrderNumber;    
        }
      }
    
      await ctx.stub.putState(indexKey, Buffer.from(JSON.stringify(newWorkOrder)));    

    } catch(e){
      throw new Error(`The tx ${this.TxId} (${indexKey}) can not be stored: ${e}`);
    }
  }

  // pesquisar por data específica
  // Tipo da data que deve ser enviada: yyyy-mm-dd-W.O.number(X)
  // Adicionar o W.O ao início dos argumentos
  async getRecordsPerDate(ctx){
    
    const args = ctx.stub.getArgs(); // pega os argumentos passados
    const keyValues = args[1].split('-')  // divide as keys em partes, separando a cada -  
    let keys = []
    keyValues.forEach(element => keys.push(element)) // cria um vetor das chaves que foram separadas anteriormente

    let tamanho = keys.length; // pega a quantidade de argumentos que foram passados para fazer a lógica de busca

    // faz a varredura do Ledger para pegar todos os registros
    const startKey = '';
    const endKey = '';    
    const resultados = [];
    for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
        const strValue = Buffer.from(value).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        resultados.push({ Key: key, Record: record });
    }

    let retornos = [] // esse vetor conterá os resultados filtrados de acordo com a data passada como argumento
    let keyArgumentos = [] // esse vetor conterá a key do registro, separado a cada - 

    // Argumento passado: apenas o ano (yyyy)
    if (tamanho == 1){ 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0]){ // compara a key referente ao ano com o primeiro argumento passado, que compreende ao ano
          retornos.push(resultados[i]) // se for o mesmo, adiciona o registro ao vetor retornos
        }
        keyArgumentos = [] // apaga os dados da variável para a próxima busca
      }
    }
    // Argumento passado: Ano (yyyy) e mês (mm)
    else if (tamanho == 2){ 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0] && keyArgumentos[2] == keys[1]){
          retornos.push(resultados[i])
        }
        keyArgumentos = []
      }
    }
    // Argumento passado: Ano (yyyy), mês (mm) e dia (dd)
    else if (tamanho == 3){ 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0] && keyArgumentos[2] == keys[1] && keyArgumentos[3] == keys[2]){
          retornos.push(resultados[i])
        }
        keyArgumentos = []
      }
    }

    // Argumento passado: Ano (yyyy), mês (mm), dia (dd) e W.O. number (X)
    else if (tamanho == 4){
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0] && keyArgumentos[2] == keys[1] && keyArgumentos[3] == keys[2] && keyArgumentos[4] == keys[3]){
          retornos.push(resultados[i])
        }
        keyArgumentos = []
      }
    }
    return JSON.stringify(retornos);   
  }

  // função que retorna todos os registros presentes no Ledger
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

  // função que pesquisa uma W.O. específica
   async searchWorkOrder(ctx, ID){

    const WOAsBytes = await ctx.stub.getState(ID); 
    if (!WOAsBytes || WOAsBytes.length === 0) {
      throw new Error(`${ID} does not exist`);
    }
    return WOAsBytes.toString('utf8');
  }

  // função que atualiza uma W.O. específica
  async updateWorkOrder(ctx, args){
    
    var argumentos = JSON.parse(args)
    const WOAsBytes = await ctx.stub.getState(argumentos.ID); 
    
    if (!WOAsBytes || WOAsBytes.length === 0) {
      throw new Error(`${argumentos.ID} does not exist`);
    }
    var resultado = JSON.parse(WOAsBytes.toString('utf8'));

    var TxId = ctx.stub.getTxID();

    let finalWO = {
      solarPowerPanelNumber: resultado.solarPowerPanelNumber,
      solarInverterNumber: resultado.solarInverterNumber,
      typeOfWork: resultado.typeOfWork,
      requirementDescription: resultado.requirementDescription,
      previoustxId: resultado.txId,
      updatetxId: TxId,
      workDescription: argumentos.work,
      startDate: argumentos.start,
      endDate: argumentos.end,
      WOexecuter: argumentos.executer,
      WOexecuterDate: argumentos.executerDate,
      WOmanager: argumentos.manager,
      WOmanagerDate: argumentos.managerDate,
    }

    await ctx.stub.putState(argumentos.ID, Buffer.from(JSON.stringify(finalWO)));    
 }


 // fazer o sistema de status: até não atualizar a W.O., fica como status "pendente"
 // ao atualizar, muda pra "done"
 
};

module.exports = Chaincode_Contract