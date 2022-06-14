'use strict';

const { Contract } = require('fabric-contract-api');

class TestContract extends Contract {

  async initLedgerAerogerador(ctx){

    let aerogeradores = [
      {
        registerNumber: "0",
        model:"Modelo Padrão",
        status: "Em operação",
        installationDate: "05/04/2022",
        lastMaintenanceDate: "28/04/2022",
        lastMaintenanceDescription: "Foi realizada a checagem e troca de óleo da Gear Box"
      },
      {
        registerNumber: "1",
        model:"Modelo Padrão",
        status: "Realizar Manutenção",
        installationDate: "05/02/2022",
        lastMaintenanceDate: "05/04/2022",
        lastMaintenanceDescription: "Troca de óleo e checagem das conexões elétricas"
      },
      {
        registerNumber: "2",
        model:"Modelo Padrão",
        status: "Parado",
        installationDate: "09/05/2022",
        lastMaintenanceDate: "08/05/2022",
        lastMaintenanceDescription: "Foi realizada toda a manutenção e checagem dos componentes para ser realizada a instalação."
      }]

    for(const aerogerador of aerogeradores){
      //aerogerador.docType = 'aerogerador';
      var id = "Aerogerador" + aerogerador.registerNumber;
      await ctx.stub.putState(id, Buffer.from(JSON.stringify(aerogerador)));
    }
  }

  //Funcao que remove o aerogerador do state store a partir da funcao deleteState passando o id como parametro
  async removerAerogerador(ctx,number){
    var id = "Aerogerador" + number;
    const aerogeradorEscolhido = await ctx.stub.getState(id);
    if (!aerogeradorEscolhido || aerogeradorEscolhido.length === 0) {
      throw new Error(`${id} nao existe no Ledger`);
    }
    await ctx.stub.deleteState(id);
    console.log(`${id} removido do Ledger`);
  }

  async registraAerogerador(ctx,args) {

    var windTurbine = {
      registerNumber: "",
      model: "",
      installationDate: "",
      lastMaintenanceDate: "",
      lastMaintenanceDescription: ""
    }
    
    args = JSON.parse(args);
    let id = "Aerogerador" + args.registerNumber;

    if (args.registerNumber != "") windTurbine.registerNumber = args.registerNumber
    if (args.model != "") windTurbine.model = args.model
    if (args.installationDate != "") windTurbine.installationDate = args.installationDate
    if (args.lastMaintenanceDate != "") windTurbine.lastMaintenanceDate = args.lastMaintenanceDate
    if (args.lastMaintenanceDescription != "") windTurbine.lastMaintenanceDescription = args.lastMaintenanceDescription

    await ctx.stub.putState(id,Buffer.from(JSON.stringify(windTurbine)));
    console.log('Aerogerador registrado com sucesso');   
  }

