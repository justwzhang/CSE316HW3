import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItem_Transaction from '../transactions/ChangeItem_Transaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_ITEM_EDIT_ACTIVE: "SET_ITEM_EDIT_ACTIVE",
    ADD_NEW_LIST: "ADD_NEW_LIST",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    DELETE_LIST:"DELETE_LIST",
    SET_ITEM_EDIT_FALSE:"SET_ITEM_EDIT_FALSE"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        itemActive: false,
        listMarkedForDeletion: null
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            //add a new List through a button press
            case GlobalStoreActionType.ADD_NEW_LIST:{
                return setStore({
                    idNamePairs: [...store.idNamePairs, payload.newIdNamePair],
                    currentList: payload.newCurrentList,
                    newListCounter: ++store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.SET_ITEM_EDIT_FALSE:{
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            //mark a list for deletion
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION:{
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: payload
                });
            }

            //delete lsit
            case GlobalStoreActionType.DELETE_LIST:{
                return setStore({
                    idNamePairs: payload,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE:{
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: true,
                    listMarkedForDeletion: null
                });
            }
            default:
                return store;
        }
    }

    store.setItemEditFalse = function(){
        storeReducer({
            type:GlobalStoreActionType.SET_ITEM_EDIT_FALSE,
            payload: null
        });
    }
    // List Deletion- shows modal and marks the list
    store.markListForDeletion = function(id){
        async function markListForDeletion(id){
            let response = await api.getTop5ListById(id);
            if(response.data.success){
                let markedList = response.data.top5List;
                storeReducer({
                    type:GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload:markedList
                });
            }
            let modal = document.getElementById("delete-modal");
            modal.classList.add("is-visible");
        }
        markListForDeletion(id);
    }
    store.hideDeleteListModal = function(){
        storeReducer({
            type:GlobalStoreActionType.MARK_LIST_FOR_DELETION,
            payload:null
        });
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    store.deleteMarkedList = function(){
        async function asyncdeleteMarkedList(){
            let response = await api.deleteTop5ListById(store.listMarkedForDeletion._id);
            if(response.data.success){
                let modal = document.getElementById("delete-modal");
                modal.classList.remove("is-visible");
                let newIdNamePairs=[];
                store.idNamePairs.map((pair) =>{
                    if(pair._id !== store.listMarkedForDeletion._id){
                        newIdNamePairs = [...newIdNamePairs, pair];
                    }
                });
                storeReducer({
                    type:GlobalStoreActionType.DELETE_LIST,
                    payload:newIdNamePairs
                });
            }
        }
        asyncdeleteMarkedList();
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                top5List.name = newName;
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        let undo = document.getElementById("undo-button");
        undo.classList.remove("top5-button");
        undo.classList.add("top5-button-disabled");
        let redo = document.getElementById("redo-button");
        redo.classList.remove("top5-button");
        redo.classList.add("top5-button-disabled");
        let close = document.getElementById("close-button");
        close.classList.remove("top5-button");
        close.classList.add("top5-button-disabled");
        tps.clearAllTransactions();
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;

                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    let close = document.getElementById("close-button");
                    close.classList.remove("top5-button-disabled");
                    close.classList.add("top5-button");
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
        if(tps.hasTransactionToUndo()){
            let undo = document.getElementById("undo-button");
            undo.classList.remove("top5-button-disabled");
            undo.classList.add("top5-button");
        }
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
        if(!tps.hasTransactionToUndo()){
            let undo = document.getElementById("undo-button");
            undo.classList.remove("top5-button");
            undo.classList.add("top5-button-disabled");
        }
        if(tps.hasTransactionToRedo()){
            let redo = document.getElementById("redo-button");
            redo.classList.remove("top5-button-disabled");
            redo.classList.add("top5-button");
        }
    }
    store.redo = function () {
        tps.doTransaction();
        if(!tps.hasTransactionToRedo()){
            let redo = document.getElementById("redo-button");
            redo.classList.remove("top5-button");
            redo.classList.add("top5-button-disabled");
        }
        if(tps.hasTransactionToUndo()){
            let undo = document.getElementById("undo-button");
            undo.classList.remove("top5-button-disabled");
            undo.classList.add("top5-button");
        }
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }
    store.setItemEditActive = function (){
        storeReducer({
            type:GlobalStoreActionType.SET_ITEM_EDIT_ACTIVE,
            payload:null
        });
    }
    store.handleAddList = function(newList){
        async function asyncHandleAddList(){
            let response = await api.createTop5List(newList);
            if(response.data.success){
                let newCurrentList = response.data.top5List;
                let id = newCurrentList._id;
                let responseName = newCurrentList.name;
                let newPair = {_id: id, name: responseName};
                storeReducer({
                    type: GlobalStoreActionType.ADD_NEW_LIST,
                    payload:{
                        newIdNamePair: newPair,
                        newCurrentList: newCurrentList
                    }
                });
                store.setCurrentList(id);
            }
        }
        asyncHandleAddList();
    }
    store.addChangeItemTransaction = function(index, oldText, newText){
        let transaction = new ChangeItem_Transaction(store, index, oldText, newText);
        tps.addTransaction(transaction);
        if(tps.hasTransactionToUndo()){
            let undo = document.getElementById("undo-button");
            undo.classList.remove("top5-button-disabled");
            undo.classList.add("top5-button");
        }
    }
    //change the name of an item
    store.changeItemName = function(index, text){
        store.currentList.items[index] = text
        store.updateCurrentList();
    }
    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}