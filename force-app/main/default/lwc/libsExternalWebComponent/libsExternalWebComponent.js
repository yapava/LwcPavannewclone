import { LightningElement } from 'lwc';
import TimeElements from '@salesforce/resourceUrl/TimeElements';
import { loadScript } from 'lightning/platformResourceLoader';

export default class LibsExternalWebComponent extends LightningElement {
    date = new Date();

    rendered = false;

    renderedCallback() {
        if (this.rendered) {
            return;
        }
        this.rendered = true;

        loadScript(this, TimeElements).then(() => {
            console.log('loaded TimeElements web components');
        });
    }
}
