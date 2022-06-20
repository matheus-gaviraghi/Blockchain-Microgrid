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
   * is done after the transaction ends
   * @param {*} ctx 
   * @param {*} result 
   */
  async afterTransaction(ctx, result) {
    // default implementation is do nothing
    console.log(`TX ${this.TxId} done !!`)
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
    
      // store the composite key with a the value
      let indexName = 'year~month~day~number'

      let _keyHelper = new Date()
      let _keyYearAsString = String(_keyHelper.getFullYear())
      let _keyMonthAsString = String(_keyHelper.getMonth() + 1).padStart(2, '0');
      let _keyDayAsString = String(_keyHelper.getDate()).padStart(2, '0');

      let number = 1
      let exists = _keyYearAsString + "~" + _keyMonthAsString + "~" +  _keyDayAsString + "~" + String(number)

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
      let yearMonthDayWOIndexKey = ""
      for (let i = 0; i < allResults.length; i++){
        if (allResults[i].Key == exists){
          number += 1;
          exists = _keyYearAsString + "~" + _keyMonthAsString + "~" +  _keyDayAsString + "~" + String(number)    
        }
        else {
          yearMonthDayWOIndexKey = await ctx.stub.createCompositeKey(indexName, [_keyYearAsString, _keyMonthAsString, _keyDayAsString, String(number)]);
        }
      }

      // store the new state
    await ctx.stub.putState(yearMonthDayWOIndexKey, Buffer.from(JSON.stringify(newWorkOrder)));

    // compose the return values
    return {
      key: _keyYearAsString + '~' + _keyMonthAsString + '~' + _keyDayAsString + '~' + String(number)
    };

    } catch(e){
      throw new Error(`The tx ${this.TxId} (${yearMonthDayWOIndexKey}) can not be stored: ${e}`);
    }
  
  }

    /**
     * get all in a given year and month 
     * 
     * @param {*} ctx 
     * @param {*} year 
     * @param {*} month 
     */
    async getRecords(ctx){

      // we use the args option
      const args = ctx.stub.getArgs();

      // we split the key into single peaces
      const keyValues = args[1].split('~')
      
      // collect the keys
      let keys = []
      keyValues.forEach(element => keys.push(element))
      
      // do the query
      let resultsIterator = await ctx.stub.getStateByPartialCompositeKey('year~month~day~number', keys);
      
      // prepare the result
      const allResults = [];
      while (true) {
        const res = await resultsIterator.next();

        if (res.value) {
          // if not a getHistoryForKey iterator then key is contained in res.value.key
          allResults.push(res.value.value.toString('utf8'));
          // console.log('V:',res.value.value.toString('utf8'))
          // console.log('K:',res.value.key.toString('utf8'))
        }

        // check to see if we have reached then end
        if (res.done) {
          // explicitly close the iterator            
          await resultsIterator.close();
          return allResults;
        }
      }
    }
};

module.exports = Chaincode_Contract