  // nao ta pegando os novos registrados
  async exibeAerogeradores(ctx) {
    const resultados = [];
    const iterador = await ctx.stub.getStateByRange('Aerogerador0', 'Aerogerador20000');
    let result = await iterador.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
      let record;
      try {
          record = JSON.parse(strValue);
      } catch (err) {
          console.log(err);
          record = strValue;
      }
      resultados.push(record);
      result = await iterador.next();
    }
    return JSON.stringify(resultados);
  }

  async exibeAerogerador(ctx, registerNumber){
    var idAero = "Aerogerador"+registerNumber;
    let aeroBytes = await ctx.stub.getState(idAero);
    if (!aeroBytes || aeroBytes.length === 0) {
      throw new Error(`${idAero} does not exist`);
    }
    let records = JSON.parse(aeroBytes.toString());
    return JSON.stringify(records);
  }

  //Gera uma ficha de manutencao para um dos aerogeradores criados na funcao initLedgerAerogerador
  async initLedgerManutencao(ctx){
    
    let fichaDeManutencao = {
        numeroFichaDeManutencao: "1",
        registerNumberAerogerador: "1",
        descricaoEquipamento: "Gerador",
        tipoDeServico: "Eletricista",
        descricaoServicoSolicitado: "Checar conexoes eletricas",
        descricaoServicoRealizado: "Checagem das conexoes eletricas",
        dataDeFinalizacaoDoServico: "03/05/2022"
    }

    let idFicha = "Ficha" + fichaDeManutencao.numeroFichaDeManutencao
    await ctx.stub.putState(idFicha, Buffer.from(JSON.stringify(fichaDeManutencao)))
    // await this.atualizaManutencaoAerogerador(JSON.stringify(fichaDeManutencao));
  }

  async initLedgerManutencao2(ctx){
    
    let fichaDeManutencao = {
        numeroFichaDeManutencao: "2",
        registerNumberAerogerador: "2",
        descricaoEquipamento: "Anemometer",
        tipoDeServico: "Manutenção Corretiva",
        descricaoServicoSolicitado: "Checar o funcionamento do anemometer",
        descricaoServicoRealizado: "Foi realizada a troca do sensor, visto que o anterior estava queimado",
        dataDeFinalizacaoDoServico: "10/05/2022"
    }

    let idFicha = "Ficha" + fichaDeManutencao.numeroFichaDeManutencao
    await ctx.stub.putState(idFicha, Buffer.from(JSON.stringify(fichaDeManutencao)))
    await this.atualizaManutencaoAerogerador2(JSON.stringify(fichaDeManutencao));
  }

  async atualizaManutencaoAerogerador(ctx, ficha){
    
    //Unexpected token u in JSON at position 0" -> significa q ja esta em JSON e estamos tentando converter dnv
    // se passar um JSON.stringify aí temos q converter mesmo
    //ficha = JSON.parse(ficha)
    let id =  "Aerogerador" + ficha.registerNumberAerogerador

    const aeroAsBytes = await ctx.stub.getState(id); 
    if (!aeroAsBytes || aeroAsBytes.length === 0) {
      throw new Error(`${id} does not exist`);
    }

    const aero = JSON.parse(aeroAsBytes.toString());
    aero.lastMaintenanceDate = ficha.dataDeFinalizacaoDoServico;
    aero.lastMaintenanceDescription = ficha.descricaoServicoRealizado;

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(aero)));
  }

  // se chamar la no Kaleido passando a JSON.stringify de uma ficha, bomba
  async atualizaManutencaoAerogerador2(ctx, ficha){
    
    //Unexpected token u in JSON at position 0" -> significa q ja esta em JSON e estamos tentando converter dnv
    // se passar um JSON.stringify aí temos q converter mesmo
    ficha = JSON.parse(ficha)
    let id =  "Aerogerador" + ficha.registerNumberAerogerador

    const aeroAsBytes = await ctx.stub.getState(id); 
    if (!aeroAsBytes || aeroAsBytes.length === 0) {
      throw new Error(`${id} does not exist`);
    }

    const aero = JSON.parse(aeroAsBytes.toString());
    aero.lastMaintenanceDate = ficha.dataDeFinalizacaoDoServico;
    aero.lastMaintenanceDescription = ficha.descricaoServicoRealizado;

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(aero)));
  }


  //Funcao que recebera as informacoes inseridas pelo usuarios e registrara um ficha de manutencao
  //Fara a chamada da funcao atualizaManutencaoAerogerador para fazer as alteracoes da ficha no aerogerador
  /*Faz a checagem para ver se o numero de ficha e o registerNumber do aerogerador foram inseridos.
  Caso contrario, lanca um erro impedindo o prosseguimento da funcao.*/
  async registraManutencao(ctx,args){
    
    args = JSON.parse(args);

    if(args.numeroFichaDeManutencao == ""){
      throw new Error("faltou a insercao do numero da ficha de manutencao");
    }
    if(args.registerNumberAerogerador == ""){
      throw new Error("faltou a insercao do numero do register number do aerogerador");
    }
    
    let idFicha = "Ficha" + args.numeroFichaDeManutencao
    
    var fichaDeManutencaoPadrao = {
      numeroFichaDeManutencao: "",
      registerNumberAerogerador: "",
      descricaoEquipamento: "",
      tipoDeServico: "",
      descricaoServicoSolicitado: "",
      descricaoServicoRealizado: "",
      dataDeFinalizacaoDoServico: ""
    }

    fichaDeManutencaoPadrao.numeroFichaDeManutencao = args.numeroFichaDeManutencao
    fichaDeManutencaoPadrao.registerNumberAerogerador = args.registerNumberAerogerador
    if(args.descricaoEquipamento != "") fichaDeManutencaoPadrao.descricaoEquipamento = args.descricaoEquipamento
    if(args.tipoDeServico != "") fichaDeManutencaoPadrao.tipoDeServico = args.tipoDeServico
    if(args.descricaoServicoSolicitado != "") fichaDeManutencaoPadrao.descricaoServicoSolicitado = args.descricaoServicoSolicitado
    if(args.descricaoServicoRealizado != "") fichaDeManutencaoPadrao.descricaoServicoRealizado = args.descricaoServicoRealizado
    if(args.dataDeFinalizacaoDoServico != "") fichaDeManutencaoPadrao.dataDeFinalizacaoDoServico = args.dataDeFinalizacaoDoServico

    await ctx.stub.putState(idFicha, Buffer.from(JSON.stringify(fichaDeManutencaoPadrao)))
    
    let id =  "Aerogerador" + fichaDeManutencaoPadrao.registerNumberAerogerador

    const aeroAsBytes = await ctx.stub.getState(id); 
    if (!aeroAsBytes || aeroAsBytes.length === 0) {
      throw new Error(`${id} does not exist`);
    }

    const aero = JSON.parse(aeroAsBytes.toString());
    aero.lastMaintenanceDate = fichaDeManutencaoPadrao.dataDeFinalizacaoDoServico;
    aero.lastMaintenanceDescription = fichaDeManutencaoPadrao.descricaoServicoRealizado;

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(aero)));
  }

  //Cannot read properties of undefined (reading 'registerNumberAerogerador')"
  async registraManutencao2(ctx,args){
    
    args = JSON.parse(args);

    if(args.numeroFichaDeManutencao == ""){
      throw new Error("faltou a insercao do numero da ficha de manutencao");
    }
    if(args.registerNumberAerogerador == ""){
      throw new Error("faltou a insercao do numero do register number do aerogerador");
    }
    
    let idFicha = "Ficha" + args.numeroFichaDeManutencao
    
    var fichaDeManutencaoPadrao = {
      numeroFichaDeManutencao: "",
      registerNumberAerogerador: "",
      descricaoEquipamento: "",
      tipoDeServico: "",
      descricaoServicoSolicitado: "",
      descricaoServicoRealizado: "",
      dataDeFinalizacaoDoServico: ""
    }

    fichaDeManutencaoPadrao.numeroFichaDeManutencao = args.numeroFichaDeManutencao
    fichaDeManutencaoPadrao.registerNumberAerogerador = args.registerNumberAerogerador
    if(args.descricaoEquipamento != "") fichaDeManutencaoPadrao.descricaoEquipamento = args.descricaoEquipamento
    if(args.tipoDeServico != "") fichaDeManutencaoPadrao.tipoDeServico = args.tipoDeServico
    if(args.descricaoServicoSolicitado != "") fichaDeManutencaoPadrao.descricaoServicoSolicitado = args.descricaoServicoSolicitado
    if(args.descricaoServicoRealizado != "") fichaDeManutencaoPadrao.descricaoServicoRealizado = args.descricaoServicoRealizado
    if(args.dataDeFinalizacaoDoServico != "") fichaDeManutencaoPadrao.dataDeFinalizacaoDoServico = args.dataDeFinalizacaoDoServico

    await ctx.stub.putState(idFicha, Buffer.from(JSON.stringify(fichaDeManutencaoPadrao)))
    await this.atualizaManutencaoAerogerador(fichaDeManutencaoPadrao);
  }
  // gera relatorio com todas as fichas de manutenção executadas e referenciadas ao aerogerador desejado
  // ta dando timeout
  async gerarRelatorioManutencaoAerogerador(ctx, idAero){
    const resultados = [];
    const iterador = await ctx.stub.getStateByRange('Ficha1', 'Ficha2000');
    let result = await iterador.next();
    while (!result.done) {
        const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        
        if (record.registerNumberAerogerador == idAero){
          resultados.push(record);
        }
      result = await iterador.next();
    }
    return JSON.stringify(resultados);
  }

  // Gera relatório com todas as fichas de manutenção criadas
  async gerarRelatorioTodasFichas(ctx){
    const resultados = [];
    const iterador = await ctx.stub.getStateByRange('Ficha1', 'Ficha20000');
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

}
    
module.exports = TestContract;