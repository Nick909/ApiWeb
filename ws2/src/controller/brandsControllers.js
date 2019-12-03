"use strict"
/**
 * codBrand     : codigo do cartão
 * nameClient   : nome do cliente
 * brand        : bandeira
 * codSecurity  : codigo de segurança
 * value        : volor em centavos
 * laPar        : parcelas
 * operetor     : operação 
 * store        : codigo da loja
 */
const Brand = require('../config/constants.json')

const ws4 = require('../config/services/ws4')

module.exports = {
  async testBrand(req, res) {
    try {
      const {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        laPar      ,
        operetor   ,
      } = req.body

      let codBrandCard = codBrand.split('.') // criando um array semparando pelo pontos
      console.log(
        !Brand.hasOwnProperty(brand), !(Brand[brand].codBandeira == codBrandCard[0]) ,  !Brand[brand].operadoresPermitidos.hasOwnProperty(operetor)
      )
      console.log(
        !Brand.hasOwnProperty(brand) || !Brand[brand].codBandeira == codBrandCard[0] || !Brand[brand].operadoresPermitidos.hasOwnProperty(operetor)
      )
      if (
        !Brand.hasOwnProperty(brand) ||
        !(Brand[brand].codBandeira == codBrandCard[0]) ||  
        !Brand[brand].operadoresPermitidos.hasOwnProperty(operetor)
      ) {
        console.log("error")
        return res.status(401).json({
          cod_resposta  : "operadora-negada",
          resposta      : "falha",
          detalhes      : "Operadora sem relação com a bandeira ou falha na leitura do codigo, por favor limpa o cartão ou solicita um novo na agencia mais perto de você, trouxa(mundo bruxo que fla, vlw flw)",
          cod_operadora : operetor
        })
      }else if(!(laPar <= Brand[brand].limiteParcela)) {
        return res.status(401).json({
          resposta              : "falha",
          detalhes              : "Limite de parcelas ultrapassado",
          infor                 : Brand[brand],
          parcelas_solicitadas  : laPar,
          limite_parcelas       : Brand[brand].parcelas
        })
      }

      const response = await ws4.post('/ws-banks/v1/pay', {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        laPar      ,
      })

      return res.status(200).json(response.data)

    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  },

  async status(req, res) {
    try {
      res.status(200).json({ status: `Serviço disponível ws2` })
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  },

  async installmentsLimit(req, res) {
    try {
      const {
        brand
      } = req.query

      if (!Brand.hasOwnProperty(brand)) {
        return res.status(401).json({
          resposta: "erro",
          detalhes: "A bandeira informada não existe"
        })
      }

      Brand[brand].codBandeira = undefined
      console.log('sinal de vida 2')
      return res.status(200).json(Brand[brand])
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  }
}