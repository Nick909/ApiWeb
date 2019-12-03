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
const Opereter = require('../config/constants.json')
const ws2 = require('../config/services/ws2')


module.exports = {
  async testOperetor(req, res) {
    try {
      const {
        operetor   ,
        brand      ,
        store      ,
        codBrand   ,
        codSecurity,
        value      ,
        laPar      ,
      } = req.body
      console.log('sinal de vida 1')

      if (!Opereter.hasOwnProperty(operetor)) {
        return res.status(401).json({
          resposta  : "falha",
          detalhes  : "Operadora não existe",
          operadora : operetor
        })
      } else if (!Opereter[operetor].bandeirasAutorizadas.hasOwnProperty(brand)) {
        return res.status(401).json({
          resposta  : "falha",
          detalhes  : "Bandeira não autorizada",
          operadora : operetor,
          bandeira  : brand
        })
      } else if (!Opereter[operetor].lojasAutorizadas.hasOwnProperty(store)) {
        return res.status(401).json({
          resposta  : "falha",
          detalhes  : "Loja não autorizada",
          operadora : operetor,
          codLoja   : store
        })
      }

      const response = await ws2.post('/ws-brands/v1/pay', {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        laPar      ,
        operetor   ,
        store      ,
      })

      console.log('sinal de vida 2')
      return res.status(200).json(response.data)

    } catch (error) {
      console.log('test')
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  },

  async status(req, res) {
    try {
      return res.status(200).json({
        status: 'Oia parece que deu certo WS1'
      })
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  }
}



/**
 * if ((json.hasOwnProperty("aviso")) && (!!json.aviso))
 * Dessa forma primeiro irá verificar se o objeto cujo nome é json existe a propriedade aviso e por último irá verificar o valor dele, dessa forma você garante que está sendo verificada a existência da propriedade e o valor dela. Edit:
 * Existe uma maneira mais eficaz ainda que é apenas deixar o !!json.avisoif (!!json.aviso)
 */