import {Link, Opioid} from "./interfaces";

class OpioidConversion {

    private opioids = new Array<Opioid>;
    private readonly iconActive = '#ff0cfb';
    private readonly iconInactive = '#afafaf';

    constructor() {
        this.init();
    }

    public calculate (from: Opioid, value: number) : void{
        //モルヒネの量に変換
        const base = 1 / from.formula(1 / value);

        this.opioids.forEach(opioid => {
            if(from !== opioid) {
                const icon = opioid.icon;
                if(icon){
                    icon.style.color = this.iconInactive;
                }

                const i = opioid.input;
                if (i) {
                    const val = opioid.formula(base);
                    if(val === Infinity || val === 0.0){
                        i.textContent = '0';
                    }else{
                        i.textContent = val.toFixed(2);
                    }
                }
            }
        });
    }

    public addTable () : void{
        const tbody = <HTMLTableSectionElement> window.document.getElementsByTagName('tbody').item(0);

        for (const opioid of this.opioids) {
            const tr: HTMLTableRowElement = window.document.createElement('tr');

            const icon: HTMLTableCellElement = window.document.createElement('td');
            icon.innerText = '◯';
            icon.style.color = this.iconInactive;
            tr.appendChild(icon);
            opioid.icon = icon;

            const name: HTMLTableCellElement = window.document.createElement('td');
            name.innerText = opioid.drugs.map(d => d.name).join(', ');
            tr.appendChild(name);

            const formula: HTMLTableCellElement = window.document.createElement('td');
            formula.innerText = opioid.formulaReadable;
            tr.appendChild(formula);

            const box: HTMLTableCellElement = window.document.createElement('td');
            box.className = 'number-input-box';
            tr.appendChild(box);

            const input: HTMLDivElement = window.document.createElement('div');
            input.contentEditable = 'true';
            input.className = 'number-input';
            input.addEventListener('input', () => {
                icon.style.color = this.iconActive;
                this.calculate(opioid, Number(input.textContent) || 0);
                gtag('event', 'Calculated from ' + opioid.uuid);
            });
            box.appendChild(input);
            opioid.input = input;

            tbody.appendChild(tr);
        }
    }

    public switchDisplay () : void{
        const prepare = <HTMLDivElement> window.document.getElementById('contents-prepare');
        const pstyle = prepare.style;
        pstyle.display = (pstyle.display === 'none' ? 'block' : 'none');

        const main = <HTMLDivElement> window.document.getElementById('contents-main');
        const mstyle = main.style;
        mstyle.display = (mstyle.display === 'none' ? 'block' : 'none');
    }

    public getAgreement () : string{
        const message: string[] = [
            '注意事項',
            'このオピオイド換算ツールは試験的に製作しているもので、医療用向けに作られたものではありません。',
            'このツールの使用により生じた問題について制作者は一切責任を負いません。',
            '',
            '上記に同意する場合のみご使用いただけます。',
            'このツールを利用しますか？'
        ];

        return message.join('\n');
    }

    public getWarningElement () : HTMLDivElement{
        return <HTMLDivElement> window.document.getElementsByClassName('contents-prepare-warning').item(0);
    }

    private buildFooter () : void{
        const footer = <HTMLDivElement> window.document.getElementsByClassName('footer').item(0);
        const links: Link[] = [
            {
                label: 'ソースコード',
                onClick: () => gtag('event', 'SourceCode'),
                url: 'https://github.com/AquaChocomint/OpioidConversion'
            },
            {
                label: '計算式参考',
                onClick: () => gtag('event', 'Reference'),
                url: 'https://www.ncc.go.jp/jp/ncch/clinic/palliative_care/201901opioid.pdf'
            }
        ];

        for (const link of links) {
            const a = window.document.createElement('a');
            a.innerText = link.label;
            a.className = 'footer-link';
            a.addEventListener('click', () => {
                link.onClick();
                window.open(link.url, '_blank');
            });
            footer.appendChild(a);
        }
    }

    private init () : void{
        if(window.confirm(this.getAgreement())){
            this.switchDisplay();
            this.registerAll();

            if(this.opioids.length === 0){
                this.switchDisplay();
                const warn = this.getWarningElement();
                warn.innerText = '利用できる薬剤がありません';
            }else{
                this.addTable();
                this.buildFooter();
            }

            gtag('event', 'Agreement agreed');
        }else{
            const warn = this.getWarningElement();
            warn.innerText = '同意がない場合はこのツールを利用できません';
            gtag('event', 'Agreement disagreed');
        }
    }

    private registerAll () : void{
        //経口
        this.register({drugs: [{name: 'MSコンチン'}, {name: 'MSツワイスロン'}, {name: 'モルペス'}], uuid: 'morphine', formula: base => base, formulaReadable: '1'});
        this.register({drugs: [{name: 'オキシコンチンTR'}, {name: 'オキシコドン徐放カプセル'}], uuid: 'oxycodone', formula: base => base * 2 / 3, formulaReadable: '2/3'});
        this.register({drugs: [{name: 'ナルサス'}], uuid: 'hydromorphone', formula: base => base / 5, formulaReadable: '1/5'});
        this.register({drugs: [{name: 'タペンタ'}], uuid: 'tapentadol', formula: base => base * 10 / 3, formulaReadable: '10/3'});
        this.register({drugs: [{name: 'トラマール'}, {name: 'ワントラム'}], uuid: 'tramadol', formula: base => base * 5, formulaReadable: '5'});

        //坐剤
        this.register({drugs: [{name: 'アンペック坐剤'}], uuid: 'morphine-suppository', formula: base => base / 2, formulaReadable: '1/2'});

        //注射
        this.register({drugs: [{name: 'モルヒネ塩酸塩注'}, {name: 'オキファスト注'}], uuid: 'morphine-injection', formula: base => base / 2, formulaReadable: '1/2'});
        this.register({drugs: [{name: 'フェンタニル注'}], uuid: 'fentanyl-injection', formula: base => base / 100, formulaReadable: '1/100'});
        this.register({drugs: [{name: 'ナルベイン注'}], uuid: 'hydromorphone-injection', formula: base => base / 25, formulaReadable: '1/25'});
    }

    private register (drug: Opioid) : void{
        this.opioids.push(drug);
    }

}

window.addEventListener('load', () => {
    new OpioidConversion();
});