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
        brand      ,
        codSecurity,
        value      ,
        laPar      ,
      } = req.body
      console.log('sinal de vida 1')
        
      let cardUser = await query(`SELECT * FROM tb_cartao WHERE numero = "${codBrand}" AND bandeira = "${brand}" And cod_seguranca = ${codSecurity}`)
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
      let dia = cardUser.dia_fechamento_fatura
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
      let valorParcelado = parseFloat(value / laPar)
      let ano2
      let mes2
      for(let I = 0; I < laPar; I++ ) {
        mes++
        if(anoTable == `${ano}-${mes}-${dia}`){
          for(let i = 0; i < laPar - I; i++) {
            if(mes == '12') {
              mes = '0'
              ano++
            }
            mes++
            mes2 = mes - 1
            ano2 = ano
            if(mes2 == '0'){
              mes2 = '12'
              ano2 = ano - 1
            }
            await query(`INSERT INTO tb_fatura (tb_cartao_id, data_inicial, data_final) VALUES (${cardUser.id}, "${ano2}-${mes2}-${parseInt(dia) + 1}", "${ano}-${mes}-${dia}") `)
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