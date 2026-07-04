"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnglish = isEnglish;
function isEnglish(text) {
    if (!text)
        return true;
    // Basic list of common English words
    const englishWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
        'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
        'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
        'which', 'go', 'me', 'experience', 'team', 'work', 'software',
        'development', 'design', 'business', 'data', 'years', 'looking',
        'company', 'our', 'we', 'are', 'is', 'your', 'can', 'skills', 'remote'
    ]);
    // Basic list of common German, French, Spanish stop words
    const foreignWords = new Set([
        // German
        'und', 'die', 'der', 'das', 'zu', 'für', 'mit', 'sich', 'des',
        'auf', 'eine', 'ist', 'den', 'von', 'nicht', 'dem', 'ein',
        'auch', 'als', 'an', 'es', 'noch', 'wie', 'aus', 'wir', 'werden',
        'sie', 'bei', 'um', 'nur', 'wird', 'kann', 'über', 'kein', 'oder',
        'entwicklung', 'prüfabläufen', 'messtechniker', 'bzw', 'gmbh', 'ag',
        'sachbearbeitung', 'nachwuchs', 'traineeprogramm',
        // French
        'et', 'le', 'la', 'les', 'de', 'des', 'un', 'une', 'dans', 'pour',
        'qui', 'que', 'sur', 'avec', 'pas', 'vous', 'nous', 'cette', 'ce',
        // Spanish
        'el', 'la', 'los', 'las', 'de', 'y', 'en', 'a', 'que', 'por', 'con',
        'para', 'una', 'un', 'no', 'su', 'se', 'del', 'lo', 'como', 'más'
    ]);
    // Immediately reject standard German job title suffixes
    if (/(\(m\/w\/d\)|\(w\/m\/d\)|\(f\/m\/d\)|\(m\/f\/d\))/i.test(text)) {
        return false;
    }
    const words = text.toLowerCase().match(/[a-zäöüßéèêáíóúñ]+/g) || [];
    let enCount = 0;
    let foreignCount = 0;
    for (const word of words) {
        if (englishWords.has(word))
            enCount++;
        if (foreignWords.has(word))
            foreignCount++;
    }
    // If we found any foreign stop words and they outnumber or equal english ones, reject.
    // Or if we found a significant number of foreign words regardless.
    if (foreignCount > 0 && foreignCount >= enCount) {
        return false;
    }
    return true;
}
