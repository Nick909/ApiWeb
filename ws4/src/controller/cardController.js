"use strict";
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

const query = require('../config/database/data')

module.exports = {
  async card(req, res) {
    try {
      const {
        codBrand   ,
        nameClient ,
        brand      ,
        codSecurity,
        value      ,
        laPar      ,
        operetor   ,
        store      ,
      } = req.body
      console.log('sinal de vida 1')
        
      let cardUser = await query(`SELECT * FROM tb_cartao WHERE numero = "${codBrand}"`)
      cardUser = cardUser[0]
      
      if(!(cardUser)){    
        return res.status(401).json({message: "cartao não existe"})
      }    

      if(value >  cardUser.limite_em_centavos) {
        return res.json({
          message: 'limite não disponivel'
        })
      }

      let ano = new Date().getFullYear()// pega o ano
      let mes = new Date().getMonth()  // pega o mes
      let dia = '3'
      //let dateMonth = new Date(ano, mes + 1, 0)// quantidade de dias do mês
      let dateNow = new Date().toLocaleDateString("pt-BR")// data atual
      
      let compra = await query(`INSERT INTO tb_compra(tb_cartao_id, data, valor_em_centavos) VALUES (${cardUser.id}, "${dateNow}", ${value})`)
      let produto = await query(`SELECT * FROM tb_compra WHERE id = ${compra.insertId}`)
      produto = produto[0]
      // cadastra a nova compra
      let upCred = await query(`UPDATE tb_cartao SET limite_em_centavos = "${cardUser.limite_em_centavos - value}" WHERE  numero = "${codBrand}"`)
      // desconta o saldo nos creditos
      let cardFatura = await query(`SELECT * from tb_fatura WHERE tb_cartao_id = ${cardUser.id}`)
      
      
      let anoTable  = cardFatura[cardFatura.length - 1].data_final.toLocaleDateString()
      let e = 0
      let valorParcelado = parseFloat(value / laPar)

      for(let I = 0; I < laPar; I++ ) {
        mes++
        e++
        if(anoTable == `${ano}-${mes}-${dia}`){
          for(let i = 0; i < laPar - e; i++) {
            if(mes == '12') {
              mes = '0'
              ano++
            }
            mes++
            await query(`INSERT INTO tb_fatura (tb_cartao_id, data_inicial, data_final) VALUES (${cardUser.id}, "${'2019-04-02'}", "${ano}-${mes}-${dia}") `)
          }
          break;
        }
        if(mes == '12') {
          mes = '0'
          ano++
        }
      }/// função ta pegando a ultima data amazenada no banco, e comparando pra ver se gera novas faturas
      cardFatura = await query(`SELECT * from tb_fatura WHERE tb_cartao_id = ${cardUser.id}`)
      
      produto.data.setDate(3)
      for(let i = 0; i < cardFatura.length-1; i++) {
        if(produto.data.toLocaleDateString() == cardFatura[i].data_final.toLocaleDateString()){
          for(let o = i; o < laPar; o++ ) {
            await query(`INSERT INTO tb_parcela  (tb_compra_id, tb_fatura_id, valor_em_centavos) VALUES  ('${produto.id}', '${cardFatura[o].id}', '${valorParcelado}')`)
          }
          break;
        }
      }// função para gera um novo valor nas parcelas
      console.log('sinal de vida 2')

      return res.status(200).json({
        resposta: "sucesso",
        nome_cliente: cardUser.nome_cliente,
        valor_em_centavos: produto.valor_em_centavos,
        parcelas: laPar
        })
    } catch(error) {
      return res.status(400).json({ message: `deu ruim ${error}`})
    }
  },

  async status(req, res) {
    try {
      return res.status(200).json('ws4 disponivel')
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}`})
    }
  }
}