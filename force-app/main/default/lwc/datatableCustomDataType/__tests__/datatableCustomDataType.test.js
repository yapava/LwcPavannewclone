import { createElement } from 'lwc';
import DatatableCustomDataType from 'c/datatableCustomDataType';
import getContacts from '@salesforce/apex/ContactController.getContactList';

// Realistic data with a list of contacts
const mockGetContactList = require('./data/getContactList.json');

// Mock getContactList Apex wire adapter
jest.mock(
    '@salesforce/apex/ContactController.getContactList',
    () => {
        const {
            createApexTestWireAdapter
        } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

describe('c-datatable-inline-edit', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Prevent data saved on mocks from leaking between tests
        jest.clearAllMocks();
    });

    // Helper function to wait until the microtask queue is empty.
    async function flushPromises() {
        return Promise.resolve();
    }
    it('renders six rows in the lightning datatable', async () => {
        const element = createElement('c-datatable-custom-data-type', {
            is: DatatableCustomDataType
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getContacts.emit(mockGetContactList);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        const tableEl = element.shadowRoot.querySelector('c-custom-data-types');
        expect(tableEl.data.length).toBe(mockGetContactList.length);
        expect(tableEl.data[0].FirstName).toBe(mockGetContactList[0].FirstName);
        //Validate if custom datatype field is populated
        expect(tableEl.data[0].Picture__c).toBe(
            mockGetContactList[0].Picture__c
        );
    });

    it('is accessible when data is returned', async () => {
        // Create initial element
        const element = createElement('c-datatable-custom-data-type', {
            is: DatatableCustomDataType
        });
        document.body.appendChild(element);

        // Emit data from @wire
        getContacts.emit(mockGetContactList);

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });

    it('is accessible when error is returned', async () => {
        // Create initial element
        const element = createElement('c-datatable-custom-data-type', {
            is: DatatableCustomDataType
        });
        document.body.appendChild(element);

        // Emit error from @wire
        getContacts.error();

        // Wait for any asynchronous DOM updates
        await flushPromises();

        await expect(element).toBeAccessible();
    });
});
