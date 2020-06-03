const Helpers = require('./helpers')

// https://www.correios.com.br/precisa-de-ajuda/como-rastrear-um-objeto/siglas-utilizadas-no-rastreamento-de-objeto
const validInitials = {
    'AA': 'Etiqueta Lógica SEDEX',
    'AB': 'Etiqueta Lógica SEDEX',
    'AL': 'Agentes de leitura',
    'AR': 'Avisos de recebimento',
    'AS': 'Encomenda PAC - Ação Social',
    'BE': 'Remessa Econômica sem AR Digital',
    'BF': 'Remessa Expressa sem AR Digital',
    'BG': 'Etiqueta Lógica Remessa Econômica com AR BG',
    'BH': 'Mensagem Físico-Digital',
    'BI': 'Etiqueta Lógica Registrada Urgente',
    'CA': 'Objeto Internacional - Colis',
    'CB': 'Objeto Internacional - Colis',
    'CC': 'Objeto Internacional - Colis',
    'CD': 'Objeto Internacional - Colis',
    'CE': 'Objeto Internacional - Colis',
    'CF': 'Objeto Internacional - Colis',
    'CG': 'Objeto Internacional - Colis',
    'CH': 'Objeto Internacional - Colis',
    'CI': 'Objeto Internacional - Colis',
    'CJ': 'Objeto Internacional - Colis',
    'CK': 'Objeto Internacional - Colis',
    'CL': 'Objeto Internacional - Colis',
    'CM': 'Objeto Internacional - Colis',
    'CN': 'Objeto Internacional - Colis',
    'CO': 'Objeto Internacional - Colis',
    'CP': 'Objeto Internacional - Colis',
    'CQ': 'Objeto Internacional - Colis',
    'CR': 'Objeto Internacional - Colis',
    'CS': 'Objeto Internacional - Colis',
    'CT': 'Objeto Internacional - Colis',
    'CU': 'Objeto internacional - Colis',
    'CV': 'Objeto Internacional - Colis',
    'CW': 'Objeto Internacional - Colis',
    'CX': 'Objeto internacional - Colis',
    'CY': 'Objeto Internacional - Colis',
    'CZ': 'Objeto Internacional - Colis',
    'DA': 'Encomenda SEDEX com AR Digital',
    'DB': 'Remessa Expressa com AR Digital (Bradesco)',
    'DC': 'Remessa Expressa Órgão de Trânsito',
    'DD': 'Devolução de documentos',
    'DE': 'Remessa Expressa com AR Digital',
    'DF': 'Encomenda SEDEX (Etiqueta Lógica)',
    'DG': 'Encomenda SEDEX (Etiqueta Lógica)',
    'DI': 'Remessa Expressa com AR Digital Itaú',
    'DJ': 'Encomenda SEDEX',
    'DK': 'SEDEX Extra Grande',
    'DL': 'SEDEX Lógico',
    'DM': 'Encomenda SEDEX',
    'DN': 'Encomenda SEDEX',
    'DO': 'Remessa Expressa com AR Digital Itaú Unibanco',
    'DP': 'SEDEX Pagamento na Entrega',
    'DQ': 'Remessa Expressa com AR Digital Bradesco',
    'DR': 'Remessa Expressa com AR Digital Santander',
    'DS': 'Remessa Expressa com AR Digital Santander',
    'DT': 'Remessa econômica com AR Digital DETRAN',
    'DU': 'Encomenda SEDEX',
    'DV': 'SEDEX com AR digital',
    'DW': 'Encomenda SEDEX (Etiqueta Lógica)',
    'DX': 'SEDEX 10 Lógico',
    'DY': 'Encomenda SEDEX (Etiqueta Física)',
    'DZ': 'Encomenda SEDEX (Etiqueta Lógica)',
    'EA': 'Objeto Internacional EMS',
    'EB': 'Objeto Internacional EMS',
    'EC': 'Encomenda PAC',
    'ED': 'Objeto Internacional Packet Express',
    'EE': 'Objeto Internacional EMS',
    'EF': 'Objeto Internacional EMS',
    'EG': 'Objeto Internacional EMS',
    'EH': 'Objeto Internacional EMS',
    'EI': 'Objeto Internacional EMS',
    'EJ': 'Objeto Internacional EMS',
    'EK': 'Objeto Internacional EMS',
    'EL': 'Objeto Internacional EMS',
    'EM': 'SEDEX MUNDI',
    'EN': 'Objeto Internacional EMS',
    'EO': 'Objeto Internacional EMS',
    'EP': 'Objeto Internacional EMS',
    'EQ': 'Encomenda de serviço não expressa ECT',
    'ER': 'Registrado',
    'ES': 'Objeto Internacional EMS',
    'ET': 'Objeto Internacional EMS',
    'EU': 'Objeto Internacional EMS',
    'EV': 'Objeto Internacional EMS',
    'EW': 'Objeto Internacional EMS',
    'EX': 'Objeto Internacional EMS',
    'EY': 'Objeto Internacional EMS',
    'EZ': 'Objeto Internacional EMS',
    'FA': 'FAC registrado',
    'FB': 'FAC Registrado',
    'FC': 'FAC Registrado (5 dias)',
    'FD': 'FAC Registrado (10 dias)',
    'FE': 'Encomenda FNDE',
    'FF': 'Registrado DETRAN',
    'FH': 'FAC registrado com AR Digital',
    'FJ': 'Remessa Econômica com AR Digital',
    'FM': 'FAC registrado (monitorado)',
    'FR': 'FAC registrado',
    'IA': 'Integrada avulsa',
    'IC': 'Integrada a cobrar',
    'ID': 'Integrada devolução de documento',
    'IE': 'Integrada Especial',
    'IF': 'CPF',
    'II': 'Integrada Interno',
    'IK': 'Integrada com Coleta Simultânea',
    'IM': 'Integrada Medicamentos',
    'IN': 'Objeto de Correspondência e EMS recebido do Exterior',
    'IP': 'Integrada Programada',
    'IR': 'Impresso Registrado',
    'IS': 'Integrada standard',
    'IT': 'Integrada Termolábil',
    'IU': 'Integrada urgente',
    'IX': 'EDEI Encomenda Expressa',
    'JA': 'Remessa econômica com AR Digital',
    'JB': 'Remessa econômica com AR Digital',
    'JC': 'Remessa econômica com AR Digital',
    'JD': 'Remessa econômica sem AR Digital',
    'JE': 'Remessa econômica com AR Digital',
    'JF': 'Remessa econômica com AR Digital',
    'JG': 'Registrado prioritário',
    'JH': 'Registrado prioritário',
    'JI': 'Remessa econômica sem AR Digital',
    'JJ': 'Registrado Justiça',
    'JK': 'Remessa econômica sem AR Digital',
    'JL': 'Registrado Lógico',
    'JM': 'Mala Direta Postal Especial',
    'JN': 'Objeto registrado econômico',
    'JO': 'Registrado Prioritário',
    'JP': 'Objeto Receita Federal (Exclusivo)',
    'JQ': 'Remessa econômica com AR Digital',
    'JR': 'Registrado Prioritário',
    'JS': 'Registrado Lógico',
    'JT': 'Registrado Urgente',
    'JU': 'Etiqueta Física Registrado Urgente',
    'JV': 'Remessa Econômica c/ AR DIGITAL',
    'JW': 'Carta Comercial a Faturar (5 dias)',
    'JX': 'Carta Comercial a Faturar (10 dias)',
    'JY': 'Remessa Econômica (5 dias)',
    'JZ': 'Remessa Econômica (10 dias)',
    'LA': 'Logística Reversa Simultânea SEDEX',
    'LB': 'Logística Reversa Simultânea SEDEX',
    'LC': 'Objeto Internacional Prime',
    'LD': 'Objeto Internacional Prime',
    'LE': 'Logística Reversa Econômica',
    'LF': 'Objeto Internacional Prime',
    'LG': 'Objeto Internacional Prime',
    'LH': 'Objeto Internacional Prime',
    'LI': 'Objeto Internacional Prime',
    'LJ': 'Objeto Internacional Prime',
    'LK': 'Objeto Internacional Prime',
    'LL': 'Objeto Internacional Prime',
    'LM': 'Objeto Internacional Prime',
    'LN': 'Objeto Internacional Prime',
    'LP': 'Logística Reversa Simultânea PAC',
    'LQ': 'Objeto Internacional Prime',
    'LS': 'Logística Reversa SEDEX',
    'LV': 'Logística Reversa Expressa',
    'LW': 'Objeto Internacional Prime',
    'LX': 'Objeto Internacional Packet Standard',
    'LY': 'Objeto Internacional Prime',
    'LZ': 'Objeto Internacional Prime',
    'MA': 'Telegrama - Serviços Adicionais',
    'MB': 'Telegrama de balcão',
    'MC': 'Telegrama Fonado',
    'MD': 'Máquina de Franquear (LOGICA)',
    'ME': 'Telegrama',
    'MF': 'Telegrama Fonado',
    'MH': 'Carta via Internet',
    'MK': 'Telegrama corporativo',
    'MM': 'Telegrama Grandes clientes',
    'MP': 'Telegrama Pré-pago',
    'MS': 'Encomenda Saúde',
    'MT': 'Telegrama via Telemail',
    'MY': 'Telegrama internacional entrante',
    'MZ': 'Telegrama via Correios Online',
    'NE': 'Tele Sena resgatada',
    'NX': 'EDEI Encomenda não urgente',
    'OA': 'Encomenda SEDEX (Etiqueta Lógica)',
    'OB': 'Encomenda SEDEX (Etiqueta Lógica)',
    'OC': 'Encomenda SEDEX (Etiqueta Lógica)',
    'OD': 'Encomenda SEDEX (Etiqueta Física)',
    'OF': 'Etiqueta lógica SEDEX',
    'OG': 'Etiqueta lógica SEDEX',
    'OH': 'Etiqueta lógica SEDEX',
    'OI': 'Etiqueta lógica SEDEX',
    'OJ': 'ETIQUETA LOGICA SEDEX OJ',
    'PA': 'Passaporte',
    'PB': 'Encomenda PAC - Não Urgente',
    'PC': 'Encomenda PAC a Cobrar',
    'PD': 'Encomenda PAC',
    'PE': 'Encomenda PAC (Etiqueta Física)',
    'PF': 'Passaporte',
    'PG': 'Encomenda PAC (Etiqueta Física)',
    'PH': 'Encomenda PAC (Etiqueta Lógica)',
    'PI': 'Encomenda PAC',
    'PJ': 'Encomenda PAC',
    'PK': 'PAC Extra Grande',
    'PL': 'Encomenda PAC',
    'PM': 'Encomenda PAC (Etiqueta Física)',
    'PN': 'Encomenda PAC (Etiqueta Lógica)',
    'PO': 'Encomenda PAC (Etiqueta Lógica)',
    'PP': 'Etiqueta Lógica PAC',
    'PQ': 'Etiqueta Lógica PAC Mini',
    'PR': 'Reembolso Postal - Cliente Avulso',
    'PS': 'Etiqueta Lógica PAC',
    'PT': 'Encomenda PAC',
    'PU': 'Encomenda PAC',
    'PV': 'Encomenda PAC',
    'PW': 'Encomenda PAC',
    'PX': 'Encomenda PAC',
    'PY': 'ETIQUETA LOGICA PAC - PY',
    'RA': 'Registrado prioritário',
    'RB': 'Carta registrada',
    'RC': 'Carta registrada com Valor Declarado',
    'RD': 'Remessa econômica DETRAN',
    'RE': 'Mala Direta postal Especial',
    'RF': 'Objeto da Receita Federal',
    'RG': 'Registrado do sistema SARA',
    'RH': 'Registrado com AR Digital',
    'RI': 'Registrado prioritário internacional',
    'RJ': 'Registrado Agência',
    'RK': 'Registrado Agência',
    'RL': 'Registrado Lógico',
    'RM': 'Registrado Agência',
    'RN': 'Registrado Agência',
    'RO': 'Registrado Agência',
    'RP': 'Reembolso Postal - Cliente Inscrito',
    'RQ': 'Registrado Agência',
    'RR': 'Registrado Internacional',
    'RS': 'Remessa econômica Órgão de Trânsico com ou sem AR',
    'RT': 'Remessa econômica Talão/Cartão sem AR Digital',
    'RU': 'Registrado Serviço ECT',
    'RV': 'Remessa econômica CRLV/CRV/CNH com AR Digital',
    'RW': 'Registrado internacional',
    'RX': 'Registrado internacional',
    'RY': 'Remessa econômica Talão/Cartão com AR Digital',
    'RZ': 'Registrado',
    'SA': 'Etiqueta SEDEX Agência',
    'SB': 'SEDEX 10',
    'SC': 'SEDEX a cobrar',
    'SD': 'Remessa Expressa DETRAN',
    'SE': 'Encomenda SEDEX',
    'SF': 'SEDEX Agência',
    'SG': 'SEDEX do sistema SARA',
    'SH': 'SEDEX com AR Digital',
    'SI': 'SEDEX Agência',
    'SJ': 'SEDEX Hoje',
    'SK': 'SEDEX Agência',
    'SL': 'SEDEX Lógico',
    'SM': 'SEDEX 12',
    'SN': 'SEDEX Agência',
    'SO': 'SEDEX Agência',
    'SP': 'SEDEX Pré-franqueado',
    'SQ': 'SEDEX',
    'SR': 'SEDEX',
    'SS': 'SEDEX Físico',
    'ST': 'Remessa Expressa Talão/Cartão sem AR Digital',
    'SU': 'Encomenda de serviço expressa (ECT)',
    'SV': 'Remessa Expressa CRLV/CRV/CNH com AR Digital',
    'SW': 'Encomenda SEDEX',
    'SX': 'SEDEX 10',
    'SY': 'Remessa Expressa Talão/Cartão com AR Digital',
    'SZ': 'SEDEX Agência',
    'TC': 'Objeto para treinamento',
    'TE': 'Objeto para treinamento',
    'TR': 'Objeto Treinamento - Não gera pré-alerta',
    'TS': 'Objeto para treinamento',
    'VA': 'Objeto internacional com valor declarado',
    'VC': 'Objeto internacional com valor declarado',
    'VD': 'Objeto internacional com valor declarado',
    'VE': 'Objeto internacional com valor declarado',
    'VF': 'Objeto internacional com valor declarado',
    'VV': 'Objeto internacional com valor declarado',
    'XA': 'Aviso de chegada Objeto Internacional Tributado',
    'XM': 'SEDEX Mundi',
    'XR': 'Objeto Internacional (PPS Tributado)',
    'XX': 'Objeto Internacional (PPS Tributado)'
}

function matchesPattern (object) {
    return /^([A-Z]{2}[0-9]{9}[A-Z]{2}){1}$/.test(object)
}

function category(object) {
    if ( !matchesPattern(object) || !Helpers.isString(object) ) {
        return undefined
    }
    let initials = object.substr(0, 2)
    let objectCategory
    switch (initials) {

        case 'EM':
            let final = object.substr(object.length - 2, 2)
            objectCategory = 'Encomenda Internacional - EMS Importação'
            if (final === 'BR') {
                objectCategory = 'Encomenda Internacional - SEDEX Mundi'
            }
            break

        default:
            objectCategory = validInitials[initials]

    }
    return objectCategory
}

function isValid (object) {
    return category(object) !== undefined
}

module.exports = {
    category, isValid
}
