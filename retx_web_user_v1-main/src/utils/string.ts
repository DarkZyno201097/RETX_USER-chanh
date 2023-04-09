import { trans } from "src/resources/trans"

export function slugify(string: string) {
    if (!string) return ""

    const a = 'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;'
    const b = 'aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return string.toString().toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/\s+/g, '-')
        .replace(p, c => b.charAt(a.indexOf(c)))
        .replace(/&/g, '-and-')
        // .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

export function isNumeric(val: string) {
    return /^-?\d+$/.test(val);
}

export function isContainsNumber(text: string) {
    let isContain = false;
    text.split('').forEach(e => {
        if (isNumeric(e)) {
            isContain = true;
        }
    })

    return isContain;
}

export const convertNameMethod = (name: string, lang: 'vi' | 'en') => {
    if (name == 'swapTokensForExactTokens') return trans[lang].buy
    else if (name == 'swapExactTokensForTokens') return trans[lang].sell
    else if (name == 'transfer') return trans[lang].transfers
    else return name
}

export const getColorMethod = (method: string) => {
    if (method == 'swapTokensForExactTokens') return '#3fdd3a'
    else if (method == 'swapExactTokensForTokens') return '#e33737'
    else if (method == 'transfer') return '#0d6efd'
    else return ''
}

export const getTableLocateText = (locate: string) => {
    return {
        emptyText: trans[locate].no_data,
        filterSearchPlaceholder: trans[locate].search,
        filterReset: trans[locate].refresh,
        triggerAsc: null,
        triggerDesc: null,
        cancelSort: null
    }
}