import { createElement } from 'lwc';
import LdsNotifyRecordUpdateAvailable from 'c/ldsNotifyRecordUpdateAvailable';
import { getRecord } from 'lightning/uiRecordApi';
import updateContact from '@salesforce/apex/ContactController.updateContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Mock realistic data
const mockGetRecord = require('./data/getRecord.json');

//Mock updateContacts
jest.mock(
    '@salesforce/apex/ContactController.updateContact',
    () => {
        return {
            default: jest.fn(() => Promise.resolve())
        };
    },
    { virtual: true }
);

// // Sample error for Apex call
// const UPDATE_CONTACTS_ERROR = {
//     body: { message: 'An internal server error has occurred' },
//     ok: false,
//     status: 400,
//     statusText: 'Bad Request'
// };

describe('c-notify-contact-update-available', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait until the microtask queue is empty.
    // This is needed for promise timing.
    async function flushPromises() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        return new Promise((resolve) => setTimeout(resolve, 0));
    }

    it('populates name from getRecord wire', async () => {
        // Create initial element
        const element = createElement('c-lds-notify-record-update-available', {
            is: LdsNotifyRecordUpdateAvailable
        });
        document.body.appendChild(element);
        const firstNameEl = element.shadowRoot.querySelector(
            'lightning-input[class="first-name"]'
        );
        const lastNameEl = element.shadowRoot.querySelector(
            'lightning-input[class="last-name"]'
        );
        // Emit data from @wire
        await getRecord.emit(mockGetRecord);

        // Return a promise to wait for any asynchronous DOM updates.
        return Promise.resolve().then(() => {
            expect(firstNameEl.value).toBe('Amy');
            expect(lastNameEl.value).toBe('Taylor');
        });
    });

    it.skip('should update contact and call notifyRecordUpdateAvailable', async () => {
        //Update all the records in the Draft Values
        const INPUT_PARAMETERS = [
            { id: '0031700000pHcf8AAC', firstName: 'John', lastName: 'Doe' }
        ];

        // Assign mock value for resolved updateContact promise
        updateContact.mockResolvedValue(INPUT_PARAMETERS);

        // Create element
        const element = createElement('c-lds-notify-record-update-available', {
            is: LdsNotifyRecordUpdateAvailable
        });
        document.body.appendChild(element);

        // Mock handler for toast event
        const toastHandler = jest.fn();
        // Add event listener to catch toast event
        element.addEventListener(ShowToastEvent, toastHandler);

        // Emit data from @wire
        getRecord.emit(mockGetRecord);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        const firstNameEl = element.shadowRoot.querySelector(
            'lightning-input[class="first-name"]'
        );
        const lastNameEl = element.shadowRoot.querySelector(
            'lightning-input[class="last-name"]'
        );
        firstNameEl.value = 'John';
        lastNameEl.value = 'Doe';
        // Find the save button and click
        const inputEl = element.shadowRoot.querySelector('lightning-button');
        //inputEl.click();

        inputEl.dispatchEvent(new CustomEvent('click'));

        // Wait for any asynchronous DOM updates
        await flushPromises();

        // Return a promise to wait for any asynchronous DOM updates.
        return Promise.resolve().then(() => {
            expect(updateContact).toHaveBeenCalledTimes(1);
        });

        // Wait for any asynchronous DOM updates
        // expect(toastHandler).toHaveBeenCalledTimes(1);
    });

    it('is accessible when data is returned', async () => {
        // Create element
        const element = createElement('c-lds-notify-record-update-available', {
            is: LdsNotifyRecordUpdateAvailable
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getRecord.emit(mockGetRecord);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });

    it('is accessible when error is returned', async () => {
        // Create element
        const element = createElement('c-lds-notify-record-update-available', {
            is: LdsNotifyRecordUpdateAvailable
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getRecord.error();

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });
});
