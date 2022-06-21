'use strict';

// SDK Library to asset with writing the logic 
const { Contract } = require('fabric-contract-api');

class Chaincode_Contract extends Contract {

  constructor(){
    super('Chaincode_Contract');
    this.TxId = ''
  }

  /**
   * is done befor the transaction starts
   * @param {*} ctx 
   */
  async beforeTransaction(ctx) {
    // default implementation is do nothing
    this.TxId = ctx.stub.getTxID();
    console.log(`we can do some logging for ${this.TxId} !!`)
  }


  /**
   * store a new state
   * @param {*} ctx 
   * @param {*} revenue 
   * @param {*} revenueTs
   * @param {*} cstype
   */
  async requireMaintenance(ctx, x) {

    let registro = JSON.parse(x)

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

  async getRecordsPerDate(ctx){

    // pesquisar por data específica
    // Tipo da data que deve ser enviada: yyyy-mm-dd-WOnumber
    // Adicionar o W.O ao início dos argumentos

    // we use the args option
    const args = ctx.stub.getArgs();
    // we split the key into single peaces
    const keyValues = args[1].split('-')    
    // collect the keys
    let keys = []
    keyValues.forEach(element => keys.push(element))
    
    let tamanho = keys.length;

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

    let retornos = []
    let keyArgumentos = []

    if (tamanho == 1){ // Pesquisa por ano
      // divide as keys dos resultados 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0]){
          retornos.push(resultados[i])
        }
      }
    }
    else if (tamanho == 2){ // Pesquisa por ano + mês
      // divide as keys dos resultados 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0] && keyArgumentos[2] == keys[1]){
          retornos.push(resultados[i])
        }
      }
    }
    else if (tamanho == 3){ // Pesquisa por ano + mês + dia
      // divide as keys dos resultados 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0] && keyArgumentos[2] == keys[1] && keyArgumentos[3] == keys[2]){
          retornos.push(resultados[i])
        }
      }
    }
    
    else if (tamanho == 4){ // Pesquisa por ano + mês + dia + number
      // divide as keys dos resultados 
      for (let i = 0; i < resultados.length; i++){
        let valores = resultados[i].Key.split('-')
        valores.forEach(element => keyArgumentos.push(element))
        if(keyArgumentos[1] == keys[0] && keyArgumentos[2] == keys[1] && keyArgumentos[3] == keys[2] && keyArgumentos[4] == keys[3]){
          retornos.push(resultados[i])
        }
      }
    }

    return JSON.stringify(retornos);   
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


};

module.exports = Chaincode_Contract