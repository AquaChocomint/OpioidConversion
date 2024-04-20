export interface OpioidDrug {
    /**
     * 薬剤名
     */
    name: string,

    /**
     * インタビューフォーム
     */
    if?: string,

    /**
     * 添付文書
     */
    pi?: string,
}

export interface Opioid {
    /**
     * 薬剤
     */
    drugs: OpioidDrug[],

    /**
     * トラッキング用
     */
    uuid: string,

    /**
     * 換算元のモルヒネの量からオピオイド換算
     */
    formula: (base: number) => number,

    /**
     * モルヒネ換算式
     */
    formulaReadable: string,

    /**
     * このオピオイドから換算しているアイコン
     */
    icon?: HTMLDivElement,

    /**
     * このオピオイド換算するときに使う入力欄
     */
    input?: HTMLDivElement,
}

export interface Link {
    label: string,
    onClick: () => void,
    url: string,
}